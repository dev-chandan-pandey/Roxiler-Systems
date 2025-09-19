import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.setAuthToken(token);
          const response = await api.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.login(email, password);
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed',
        errors: error.response?.data?.errors
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setAuthToken(null);
    setUser(null);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.updatePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password update failed',
        errors: error.response?.data?.errors
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
