// Mock API 数据，用于演示
// 模拟延迟
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 生成唯一ID
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 审计日志数据
let mockAuditLogs = [
  {
    id: 'AUDIT-001',
    timestamp: '2026-03-16T16:30:00.000Z',
    operator: 'admin',
    action: '登录',
    target: '系统',
    description: '用户成功登录系统',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'AUDIT-002',
    timestamp: '2026-03-16T15:45:00.000Z',
    operator: 'admin',
    action: '创建角色',
    target: '系统管理员',
    description: '创建了新的系统角色',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'AUDIT-003',
    timestamp: '2026-03-16T14:20:00.000Z',
    operator: 'john.smith',
    action: '更新账号',
    target: '个人信息',
    description: '更新了个人邮箱信息',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'AUDIT-004',
    timestamp: '2026-03-16T13:15:00.000Z',
    operator: 'admin',
    action: '删除菜单',
    target: '测试菜单',
    description: '删除了测试用的菜单项',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'AUDIT-005',
    timestamp: '2026-03-16T12:30:00.000Z',
    operator: 'mary.johnson',
    action: '查看报表',
    target: '采购报表',
    description: '查看了本月采购统计报表',
    ipAddress: '192.168.1.102'
  }
];

// 添加审计日志
const addAuditLog = (action: string, target: string, description: string, operator: string = 'admin') => {
  const newLog = {
    id: generateId('AUDIT'),
    timestamp: new Date().toISOString(),
    operator,
    action,
    target,
    description,
    ipAddress: '192.168.1.100'
  };
  mockAuditLogs.unshift(newLog);
  // 保持最新的50条记录
  if (mockAuditLogs.length > 50) {
    mockAuditLogs = mockAuditLogs.slice(0, 50);
  }
};

export const mockAuth = {
  login: (username: string, password: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          addAuditLog('登录', '系统', '用户成功登录系统', username);
          resolve({
            success: true,
            data: {
              token: 'mock-jwt-token',
              user: {
                id: '1',
                username: 'admin',
                accountType: 'MAIN'
              }
            }
          });
        } else {
          addAuditLog('登录失败', '系统', '用户登录失败，密码错误', username);
          reject({
            success: false,
            error: 'Invalid credentials'
          });
        }
      }, 500);
    });
  }
};

export const mockMenus = [
  {
    id: '1',
    name: '工作台',
    code: 'dashboard',
    path: '/dashboard',
    order: 1,
    type: 'MENU',
    status: 'NORMAL',
    parentId: null,
    children: []
  },
  {
    id: '2',
    name: '系统管理',
    code: 'system',
    path: '/system',
    order: 2,
    type: 'DIRECTORY',
    status: 'NORMAL',
    parentId: null,
    children: [
      {
        id: '3',
        name: '菜单管理',
        code: 'menu-management',
        path: '/system/menus',
        order: 1,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '2'
      },
      {
        id: '4',
        name: '角色管理',
        code: 'role-management',
        path: '/system/roles',
        order: 2,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '2'
      },
      {
        id: '5',
        name: '账号管理',
        code: 'account-management',
        path: '/system/accounts',
        order: 3,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '2'
      }
    ]
  },
  {
    id: '6',
    name: '采购管理',
    code: 'purchase',
    path: '/purchase',
    order: 3,
    type: 'DIRECTORY',
    status: 'NORMAL',
    parentId: null,
    children: [
      {
        id: '7',
        name: '采购订单',
        code: 'purchase-orders',
        path: '/purchase/orders',
        order: 1,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '6'
      },
      {
        id: '8',
        name: '供应商管理',
        code: 'suppliers',
        path: '/purchase/suppliers',
        order: 2,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '6'
      }
    ]
  },
  {
    id: '9',
    name: '订单管理',
    code: 'orders',
    path: '/orders',
    order: 4,
    type: 'DIRECTORY',
    status: 'NORMAL',
    parentId: null,
    children: [
      {
        id: '10',
        name: '订单列表',
        code: 'order-list',
        path: '/orders/list',
        order: 1,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '9'
      },
      {
        id: '11',
        name: '订单统计',
        code: 'order-stats',
        path: '/orders/stats',
        order: 2,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '9'
      }
    ]
  },
  {
    id: '12',
    name: '运输管理',
    code: 'transport',
    path: '/transport',
    order: 5,
    type: 'DIRECTORY',
    status: 'NORMAL',
    parentId: null,
    children: [
      {
        id: '13',
        name: '运输计划',
        code: 'transport-plan',
        path: '/transport/plan',
        order: 1,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '12'
      },
      {
        id: '14',
        name: '车辆管理',
        code: 'vehicles',
        path: '/transport/vehicles',
        order: 2,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '12'
      }
    ]
  }
];

