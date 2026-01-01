// src/Context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAndSetCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const data = await cartService.getCartCount();
      setCartCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    const loadStoredUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Invalid user data in localStorage');
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);

      return data;
    } catch (error) {
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