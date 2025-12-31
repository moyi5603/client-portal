import { db } from './models';
import { Account, AccountType, AccountStatus, Role, RoleType, RoleStatus, Environment, Module, Operation, ActionType, TargetType } from '../types';
import { generateId } from '../utils/uuid';
import { auditService } from '../services/auditService';

// 初始化测试数据
export const initTestData = () => {
  // 创建主账号
  const mainAccount: Account = {
    id: generateId(),
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138000',
    accountType: AccountType.MAIN,
    status: AccountStatus.ACTIVE,
    tenantId: 'tenant-1',
    roles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(mainAccount, 'admin123');

  // 创建示例角色（使用新的权限结构）
  const systemAdminRole: Role = {
    id: 'SYS-ADMIN-001',
    name: '系统管理员',
    description: '拥有所有权限的完整系统访问权限',
    type: RoleType.INTERNAL,
    status: RoleStatus.ACTIVE,
    environment: Environment.PROD,
    permissions: [
      {
        module: Module.ADMIN,
        page: '用户管理',
        pageCode: 'user-management',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.DELETE, Operation.EXPORT]
      },
      {
        module: Module.ADMIN,
        page: '角色管理',
        pageCode: 'role-management',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.DELETE, Operation.EXPORT]
      }
    ],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createRole(systemAdminRole);

  const customerAdminRole: Role = {
    id: 'CUST-ADMIN-001',
    name: '客户管理员',
    description: '管理客户用户和角色',
    type: RoleType.CUSTOMER,
    status: RoleStatus.ACTIVE,
    environment: Environment.PROD,
    permissions: [
      {
        module: Module.INVENTORY,
        page: '库存状态',
        pageCode: 'inventory-status',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: '订单列表',
        pageCode: 'order-list',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: '订单详情',
        pageCode: 'order-details',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.EXPORT]
      }
    ],
    defaultDataScope: {
      customers: ['customer-1']
    },
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createRole(customerAdminRole);

  const csrRole: Role = {
    id: 'CSR-STANDARD-001',
    name: '客户服务代表',
    description: '处理客户咨询、处理订单并提供支持',
    type: RoleType.CUSTOMER,
    status: RoleStatus.ACTIVE,
    environment: Environment.PROD,
    permissions: [
      {
        module: Module.KPI,
        page: '仪表板视图',
        pageCode: 'dashboard-view',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.KPI,
        page: '绩效指标',
        pageCode: 'performance-metrics',
        operations: [Operation.VIEW, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: '订单列表',
        pageCode: 'order-list',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: '订单详情',
        pageCode: 'order-details',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: '订单履约',
        pageCode: 'order-fulfillment',
        operations: [Operation.VIEW, Operation.EDIT, Operation.APPROVE, Operation.EXPORT]
      },
      {
        module: Module.OUTBOUND,
        page: '退货处理',
        pageCode: 'returns-processing',
        operations: [Operation.VIEW, Operation.CREATE, Operation.EDIT, Operation.APPROVE, Operation.EXPORT]
      }
    ],
    usageCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createRole(csrRole);

  // 创建模拟用户账号数据
  const user1: Account = {
    id: generateId(),
    username: 'zhang.san',
    email: 'zhang.san@example.com',
    phone: '13800138001',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'tenant-1',
    roles: ['SYS-ADMIN-001', 'CUST-ADMIN-001'], // 分配系统管理员和客户管理员角色
    customerIds: ['customer-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user1, 'user123');

  const user2: Account = {
    id: generateId(),
    username: 'li.si',
    email: 'li.si@example.com',
    phone: '13800138002',
    accountType: AccountType.CUSTOMER,
    status: AccountStatus.ACTIVE,
    tenantId: 'tenant-1',
    roles: ['CSR-STANDARD-001'], // 分配客户服务代表角色
    customerIds: ['customer-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(user2, 'user123');

  // 更新主账号，分配系统管理员角色
  db.updateAccount(mainAccount.id, { roles: ['SYS-ADMIN-001'] });

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
    undefined,
    {
      name: systemAdminRole.name,
      description: systemAdminRole.description,
      type: systemAdminRole.type,
      status: systemAdminRole.status,
      permissions: systemAdminRole.permissions
    },
    [
      {
        field: 'name',
        oldValue: undefined,
        newValue: systemAdminRole.name,
        changeType: 'ADDED'
      },
      {
        field: 'description',
        oldValue: undefined,
        newValue: systemAdminRole.description,
        changeType: 'ADDED'
      },
      {
        field: 'permissions',
        oldValue: undefined,
        newValue: systemAdminRole.permissions,
        changeType: 'ADDED'
      }
    ],
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    log1Timestamp
  );

  // 模拟操作记录2：分配角色给用户（30分钟前）
  const log2Timestamp = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  auditService.log(
    mockActor1,
    ActionType.ROLE_ASSIGNED,
    TargetType.USER,
    user1.id,
    {
      roles: []
    },
    {
      roles: ['SYS-ADMIN-001', 'CUST-ADMIN-001']
    },
    [
      {
        field: 'roles',
        oldValue: [],
        newValue: ['SYS-ADMIN-001', 'CUST-ADMIN-001'],
        changeType: 'MODIFIED'
      }
    ],
    '192.168.1.101',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    log2Timestamp
  );

  console.log('测试数据初始化完成');
  console.log('主账号: admin / admin123');
  console.log('用户账号1: zhang.san / user123 (角色: 系统管理员, 客户管理员)');
  console.log('用户账号2: li.si / user123 (角色: 客户服务代表)');
  console.log('租户ID: tenant-1');
  console.log('示例角色已创建：系统管理员、客户管理员、客户服务代表');
  console.log('已创建2条模拟操作记录');
};

