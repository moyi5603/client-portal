import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { toast } from '../components/ui/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  accountType: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, tenantId: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Verify token validity
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = useCallback(async (username: string, password: string, tenantId: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { username, password, tenantId });
      if (response.data.success) {
        const { token: newToken, account } = response.data.data;
        setToken(newToken);
        setUser(account);
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        toast({
          title: 'Success',
          description: 'Login successful',
          variant: 'success',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed, please check if the backend service is running';
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        toast({
          title: 'Connection Error',
          description: 'Cannot connect to backend service. Please ensure it is running on http://localhost:3001',
          variant: 'destructive',
        });
      }
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
      variant: 'success',
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
