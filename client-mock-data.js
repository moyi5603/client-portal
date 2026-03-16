// 前端Mock数据 - 直接在浏览器中使用
window.mockData = {
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
          operations: ['VIEW']
        },
        {
          module: 'PERMISSION_MANAGEMENT',
          page: 'Role Management',
          pageCode: 'role-management',
          operations: ['VIEW']
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
    }
  ],

  // 客户数据
  customers: [
    {
      id: 'customer-1',
      name: 'ABC Corporation',
      code: 'ABC001',
      description: 'Large retail chain customer',
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'customer-2',
      name: 'XYZ Industries',
      code: 'XYZ002',
      description: 'Manufacturing company',
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // 设施数据
  facilities: [
    {
      id: 'facility-1',
      name: 'Warehouse A',
      code: 'WH-A001',
      description: 'Main distribution center',
      address: '123 Industrial Blvd, City A',
      type: 'WAREHOUSE',
      status: 'ACTIVE',
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'facility-2',
      name: 'Warehouse B',
      code: 'WH-B002',
      description: 'Secondary storage facility',
      address: '456 Storage Ave, City B',
      type: 'WAREHOUSE',
      status: 'ACTIVE',
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  // 用户页面数据
  userPages: [
    {
      id: 'PAGE-001',
      name: '订单统计看板',
      description: '实时订单数据统计和趋势分析',
      pageType: 'dashboard',
      status: 'PUBLISHED',
      userId: 'ACC-000',
      config: {
        entity: 'orders',
        operations: ['VIEW', 'EXPORT', 'REFRESH'],
        fields: ['订单总量', '待发货', '已发货', '已完成'],
        layout: 'dashboard',
        theme: 'default'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    }
  ],

  // Mock API函数
  mockAPI: {
    // 认证API
    auth: function(username, password) {
      const user = this.accounts.find(acc => acc.username === username);
      if (user && password === 'admin123') {
        const userRoles = user.roles.map(roleId => 
          this.roles.find(role => role.id === roleId)
        ).filter(Boolean);
        
        return {
          success: true,
          data: {
            token: 'jwt-token-' + Date.now(),
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
        };
      } else {
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }
    },

    // 获取账号列表
    getAccounts: function() {
      return {
        success: true,
        data: {
          items: this.accounts,
          total: this.accounts.length
        }
      };
    },

    // 获取角色列表
    getRoles: function() {
      return {
        success: true,
        data: {
          items: this.roles,
          total: this.roles.length
        }
      };
    },

    // 获取菜单列表
    getMenus: function() {
      return {
        success: true,
        data: this.menus
      };
    },

    // 获取审计日志
    getAuditLogs: function() {
      return {
        success: true,
        data: {
          items: this.auditLogs,
          total: this.auditLogs.length
        }
      };
    },

    // 获取客户列表
    getCustomers: function() {
      return {
        success: true,
        data: {
          items: this.customers,
          total: this.customers.length
        }
      };
    },

    // 获取设施列表
    getFacilities: function() {
      return {
        success: true,
        data: {
          items: this.facilities,
          total: this.facilities.length
        }
      };
    },

    // 获取用户页面
    getUserPages: function() {
      return {
        success: true,
        data: {
          items: this.userPages,
          total: this.userPages.length
        }
      };
    }
  }
};

// 绑定到window.mockData的上下文
Object.keys(window.mockData.mockAPI).forEach(key => {
  window.mockData.mockAPI[key] = window.mockData.mockAPI[key].bind(window.mockData);
});