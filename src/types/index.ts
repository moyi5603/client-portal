// 账号类型
export enum AccountType {
  MAIN = 'MAIN',           // 主账号
  CUSTOMER = 'CUSTOMER',   // 客户子账号
  PARTNER = 'PARTNER'      // Partner账号
}

// 用户状态
export enum UserStatus {
  ACTIVE = 'ACTIVE',       // 活跃
  INACTIVE = 'INACTIVE',   // 禁用
  READ_ONLY = 'READ_ONLY'  // 只读
}

// 账号状态（兼容旧代码）
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// 角色类型
export enum RoleType {
  INTERNAL = 'INTERNAL',   // 内部角色
  CUSTOMER = 'CUSTOMER'    // 客户角色
}

// 角色状态
export enum RoleStatus {
  ACTIVE = 'ACTIVE',       // 活跃（可分配）
  DEPRECATED = 'DEPRECATED' // 已废弃（不可新分配，保留现有）
}

// 环境类型
export enum Environment {
  STAGING = 'STAGING',
  PROD = 'PROD'
}

// 数据权限类型
export enum DataPermissionType {
  ALL = 'ALL',             // 全部数据
  ASSIGNED = 'ASSIGNED'    // 指定Customer
}

// 模块类型
export enum Module {
  DASHBOARDS = 'DASHBOARDS',
  PURCHASE_MANAGEMENT = 'PURCHASE_MANAGEMENT',
  SALES_ORDER = 'SALES_ORDER',
  WORK_ORDER = 'WORK_ORDER',
  INBOUND = 'INBOUND',
  INVENTORY = 'INVENTORY',
  OUTBOUND = 'OUTBOUND',
  RETURNS = 'RETURNS',
  YARD_MANAGEMENT = 'YARD_MANAGEMENT',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN',
  FINANCE = 'FINANCE',
  SYSTEM_MANAGEMENT = 'SYSTEM_MANAGEMENT',
  PERMISSION_MANAGEMENT = 'PERMISSION_MANAGEMENT'
}

// 操作类型
export enum Operation {
  VIEW = 'VIEW',           // 查看
  CREATE = 'CREATE',       // 创建
  EDIT = 'EDIT',           // 编辑
  DELETE = 'DELETE',       // 删除
  APPROVE = 'APPROVE',     // 审批
  EXPORT = 'EXPORT'        // 导出
}

// 审计日志操作类型
export enum ActionType {
  // 角色相关
  ROLE_CREATED = 'ROLE_CREATED',
  ROLE_UPDATED = 'ROLE_UPDATED',
  ROLE_DEPRECATED = 'ROLE_DEPRECATED',
  // 权限相关
  PERMISSION_ADDED = 'PERMISSION_ADDED',
  PERMISSION_REMOVED = 'PERMISSION_REMOVED',
  PERMISSION_MODIFIED = 'PERMISSION_MODIFIED',
  // 用户相关
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_STATUS_CHANGED = 'USER_STATUS_CHANGED',
  // 角色分配相关
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  // IdP映射相关
  IDP_MAPPING_CREATED = 'IDP_MAPPING_CREATED',
  IDP_MAPPING_UPDATED = 'IDP_MAPPING_UPDATED',
  IDP_MAPPING_DELETED = 'IDP_MAPPING_DELETED'
}

// 审计日志目标类型
export enum TargetType {
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  IDP_MAPPING = 'IDP_MAPPING'
}

