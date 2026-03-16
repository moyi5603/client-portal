// Mock API 数据，用于演示
export const mockAuth = {
  login: (username: string, password: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
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
    usageCount: 5,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-004',
    name: 'Order Manager',
    description: 'Order management permissions',
    status: 'ACTIVE',
    permissions: ['order.*', 'order.view', 'order.create', 'order.edit'],
    usageCount: 8,
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-005',
    name: 'Transport Manager',
    description: 'Transportation management permissions',
    status: 'ACTIVE',
    permissions: ['transport.*', 'vehicle.*'],
    usageCount: 3,
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-006',
    name: 'Viewer',
    description: 'Read-only access to most modules',
    status: 'ACTIVE',
    permissions: ['*.view'],
    usageCount: 12,
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