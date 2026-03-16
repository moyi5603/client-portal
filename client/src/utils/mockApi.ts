// Mock API 数据，用于演示
// 模拟延迟
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 生成唯一ID
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 客户数据
export const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'Apple Inc.',
    code: 'APPLE',
    type: 'ENTERPRISE',
    status: 'ACTIVE',
    contactEmail: 'contact@apple.com',
    contactPhone: '+1-408-996-1010',
    address: 'One Apple Park Way, Cupertino, CA 95014',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'CUST-002',
    name: 'Microsoft Corporation',
    code: 'MSFT',
    type: 'ENTERPRISE',
    status: 'ACTIVE',
    contactEmail: 'contact@microsoft.com',
    contactPhone: '+1-425-882-8080',
    address: 'One Microsoft Way, Redmond, WA 98052',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'CUST-003',
    name: 'Google LLC',
    code: 'GOOGL',
    type: 'ENTERPRISE',
    status: 'ACTIVE',
    contactEmail: 'contact@google.com',
    contactPhone: '+1-650-253-0000',
    address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
    createdAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: 'CUST-004',
    name: 'Amazon.com Inc.',
    code: 'AMZN',
    type: 'ENTERPRISE',
    status: 'ACTIVE',
    contactEmail: 'contact@amazon.com',
    contactPhone: '+1-206-266-1000',
    address: '410 Terry Avenue North, Seattle, WA 98109',
    createdAt: '2024-02-15T00:00:00.000Z'
  },
  {
    id: 'CUST-005',
    name: 'Tesla Inc.',
    code: 'TSLA',
    type: 'ENTERPRISE',
    status: 'ACTIVE',
    contactEmail: 'contact@tesla.com',
    contactPhone: '+1-512-516-8177',
    address: '1 Tesla Road, Austin, TX 78725',
    createdAt: '2024-03-01T00:00:00.000Z'
  },
  {
    id: 'CUST-006',
    name: 'Meta Platforms Inc.',
    code: 'META',
    type: 'ENTERPRISE',
    status: 'ACTIVE',
    contactEmail: 'contact@meta.com',
    contactPhone: '+1-650-543-4800',
    address: '1 Meta Way, Menlo Park, CA 94025',
    createdAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: 'CUST-007',
    name: 'Netflix Inc.',
    code: 'NFLX',
    type: 'STANDARD',
    status: 'ACTIVE',
    contactEmail: 'contact@netflix.com',
    contactPhone: '+1-408-540-3700',
    address: '100 Winchester Circle, Los Gatos, CA 95032',
    createdAt: '2024-02-10T00:00:00.000Z'
  },
  {
    id: 'CUST-008',
    name: 'Spotify Technology S.A.',
    code: 'SPOT',
    type: 'STANDARD',
    status: 'ACTIVE',
    contactEmail: 'contact@spotify.com',
    contactPhone: '+46-8-120-140-00',
    address: 'Regeringsgatan 19, 111 53 Stockholm, Sweden',
    createdAt: '2024-01-25T00:00:00.000Z'
  },
  {
    id: 'CUST-009',
    name: 'Uber Technologies Inc.',
    code: 'UBER',
    type: 'STANDARD',
    status: 'ACTIVE',
    contactEmail: 'contact@uber.com',
    contactPhone: '+1-415-612-8582',
    address: '1515 3rd Street, San Francisco, CA 94158',
    createdAt: '2024-02-20T00:00:00.000Z'
  },
  {
    id: 'CUST-010',
    name: 'Airbnb Inc.',
    code: 'ABNB',
    type: 'STANDARD',
    status: 'INACTIVE',
    contactEmail: 'contact@airbnb.com',
    contactPhone: '+1-415-800-5959',
    address: '888 Brannan Street, San Francisco, CA 94103',
    createdAt: '2024-03-05T00:00:00.000Z'
  }
];

