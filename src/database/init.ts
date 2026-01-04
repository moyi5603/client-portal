import { db } from './models';
import { Account, AccountType, AccountStatus, Role, RoleStatus, Module, Operation, ActionType, TargetType } from '../types';
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
    tenantId: 'admin',
    roles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.createAccount(mainAccount, 'admin123');

  // 创建示例角色（使用新的权限结构）
  const systemAdminRole: Role = {
    id: 'ROLE-001',
    name: '系统管理员',
    description: '拥有所有权限的完整系统访问权限',
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
    name: '客户管理员',
    description: '管理客户用户和角色',
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
    name: '客户服务代表',
    description: '处理客户咨询、处理订单并提供支持',
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
    id: generateId(),
    username: 'zhang.san',
    email: 'zhang.san@example.com',
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
    id: generateId(),
    username: 'li.si',
    email: 'li.si@example.com',
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
    undefined,
    {
      name: systemAdminRole.name,
      description: systemAdminRole.description,
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
      roles: ['ROLE-001', 'ROLE-002']
    },
    [
      {
        field: 'roles',
        oldValue: [],
        newValue: ['ROLE-001', 'ROLE-002'],
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
  console.log('租户ID: admin');
  console.log('示例角色已创建：系统管理员、客户管理员、客户服务代表');
  console.log('已创建2条模拟操作记录');
};

