import axios from 'axios';
import { mockAuth, mockMenus, mockRoles, mockAccounts } from './mockApi';

// 检查是否在生产环境且没有真实 API
const isProduction = import.meta.env.PROD;
const useMockData = isProduction; // 在生产环境使用 Mock 数据

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock API 拦截器
if (useMockData) {
  api.interceptors.request.use(
    async (config) => {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { method, url } = config;
      
      // 认证接口
      if (method === 'post' && url === '/auth') {
        const { username, password } = config.data;
        try {
          const result = await mockAuth.login(username, password);
          // 直接返回成功的响应，不要抛出错误
          return Promise.reject({ 
            response: { 
              data: result, 
              status: 200,
              statusText: 'OK'
            } 
          });
        } catch (error) {
          return Promise.reject({ 
            response: { 
              data: error, 
              status: 401,
              statusText: 'Unauthorized'
            } 
          });
        }
      }
      
      // 菜单接口
      if (method === 'get' && url === '/menus') {
        return Promise.reject({ 
          response: { 
            data: { success: true, data: mockMenus },
            status: 200,
            statusText: 'OK'
          } 
        });
      }
      
      // 角色接口
      if (method === 'get' && url === '/roles') {
        return Promise.reject({ 
          response: { 
            data: { 
              success: true, 
              data: { items: mockRoles, total: mockRoles.length } 
            },
            status: 200,
            statusText: 'OK'
          } 
        });
      }
      
      // 账号接口
      if (method === 'get' && url === '/accounts') {
        return Promise.reject({ 
          response: { 
            data: { 
              success: true, 
              data: { items: mockAccounts, total: mockAccounts.length } 
            },
            status: 200,
            statusText: 'OK'
          } 
        });
      }
      
      // 如果没有匹配的Mock接口，返回404
      return Promise.reject({
        response: {
          data: { success: false, error: 'API not found' },
          status: 404,
          statusText: 'Not Found'
        }
      });
    },
    error => Promise.reject(error)
  );
}

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 处理 Mock 数据的响应
    if (useMockData && error.response) {
      return Promise.resolve(error.response);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

