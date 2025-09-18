import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/index';
import api from '../utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Get user profile if we have a token
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('auth_token', newToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('auth_token', newToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const updateCurrency = async (currency: string) => {
    try {
      const response = await api.put('/auth/currency', { currency });
      if (user) {
        setUser({ ...user, currency });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update currency');
    }
  };

  const checkSetup = async (): Promise<boolean> => {
    try {
      const response = await api.get('/auth/check-setup');
      return response.data.hasPassword;
    } catch (error) {
      console.error('Failed to check setup:', error);
      return false;
    }
  };

  const setupPassword = async (password: string, currency: string = 'USD') => {
    try {
      const response = await api.post('/auth/setup-password', { password, currency });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('auth_token', newToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to set up password');
    }
  };

  const loginWithPassword = async (password: string) => {
    try {
      const response = await api.post('/auth/login-password', { password });
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem('auth_token', newToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Invalid password');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updateCurrency,
    checkSetup,
    setupPassword,
    loginWithPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};