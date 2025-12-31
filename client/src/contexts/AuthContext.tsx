import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import api from '../utils/api';

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
      // 验证token有效性
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // 可以添加验证token的API调用
    }
  }, [token]);

  const login = async (username: string, password: string, tenantId: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { username, password, tenantId });
      if (response.data.success) {
        const { token: newToken, account } = response.data.data;
        setToken(newToken);
        setUser(account);
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        message.success('登录成功');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('登录错误:', error);
      const errorMessage = error.response?.data?.error || error.message || '登录失败，请检查后端服务是否启动';
      message.error(errorMessage);
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        message.error('无法连接到后端服务，请确保后端服务已启动在 http://localhost:3001');
      }
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    message.success('已退出登录');
  };

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