// Customer信息
export interface Customer {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 用户信息（新设计）
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  // IdP集成
  idpUserId: string;       // IdP用户ID（不可变，唯一）
  idpSource: string;        // IdP来源：'Azure AD' | 'Okta' | 'Google' | 'Other'
  idpGroups?: string[];     // IdP组/声明（只读，来自SSO）
  lastLogin?: string;       // 最后登录时间（ISO 8601）
  // 状态与上下文
  status: UserStatus;
  tenantId: string;
  // 数据范围
  customers?: string[];
  warehouses?: string[];
  regions?: string[];
  // 角色分配
  roleAssignments: {
    manual: string[];       // 手动分配的角色IDs
    idpDerived: string[];   // IdP组映射的角色IDs（只读）
  };
  // 元数据
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// 账号信息（兼容旧代码）
export interface Account {
  id: string;
  username: string;
  email: string;
  phone?: string;         // 手机号（可选）
  accountType: AccountType;
  status: AccountStatus;
  tenantId: string;
  customerIds?: string[];
  accessibleCustomerIds?: string[];
  roles: string[];         // 角色IDs
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// 权限信息（新设计）
export interface Permission {
  module: Module;                 // 模块
  page: string;                   // 页面/功能名称
  pageCode: string;               // 页面代码（唯一标识）
  operations: Operation[];         // 允许的操作列表
  dataScope?: {                   // 数据范围（可选）
    customers?: string[];
    warehouses?: string[];
    regions?: string[];
  };
}

// 角色信息（新设计）
export interface Role {
  id: string;
  name: string;
  description?: string;
  status: RoleStatus;             // 'ACTIVE' | 'DEPRECATED'
  // 权限配置
  permissions: Permission[];       // 权限列表（模块→页面→操作）
  // 元数据
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  modifiedBy?: string;
}

// 菜单信息
export interface Menu {
  id: string;
  name: string;
  code: string;
  path: string;
  parentId?: string;
  icon?: string;
  order: number;
  children?: Menu[];
}

// 功能权限
export interface FunctionPermission {
  id: string;
  name: string;
  code: string;
  menuId: string;          // 所属菜单
  action: string;          // 操作类型：view, create, update, delete等
}

// 权限策略（从Central系统同步）
export interface PermissionPolicy {
  id: string;
  name: string;
  accountType: AccountType;
  permissions: {
    menus: string[];
    functions: string[];
    dataPermission: {
      type: DataPermissionType;
      customerIds?: string[];
    };
  };
}

// 登录凭证
export interface LoginCredentials {
  username: string;
  password: string;
}

// JWT Token Payload
export interface TokenPayload {
  accountId: string;
  username: string;
  accountType: AccountType;
  tenantId: string;
  customerIds?: string[];
  accessibleCustomerIds?: string[];
}

// API响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// IdP组映射
export interface IdpGroupMapping {
  id: string;
  idpSource: string;              // IdP来源
  groupClaim: string;              // IdP组/声明值
  mappedRoleIds: string[];        // 映射的角色IDs（多对多）
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// 变更详情
export interface ChangeDetail {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED';
}

// 审计日志
export interface AuditLog {
  id: string;
  timestamp: string;
  // 操作者信息
  actor: {
    userId: string;
    username: string;
    email: string;
    idpSource?: string;
  };
  // 操作信息
  actionType: ActionType;
  targetType: TargetType;
  targetId: string;
  // 变更详情
  previousValue?: any;
  newValue?: any;
  changes?: ChangeDetail[];
  // 上下文
  ipAddress?: string;
  userAgent?: string;
  tenantId: string;
}

// 权限矩阵
export interface PermissionMatrix {
  roles: Role[];
  modules: Module[];
  matrix: {
    [roleId: string]: {
      [module: string]: {
        [pageCode: string]: Operation[];
      };
    };
  };
}

// 用户详情（扩展）
export interface UserDetail extends User {
  effectiveRoles: {
    manual: Role[];
    idpDerived: Role[];
  };
  effectivePermissions: Permission[];
  effectiveAccessSummary: string;  // 人类可读的权限摘要
}

// 角色详情（扩展）
export interface RoleDetail extends Role {
  assignedUsers: User[];
  impactPreview: string;  // 权限影响预览
}

// Warehouse信息
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  customerId: string;
  regionId?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

// Region信息
export interface Region {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

