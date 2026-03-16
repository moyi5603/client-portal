import axios from 'axios';
import { 
  mockAuth, 
  mockMenuApi, 
  mockRoleApi, 
  mockAccountApi, 
  mockAuditApi, 
  mockStatsApi,
  mockCustomerApi,
  mockFacilityApi
} from './mockApi';

// 使用Mock数据确保稳定性
const useMockData = true;

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock API 拦截器
if (useMockData) {
  api.interceptors.request.use(
    async (config) => {
      const { method, url, data } = config;
      
      try {
        // 认证接口
        if (method === 'post' && url === '/auth') {
          const { username, password } = data;
          const result = await mockAuth.login(username, password);
          return Promise.reject({ 
            response: { 
              data: result, 
              status: 200,
              statusText: 'OK'
            } 
          });
        }
        
        // 菜单接口
        if (method === 'get' && url === '/menus') {
          const result = await mockMenuApi.getMenus();
          return Promise.reject({ 
            response: { 
              data: result,
              status: 200,
              statusText: 'OK'
            } 
          });
        }
        
        if (method === 'post' && url === '/menus') {
          const result = await mockMenuApi.createMenu(data);
          return Promise.reject({
            response: {
              data: result,
              status: 201,
              statusText: 'Created'
            }
          });
        }
        
        if (method === 'put' && url?.startsWith('/menus/')) {
          const menuId = url.split('/')[2];
          const result = await mockMenuApi.updateMenu(menuId, data);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        if (method === 'delete' && url?.startsWith('/menus/')) {
          const menuId = url.split('/')[2];
          const result = await mockMenuApi.deleteMenu(menuId);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        // 角色接口
        if (method === 'get' && url === '/roles') {
          const result = await mockRoleApi.getRoles();
          return Promise.reject({ 
            response: { 
              data: result,
              status: 200,
              statusText: 'OK'
            } 
          });
        }
        
        if (method === 'post' && url === '/roles') {
          const result = await mockRoleApi.createRole(data);
          return Promise.reject({
            response: {
              data: result,
              status: 201,
              statusText: 'Created'
            }
          });
        }
        
        if (method === 'put' && url?.startsWith('/roles/')) {
          const roleId = url.split('/')[2];
          const result = await mockRoleApi.updateRole(roleId, data);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        if (method === 'delete' && url?.startsWith('/roles/')) {
          const roleId = url.split('/')[2];
          const result = await mockRoleApi.deleteRole(roleId);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        // 账号接口
        if (method === 'get' && url === '/accounts') {
          const result = await mockAccountApi.getAccounts();
          return Promise.reject({ 
            response: { 
              data: result,
              status: 200,
              statusText: 'OK'
            } 
          });
        }
        
        if (method === 'post' && url === '/accounts') {
          const result = await mockAccountApi.createAccount(data);
          return Promise.reject({
            response: {
              data: result,
              status: 201,
              statusText: 'Created'
            }
          });
        }
        
        if (method === 'put' && url?.startsWith('/accounts/')) {
          const accountId = url.split('/')[2];
          const result = await mockAccountApi.updateAccount(accountId, data);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        if (method === 'delete' && url?.startsWith('/accounts/')) {
          const accountId = url.split('/')[2];
          const result = await mockAccountApi.deleteAccount(accountId);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        // 客户接口
        if (method === 'get' && url === '/customers') {
          const result = await mockCustomerApi.getCustomers();
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        if (method === 'post' && url === '/customers') {
          const result = await mockCustomerApi.createCustomer(data);
          return Promise.reject({
            response: {
              data: result,
              status: 201,
              statusText: 'Created'
            }
          });
        }
        
        if (method === 'put' && url?.startsWith('/customers/')) {
          const customerId = url.split('/')[2];
          const result = await mockCustomerApi.updateCustomer(customerId, data);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        if (method === 'delete' && url?.startsWith('/customers/')) {
          const customerId = url.split('/')[2];
          const result = await mockCustomerApi.deleteCustomer(customerId);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        // 设施接口
        if (method === 'get' && url === '/facilities') {
          const result = await mockFacilityApi.getFacilities();
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        if (method === 'get' && url?.startsWith('/facilities/customer/')) {
          const customerId = url.split('/')[3];
          const result = await mockFacilityApi.getFacilitiesByCustomer(customerId);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        if (method === 'post' && url === '/facilities') {
          const result = await mockFacilityApi.createFacility(data);
          return Promise.reject({
            response: {
              data: result,
              status: 201,
              statusText: 'Created'
            }
          });
        }
        
        if (method === 'put' && url?.startsWith('/facilities/')) {
          const facilityId = url.split('/')[2];
          const result = await mockFacilityApi.updateFacility(facilityId, data);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        if (method === 'delete' && url?.startsWith('/facilities/')) {
          const facilityId = url.split('/')[2];
          const result = await mockFacilityApi.deleteFacility(facilityId);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        // 审计日志接口
        if (method === 'get' && url === '/audit-logs') {
          const params = new URLSearchParams(config.params);
          const page = parseInt(params.get('page') || '1');
          const pageSize = parseInt(params.get('pageSize') || '20');
          const result = await mockAuditApi.getAuditLogs(page, pageSize);
          return Promise.reject({
            response: {
              data: result,
              status: 200,
              statusText: 'OK'
            }
          });
        }
        
        // 统计数据接口
        if (method === 'get' && url === '/stats') {
          const result = await mockStatsApi.getStats();
          return Promise.reject({
            response: {
              data: result,
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
        
      } catch (error) {
        return Promise.reject({
          response: {
            data: { success: false, error: error.message },
            status: 500,
            statusText: 'Internal Server Error'
          }
        });
      }
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

