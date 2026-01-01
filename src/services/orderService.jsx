import api from './api';

export const orderService = {
  placeOrder: async (orderData) => {
    const response = await api.post('/placeorder/', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/orderlist/');
    return response.data;
  },

  getOrderDetail: async (orderId) => {
    const response = await api.get(`/order/${orderId}/`);
    return response.data;
  },
};