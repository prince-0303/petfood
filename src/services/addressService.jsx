import api from './api';

export const addressService = {
  getAddresses: async () => {
    const response = await api.get('/addresses/');
    return response.data;
  },

  createAddress: async (addressData) => {
    const response = await api.post('/addresses/', addressData);
    return response.data;
  },

  updateAddress: async (id, addressData) => {
    const response = await api.put(`/addresses/${id}/`, addressData);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await api.delete(`/addresses/${id}/`);
    return response.data;
  },
};