// 设施数据
export const mockFacilities = [
  {
    id: 'FAC-001',
    name: 'Apple Park Warehouse',
    code: 'APW-001',
    customerId: 'CUST-001',
    type: 'WAREHOUSE',
    status: 'ACTIVE',
    address: 'Apple Park, Cupertino, CA',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'FAC-002',
    name: 'Apple Retail Store',
    code: 'ARS-001',
    customerId: 'CUST-001',
    type: 'RETAIL',
    status: 'ACTIVE',
    address: 'Fifth Avenue, New York, NY',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'FAC-003',
    name: 'Microsoft Azure DC',
    code: 'MAD-001',
    customerId: 'CUST-002',
    type: 'DATACENTER',
    status: 'ACTIVE',
    address: 'Redmond, WA',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'FAC-004',
    name: 'Google Cloud DC',
    code: 'GCD-001',
    customerId: 'CUST-003',
    type: 'DATACENTER',
    status: 'ACTIVE',
    address: 'Mountain View, CA',
    createdAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: 'FAC-005',
    name: 'Amazon Fulfillment Center',
    code: 'AFC-001',
    customerId: 'CUST-004',
    type: 'WAREHOUSE',
    status: 'ACTIVE',
    address: 'Seattle, WA',
    createdAt: '2024-02-15T00:00:00.000Z'
  }
];

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
    phone: '+1-555-0001',
    firstName: 'System',
    lastName: 'Administrator',
    accountType: 'MAIN',
    status: 'ACTIVE',
    roles: ['ROLE-001'],
    customerIds: [],
    accessibleCustomerIds: ['CUST-001', 'CUST-002', 'CUST-003', 'CUST-004', 'CUST-005'],
    facilityIds: [],
    accessibleFacilityIds: ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005'],
    customerFacilityMappings: [
      { customerId: 'CUST-001', facilityIds: ['FAC-001', 'FAC-002'] },
      { customerId: 'CUST-002', facilityIds: ['FAC-003'] },
      { customerId: 'CUST-003', facilityIds: ['FAC-004'] },
      { customerId: 'CUST-004', facilityIds: ['FAC-005'] }
    ],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-002',
    username: 'john.smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0002',
    firstName: 'John',
    lastName: 'Smith',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002'],
    customerIds: ['CUST-001'],
    accessibleCustomerIds: ['CUST-001', 'CUST-002'],
    facilityIds: ['FAC-001'],
    accessibleFacilityIds: ['FAC-001', 'FAC-002', 'FAC-003'],
    customerFacilityMappings: [
      { customerId: 'CUST-001', facilityIds: ['FAC-001', 'FAC-002'] },
      { customerId: 'CUST-002', facilityIds: ['FAC-003'] }
    ],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-003',
    username: 'mary.johnson',
    email: 'mary.johnson@example.com',
    phone: '+1-555-0003',
    firstName: 'Mary',
    lastName: 'Johnson',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-003'],
    customerIds: ['CUST-002', 'CUST-003'],
    accessibleCustomerIds: ['CUST-002', 'CUST-003'],
    facilityIds: ['FAC-003', 'FAC-004'],
    accessibleFacilityIds: ['FAC-003', 'FAC-004'],
    customerFacilityMappings: [
      { customerId: 'CUST-002', facilityIds: ['FAC-003'] },
      { customerId: 'CUST-003', facilityIds: ['FAC-004'] }
    ],
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-004',
    username: 'david.wilson',
    email: 'david.wilson@example.com',
    phone: '+1-555-0004',
    firstName: 'David',
    lastName: 'Wilson',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-004'],
    customerIds: ['CUST-004'],
    accessibleCustomerIds: ['CUST-004', 'CUST-005'],
    facilityIds: ['FAC-005'],
    accessibleFacilityIds: ['FAC-005'],
    customerFacilityMappings: [
      { customerId: 'CUST-004', facilityIds: ['FAC-005'] }
    ],
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-005',
    username: 'sarah.brown',
    email: 'sarah.brown@example.com',
    phone: '+1-555-0005',
    firstName: 'Sarah',
    lastName: 'Brown',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-005'],
    customerIds: ['CUST-005'],
    accessibleCustomerIds: ['CUST-005'],
    facilityIds: [],
    accessibleFacilityIds: [],
    customerFacilityMappings: [
      { customerId: 'CUST-005', facilityIds: [] }
    ],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-006',
    username: 'mike.davis',
    email: 'mike.davis@example.com',
    phone: '+1-555-0006',
    firstName: 'Mike',
    lastName: 'Davis',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-006'],
    customerIds: ['CUST-006'],
    accessibleCustomerIds: ['CUST-006', 'CUST-007'],
    facilityIds: [],
    accessibleFacilityIds: [],
    customerFacilityMappings: [
      { customerId: 'CUST-006', facilityIds: [] },
      { customerId: 'CUST-007', facilityIds: [] }
    ],
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-007',
    username: 'lisa.garcia',
    email: 'lisa.garcia@example.com',
    phone: '+1-555-0007',
    firstName: 'Lisa',
    lastName: 'Garcia',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-003', 'ROLE-006'],
    customerIds: ['CUST-007', 'CUST-008'],
    accessibleCustomerIds: ['CUST-007', 'CUST-008'],
    facilityIds: [],
    accessibleFacilityIds: [],
    customerFacilityMappings: [
      { customerId: 'CUST-007', facilityIds: [] },
      { customerId: 'CUST-008', facilityIds: [] }
    ],
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-008',
    username: 'tom.martinez',
    email: 'tom.martinez@example.com',
    phone: '+1-555-0008',
    firstName: 'Tom',
    lastName: 'Martinez',
    accountType: 'SUB',
    status: 'INACTIVE',
    roles: ['ROLE-006'],
    customerIds: ['CUST-009'],
    accessibleCustomerIds: ['CUST-009'],
    facilityIds: [],
    accessibleFacilityIds: [],
    customerFacilityMappings: [
      { customerId: 'CUST-009', facilityIds: [] }
    ],
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-009',
    username: 'anna.rodriguez',
    email: 'anna.rodriguez@example.com',
    phone: '+1-555-0009',
    firstName: 'Anna',
    lastName: 'Rodriguez',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-004', 'ROLE-006'],
    customerIds: ['CUST-010'],
    accessibleCustomerIds: ['CUST-010'],
    facilityIds: [],
    accessibleFacilityIds: [],
    customerFacilityMappings: [
      { customerId: 'CUST-010', facilityIds: [] }
    ],
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-010',
    username: 'james.lee',
    email: 'james.lee@example.com',
    phone: '+1-555-0010',
    firstName: 'James',
    lastName: 'Lee',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002', 'ROLE-006'],
    customerIds: ['CUST-001', 'CUST-002'],
    accessibleCustomerIds: ['CUST-001', 'CUST-002', 'CUST-003'],
    facilityIds: ['FAC-001', 'FAC-003'],
    accessibleFacilityIds: ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004'],
    customerFacilityMappings: [
      { customerId: 'CUST-001', facilityIds: ['FAC-001', 'FAC-002'] },
      { customerId: 'CUST-002', facilityIds: ['FAC-003'] },
      { customerId: 'CUST-003', facilityIds: ['FAC-004'] }
    ],
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
        customerCount: mockCustomers.length,
        facilityCount: mockFacilities.length,
        activeAccountCount: mockAccounts.filter(a => a.status === 'ACTIVE').length,
        activeRoleCount: mockRoles.filter(r => r.status === 'ACTIVE').length,
        activeCustomerCount: mockCustomers.filter(c => c.status === 'ACTIVE').length,
        activeFacilityCount: mockFacilities.filter(f => f.status === 'ACTIVE').length
      }
    };
  }
};

