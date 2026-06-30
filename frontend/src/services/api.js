// ============================================================
// FRIENDIX API Service — connects frontend to backend
// All API calls go through here
// ============================================================
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance = null;

const getFFmpeg = async (onProgress) => {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Log]', message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    const pct = Math.round(progress * 100);
    if (onProgress) {
      onProgress({ phase: 'compress', pct });
    }
  });

  // Load ffmpeg.wasm from unpkg CDN
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegInstance = ffmpeg;
  return ffmpegInstance;
};

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('friendix_token');

// Generic fetch helper
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };
  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

// ===== AUTH =====
export const authAPI = {
  register: (userData) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (email, password) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  resetPassword: (payload) => apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  getMe: () => apiFetch('/auth/me'),
};

// ===== POSTS =====
export const postsAPI = {
  getFeed: () => apiFetch('/posts/feed'),
  getAll: () => apiFetch('/posts/feed'),

  getUserPosts: (userId) => apiFetch(`/posts/user/${userId}`),

  // ── Video Compression (FFmpeg.wasm) ──
  compressVideo: async (file, onProgress) => {
    // Compress if file size is > 20MB
    if (file.size <= 20 * 1024 * 1024) { 
      return file; 
    }

    try {
      onProgress && onProgress({ phase: 'compress', pct: 0 });
      const ffmpeg = await getFFmpeg(onProgress);

      const inputName = 'input.mp4';
      const outputName = 'output.mp4';

      // Write file to FFmpeg virtual file system
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      // Run FFmpeg compression commands
      await ffmpeg.exec([
        '-i', inputName,
        '-vcodec', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-vf', 'scale=-2:480',
        '-acodec', 'aac',
        '-b:a', '128k',
        outputName
      ]);

      // Read compressed file
      const data = await ffmpeg.readFile(outputName);
      
      // Cleanup FFmpeg virtual filesystem memory
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      // Create compressed File object
      const compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '_compressed.mp4'), {
        type: 'video/mp4'
      });

      console.log(`[FFmpeg] Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      
      onProgress && onProgress({ phase: 'compress', pct: 100 });
      return compressedFile;
    } catch (error) {
      console.error('FFmpeg compression failed, uploading original:', error);
      return file;
    }
  },

  uploadFile: async (file, onProgress) => {
    const token = getToken();
    const isVideo = file.type.startsWith('video') || /\.(mp4|mov|avi|mkv|webm|3gp)/i.test(file.name);

    // ── Step 1: Compress video if needed ──
    let fileToUpload = file;
    if (isVideo) {
      try {
        fileToUpload = await postsAPI.compressVideo(file, onProgress);
      } catch {
        fileToUpload = file; // fallback to original
      }
    }

    // ── Step 2: Try Telegram direct upload ──
    try {
      const config = await apiFetch('/posts/storage-config');
      if (config.provider === 'telegram' && config.telegramToken && config.telegramChatId) {
        const endpoint = isVideo ? 'sendVideo' : 'sendPhoto';
        const fieldName = isVideo ? 'video' : 'photo';

        const formData = new FormData();
        formData.append('chat_id', config.telegramChatId);
        formData.append(fieldName, fileToUpload);

        // XHR for real-time upload progress
        const url = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `https://api.telegram.org/bot${config.telegramToken}/${endpoint}`);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              onProgress && onProgress({ phase: 'upload', pct });
            }
          };
          xhr.onload = async () => {
            if (xhr.status !== 200) { reject(new Error('Telegram upload failed')); return; }
            const data = JSON.parse(xhr.responseText);
            const message = data.result;
            const fileId = isVideo
              ? message.video.file_id
              : message.photo[message.photo.length - 1].file_id;
            // Get file path
            const fileInfoRes = await fetch(`https://api.telegram.org/bot${config.telegramToken}/getFile?file_id=${fileId}`);
            if (!fileInfoRes.ok) { reject(new Error('getFile failed')); return; }
            const fileInfoData = await fileInfoRes.json();
            resolve(`https://api.telegram.org/file/bot${config.telegramToken}/${fileInfoData.result.file_path}`);
          };
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(formData);
        });
        onProgress && onProgress({ phase: 'upload', pct: 100 });
        return { url };
      }
    } catch (err) {
      console.warn('Telegram upload failed, falling back to server proxy:', err);
    }

    // ── Step 3: Fallback — upload through proxy server (XHR with progress) ──
    const formData = new FormData();
    formData.append('file', fileToUpload);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}/posts/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress && onProgress({ phase: 'upload', pct });
        }
      };
      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          try { reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed')); } catch { reject(new Error('Upload failed')); }
          return;
        }
        resolve(JSON.parse(xhr.responseText));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  },

  createPost: (postData) => apiFetch('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),

  reactToPost: (postId, type = 'like') => apiFetch(`/posts/${postId}/react`, {
    method: 'PUT',
    body: JSON.stringify({ type }),
  }),

  addComment: (postId, content) => apiFetch(`/posts/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  deletePost: (postId) => apiFetch(`/posts/${postId}`, { method: 'DELETE' }),

  updatePost: (postId, postData) => apiFetch(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  }),
};

// ===== USERS =====
export const usersAPI = {
  getProfile: (userId) => apiFetch(`/users/${userId}`),

  searchUsers: (q) => apiFetch(`/users/search?q=${encodeURIComponent(q)}`),

  getSuggestions: () => apiFetch('/users/suggestions'),

  updateProfile: (updates) => apiFetch('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),

  sendFriendRequest: (userId) => apiFetch(`/users/${userId}/friend-request`, { method: 'POST' }),

  acceptFriendRequest: (userId) => apiFetch(`/users/${userId}/accept-request`, { method: 'POST' }),

  declineFriendRequest: (userId) => apiFetch(`/users/${userId}/decline-request`, { method: 'DELETE' }),

  unfriend: (userId) => apiFetch(`/users/${userId}/unfriend`, { method: 'DELETE' }),

  // Follow/Unfollow
  follow: (userId) => apiFetch(`/users/${userId}/follow`, { method: 'POST' }),

  unfollow: (userId) => apiFetch(`/users/${userId}/unfollow`, { method: 'DELETE' }),

  getFollowers: (userId) => apiFetch(`/users/${userId}/followers`),

  getFollowing: (userId) => apiFetch(`/users/${userId}/following`),

  // Professional Mode
  toggleProfessional: () => apiFetch('/users/professional/toggle', { method: 'POST' }),

  setCategory: (category) => apiFetch('/users/professional/category', {
    method: 'PUT',
    body: JSON.stringify({ category }),
  }),

  getDashboard: () => apiFetch('/users/professional/dashboard'),

  getMyPostAnalytics: (period) => apiFetch(`/users/analytics/my-posts?period=${period || '90d'}`),

  trackPostView: (postId) => apiFetch('/users/analytics/track-view', {
    method: 'POST',
    body: JSON.stringify({ postId }),
  }),

  // Alias
  trackView: (postId) => apiFetch('/users/analytics/track-view', {
    method: 'POST',
    body: JSON.stringify({ postId }),
  }),
};

// ===== MESSAGES =====
export const messagesAPI = {
  getConversations: () => apiFetch('/messages'),

  getMessages: (userId) => apiFetch(`/messages/${userId}`),

  sendMessage: (receiverId, content, image = null) => apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content, image }),
  }),

  deleteMessage: (msgId) => apiFetch(`/messages/${msgId}`, {
    method: 'DELETE',
  }),

  getUnreadCount: () => apiFetch('/messages/unread/count'),
};

// ===== NOTIFICATIONS =====
export const notificationsAPI = {
  getAll: () => apiFetch('/notifications'),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),
};

// ===== ADMIN =====
export const adminAPI = {
  getCloudinary: () => apiFetch('/admin/cloudinary'),
  addCloudinary: (config) => apiFetch('/admin/cloudinary', {
    method: 'POST',
    body: JSON.stringify(config),
  }),
  activateCloudinary: (id) => apiFetch(`/admin/cloudinary/${id}/activate`, {
    method: 'PATCH',
  }),
  deleteCloudinary: (id) => apiFetch(`/admin/cloudinary/${id}`, {
    method: 'DELETE',
  }),
  getUsers: () => apiFetch('/admin/users'),
  banUser: (id) => apiFetch(`/admin/users/${id}/ban`, {
    method: 'PATCH',
  }),
  getPosts: () => apiFetch('/admin/posts'),
  deletePost: (id) => apiFetch(`/admin/posts/${id}`, {
    method: 'DELETE',
  }),
};

// ===== PRODUCTS (MARKETPLACE) =====
export const productsAPI = {
  getAll: () => apiFetch('/products'),
  create: (productData) => apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
};

// ===== PRESENCE (Online Status) =====
export const presenceAPI = {
  heartbeat: () => apiFetch('/presence/heartbeat', { method: 'POST' }),
  getOnline: (ids) => apiFetch(`/presence/online?ids=${ids.join(',')}`),
};

// ===== GROUPS =====
export const groupsAPI = {
  getAll: () => apiFetch('/groups'),
  create: (groupData) => apiFetch('/groups', {
    method: 'POST',
    body: JSON.stringify(groupData),
  }),
  join: (groupId) => apiFetch(`/groups/${groupId}/join`, {
    method: 'POST',
  }),
  leave: (groupId) => apiFetch(`/groups/${groupId}/leave`, {
    method: 'POST',
  }),
};

// ===== STORIES =====
export const storiesAPI = {
  getAll: () => apiFetch('/stories'),
  getArchive: () => apiFetch('/stories/archive'),
  create: (storyData) => apiFetch('/stories', {
    method: 'POST',
    body: JSON.stringify(storyData),
  }),
  viewStory: (storyId) => apiFetch(`/stories/${storyId}/view`, {
    method: 'POST',
  }),
  deleteStory: (storyId) => apiFetch(`/stories/${storyId}`, {
    method: 'DELETE',
  }),
};

export default { authAPI, postsAPI, usersAPI, messagesAPI, notificationsAPI, adminAPI, productsAPI, groupsAPI, storiesAPI, presenceAPI };
