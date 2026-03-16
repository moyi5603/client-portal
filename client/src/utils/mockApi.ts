// Mock API适配器 - 使用前端Mock数据
declare global {
  interface Window {
    mockData: any;
  }
}

// Mock数据 - 与client-mock-data.js保持一致
const mockData = {
  // 账号数据
  accounts: [
    {
      id: 'ACC-000',
      username: 'admin',
      email: 'admin@example.com',
      phone: '13800138000',
      accountType: 'MAIN',
      status: 'ACTIVE',
      tenantId: 'admin',
      roles: ['ROLE-000'],
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ACC-001',
      username: 'john.smith',
      email: 'john.smith@example.com',
      phone: '13800138001',
      accountType: 'SUB',
      status: 'ACTIVE',
      tenantId: 'admin',
      roles: ['ROLE-001', 'ROLE-002'],
      customerIds: ['customer-1', 'customer-2', 'customer-3'],
      facilityIds: ['facility-1', 'facility-2', 'facility-3', 'facility-4', 'facility-5'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ACC-002',
      username: 'jane.doe',
      email: 'jane.doe@example.com',
      phone: '13800138002',
      accountType: 'SUB',
      status: 'ACTIVE',
      tenantId: 'admin',
      roles: ['ROLE-003'],
      customerIds: ['customer-1'],
      facilityIds: ['facility-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ACC-003',
      username: 'mike.johnson',
      email: 'mike.johnson@example.com',
      phone: '13800138003',
      accountType: 'SUB',
      status: 'ACTIVE',
      tenantId: 'admin',
      roles: ['ROLE-002'],
      customerIds: ['customer-2'],
      facilityIds: ['facility-2', 'facility-3'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // 角色数据
  roles: [
    {
      id: 'ROLE-000',
      name: 'Super Administrator',
      description: 'Super administrator with all permissions',
      status: 'ACTIVE',
      permissions: [
        {
          module: 'DASHBOARDS',
          page: 'KPI',
          pageCode: 'kpi',
          operations: ['VIEW']
        },
        {
          module: 'PERMISSION_MANAGEMENT',
          page: 'Account Management',
          pageCode: 'account-management',
          operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
        },
        {
          module: 'PERMISSION_MANAGEMENT',
          page: 'Role Management',
          pageCode: 'role-management',
          operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
        },
        {
          module: 'PERMISSION_MANAGEMENT',
          page: 'Menu Management',
          pageCode: 'menu-management',
          operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
        }
      ],
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystemRole: true
    },
    {
      id: 'ROLE-001',
      name: 'System Administrator',
      description: 'Full system access with all permissions',
      status: 'ACTIVE',
      permissions: [
        {
          module: 'SYSTEM_MANAGEMENT',
          page: 'Address Book',
          pageCode: 'address-book',
          operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT']
        },
        {
          module: 'PERMISSION_MANAGEMENT',
          page: 'Account Management',
          pageCode: 'account-management',
          operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
        }
      ],
      usageCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ROLE-002',
      name: 'Customer Administrator',
      description: 'Manage customer users and roles',
      status: 'ACTIVE',
      permissions: [
        {
          module: 'DASHBOARDS',
          page: 'KPI',
          pageCode: 'kpi',
          operations: ['VIEW']
        },
        {
          module: 'INVENTORY',
          page: 'Inventory Status',
          pageCode: 'inventory-status',
          operations: ['VIEW', 'EXPORT']
        }
      ],
      usageCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ROLE-003',
      name: 'Customer Service Representative',
      description: 'Handle customer inquiries and support',
      status: 'ACTIVE',
      permissions: [
        {
          module: 'DASHBOARDS',
          page: 'KPI',
          pageCode: 'kpi',
          operations: ['VIEW']
        },
        {
          module: 'INVENTORY',
          page: 'SN Look Up',
          pageCode: 'sn-look-up',
          operations: ['VIEW', 'EXPORT']
        }
      ],
      usageCount: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // 菜单数据
  menus: [
    {
      id: 'MENU-001',
      name: 'Dashboard',
      code: 'dashboard',
      path: '/dashboard',
      parentId: null,
      icon: 'dashboard',
      order: 1,
      type: 'MENU',
      isExternal: false,
      visible: true,
      status: 'NORMAL',
      componentPath: '/pages/Dashboard',
      children: []
    },
    {
      id: 'MENU-002',
      name: 'Purchase Management',
      code: 'purchase-management',
      path: '/purchase',
      parentId: null,
      icon: 'shopping-cart',
      order: 2,
      type: 'DIRECTORY',
      isExternal: false,
      visible: true,
      status: 'NORMAL',
      children: [
        {
          id: 'MENU-002-001',
          name: 'Projects',
          code: 'projects',
          path: '/purchase/projects',
          parentId: 'MENU-002',
          icon: 'project',
          order: 1,
          type: 'MENU',
          isExternal: false,
          visible: true,
          status: 'NORMAL',
          componentPath: '/pages/Purchase/Projects'
        }
      ]
    },
    {
      id: 'MENU-006',
      name: 'Permission Management',
      code: 'permission-management',
      path: '/portal-admin',
      parentId: null,
      icon: 'security-scan',
      order: 6,
      type: 'DIRECTORY',
      isExternal: false,
      visible: true,
      status: 'NORMAL',
      children: [
        {
          id: 'MENU-006-001',
          name: 'Account Management',
          code: 'account-management',
          path: '/portal-admin/accounts',
          parentId: 'MENU-006',
          icon: 'user',
          order: 1,
          type: 'MENU',
          isExternal: false,
          visible: true,
          status: 'NORMAL',
          componentPath: '/pages/PortalAdmin/AccountManagement'
        },
        {
          id: 'MENU-006-002',
          name: 'Role Management',
          code: 'role-management',
          path: '/portal-admin/roles',
          parentId: 'MENU-006',
          icon: 'team',
          order: 2,
          type: 'MENU',
          isExternal: false,
          visible: true,
          status: 'NORMAL',
          componentPath: '/pages/PortalAdmin/RoleManagement'
        },
        {
          id: 'MENU-006-003',
          name: 'Menu Management',
          code: 'menu-management',
          path: '/portal-admin/menus',
          parentId: 'MENU-006',
          icon: 'menu',
          order: 3,
          type: 'MENU',
          isExternal: false,
          visible: true,
          status: 'NORMAL',
          componentPath: '/pages/PortalAdmin/MenuManagement'
        }
      ]
    }
  ],

  // 审计日志数据
  auditLogs: [
    {
      id: 'AUDIT-001',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      actor: {
        userId: 'ACC-000',
        username: 'admin',
        email: 'admin@example.com'
      },
      actionType: 'ROLE_CREATED',
      targetType: 'ROLE',
      targetId: 'ROLE-001',
      targetName: 'System Administrator',
      description: 'Created role: System Administrator',
      tenantId: 'admin'
    },
    {
      id: 'AUDIT-002',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      actor: {
        userId: 'ACC-000',
        username: 'admin',
        email: 'admin@example.com'
      },
      actionType: 'ACCOUNT_UPDATED',
      targetType: 'ACCOUNT',
      targetId: 'ACC-001',
      targetName: 'john.smith',
      description: 'Updated account: john.smith modified email and roles',
      tenantId: 'admin'
    },
    {
      id: 'AUDIT-003',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      actor: {
        userId: 'ACC-001',
        username: 'john.smith',
        email: 'john.smith@example.com'
      },
      actionType: 'MENU_CREATED',
      targetType: 'MENU',
      targetId: 'MENU-006-003',
      targetName: 'Menu Management',
      description: 'Created menu: Menu Management',
      tenantId: 'admin'
    },
    {
      id: 'AUDIT-004',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      actor: {
        userId: 'ACC-002',
        username: 'jane.doe',
        email: 'jane.doe@example.com'
      },
      actionType: 'LOGIN',
      targetType: 'ACCOUNT',
      targetId: 'ACC-002',
      targetName: 'jane.doe',
      description: 'User logged in successfully',
      tenantId: 'admin'
    },
    {
      id: 'AUDIT-005',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      actor: {
        userId: 'ACC-000',
        username: 'admin',
        email: 'admin@example.com'
      },
      actionType: 'ROLE_UPDATED',
      targetType: 'ROLE',
      targetId: 'ROLE-002',
      targetName: 'Customer Administrator',
      description: 'Updated role permissions for Customer Administrator',
      tenantId: 'admin'
    }
  ]
};

// Mock API类
class MockAPI {
  private delay(ms: number = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 认证API
  async login(username: string, password: string) {
    await this.delay();
    
    const user = mockData.accounts.find(acc => acc.username === username);
    if (user && password === 'admin123') {
      const userRoles = user.roles.map(roleId => 
        mockData.roles.find(role => role.id === roleId)
      ).filter(Boolean);
      
      const token = 'jwt-token-' + Date.now();
      localStorage.setItem('token', token);
      
      return {
        data: {
          success: true,
          data: {
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              accountType: user.accountType,
              tenantId: user.tenantId,
              roles: userRoles,
              customerIds: user.customerIds || [],
              facilityIds: user.facilityIds || []
            }
          }
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  // 获取账号列表
  async getAccounts() {
    await this.delay();
    return {
      data: {
        success: true,
        data: {
          items: mockData.accounts,
          total: mockData.accounts.length
        }
      }
    };
  }

  // 创建账号
  async createAccount(accountData: any) {
    await this.delay();
    const newAccount = {
      ...accountData,
      id: `ACC-${String(mockData.accounts.length).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockData.accounts.push(newAccount);
    
    return {
      data: {
        success: true,
        data: newAccount
      }
    };
  }

  // 更新账号
  async updateAccount(id: string, updates: any) {
    await this.delay();
    const accountIndex = mockData.accounts.findIndex(acc => acc.id === id);
    if (accountIndex !== -1) {
      mockData.accounts[accountIndex] = {
        ...mockData.accounts[accountIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return {
        data: {
          success: true,
          data: mockData.accounts[accountIndex]
        }
      };
    }
    throw new Error('Account not found');
  }

  // 删除账号
  async deleteAccount(id: string) {
    await this.delay();
    const accountIndex = mockData.accounts.findIndex(acc => acc.id === id);
    if (accountIndex !== -1) {
      mockData.accounts.splice(accountIndex, 1);
      return {
        data: {
          success: true,
          message: 'Account deleted successfully'
        }
      };
    }
    throw new Error('Account not found');
  }

  // 获取角色列表
  async getRoles() {
    await this.delay();
    return {
      data: {
        success: true,
        data: {
          items: mockData.roles,
          total: mockData.roles.length
        }
      }
    };
  }

  // 创建角色
  async createRole(roleData: any) {
    await this.delay();
    const newRole = {
      ...roleData,
      id: `ROLE-${String(mockData.roles.length).padStart(3, '0')}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockData.roles.push(newRole);
    
    return {
      data: {
        success: true,
        data: newRole
      }
    };
  }

  // 更新角色
  async updateRole(id: string, updates: any) {
    await this.delay();
    const roleIndex = mockData.roles.findIndex(role => role.id === id);
    if (roleIndex !== -1) {
      mockData.roles[roleIndex] = {
        ...mockData.roles[roleIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return {
        data: {
          success: true,
          data: mockData.roles[roleIndex]
        }
      };
    }
    throw new Error('Role not found');
  }

  // 删除角色
  async deleteRole(id: string) {
    await this.delay();
    const roleIndex = mockData.roles.findIndex(role => role.id === id);
    if (roleIndex !== -1) {
      mockData.roles.splice(roleIndex, 1);
      return {
        data: {
          success: true,
          message: 'Role deleted successfully'
        }
      };
    }
    throw new Error('Role not found');
  }

  // 获取菜单列表
  async getMenus() {
    await this.delay();
    return {
      data: {
        success: true,
        data: mockData.menus
      }
    };
  }

  // 创建菜单
  async createMenu(menuData: any) {
    await this.delay();
    const newMenu = {
      ...menuData,
      id: `MENU-${String(mockData.menus.length + 1).padStart(3, '0')}`,
      children: []
    };
    mockData.menus.push(newMenu);
    
    return {
      data: {
        success: true,
        data: newMenu
      }
    };
  }

  // 更新菜单
  async updateMenu(id: string, updates: any) {
    await this.delay();
    const menuIndex = mockData.menus.findIndex(menu => menu.id === id);
    if (menuIndex !== -1) {
      mockData.menus[menuIndex] = {
        ...mockData.menus[menuIndex],
        ...updates
      };
      return {
        data: {
          success: true,
          data: mockData.menus[menuIndex]
        }
      };
    }
    throw new Error('Menu not found');
  }

  // 删除菜单
  async deleteMenu(id: string) {
    await this.delay();
    const menuIndex = mockData.menus.findIndex(menu => menu.id === id);
    if (menuIndex !== -1) {
      mockData.menus.splice(menuIndex, 1);
      return {
        data: {
          success: true,
          message: 'Menu deleted successfully'
        }
      };
    }
    throw new Error('Menu not found');
  }

  // 获取审计日志
  async getAuditLogs(params?: any) {
    await this.delay();
    let logs = [...mockData.auditLogs];
    
    // 简单的过滤逻辑
    if (params?.actionType) {
      logs = logs.filter(log => log.actionType === params.actionType);
    }
    
    if (params?.targetType) {
      logs = logs.filter(log => log.targetType === params.targetType);
    }
    
    // 分页
    const page = parseInt(params?.page || '1');
    const pageSize = parseInt(params?.pageSize || '20');
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLogs = logs.slice(startIndex, endIndex);
    
    return {
      data: {
        success: true,
        data: {
          items: paginatedLogs,
          total: logs.length,
          page,
          pageSize
        }
      }
    };
  }
}

export const mockAPI = new MockAPI();
export default mockAPI;