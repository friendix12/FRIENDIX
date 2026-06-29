// ============================================================
// FRIENDIX API Service — connects frontend to backend
// All API calls go through here
// ============================================================

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

  uploadFile: async (file) => {
    try {
      // 1. Fetch storage config
      const config = await apiFetch('/posts/storage-config');
      if (config.provider === 'telegram' && config.telegramToken && config.telegramChatId) {
        const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|avi|mkv|webm|3gp)/i);
        const endpoint = isVideo ? 'sendVideo' : 'sendPhoto';
        const fieldName = isVideo ? 'video' : 'photo';

        const formData = new FormData();
        formData.append('chat_id', config.telegramChatId);
        formData.append(fieldName, file);

        // Upload directly from browser to Telegram API (bypassing Vercel limits!)
        const response = await fetch(`https://api.telegram.org/bot${config.telegramToken}/${endpoint}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Direct Telegram upload failed');
        }

        const data = await response.json();
        const message = data.result;
        const fileId = isVideo 
          ? message.video.file_id 
          : message.photo[message.photo.length - 1].file_id;

        // Get file path
        const fileInfoRes = await fetch(`https://api.telegram.org/bot${config.telegramToken}/getFile?file_id=${fileId}`);
        if (!fileInfoRes.ok) {
          throw new Error('Telegram getFile failed');
        }
        const fileInfoData = await fileInfoRes.json();
        const filePath = fileInfoData.result.file_path;

        return {
          url: `https://api.telegram.org/file/bot${config.telegramToken}/${filePath}`
        };
      }
    } catch (err) {
      console.warn('Direct Telegram upload failed or not configured, falling back to server upload proxy:', err);
    }

    // Fallback: upload through proxy server
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/posts/upload', {
      method: 'POST',
      body: formData,
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
