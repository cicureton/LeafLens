import axios from 'axios';

const API_BASE_URL = 'https://leaflens-16s1.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

interface UserData {
  name: string;
  email: string;
  user_type: string;
  password_hash: string; // Keep password_hash required for backend
}

export const adminAPI = {
  // Users
  getUsers: () => api.get('/users/'),
  deleteUser: (userId: number) => api.delete(`/users/${userId}`),
  updateUser: (userId: number, userData: UserData) => api.put(`/users/${userId}`, userData),
  
  // Plants
  getPlants: () => api.get('/plants'),
  
  // Diseases
  getDiseases: () => api.get('/diseases'),

  // Scans
  getScans: () => api.get('/scans'),
  deleteScan: (scanId: number) => api.delete(`/scans/${scanId}`),
  
  // Forum Posts
  getForumPosts: () => api.get('/forum_posts'),
};

export default api;