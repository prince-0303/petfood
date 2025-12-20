import api from './api';

export const cartService = {
  // Get cart
  getCart: async () => {
    const response = await api.get('/cart/');
    return response.data;
  },

  // Add to cart
  addToCart: async (product_id, quantity = 1) => {
    const response = await api.post('/cart/add/', {
      product_id,
      quantity,
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (item_id, quantity) => {
    const response = await api.put(`/cart/update/${item_id}/`, {
      quantity,
    });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (item_id) => {
    const response = await api.delete(`/cart/remove/${item_id}/`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear/');
    return response.data;
  },

  // Get cart count
  getCartCount: async () => {
    const response = await api.get('/cart/count/');
    return response.data;
  },
};