// 完整的Mock数据 - 基于后端数据结构
// 包含所有账号、角色、菜单、审计日志、用户页面等数据

// 账号数据 (完全对应后端initTestData)
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
    roles: ['ROLE-000'], // 超级管理员
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 子账号1 - john.smith
  {
    id: 'ACC-001',
    username: 'john.smith',
    email: 'john.smith@example.com',
    phone: '13800138001',
    accountType: 'SUB',
    status: 'ACTIVE',
    tenantId: 'admin',
    roles: ['ROLE-001', 'ROLE-002'], // 系统管理员 + 客户管理员
    customerIds: ['customer-1', 'customer-2', 'customer-3'],
    facilityIds: ['facility-1', 'facility-2', 'facility-3', 'facility-4', 'facility-5'],
    customerFacilityMappings: [
      { customerId: 'customer-1', facilityIds: ['facility-1', 'facility-2'] },
      { customerId: 'customer-2', facilityIds: ['facility-3', 'facility-4'] },
      { customerId: 'customer-3', facilityIds: ['facility-5'] }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 子账号2 - jane.doe
  {
    id: 'ACC-002',
    username: 'jane.doe',
    email: 'jane.doe@example.com',
    phone: '13800138002',
    accountType: 'SUB',
    status: 'ACTIVE',
    tenantId: 'admin',
    roles: ['ROLE-003'], // 客户服务代表
    customerIds: ['customer-1'],
    facilityIds: ['facility-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  // 子账号3 - mike.johnson
  {
    id: 'ACC-003',
    username: 'mike.johnson',
    email: 'mike.johnson@example.com',
    phone: '13800138003',
    accountType: 'SUB',
    status: 'ACTIVE',
    tenantId: 'admin',
    roles: ['ROLE-002'], // 客户管理员
    customerIds: ['customer-2'],
    facilityIds: ['facility-2', 'facility-3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 子账号4 - sarah.wilson
  {
    id: 'ACC-004',
    username: 'sarah.wilson',
    email: 'sarah.wilson@example.com',
    phone: '13800138004',
    accountType: 'SUB',
    status: 'ACTIVE',
    tenantId: 'admin',
    roles: ['ROLE-003'], // 客户服务代表
    customerIds: ['customer-2'],
    facilityIds: ['facility-3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 子账号5 - david.brown
  {
    id: 'ACC-005',
    username: 'david.brown',
    email: 'david.brown@example.com',
    phone: '13800138005',
    accountType: 'SUB',
    status: 'ACTIVE',
    tenantId: 'admin',
    roles: ['ROLE-001'], // 系统管理员
    customerIds: ['customer-3'],
    facilityIds: ['facility-1', 'facility-2', 'facility-3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 子账号6 - lisa.garcia
  {
    id: 'ACC-006',
    username: 'lisa.garcia',
    email: 'lisa.garcia@example.com',
    phone: '13800138006',
    accountType: 'SUB',
    status: 'ACTIVE',
    tenantId: 'admin',
    roles: ['ROLE-002', 'ROLE-003'], // 客户管理员 + 客户服务代表
    customerIds: ['customer-3'],
    facilityIds: ['facility-2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // 子账号7 - robert.davis
  {
    id: 'ACC-007',
    username: 'robert.davis',
    email: 'robert.davis@example.com',
    phone: '13800138007',
    accountType: 'SUB',
    status: 'ACTIVE',
    tenantId: 'admin',
    roles: ['ROLE-003'], // 客户服务代表
    customerIds: ['customer-4'],
    facilityIds: ['facility-1', 'facility-3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
// 角色数据 (完全对应后端initTestData)
const roles = [
  // 超级管理员角色 (ROLE-000)
  {
    id: 'ROLE-000',
    name: 'Super Administrator',
    description: 'Super administrator with all permissions (actions disabled)',
    status: 'ACTIVE',
    permissions: [
      // DASHBOARDS
      {
        module: 'DASHBOARDS',
        page: 'KPI',
        pageCode: 'kpi',
        operations: ['VIEW']
      },
      // PURCHASE_MANAGEMENT
      {
        module: 'PURCHASE_MANAGEMENT',
        page: 'Projects',
        pageCode: 'projects',
        operations: ['VIEW', 'CREATE', 'EXPORT']
      },
      {
        module: 'PURCHASE_MANAGEMENT',
        page: 'Purchase Request',
        pageCode: 'purchase-request',
        operations: ['VIEW', 'CREATE', 'EXPORT']
      },
      {
        module: 'PURCHASE_MANAGEMENT',
        page: 'Purchase Order',
        pageCode: 'purchase-order',
        operations: ['VIEW']
      },
      // SALES_ORDER
      {
        module: 'SALES_ORDER',
        page: 'Wholesale Orders',
        pageCode: 'wholesale-orders',
        operations: ['VIEW']
      },
      {
        module: 'SALES_ORDER',
        page: 'Retail Orders',
        pageCode: 'retail-orders',
        operations: ['VIEW']
      },
      // WORK_ORDER
      {
        module: 'WORK_ORDER',
        page: 'Work Orders',
        pageCode: 'work-orders',
        operations: ['VIEW']
      },
      // INBOUND
      {
        module: 'INBOUND',
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: ['VIEW', 'EDIT', 'EXPORT', 'CANCEL']
      },
      {
        module: 'INBOUND',
        page: 'Schedule Summary',
        pageCode: 'schedule-summary',
        operations: ['VIEW']
      },
      {
        module: 'INBOUND',
        page: 'Received Summary',
        pageCode: 'received-summary',
        operations: ['VIEW']
      },
      {
        module: 'INBOUND',
        page: 'Receipt Entry',
        pageCode: 'receipt-entry',
        operations: ['CREATE']
      },
      {
        module: 'INBOUND',
        page: 'Put Away Report',
        pageCode: 'put-away-report',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'INBOUND',
        page: 'Make Appointment',
        pageCode: 'make-appointment',
        operations: ['CREATE']
      },
      {
        module: 'INBOUND',
        page: 'Appointment List',
        pageCode: 'appointment-list',
        operations: ['VIEW', 'CREATE', 'EDIT', 'CANCEL']
      }
      // INVENTORY
      {
        module: 'INVENTORY',
        page: 'SN Look Up',
        pageCode: 'sn-look-up',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'INVENTORY',
        page: 'Inventory Activity',
        pageCode: 'inventory-activity',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'INVENTORY',
        page: 'Inventory Adjustment',
        pageCode: 'inventory-adjustment',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'INVENTORY',
        page: 'Inventory Status',
        pageCode: 'inventory-status',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'INVENTORY',
        page: 'Item Master',
        pageCode: 'item-master',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'INVENTORY',
        page: 'Current Onhand Inventory Aging Report',
        pageCode: 'current-onhand',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'INVENTORY',
        page: 'Historical Inventory Aging Report',
        pageCode: 'historical-inventory-aging',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'INVENTORY',
        page: 'Warehouse Projects',
        pageCode: 'warehouse-projects',
        operations: ['VIEW', 'EXPORT']
      },
      // OUTBOUND
      {
        module: 'OUTBOUND',
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'OUTBOUND',
        page: 'Schedule Summary',
        pageCode: 'schedule-summary',
        operations: ['VIEW']
      },
      {
        module: 'OUTBOUND',
        page: 'Shipped Summary',
        pageCode: 'shipped-summary',
        operations: ['VIEW']
      },
      {
        module: 'OUTBOUND',
        page: 'Order Carrier Update',
        pageCode: 'order-carrier-update',
        operations: ['VIEW']
      },
      {
        module: 'OUTBOUND',
        page: 'Order Entry',
        pageCode: 'order-entry',
        operations: ['CREATE']
      },
      {
        module: 'OUTBOUND',
        page: 'Small Parcel Tracking Status',
        pageCode: 'small-parcel-tracking',
        operations: ['VIEW']
      },
      {
        module: 'OUTBOUND',
        page: 'Freight Quote',
        pageCode: 'freight-quote',
        operations: ['VIEW', 'CREATE']
      }
      // RETURNS
      {
        module: 'RETURNS',
        page: 'RMA',
        pageCode: 'rma',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'RETURNS',
        page: 'Traveler ID',
        pageCode: 'traveler-id',
        operations: ['VIEW']
      },
      {
        module: 'RETURNS',
        page: 'Return Report',
        pageCode: 'return-report',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'RETURNS',
        page: 'Restock Report',
        pageCode: 'restock-report',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'RETURNS',
        page: 'Adjustment Report',
        pageCode: 'adjustment-report',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'RETURNS',
        page: 'Scrap Report',
        pageCode: 'scrap-report',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'RETURNS',
        page: 'Service Claim Report',
        pageCode: 'service-claim-report',
        operations: ['VIEW', 'EXPORT']
      },
      // YARD_MANAGEMENT
      {
        module: 'YARD_MANAGEMENT',
        page: 'Equipment History Report',
        pageCode: 'equipment-history-report',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'YARD_MANAGEMENT',
        page: 'Equipment Report',
        pageCode: 'equipment-report',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'YARD_MANAGEMENT',
        page: 'Yard Status Report',
        pageCode: 'yard-status-report',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'YARD_MANAGEMENT',
        page: 'Yard Check Report',
        pageCode: 'yard-check-report',
        operations: ['VIEW', 'EXPORT']
      },
      // SUPPLY_CHAIN
      {
        module: 'SUPPLY_CHAIN',
        page: 'Damaged Box Detection',
        pageCode: 'damaged-box-detection',
        operations: ['VIEW', 'EDIT']
      },
      {
        module: 'SUPPLY_CHAIN',
        page: 'Routing Report',
        pageCode: 'routing-report',
        operations: ['VIEW']
      },
      {
        module: 'SUPPLY_CHAIN',
        page: 'Walmart Shipments',
        pageCode: 'walmart-shipments',
        operations: ['VIEW']
      },
      {
        module: 'SUPPLY_CHAIN',
        page: 'Target Shipments',
        pageCode: 'target-shipments',
        operations: ['VIEW']
      },
      {
        module: 'SUPPLY_CHAIN',
        page: 'Shipments',
        pageCode: 'shipments',
        operations: ['VIEW', 'CREATE']
      },
      {
        module: 'SUPPLY_CHAIN',
        page: 'Tracking',
        pageCode: 'tracking',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'SUPPLY_CHAIN',
        page: 'Automated Order Entry',
        pageCode: 'automated-order-entry',
        operations: ['CREATE']
      }
      // FINANCE
      {
        module: 'FINANCE',
        page: 'Invoice',
        pageCode: 'invoice',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'FINANCE',
        page: 'Card and Balance',
        pageCode: 'card-and-balance',
        operations: ['VIEW', 'CREATE']
      },
      {
        module: 'FINANCE',
        page: 'History',
        pageCode: 'history',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'FINANCE',
        page: 'Cost Calculator',
        pageCode: 'cost-calculator',
        operations: ['VIEW']
      },
      {
        module: 'FINANCE',
        page: 'Claim',
        pageCode: 'claim',
        operations: ['VIEW', 'CREATE', 'EDIT', 'EXPORT']
      },
      // SYSTEM_MANAGEMENT
      {
        module: 'SYSTEM_MANAGEMENT',
        page: 'Address Book',
        pageCode: 'address-book',
        operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT']
      },
      {
        module: 'SYSTEM_MANAGEMENT',
        page: 'Settings',
        pageCode: 'settings',
        operations: ['VIEW', 'CREATE', 'EDIT']
      },
      // PERMISSION_MANAGEMENT - 超级管理员在权限管理模块中禁用操作
      {
        module: 'PERMISSION_MANAGEMENT',
        page: 'Account Management',
        pageCode: 'account-management',
        operations: ['VIEW'] // 只有查看权限，禁用操作
      },
      {
        module: 'PERMISSION_MANAGEMENT',
        page: 'Role Management',
        pageCode: 'role-management',
        operations: ['VIEW'] // 只有查看权限，禁用操作
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
  }
  // 系统管理员角色 (ROLE-001)
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
        module: 'SYSTEM_MANAGEMENT',
        page: 'Settings',
        pageCode: 'settings',
        operations: ['VIEW', 'CREATE', 'EDIT']
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
  // 客户管理员角色 (ROLE-002)
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
      },
      {
        module: 'OUTBOUND',
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'FINANCE',
        page: 'Invoice',
        pageCode: 'invoice',
        operations: ['VIEW', 'EXPORT']
      }
    ],
    usageCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  // 客户服务代表角色 (ROLE-003)
  {
    id: 'ROLE-003',
    name: 'Customer Service Representative',
    description: 'Handle customer inquiries, process orders and provide support',
    status: 'ACTIVE',
    permissions: [
      {
        module: 'DASHBOARDS',
        page: 'KPI',
        pageCode: 'kpi',
        operations: ['VIEW']
      },
      {
        module: 'PURCHASE_MANAGEMENT',
        page: 'Projects',
        pageCode: 'projects',
        operations: ['VIEW', 'CREATE', 'EXPORT']
      },
      {
        module: 'SALES_ORDER',
        page: 'Wholesale Orders',
        pageCode: 'wholesale-orders',
        operations: ['VIEW']
      },
      {
        module: 'INBOUND',
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: ['VIEW', 'EDIT', 'EXPORT']
      },
      {
        module: 'INVENTORY',
        page: 'SN Look Up',
        pageCode: 'sn-look-up',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'OUTBOUND',
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: ['VIEW', 'EXPORT']
      },
      {
        module: 'RETURNS',
        page: 'RMA',
        pageCode: 'rma',
        operations: ['VIEW', 'EXPORT']
      }
    ],
    usageCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
// 菜单数据 (完整的菜单结构)
const menus = [
  // 工作台
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
    routeParams: null,
    children: []
  },
  // 采购管理
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
    componentPath: null,
    routeParams: null,
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
        componentPath: '/pages/Purchase/Projects',
        routeParams: null
      },
      {
        id: 'MENU-002-002',
        name: 'Purchase Request',
        code: 'purchase-request',
        path: '/purchase/request',
        parentId: 'MENU-002',
        icon: 'file-text',
        order: 2,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/Purchase/Request',
        routeParams: null
      },
      {
        id: 'MENU-002-003',
        name: 'Purchase Order',
        code: 'purchase-order',
        path: '/purchase/order',
        parentId: 'MENU-002',
        icon: 'file-text',
        order: 3,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/Purchase/Order',
        routeParams: null
      }
    ]
  }
  // 订单管理
  {
    id: 'MENU-003',
    name: 'Order Management',
    code: 'order-management',
    path: '/orders',
    parentId: null,
    icon: 'shopping',
    order: 3,
    type: 'DIRECTORY',
    isExternal: false,
    visible: true,
    status: 'NORMAL',
    componentPath: null,
    routeParams: null,
    children: [
      {
        id: 'MENU-003-001',
        name: 'Wholesale Orders',
        code: 'wholesale-orders',
        path: '/orders/wholesale',
        parentId: 'MENU-003',
        icon: 'shopping',
        order: 1,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/Orders/Wholesale',
        routeParams: null
      },
      {
        id: 'MENU-003-002',
        name: 'Retail Orders',
        code: 'retail-orders',
        path: '/orders/retail',
        parentId: 'MENU-003',
        icon: 'shopping',
        order: 2,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/Orders/Retail',
        routeParams: null
      }
    ]
  },
  // 运输管理
  {
    id: 'MENU-004',
    name: 'Transportation Management',
    code: 'transportation-management',
    path: '/transportation',
    parentId: null,
    icon: 'truck',
    order: 4,
    type: 'DIRECTORY',
    isExternal: false,
    visible: true,
    status: 'NORMAL',
    componentPath: null,
    routeParams: null,
    children: [
      {
        id: 'MENU-004-001',
        name: 'Work Orders',
        code: 'work-orders',
        path: '/transportation/work-orders',
        parentId: 'MENU-004',
        icon: 'file-text',
        order: 1,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/Transportation/WorkOrders',
        routeParams: null
      }
    ]
  }
  // 系统管理
  {
    id: 'MENU-005',
    name: 'System Management',
    code: 'system-management',
    path: '/system',
    parentId: null,
    icon: 'settings',
    order: 5,
    type: 'DIRECTORY',
    isExternal: false,
    visible: true,
    status: 'NORMAL',
    componentPath: null,
    routeParams: null,
    children: [
      {
        id: 'MENU-005-001',
        name: 'Address Book',
        code: 'address-book',
        path: '/system/address-book',
        parentId: 'MENU-005',
        icon: 'contacts',
        order: 1,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/System/AddressBook',
        routeParams: null
      },
      {
        id: 'MENU-005-002',
        name: 'Settings',
        code: 'settings',
        path: '/system/settings',
        parentId: 'MENU-005',
        icon: 'setting',
        order: 2,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/System/Settings',
        routeParams: null
      }
    ]
  },
  // 权限管理 (Portal Admin)
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
    componentPath: null,
    routeParams: null,
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
        componentPath: '/pages/PortalAdmin/AccountManagement',
        routeParams: null
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
        componentPath: '/pages/PortalAdmin/RoleManagement',
        routeParams: null
      }
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
        componentPath: '/pages/PortalAdmin/MenuManagement',
        routeParams: null
      },
      {
        id: 'MENU-006-004',
        name: 'Permission View',
        code: 'permission-view',
        path: '/portal-admin/permissions',
        parentId: 'MENU-006',
        icon: 'eye',
        order: 4,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/PortalAdmin/PermissionView',
        routeParams: null
      },
      {
        id: 'MENU-006-005',
        name: 'Audit Log',
        code: 'audit-log',
        path: '/portal-admin/audit-logs',
        parentId: 'MENU-006',
        icon: 'file-search',
        order: 5,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '/pages/PortalAdmin/AuditLog',
        routeParams: null
      }
    ]
  }
];
// 审计日志数据 (完全对应后端initTestData)
const auditLogs = [
  // 模拟操作记录1：创建角色（1小时前）
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
    tenantId: 'admin',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    changes: null,
    oldValue: null,
    newValue: {
      id: 'ROLE-001',
      name: 'System Administrator',
      description: 'Full system access with all permissions',
      status: 'ACTIVE'
    }
  },
  // 模拟操作记录2：编辑账号（45分钟前）
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
    tenantId: 'admin',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    changes: [
      {
        field: 'email',
        oldValue: 'old.email@example.com',
        newValue: 'john.smith@example.com',
        changeType: 'MODIFIED'
      },
      {
        field: 'roles',
        oldValue: ['ROLE-001'],
        newValue: ['ROLE-001', 'ROLE-002'],
        changeType: 'MODIFIED'
      }
    ],
    oldValue: {
      email: 'old.email@example.com',
      roles: ['ROLE-001']
    },
    newValue: {
      email: 'john.smith@example.com',
      roles: ['ROLE-001', 'ROLE-002']
    }
  }
  // 模拟操作记录3：创建账号（30分钟前）
  {
    id: 'AUDIT-003',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    actor: {
      userId: 'ACC-000',
      username: 'admin',
      email: 'admin@example.com'
    },
    actionType: 'ACCOUNT_CREATED',
    targetType: 'ACCOUNT',
    targetId: 'ACC-002',
    targetName: 'jane.doe',
    description: 'Created account: jane.doe',
    tenantId: 'admin',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    changes: null,
    oldValue: null,
    newValue: {
      id: 'ACC-002',
      username: 'jane.doe',
      email: 'jane.doe@example.com',
      accountType: 'SUB',
      status: 'ACTIVE',
      roles: ['ROLE-003']
    }
  },
  // 模拟操作记录4：编辑角色（20分钟前）
  {
    id: 'AUDIT-004',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    actor: {
      userId: 'ACC-001',
      username: 'john.smith',
      email: 'john.smith@example.com'
    },
    actionType: 'ROLE_UPDATED',
    targetType: 'ROLE',
    targetId: 'ROLE-002',
    targetName: 'Customer Administrator',
    description: 'Updated role: Customer Administrator modified description and permissions',
    tenantId: 'admin',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    changes: [
      {
        field: 'description',
        oldValue: 'Manage customer users',
        newValue: 'Manage customer users and roles',
        changeType: 'MODIFIED'
      },
      {
        field: 'permissions',
        oldValue: [
          {
            module: 'DASHBOARDS',
            page: 'KPI',
            pageCode: 'kpi',
            operations: ['VIEW']
          }
        ],
        newValue: [
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
        changeType: 'MODIFIED'
      }
    ]
  }
  // 模拟操作记录5：复制角色（10分钟前）
  {
    id: 'AUDIT-005',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    actor: {
      userId: 'ACC-001',
      username: 'john.smith',
      email: 'john.smith@example.com'
    },
    actionType: 'ROLE_CREATED',
    targetType: 'ROLE',
    targetId: 'ROLE-004',
    targetName: 'Customer Administrator (Copy)',
    description: 'Created role: Customer Administrator (Copy) - duplicated from Customer Administrator',
    tenantId: 'admin',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    changes: null,
    oldValue: null,
    newValue: {
      id: 'ROLE-004',
      name: 'Customer Administrator (Copy)',
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
        },
        {
          module: 'OUTBOUND',
          page: 'Inquiry',
          pageCode: 'inquiry',
          operations: ['VIEW', 'EXPORT']
        },
        {
          module: 'FINANCE',
          page: 'Invoice',
          pageCode: 'invoice',
          operations: ['VIEW', 'EXPORT']
        }
      ]
    }
  }
];
// 用户页面数据 (完全对应后端initTestData)
const userPages = [
  // 订单统计看板
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
      fields: ['订单总量', '待发货', '已发货', '已完成', '订单趋势'],
      layout: 'dashboard',
      theme: 'default',
      dataSources: ['orders', 'order_statistics'],
      calculations: [
        {
          id: 'calc-1',
          name: '订单总量',
          type: 'count',
          field: 'orderId',
          groupBy: []
        },
        {
          id: 'calc-2',
          name: '待发货订单',
          type: 'count',
          field: 'orderId',
          groupBy: [],
          filter: { status: 'pending_shipment' }
        }
      ],
      filters: [
        {
          field: 'dateRange',
          type: 'date',
          defaultValue: 'last7days'
        }
      ]
    },
    componentCode: '// 订单统计看板组件\nexport default function OrderStatistics() { return <div>订单统计看板</div>; }',
    styleCode: '.order-stats { padding: 20px; }',
    configCode: '{ "refreshInterval": 30000 }',
    apiCalls: ['/api/orders/statistics', '/api/orders/trend'],
    dependencies: ['react', 'antd'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
  },
  // 待发货订单列表
  {
    id: 'PAGE-002',
    name: '待发货订单列表',
    description: '待发货订单管理和批量操作',
    pageType: 'list',
    status: 'PUBLISHED',
    userId: 'ACC-000',
    config: {
      entity: 'orders',
      operations: ['VIEW', 'EXPORT', 'BATCH_SHIP'],
      fields: ['订单号', '客户名称', '订单金额', '下单时间', '优先级', '操作'],
      layout: 'table',
      theme: 'default',
      dataSources: ['orders'],
      filters: [
        {
          field: 'priority',
          type: 'select',
          options: ['高', '中', '低']
        },
        {
          field: 'orderDate',
          type: 'date'
        }
      ]
    },
    componentCode: '// 待发货订单列表组件\nexport default function PendingShipment() { return <div>待发货订单列表</div>; }',
    styleCode: '.pending-shipment { padding: 20px; }',
    configCode: '{ "pageSize": 20 }',
    apiCalls: ['/api/orders/pending-shipment'],
    dependencies: ['react', 'antd'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
  }
  // 库存报表
  {
    id: 'PAGE-003',
    name: '库存报表',
    description: '库存数量统计和预警监控',
    pageType: 'list',
    status: 'PUBLISHED',
    userId: 'ACC-000',
    config: {
      entity: 'inventory',
      operations: ['VIEW', 'EXPORT', 'SET_ALERT'],
      fields: ['产品名称', '产品编码', '库存数量', '预警值', '状态', '最后更新'],
      layout: 'table',
      theme: 'default',
      dataSources: ['inventory', 'products'],
      calculations: [
        {
          id: 'calc-3',
          name: '库存预警',
          type: 'comparison',
          field: 'stock',
          filter: { stock: { $lt: 'alertThreshold' } }
        }
      ],
      filters: [
        {
          field: 'status',
          type: 'select',
          options: ['正常', '预警', '严重']
        },
        {
          field: 'warehouse',
          type: 'select'
        }
      ]
    },
    componentCode: '// 库存报表组件\nexport default function InventoryReport() { return <div>库存报表</div>; }',
    styleCode: '.inventory-report { padding: 20px; }',
    configCode: '{ "alertThreshold": 50 }',
    apiCalls: ['/api/inventory/summary', '/api/inventory/alerts'],
    dependencies: ['react', 'antd'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
  },
  // 客户分析报表
  {
    id: 'PAGE-004',
    name: '客户分析报表',
    description: '客户订单分析和消费趋势统计',
    pageType: 'dashboard',
    status: 'PUBLISHED',
    userId: 'ACC-000',
    config: {
      entity: 'customers',
      operations: ['VIEW', 'EXPORT', 'ANALYZE'],
      fields: ['客户名称', '订单总数', '消费金额', '最近订单', '客户等级', '趋势'],
      layout: 'dashboard',
      theme: 'default',
      dataSources: ['customers', 'orders', 'order_statistics'],
      calculations: [
        {
          id: 'calc-4',
          name: '客户总数',
          type: 'count',
          field: 'customerId',
          groupBy: []
        },
        {
          id: 'calc-5',
          name: '活跃客户',
          type: 'count',
          field: 'customerId',
          groupBy: [],
          filter: { lastOrderDate: { $gte: 'last30days' } }
        },
        {
          id: 'calc-6',
          name: '总消费金额',
          type: 'sum',
          field: 'totalAmount',
          groupBy: []
        }
      ],
      filters: [
        {
          field: 'customerLevel',
          type: 'select',
          options: ['VIP', '普通', '新客户']
        },
        {
          field: 'dateRange',
          type: 'date',
          defaultValue: 'last30days'
        }
      ]
    },
    componentCode: '// 客户分析报表组件\nexport default function CustomerAnalysis() { return <div>客户分析报表</div>; }',
    styleCode: '.customer-analysis { padding: 20px; background: #f5f5f5; }',
    configCode: '{ "refreshInterval": 60000, "chartType": "bar" }',
    apiCalls: ['/api/customers/analysis', '/api/customers/trend'],
    dependencies: ['react', 'antd', 'recharts'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
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
  },
  {
    id: 'customer-3',
    name: 'Global Logistics Ltd',
    code: 'GLL003',
    description: 'International logistics provider',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'customer-4',
    name: 'Tech Solutions Inc',
    code: 'TSI004',
    description: 'Technology solutions provider',
    createdAt: new Date('2024-02-15').toISOString(),
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
  },
  {
    id: 'facility-3',
    name: 'Distribution Center C',
    code: 'DC-C003',
    description: 'Regional distribution hub',
    address: '789 Logistics Way, City C',
    type: 'DISTRIBUTION_CENTER',
    status: 'ACTIVE',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'facility-4',
    name: 'Warehouse D',
    code: 'WH-D004',
    description: 'Cold storage facility',
    address: '321 Cold Storage Rd, City D',
    type: 'COLD_STORAGE',
    status: 'ACTIVE',
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'facility-5',
    name: 'Processing Center E',
    code: 'PC-E005',
    description: 'Order processing center',
    address: '654 Processing St, City E',
    type: 'PROCESSING_CENTER',
    status: 'ACTIVE',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
];
// 权限矩阵数据
const permissionMatrix = {
  roles: roles,
  modules: [
    'DASHBOARDS',
    'PURCHASE_MANAGEMENT', 
    'SALES_ORDER',
    'WORK_ORDER',
    'INBOUND',
    'INVENTORY',
    'OUTBOUND',
    'RETURNS',
    'YARD_MANAGEMENT',
    'SUPPLY_CHAIN',
    'FINANCE',
    'SYSTEM_MANAGEMENT',
    'PERMISSION_MANAGEMENT'
  ],
  matrix: {
    'ROLE-000': {
      'DASHBOARDS': {
        'kpi': ['VIEW']
      },
      'PURCHASE_MANAGEMENT': {
        'projects': ['VIEW', 'CREATE', 'EXPORT'],
        'purchase-request': ['VIEW', 'CREATE', 'EXPORT'],
        'purchase-order': ['VIEW']
      },
      'SALES_ORDER': {
        'wholesale-orders': ['VIEW'],
        'retail-orders': ['VIEW']
      },
      'WORK_ORDER': {
        'work-orders': ['VIEW']
      },
      'PERMISSION_MANAGEMENT': {
        'account-management': ['VIEW'],
        'role-management': ['VIEW'],
        'permission-view': ['VIEW'],
        'audit-log': ['VIEW', 'EXPORT']
      }
    },
    'ROLE-001': {
      'SYSTEM_MANAGEMENT': {
        'address-book': ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'],
        'settings': ['VIEW', 'CREATE', 'EDIT']
      },
      'PERMISSION_MANAGEMENT': {
        'account-management': ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
        'role-management': ['VIEW', 'CREATE', 'EDIT', 'DELETE']
      }
    },
    'ROLE-002': {
      'DASHBOARDS': {
        'kpi': ['VIEW']
      },
      'INVENTORY': {
        'inventory-status': ['VIEW', 'EXPORT']
      },
      'OUTBOUND': {
        'inquiry': ['VIEW', 'EXPORT']
      },
      'FINANCE': {
        'invoice': ['VIEW', 'EXPORT']
      }
    },
    'ROLE-003': {
      'DASHBOARDS': {
        'kpi': ['VIEW']
      },
      'PURCHASE_MANAGEMENT': {
        'projects': ['VIEW', 'CREATE', 'EXPORT']
      },
      'SALES_ORDER': {
        'wholesale-orders': ['VIEW']
      },
      'INBOUND': {
        'inquiry': ['VIEW', 'EDIT', 'EXPORT']
      },
      'INVENTORY': {
        'sn-look-up': ['VIEW', 'EXPORT']
      },
      'OUTBOUND': {
        'inquiry': ['VIEW', 'EXPORT']
      },
      'RETURNS': {
        'rma': ['VIEW', 'EXPORT']
      }
    }
  }
};
// 导出所有数据
module.exports = {
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
  getAuditLogById: (id) => auditLogs.find(log => log.id === id),
  getUserPageById: (id) => userPages.find(page => page.id === id),
  getCustomerById: (id) => customers.find(customer => customer.id === id),
  getFacilityById: (id) => facilities.find(facility => facility.id === id),
  
  // 过滤函数
  getAccountsByTenantId: (tenantId) => accounts.filter(acc => acc.tenantId === tenantId),
  getRolesByStatus: (status) => roles.filter(role => role.status === status),
  getMenusByParentId: (parentId) => menus.filter(menu => menu.parentId === parentId),
  getAuditLogsByTimeRange: (startTime, endTime) => auditLogs.filter(log => 
    new Date(log.timestamp) >= new Date(startTime) && 
    new Date(log.timestamp) <= new Date(endTime)
  ),
  getUserPagesByUserId: (userId) => userPages.filter(page => page.userId === userId),
  getFacilitiesByStatus: (status) => facilities.filter(facility => facility.status === status),
  
  // 统计函数
  getAccountsCount: () => accounts.length,
  getRolesCount: () => roles.length,
  getMenusCount: () => menus.length,
  getAuditLogsCount: () => auditLogs.length,
  getUserPagesCount: () => userPages.length,
  getCustomersCount: () => customers.length,
  getFacilitiesCount: () => facilities.length,
  
  // 角色使用统计
  updateRoleUsageCount: (roleId, increment = 1) => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      role.usageCount += increment;
      role.updatedAt = new Date().toISOString();
    }
  }
};