// 客户管理 API
export const mockCustomerApi = {
  // 获取所有客户
  getCustomers: async () => {
    await mockDelay();
    return {
      success: true,
      data: {
        items: mockCustomers,
        total: mockCustomers.length
      }
    };
  },

  // 创建客户
  createCustomer: async (customerData: any) => {
    await mockDelay();
    const newCustomer = {
      id: generateId('CUST'),
      ...customerData,
      createdAt: new Date().toISOString()
    };
    mockCustomers.push(newCustomer);
    addAuditLog('创建客户', customerData.name, `创建了新的客户: ${customerData.name}`);
    return {
      success: true,
      data: newCustomer
    };
  },

  // 更新客户
  updateCustomer: async (id: string, customerData: any) => {
    await mockDelay();
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCustomers[index] = { ...mockCustomers[index], ...customerData };
      addAuditLog('更新客户', customerData.name, `更新了客户: ${customerData.name}`);
      return {
        success: true,
        data: mockCustomers[index]
      };
    }
    return {
      success: false,
      error: 'Customer not found'
    };
  },

  // 删除客户
  deleteCustomer: async (id: string) => {
    await mockDelay();
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      const customer = mockCustomers[index];
      mockCustomers.splice(index, 1);
      addAuditLog('删除客户', customer.name, `删除了客户: ${customer.name}`);
      return {
        success: true
      };
    }
    return {
      success: false,
      error: 'Customer not found'
    };
  }
};

// 设施管理 API
export const mockFacilityApi = {
  // 获取所有设施
  getFacilities: async () => {
    await mockDelay();
    return {
      success: true,
      data: {
        items: mockFacilities,
        total: mockFacilities.length
      }
    };
  },

  // 根据客户ID获取设施
  getFacilitiesByCustomer: async (customerId: string) => {
    await mockDelay();
    const facilities = mockFacilities.filter(f => f.customerId === customerId);
    return {
      success: true,
      data: {
        items: facilities,
        total: facilities.length
      }
    };
  },

  // 创建设施
  createFacility: async (facilityData: any) => {
    await mockDelay();
    const newFacility = {
      id: generateId('FAC'),
      ...facilityData,
      createdAt: new Date().toISOString()
    };
    mockFacilities.push(newFacility);
    addAuditLog('创建设施', facilityData.name, `创建了新的设施: ${facilityData.name}`);
    return {
      success: true,
      data: newFacility
    };
  },

  // 更新设施
  updateFacility: async (id: string, facilityData: any) => {
    await mockDelay();
    const index = mockFacilities.findIndex(f => f.id === id);
    if (index !== -1) {
      mockFacilities[index] = { ...mockFacilities[index], ...facilityData };
      addAuditLog('更新设施', facilityData.name, `更新了设施: ${facilityData.name}`);
      return {
        success: true,
        data: mockFacilities[index]
      };
    }
    return {
      success: false,
      error: 'Facility not found'
    };
  },

  // 删除设施
  deleteFacility: async (id: string) => {
    await mockDelay();
    const index = mockFacilities.findIndex(f => f.id === id);
    if (index !== -1) {
      const facility = mockFacilities[index];
      mockFacilities.splice(index, 1);
      addAuditLog('删除设施', facility.name, `删除了设施: ${facility.name}`);
      return {
        success: true
      };
    }
    return {
      success: false,
      error: 'Facility not found'
    };
  }
};