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

  getUserPosts: (userId) => apiFetch(`/posts/user/${userId}`),

  uploadFile: (file) => {
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
};

// ===== MESSAGES =====
export const messagesAPI = {
  getConversations: () => apiFetch('/messages'),

  getMessages: (userId) => apiFetch(`/messages/${userId}`),

  sendMessage: (receiverId, content, image = null) => apiFetch('/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content, image }),
  }),
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

export default { authAPI, postsAPI, usersAPI, messagesAPI, notificationsAPI, adminAPI };