// 菜单管理 API
export const mockMenuApi = {
  // 获取所有菜单
  getMenus: async () => {
    await mockDelay();
    return {
      success: true,
      data: mockMenus
    };
  },

  // 创建菜单
  createMenu: async (menuData: any) => {
    await mockDelay();
    const newMenu = {
      id: generateId('MENU'),
      ...menuData,
      children: []
    };
    mockMenus.push(newMenu);
    addAuditLog('创建菜单', menuData.name, `创建了新的菜单项: ${menuData.name}`);
    return {
      success: true,
      data: newMenu
    };
  },

  // 更新菜单
  updateMenu: async (id: string, menuData: any) => {
    await mockDelay();
    const index = mockMenus.findIndex(m => m.id === id);
    if (index !== -1) {
      mockMenus[index] = { ...mockMenus[index], ...menuData };
      addAuditLog('更新菜单', menuData.name, `更新了菜单项: ${menuData.name}`);
      return {
        success: true,
        data: mockMenus[index]
      };
    }
    return {
      success: false,
      error: 'Menu not found'
    };
  },

  // 删除菜单
  deleteMenu: async (id: string) => {
    await mockDelay();
    const index = mockMenus.findIndex(m => m.id === id);
    if (index !== -1) {
      const menu = mockMenus[index];
      mockMenus.splice(index, 1);
      addAuditLog('删除菜单', menu.name, `删除了菜单项: ${menu.name}`);
      return {
        success: true
      };
    }
    return {
      success: false,
      error: 'Menu not found'
    };
  }
};

