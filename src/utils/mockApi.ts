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
  }
];

export const mockRoles = [
  {
    id: 'ROLE-001',
    name: 'Super Administrator',
    description: 'Full system access',
    status: 'ACTIVE',
    permissions: [],
    usageCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-002',
    name: 'System Administrator',
    description: 'System management access',
    status: 'ACTIVE',
    permissions: [],
    usageCount: 2,
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-002',
    username: 'john.smith',
    email: 'john@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];