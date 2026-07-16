import axios from 'axios';
import { supabase } from './supabase';

// Backend API base URL - use relative path for Vite proxy
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15s timeout to prevent hanging requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      supabase.auth.signOut().finally(() => {
        window.location.href = '/login';
      });
    } else if (error.response?.status === 403 && 
               (error.response?.data?.message?.includes('vô hiệu hóa') || 
                error.response?.data?.message?.includes('disabled') || 
                error.response?.data?.message?.includes('inactive'))) {
      // Account deactivated
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      supabase.auth.signOut().finally(() => {
        window.location.href = '/login?error=deactivated';
      });
    }
    return Promise.reject(error);
  }
);

export const API_URL = API_BASE_URL; // Alias for compatibility
export { API_BASE_URL };
export default api;