export const mockRoles = [
  {
    id: 'ROLE-001',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    status: 'ACTIVE',
    permissions: ['*'],
    usageCount: 1,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-002',
    name: 'System Administrator',
    description: 'System management access',
    status: 'ACTIVE',
    permissions: ['system.*', 'menu.*', 'role.*', 'account.*'],
    usageCount: 2,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-003',
    name: 'Purchase Manager',
    description: 'Purchase management permissions',
    status: 'ACTIVE',
    permissions: ['purchase.*', 'supplier.*'],
    usageCount: 2,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-004',
    name: 'Order Manager',
    description: 'Order management permissions',
    status: 'ACTIVE',
    permissions: ['order.*', 'order.view', 'order.create', 'order.edit'],
    usageCount: 2,
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-005',
    name: 'Transport Manager',
    description: 'Transportation management permissions',
    status: 'ACTIVE',
    permissions: ['transport.*', 'vehicle.*'],
    usageCount: 1,
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-006',
    name: 'Viewer',
    description: 'Read-only access to most modules',
    status: 'ACTIVE',
    permissions: ['*.view'],
    usageCount: 5,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-007',
    name: 'Disabled Role',
    description: 'This role is currently disabled',
    status: 'INACTIVE',
    permissions: [],
    usageCount: 0,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 角色管理 API
export const mockRoleApi = {
  // 获取所有角色
  getRoles: async () => {
    await mockDelay();
    return {
      success: true,
      data: {
        items: mockRoles,
        total: mockRoles.length
      }
    };
  },

  // 创建角色
  createRole: async (roleData: any) => {
    await mockDelay();
    const newRole = {
      id: generateId('ROLE'),
      ...roleData,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockRoles.push(newRole);
    addAuditLog('创建角色', roleData.name, `创建了新的角色: ${roleData.name}`);
    return {
      success: true,
      data: newRole
    };
  },

  // 更新角色
  updateRole: async (id: string, roleData: any) => {
    await mockDelay();
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRoles[index] = { 
        ...mockRoles[index], 
        ...roleData, 
        updatedAt: new Date().toISOString() 
      };
      addAuditLog('更新角色', roleData.name, `更新了角色: ${roleData.name}`);
      return {
        success: true,
        data: mockRoles[index]
      };
    }
    return {
      success: false,
      error: 'Role not found'
    };
  },

  // 删除角色
  deleteRole: async (id: string) => {
    await mockDelay();
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
      const role = mockRoles[index];
      mockRoles.splice(index, 1);
      addAuditLog('删除角色', role.name, `删除了角色: ${role.name}`);
      return {
        success: true
      };
    }
    return {
      success: false,
      error: 'Role not found'
    };
  }
};

export const mockAccounts = [
  {
    id: 'ACC-001',
    username: 'admin',
    email: 'admin@example.com',
    accountType: 'MAIN',
    status: 'ACTIVE',
    roles: ['ROLE-001'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-002',
    username: 'john.smith',
    email: 'john.smith@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002'],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-003',
    username: 'mary.johnson',
    email: 'mary.johnson@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-003'],
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-004',
    username: 'david.wilson',
    email: 'david.wilson@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-004'],
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-005',
    username: 'sarah.brown',
    email: 'sarah.brown@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-005'],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-006',
    username: 'mike.davis',
    email: 'mike.davis@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-006'],
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-007',
    username: 'lisa.garcia',
    email: 'lisa.garcia@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-003', 'ROLE-006'],
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-008',
    username: 'tom.martinez',
    email: 'tom.martinez@example.com',
    accountType: 'SUB',
    status: 'INACTIVE',
    roles: ['ROLE-006'],
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-009',
    username: 'anna.rodriguez',
    email: 'anna.rodriguez@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-004', 'ROLE-006'],
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-010',
    username: 'james.lee',
    email: 'james.lee@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002', 'ROLE-006'],
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 账号管理 API
export const mockAccountApi = {
  // 获取所有账号
  getAccounts: async () => {
    await mockDelay();
    return {
      success: true,
      data: {
        items: mockAccounts,
        total: mockAccounts.length
      }
    };
  },

  // 创建账号
  createAccount: async (accountData: any) => {
    await mockDelay();
    const newAccount = {
      id: generateId('ACC'),
      ...accountData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockAccounts.push(newAccount);
    addAuditLog('创建账号', accountData.username, `创建了新的用户账号: ${accountData.username}`);
    return {
      success: true,
      data: newAccount
    };
  },

  // 更新账号
  updateAccount: async (id: string, accountData: any) => {
    await mockDelay();
    const index = mockAccounts.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAccounts[index] = { 
        ...mockAccounts[index], 
        ...accountData, 
        updatedAt: new Date().toISOString() 
      };
      addAuditLog('更新账号', accountData.username, `更新了用户账号: ${accountData.username}`);
      return {
        success: true,
        data: mockAccounts[index]
      };
    }
    return {
      success: false,
      error: 'Account not found'
    };
  },

  // 删除账号
  deleteAccount: async (id: string) => {
    await mockDelay();
    const index = mockAccounts.findIndex(a => a.id === id);
    if (index !== -1) {
      const account = mockAccounts[index];
      mockAccounts.splice(index, 1);
      addAuditLog('删除账号', account.username, `删除了用户账号: ${account.username}`);
      return {
        success: true
      };
    }
    return {
      success: false,
      error: 'Account not found'
    };
  }
};

// 审计日志 API
export const mockAuditApi = {
  // 获取审计日志
  getAuditLogs: async (page: number = 1, pageSize: number = 20) => {
    await mockDelay();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const sortedLogs = [...mockAuditLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return {
      success: true,
      data: {
        items: sortedLogs.slice(start, end),
        total: mockAuditLogs.length,
        page,
        pageSize
      }
    };
  }
};

// 统计数据 API
export const mockStatsApi = {
  // 获取系统统计
  getStats: async () => {
    await mockDelay();
    return {
      success: true,
      data: {
        accountCount: mockAccounts.length,
        roleCount: mockRoles.length,
        menuCount: mockMenus.length,
        auditCount: mockAuditLogs.length,
        activeAccountCount: mockAccounts.filter(a => a.status === 'ACTIVE').length,
        activeRoleCount: mockRoles.filter(r => r.status === 'ACTIVE').length
      }
    };
  }
};