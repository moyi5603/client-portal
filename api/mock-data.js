// 完整的Mock数据 - 基于后端数据结构
// 包含所有账号、角色、菜单、审计日志等数据

// 账号数据
const accounts = [
  // 主账号
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
  // 子账号1
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
  // 子账号2
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
  // 子账号3
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
];
// 角色数据
const roles = [
  // 超级管理员角色
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
      },
      {
        module: 'PERMISSION_MANAGEMENT',
        page: 'Permission View',
        pageCode: 'permission-view',
        operations: ['VIEW']
      },
      {
        module: 'PERMISSION_MANAGEMENT',
        page: 'Audit Log',
        pageCode: 'audit-log',
        operations: ['VIEW', 'EXPORT']
      }
    ],
    usageCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystemRole: true
  },
  // 系统管理员角色
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
      },
      {
        module: 'PERMISSION_MANAGEMENT',
        page: 'Role Management',
        pageCode: 'role-management',
        operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
      }
    ],
    usageCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 客户管理员角色
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
  // 客户服务代表角色
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
];
// 菜单数据
const menus = [
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
];
// 审计日志数据
const auditLogs = [
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
];

// 客户数据
const customers = [
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
];

// 设施数据
const facilities = [
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
];
// 用户页面数据
const userPages = [
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
];

// 权限矩阵数据
const permissionMatrix = {
  roles: roles,
  modules: [
    'DASHBOARDS',
    'PURCHASE_MANAGEMENT', 
    'PERMISSION_MANAGEMENT'
  ],
  matrix: {
    'ROLE-000': {
      'DASHBOARDS': {
        'kpi': ['VIEW']
      },
      'PERMISSION_MANAGEMENT': {
        'account-management': ['VIEW'],
        'role-management': ['VIEW'],
        'permission-view': ['VIEW'],
        'audit-log': ['VIEW', 'EXPORT']
      }
    },
    'ROLE-001': {
      'PERMISSION_MANAGEMENT': {
        'account-management': ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
        'role-management': ['VIEW', 'CREATE', 'EDIT', 'DELETE']
      }
    }
  }
};

// 导出所有数据
const mockData = {
  accounts,
  roles,
  menus,
  auditLogs,
  userPages,
  customers,
  facilities,
  permissionMatrix,
  
  // 辅助函数
  getAccountById: (id) => accounts.find(acc => acc.id === id),
  getRoleById: (id) => roles.find(role => role.id === id),
  getMenuById: (id) => menus.find(menu => menu.id === id),
  getCustomerById: (id) => customers.find(customer => customer.id === id),
  getFacilityById: (id) => facilities.find(facility => facility.id === id),
  getUserPagesByUserId: (userId) => userPages.filter(page => page.userId === userId),
  getFacilitiesByStatus: (status) => facilities.filter(facility => facility.status === status),
  getAuditLogsByTimeRange: (startTime, endTime) => auditLogs.filter(log => {
    const logTime = new Date(log.timestamp);
    return logTime >= new Date(startTime) && logTime <= new Date(endTime);
  }),
  
  // 统计函数
  getAccountsCount: () => accounts.length,
  getRolesCount: () => roles.length,
  getMenusCount: () => menus.length,
  getAuditLogsCount: () => auditLogs.length,
  getUserPagesCount: () => userPages.length,
  getCustomersCount: () => customers.length,
  getFacilitiesCount: () => facilities.length
};

export default mockData;