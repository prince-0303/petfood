import api from './api';

export const adminService = {
  // dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/');
    return response.data;
  },

  // user mngmnt
  getUsers: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/`);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}/`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}/`);
    return response.data;
  },

  restrictUser: async (userId, restricted) => {
    const response = await api.put(`/admin/users/${userId}/`, { restricted });
    return response.data;
  },

  toggleUserActive: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/`, { is_active: isActive });
    return response.data;
  },

  // product mngmnt
  getProducts: async (search = '', category = '') => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const response = await api.get('/admin/products/', { params });
    return response.data;
  },

  getProductById: async (productId) => {
    const response = await api.get(`/admin/products/${productId}/`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/admin/products/', productData);
    return response.data;
  },

  updateProduct: async (productId, productData) => {
    const response = await api.put(`/admin/products/${productId}/`, productData);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/admin/products/${productId}/`);
    return response.data;
  },

  // order mngmnt
  getOrders: async (status = '', search = '') => {
    const params = {};
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await api.get('/admin/orders/', { params });
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}/`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/admin/orders/${orderId}/`, { status });
    return response.data;
  },
};