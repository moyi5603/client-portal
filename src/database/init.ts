import { db } from './models';
import { Account, AccountType, AccountStatus, Role, RoleStatus, Module, Operation, ActionType, TargetType } from '../types';
import { generateAccountId, generateId } from '../utils/uuid';
import { auditService } from '../services/auditService';

// 初始化测试数据
export const initTestData = () => {
  // 创建主账号
  const mainAccount: Account = {
    id: 'ACC-000', // 主账号使用特殊ID
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138000',
    accountType: AccountType.MAIN,
    status: AccountStatus.ACTIVE,
    tenantId: 'admin',
    roles: [],
    lastLoginAt: new Date().toISOString(), // Set to current date/time
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(mainAccount, 'admin123');

  // 创建超级管理员角色（预设角色，拥有所有权限但禁用操作）
  const superAdminRole: Role = {
    id: 'ROLE-000', // 使用特殊ID标识超级管理员
    name: 'Super Administrator',
    description: 'Super administrator with all permissions (actions disabled)',
    status: RoleStatus.ACTIVE,
    permissions: [
      // DASHBOARDS
      {
        module: Module.DASHBOARDS,
        page: 'KPI',
        pageCode: 'kpi',
        operations: [Operation.VIEW]
      },
      // PURCHASE_MANAGEMENT
      {
        module: Module.PURCHASE_MANAGEMENT,
        page: 'Projects',
        pageCode: 'projects',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EXPORT]
      },
      {
        module: Module.PURCHASE_MANAGEMENT,
        page: 'Purchase Request',
        pageCode: 'purchase-request',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EXPORT]
      },
      {
        module: Module.PURCHASE_MANAGEMENT,
        page: 'Purchase Order',
        pageCode: 'purchase-order',
        operations: [Operation.VIEW]
      },
      // SALES_ORDER
      {
        module: Module.SALES_ORDER,
        page: 'Wholesale Orders',
        pageCode: 'wholesale-orders',
        operations: [Operation.VIEW]
      },
      {
        module: Module.SALES_ORDER,
        page: 'Retail Orders',
        pageCode: 'retail-orders',
        operations: [Operation.VIEW]
      },
      // WORK_ORDER
      {
        module: Module.WORK_ORDER,
        page: 'Work Orders',
        pageCode: 'work-orders',
        operations: [Operation.VIEW]
      },
      // INBOUND
      {
        module: Module.INBOUND,
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: [Operation.VIEW, Operation.EDIT, Operation.EXPORT, Operation.CANCEL]
      },
      {
        module: Module.INBOUND,
        page: 'Schedule Summary',
        pageCode: 'schedule-summary',
        operations: [Operation.VIEW]
      },
      {
        module: Module.INBOUND,
        page: 'Received Summary',
        pageCode: 'received-summary',
        operations: [Operation.VIEW]
      },
      {
        module: Module.INBOUND,
        page: 'Receipt Entry',
        pageCode: 'receipt-entry',
        operations: [Operation.CREATE]
      },
      {
        module: Module.INBOUND,
        page: 'Put Away Report',
        pageCode: 'put-away-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.INBOUND,
        page: 'Make Appointment',
        pageCode: 'make-appointment',
        operations: [Operation.CREATE]
      },
      {
        module: Module.INBOUND,
        page: 'Appointment List',
        pageCode: 'appointment-list',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.CANCEL]
      },
      // INVENTORY
      {
        module: Module.INVENTORY,
        page: 'SN Look Up',
        pageCode: 'sn-look-up',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.INVENTORY,
        page: 'Inventory Activity',
        pageCode: 'inventory-activity',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.INVENTORY,
        page: 'Inventory Adjustment',
        pageCode: 'inventory-adjustment',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.INVENTORY,
        page: 'Inventory Status',
        pageCode: 'inventory-status',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.INVENTORY,
        page: 'Item Master',
        pageCode: 'item-master',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.INVENTORY,
        page: 'Current Onhand Inventory Aging Report',
        pageCode: 'current-onhand',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.INVENTORY,
        page: 'Historical Inventory Aging Report',
        pageCode: 'historical-inventory-aging',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.INVENTORY,
        page: 'Warehouse Projects',
        pageCode: 'warehouse-projects',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      // OUTBOUND
      {
        module: Module.OUTBOUND,
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: 'Schedule Summary',
        pageCode: 'schedule-summary',
        operations: [Operation.VIEW]
      },
      {
        module: Module.OUTBOUND,
        page: 'Shipped Summary',
        pageCode: 'shipped-summary',
        operations: [Operation.VIEW]
      },
      {
        module: Module.OUTBOUND,
        page: 'Order Carrier Update',
        pageCode: 'order-carrier-update',
        operations: [Operation.VIEW]
      },
      {
        module: Module.OUTBOUND,
        page: 'Order Entry',
        pageCode: 'order-entry',
        operations: [Operation.CREATE]
      },
      {
        module: Module.OUTBOUND,
        page: 'Small Parcel Tracking Status',
        pageCode: 'small-parcel-tracking',
        operations: [Operation.VIEW]
      },
      {
        module: Module.OUTBOUND,
        page: 'Freight Quote',
        pageCode: 'freight-quote',
        operations: [Operation.VIEW, Operation.CREATE]
      },
      // RETURNS
      {
        module: Module.RETURNS,
        page: 'RMA',
        pageCode: 'rma',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.RETURNS,
        page: 'Traveler ID',
        pageCode: 'traveler-id',
        operations: [Operation.VIEW]
      },
      {
        module: Module.RETURNS,
        page: 'Return Report',
        pageCode: 'return-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.RETURNS,
        page: 'Restock Report',
        pageCode: 'restock-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.RETURNS,
        page: 'Adjustment Report',
        pageCode: 'adjustment-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.RETURNS,
        page: 'Scrap Report',
        pageCode: 'scrap-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.RETURNS,
        page: 'Service Claim Report',
        pageCode: 'service-claim-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      // YARD_MANAGEMENT
      {
        module: Module.YARD_MANAGEMENT,
        page: 'Equipment History Report',
        pageCode: 'equipment-history-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.YARD_MANAGEMENT,
        page: 'Equipment Report',
        pageCode: 'equipment-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.YARD_MANAGEMENT,
        page: 'Yard Status Report',
        pageCode: 'yard-status-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.YARD_MANAGEMENT,
        page: 'Yard Check Report',
        pageCode: 'yard-check-report',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      // SUPPLY_CHAIN
      {
        module: Module.SUPPLY_CHAIN,
        page: 'Damaged Box Detection',
        pageCode: 'damaged-box-detection',
        operations: [Operation.VIEW, Operation.EDIT]
      },
      {
        module: Module.SUPPLY_CHAIN,
        page: 'Routing Report',
        pageCode: 'routing-report',
        operations: [Operation.VIEW]
      },
      {
        module: Module.SUPPLY_CHAIN,
        page: 'Walmart Shipments',
        pageCode: 'walmart-shipments',
        operations: [Operation.VIEW]
      },
      {
        module: Module.SUPPLY_CHAIN,
        page: 'Target Shipments',
        pageCode: 'target-shipments',
        operations: [Operation.VIEW]
      },
      {
        module: Module.SUPPLY_CHAIN,
        page: 'Shipments',
        pageCode: 'shipments',
        operations: [Operation.VIEW, Operation.CREATE]
      },
      {
        module: Module.SUPPLY_CHAIN,
        page: 'Tracking',
        pageCode: 'tracking',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.SUPPLY_CHAIN,
        page: 'Automated Order Entry',
        pageCode: 'automated-order-entry',
        operations: [Operation.CREATE]
      },
      // FINANCE
      {
        module: Module.FINANCE,
        page: 'Invoice',
        pageCode: 'invoice',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.FINANCE,
        page: 'Card and Balance',
        pageCode: 'card-and-balance',
        operations: [Operation.VIEW, Operation.CREATE]
      },
      {
        module: Module.FINANCE,
        page: 'History',
        pageCode: 'history',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.FINANCE,
        page: 'Cost Calculator',
        pageCode: 'cost-calculator',
        operations: [Operation.VIEW]
      },
      {
        module: Module.FINANCE,
        page: 'Claim',
        pageCode: 'claim',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.EXPORT]
      },
      // SYSTEM_MANAGEMENT
      {
        module: Module.SYSTEM_MANAGEMENT,
        page: 'Address Book',
        pageCode: 'address-book',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.DELETE, Operation.EXPORT]
      },
      {
        module: Module.SYSTEM_MANAGEMENT,
        page: 'Settings',
        pageCode: 'settings',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT]
      },
      // PERMISSION_MANAGEMENT - 注意：超级管理员在权限管理模块中禁用操作
      {
        module: Module.PERMISSION_MANAGEMENT,
        page: 'Account Management',
        pageCode: 'account-management',
        operations: [Operation.VIEW] // 只有查看权限，禁用操作
      },
      {
        module: Module.PERMISSION_MANAGEMENT,
        page: 'Role Management',
        pageCode: 'role-management',
        operations: [Operation.VIEW] // 只有查看权限，禁用操作
      },
      {
        module: Module.PERMISSION_MANAGEMENT,
        page: 'Permission View',
        pageCode: 'permission-view',
        operations: [Operation.VIEW]
      },
      {
        module: Module.PERMISSION_MANAGEMENT,
        page: 'Audit Log',
        pageCode: 'audit-log',
        operations: [Operation.VIEW, Operation.EXPORT]
      }
    ],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystemRole: true // 标记为系统预设角色
  };
  db.createRole(superAdminRole);

  // 创建示例角色（使用新的权限结构）
  const systemAdminRole: Role = {
    id: 'ROLE-001',
    name: 'System Administrator',
    description: 'Full system access with all permissions',
    status: RoleStatus.ACTIVE,
    permissions: [
      {
        module: Module.SYSTEM_MANAGEMENT,
        page: 'Address Book',
        pageCode: 'address-book',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.DELETE, Operation.EXPORT]
      },
      {
        module: Module.SYSTEM_MANAGEMENT,
        page: 'Settings',
        pageCode: 'settings',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT]
      },
      {
        module: Module.PERMISSION_MANAGEMENT,
        page: 'Account Management',
        pageCode: 'account-management',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.DELETE]
      },
      {
        module: Module.PERMISSION_MANAGEMENT,
        page: 'Role Management',
        pageCode: 'role-management',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.DELETE]
      }
    ],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createRole(systemAdminRole);

  const customerAdminRole: Role = {
    id: 'ROLE-002',
    name: 'Customer Administrator',
    description: 'Manage customer users and roles',
    status: RoleStatus.ACTIVE,
    permissions: [
      {
        module: Module.DASHBOARDS,
        page: 'KPI',
        pageCode: 'kpi',
        operations: [Operation.VIEW]
      },
      {
        module: Module.INVENTORY,
        page: 'Inventory Status',
        pageCode: 'inventory-status',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.FINANCE,
        page: 'Invoice',
        pageCode: 'invoice',
        operations: [Operation.VIEW, Operation.EXPORT]
      }
    ],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createRole(customerAdminRole);

  const csrRole: Role = {
    id: 'ROLE-003',
    name: 'Customer Service Representative',
    description: 'Handle customer inquiries, process orders and provide support',
    status: RoleStatus.ACTIVE,
    permissions: [
      {
        module: Module.DASHBOARDS,
        page: 'KPI',
        pageCode: 'kpi',
        operations: [Operation.VIEW]
      },
      {
        module: Module.PURCHASE_MANAGEMENT,
        page: 'Projects',
        pageCode: 'projects',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EXPORT]
      },
      {
        module: Module.SALES_ORDER,
        page: 'Wholesale Orders',
        pageCode: 'wholesale-orders',
        operations: [Operation.VIEW]
      },
      {
        module: Module.INBOUND,
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: [Operation.VIEW, Operation.EDIT, Operation.EXPORT]
      },
      {
        module: Module.INVENTORY,
        page: 'SN Look Up',
        pageCode: 'sn-look-up',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: 'Inquiry',
        pageCode: 'inquiry',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.RETURNS,
        page: 'RMA',
        pageCode: 'rma',
        operations: [Operation.VIEW, Operation.EXPORT]
      }
    ],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createRole(csrRole);

  // 创建模拟用户账号数据
  const user1: Account = {
    id: generateAccountId(),
    username: 'john.smith',
    email: 'john.smith@example.com',
    phone: '13800138001',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'admin',
    roles: ['ROLE-001', 'ROLE-002'], // 分配系统管理员和客户管理员角色
    customerIds: ['customer-1'],
    facilityIds: ['facility-1', 'facility-2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user1, 'user123');

  const user2: Account = {
    id: generateAccountId(),
    username: 'jane.doe',
    email: 'jane.doe@example.com',
    phone: '13800138002',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'admin',
    roles: ['ROLE-003'], // 分配客户服务代表角色
    customerIds: ['customer-1'],
    facilityIds: ['facility-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user2, 'user123');

  const user3: Account = {
    id: generateAccountId(),
    username: 'mike.johnson',
    email: 'mike.johnson@example.com',
    phone: '13800138003',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'admin',
    roles: ['ROLE-002'], // 分配客户管理员角色
    customerIds: ['customer-2'],
    facilityIds: ['facility-2', 'facility-3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user3, 'user123');

  const user4: Account = {
    id: generateAccountId(),
    username: 'sarah.wilson',
    email: 'sarah.wilson@example.com',
    phone: '13800138004',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'admin',
    roles: ['ROLE-003'], // 分配客户服务代表角色
    customerIds: ['customer-2'],
    facilityIds: ['facility-3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user4, 'user123');

  const user5: Account = {
    id: generateAccountId(),
    username: 'david.brown',
    email: 'david.brown@example.com',
    phone: '13800138005',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'admin',
    roles: ['ROLE-001'], // 分配系统管理员角色
    customerIds: ['customer-3'],
    facilityIds: ['facility-1', 'facility-2', 'facility-3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user5, 'user123');

  const user6: Account = {
    id: generateAccountId(),
    username: 'lisa.garcia',
    email: 'lisa.garcia@example.com',
    phone: '13800138006',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'admin',
    roles: ['ROLE-002', 'ROLE-003'], // 分配客户管理员和客户服务代表角色
    customerIds: ['customer-3'],
    facilityIds: ['facility-2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user6, 'user123');

  const user7: Account = {
    id: generateAccountId(),
    username: 'robert.davis',
    email: 'robert.davis@example.com',
    phone: '13800138007',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'admin',
    roles: ['ROLE-003'], // 分配客户服务代表角色
    customerIds: ['customer-4'],
    facilityIds: ['facility-1', 'facility-3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user7, 'user123');

  // 更新主账号，分配超级管理员角色
  db.updateAccount(mainAccount.id, { roles: ['ROLE-000'] });

  // 创建模拟操作记录数据
  const mockActor1: any = {
    accountId: mainAccount.id,
    username: mainAccount.username,
    accountType: AccountType.MAIN,
    tenantId: mainAccount.tenantId
  };

  const mockActor2: any = {
    accountId: user1.id,
    username: user1.username,
    accountType: AccountType.CUSTOMER,
    tenantId: user1.tenantId
  };

  // 模拟操作记录1：创建角色（1小时前）
  const log1Timestamp = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  auditService.log(
    mockActor1,
    ActionType.ROLE_CREATED,
    TargetType.ROLE,
    systemAdminRole.id,
    systemAdminRole.name,
    undefined,
    systemAdminRole,
    undefined,
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    log1Timestamp
  );

  // 模拟操作记录2：编辑账号（45分钟前）
  const log2Timestamp = new Date(Date.now() - 45 * 60 * 1000).toISOString();
  auditService.log(
    mockActor1,
    ActionType.ACCOUNT_UPDATED,
    TargetType.ACCOUNT,
    user1.id,
    user1.username,
    {
      email: 'old.email@example.com',
      roles: ['ROLE-001']
    },
    {
      email: 'john.smith@example.com',
      roles: ['ROLE-001', 'ROLE-002']
    },
    [
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
    '192.168.1.101',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    log2Timestamp
  );

  // 模拟操作记录3：创建账号（30分钟前）
  const log3Timestamp = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  auditService.log(
    mockActor1,
    ActionType.ACCOUNT_CREATED,
    TargetType.ACCOUNT,
    user2.id,
    user2.username,
    undefined,
    user2,
    undefined,
    '192.168.1.102',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    log3Timestamp
  );

  // 模拟操作记录4：编辑角色（20分钟前）
  const log4Timestamp = new Date(Date.now() - 20 * 60 * 1000).toISOString();
  auditService.log(
    mockActor2,
    ActionType.ROLE_UPDATED,
    TargetType.ROLE,
    customerAdminRole.id,
    customerAdminRole.name,
    {
      name: 'Customer Administrator',
      description: 'Manage customer users',
      permissions: [
        {
          module: 'DASHBOARDS',
          page: 'KPI',
          pageCode: 'kpi',
          operations: ['VIEW']
        }
      ]
    },
    {
      name: 'Customer Administrator',
      description: 'Manage customer users and roles',
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
      ]
    },
    [
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
    ],
    '192.168.1.103',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    log4Timestamp
  );

  // 模拟操作记录5：复制角色（10分钟前）
  const log5Timestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const copiedRole = {
    id: 'ROLE-004',
    name: 'Customer Administrator (Copy)',
    description: 'Manage customer users and roles',
    status: 'ACTIVE',
    permissions: [...customerAdminRole.permissions]
  };
  auditService.log(
    mockActor2,
    ActionType.ROLE_COPIED,
    TargetType.ROLE,
    copiedRole.id,
    copiedRole.name,
    customerAdminRole,
    copiedRole,
    undefined,
    '192.168.1.104',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    log5Timestamp
  );

  console.log('Test data initialization completed');
  console.log('Main account: admin / admin123 (ONLY Super Administrator role)');
  console.log('User account 1: john.smith / user123 (roles: System Administrator, Customer Administrator)');
  console.log('User account 2: jane.doe / user123 (roles: Customer Service Representative)');
  console.log('User account 3: mike.johnson / user123 (roles: Customer Administrator)');
  console.log('User account 4: sarah.wilson / user123 (roles: Customer Service Representative)');
  console.log('User account 5: david.brown / user123 (roles: System Administrator)');
  console.log('User account 6: lisa.garcia / user123 (roles: Customer Administrator, Customer Service Representative)');
  console.log('User account 7: robert.davis / user123 (roles: Customer Service Representative)');
  console.log('Tenant ID: admin');
  console.log('Sample roles created:');
  console.log('  - Super Administrator (ROLE-000): Preset role with all permissions, actions disabled for permission management');
  console.log('  - System Administrator (ROLE-001): Full system access with all permissions');
  console.log('  - Customer Administrator (ROLE-002): Manage customer users and roles');
  console.log('  - Customer Service Representative (ROLE-003): Handle customer inquiries and support');
  console.log('Created 5 mock audit log entries:');
  console.log('  1. Role created: System Administrator (1 hour ago)');
  console.log('  2. Account updated: john.smith modified email and roles (45 minutes ago)');
  console.log('  3. Account created: jane.doe (30 minutes ago)');
  console.log('  4. Role updated: Customer Administrator modified description and permissions (20 minutes ago)');
  console.log('  5. Role copied: Customer Administrator -> Customer Administrator (Copy) (10 minutes ago)');
  console.log('Total: 1 main account + 7 sub-accounts = 8 accounts');
  console.log('✅ Main account (admin) assigned ONLY Super Administrator role (ROLE-000)');
};

