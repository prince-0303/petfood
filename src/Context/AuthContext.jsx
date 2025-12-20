import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch cart count from Django backend
  const fetchAndSetCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const data = await cartService.getCartCount();
      setCartCount(data.count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  // Update cart count when user changes
  useEffect(() => {
    if (user) {
      fetchAndSetCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      await fetchAndSetCartCount();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setCartCount(0);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        cartCount,
        setCartCount,
        fetchAndSetCartCount,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};