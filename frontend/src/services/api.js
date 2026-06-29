// ============================================================
// FRIENDIX API Service — connects frontend to backend
// All API calls go through here
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('friendix_token');

// Generic fetch helper
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
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

  getMe: () => apiFetch('/auth/me'),
};

// ===== POSTS =====
export const postsAPI = {
  getFeed: () => apiFetch('/posts/feed'),

  getUserPosts: (userId) => apiFetch(`/posts/user/${userId}`),

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

export default { authAPI, postsAPI, usersAPI, messagesAPI, notificationsAPI };
