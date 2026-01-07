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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user7, 'user123');

  // 更新主账号，分配系统管理员角色
  db.updateAccount(mainAccount.id, { roles: ['ROLE-001'] });

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
  console.log('Main account: admin / admin123');
  console.log('User account 1: john.smith / user123 (roles: System Administrator, Customer Administrator)');
  console.log('User account 2: jane.doe / user123 (roles: Customer Service Representative)');
  console.log('User account 3: mike.johnson / user123 (roles: Customer Administrator)');
  console.log('User account 4: sarah.wilson / user123 (roles: Customer Service Representative)');
  console.log('User account 5: david.brown / user123 (roles: System Administrator)');
  console.log('User account 6: lisa.garcia / user123 (roles: Customer Administrator, Customer Service Representative)');
  console.log('User account 7: robert.davis / user123 (roles: Customer Service Representative)');
  console.log('Tenant ID: admin');
  console.log('Sample roles created: System Administrator, Customer Administrator, Customer Service Representative');
  console.log('Created 5 mock audit log entries:');
  console.log('  1. Role created: System Administrator (1 hour ago)');
  console.log('  2. Account updated: john.smith modified email and roles (45 minutes ago)');
  console.log('  3. Account created: jane.doe (30 minutes ago)');
  console.log('  4. Role updated: Customer Administrator modified description and permissions (20 minutes ago)');
  console.log('  5. Role copied: Customer Administrator -> Customer Administrator (Copy) (10 minutes ago)');
  console.log('Total: 1 main account + 7 sub-accounts = 8 accounts');
};

