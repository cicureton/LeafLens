import axios from 'axios';

const API_BASE_URL = 'https://leaflens-16s1.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const adminAPI = {
  // Users
  getUsers: () => api.get('/users'),
  
  // Plants
  getPlants: () => api.get('/plants'),
  
  // Diseases
  getDiseases: () => api.get('/diseases'),
  
  // Forum Posts
  getForumPosts: () => api.get('/forum_posts'),
  
};

export default api;