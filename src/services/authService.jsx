import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/login/', { email, password });
    
    const access = response.data.tokens?.access || response.data.access;
    const refresh = response.data.tokens?.refresh || response.data.refresh;
    
    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } else {
      throw new Error('Invalid login response - no tokens received');
    }
  },

  // Logout
  logout: async () => {
    try {
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
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