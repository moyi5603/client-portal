import axios from 'axios';
import { mockAPI } from './mockApi';

// 检查是否使用Mock API (生产环境或没有后端时)
const USE_MOCK_API = import.meta.env.PROD || !import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3003/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API包装器 - 根据环境选择真实API或Mock API
const apiWrapper = {
  // 认证相关
  post: async (url: string, data?: any, config?: any) => {
    if (USE_MOCK_API) {
      // 使用Mock API
      switch (url) {
        case '/auth':
          return mockAPI.login(data.username, data.password);
        case '/accounts':
          return mockAPI.createAccount(data);
        case '/roles':
          return mockAPI.createRole(data);
        case '/menus':
          return mockAPI.createMenu(data);
        default:
          throw new Error(`Mock API endpoint not implemented: POST ${url}`);
      }
    }
    return api.post(url, data, config);
  },

  get: async (url: string, config?: any) => {
    if (USE_MOCK_API) {
      // 使用Mock API
      switch (true) {
        case url === '/accounts':
          return mockAPI.getAccounts();
        case url === '/roles':
          return mockAPI.getRoles();
        case url === '/menus':
          return mockAPI.getMenus();
        case url.startsWith('/audit-logs'):
          const params = new URLSearchParams(url.split('?')[1]);
          return mockAPI.getAuditLogs(Object.fromEntries(params));
        default:
          throw new Error(`Mock API endpoint not implemented: GET ${url}`);
      }
    }
    return api.get(url, config);
  },

  put: async (url: string, data?: any, config?: any) => {
    if (USE_MOCK_API) {
      // 使用Mock API
      const id = data.id;
      switch (true) {
        case url === '/accounts':
          return mockAPI.updateAccount(id, data);
        case url === '/roles':
          return mockAPI.updateRole(id, data);
        case url === '/menus':
          return mockAPI.updateMenu(id, data);
        default:
          throw new Error(`Mock API endpoint not implemented: PUT ${url}`);
      }
    }
    return api.put(url, data, config);
  },

  delete: async (url: string, config?: any) => {
    if (USE_MOCK_API) {
      // 从URL中提取ID
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 1];
      
      switch (true) {
        case url.includes('/accounts/'):
          return mockAPI.deleteAccount(id);
        case url.includes('/roles/'):
          return mockAPI.deleteRole(id);
        case url.includes('/menus/'):
          return mockAPI.deleteMenu(id);
        default:
          throw new Error(`Mock API endpoint not implemented: DELETE ${url}`);
      }
    }
    return api.delete(url, config);
  }
};

export default apiWrapper;

