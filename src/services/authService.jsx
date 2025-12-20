import api from './api';

export const authService = {
  // Register
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/login/', { email, password });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    try {
      await api.post('/logout/', { refresh });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Get Profile
  getProfile: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};