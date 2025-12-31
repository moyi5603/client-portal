# RBAC Admin Portal - 完整系统设计文档

**版本**: 1.0  
**日期**: 2025年12月  
**基于**: RBAC Admin Portal PRD v0.2 + Item Design System

---

## 📑 目录

1. [项目概述](#1-项目概述)
2. [问题陈述与目标](#2-问题陈述与目标)
3. [用户角色](#3-用户角色)
4. [系统架构](#4-系统架构)
5. [数据模型设计](#5-数据模型设计)
6. [API设计](#6-api设计)
7. [前端页面设计](#7-前端页面设计)
8. [权限模型](#8-权限模型)
9. [UI/UX设计规范](#9-uiux设计规范)
10. [实施计划](#10-实施计划)
11. [技术栈与依赖](#11-技术栈与依赖)

---

## 1. 项目概述

### 1.1 项目背景

RBAC Admin Portal是一个基于角色的访问控制（RBAC）管理平台，为Item Portal提供细粒度的权限管理能力。系统支持SSO认证用户，覆盖所有客户端和内部模块（KPI、入库、库存、出库、退货、财务、供应链等）。

### 1.2 核心价值

- **集中化权限管理**: 统一的"访问控制"管理区域
- **细粒度授权**: 支持模块→页面→操作→数据范围的多维度权限控制
- **可审计性**: 完整的审计日志，支持合规审查
- **快速上架**: 新用户上架时间缩短至5分钟以内
- **SSO集成**: 与现有SSO系统无缝集成，支持IdP组映射

### 1.3 系统范围

**包含**:
- 用户管理（SSO认证用户）
- 角色管理（可复用的权限包）
- 权限矩阵（跨角色权限视图）
- 审计日志（所有权限变更记录）
- IdP组到角色映射
- 细粒度权限模型（模块→页面→操作）

**不包含**:
- SSO协议级变更（SAML/OIDC流程、IdP配置）
- MFA强制执行（由IdP控制）
- 许可证/席位管理或计费逻辑

---

## 2. 问题陈述与目标

### 2.1 当前问题

- 权限管理方式临时或硬编码，难以确保最小权限原则
- 用户上架/下架流程缓慢，特别是大型客户账户和内部团队
- 缺乏可审计的权限变更证据，无法满足合规和客户审查需求
- 导致安全风险、运营开销和客户体验不一致

### 2.2 目标

✅ **核心目标**:
- 提供集中的"访问控制"管理区域
- 实现可复用的角色模型，对齐工作职能
- 支持细粒度授权（模块、页面、操作、数据范围）
- 实现清晰的审计能力
- 新用户上架时间 < 5分钟

✅ **成功指标**:
- ≥ 80%的活跃用户通过角色分配（无临时权限覆盖）
- 新用户上架时间（SSO可用后）< 5分钟
- 所有权限变更在审计日志中可追溯
- 90天内无因角色配置不清导致的严重权限事件

---

## 3. 用户角色

### 3.1 System Admin (内部系统管理员)

**职责**:
- 管理全局角色、权限和高权限操作
- 需要完整的访问可见性和强审计追踪

**权限**:
- 创建/编辑/删除所有角色
- 管理所有用户和权限
- 查看审计日志
- 配置IdP组映射

### 3.2 Customer Admin (外部客户管理员)

**职责**:
- 管理特定客户的用户，仅限于该客户的数据和仓库
- 需要简单的流程来添加用户、分配预定义角色和调整范围

**权限**:
- 管理所属客户的用户
- 分配预定义角色
- 调整用户数据范围
- 查看所属客户的权限矩阵

### 3.3 Operations Manager / CSR (运营经理/客服)

**职责**:
- 使用门户（KPI、入库、库存、出库、退货）进行日常工作
- 不配置角色，但受角色影响

**权限**:
- 查看被授权的模块和页面
- 执行被授权的操作
- 查看自己的权限

### 3.4 Security / Compliance Reviewer (安全/合规审查员)

**职责**:
- 在审计和客户升级期间审查访问
- 需要可导出的角色、分配和变更历史报告

**权限**:
- 查看权限矩阵
- 查看审计日志
- 导出报告（CSV）

---

## 4. 系统架构

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Users   │ │  Roles   │ │  Matrix  │ │  Audit   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                    HTTPS/API
                          │
┌─────────────────────────────────────────────────────────┐
│              Backend API (Express/Node.js)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   Auth   │ │   RBAC   │ │  Audit   │ │   IdP    │ │
│  │ Middleware│ │ Service  │ │  Logger  │ │  Mapper  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                    Data Access
                          │
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Users   │ │  Roles   │ │  Audit   │ │  IdP Map │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                    External
                          │
┌─────────────────────────────────────────────────────────┐
│              External Systems                           │
│  ┌──────────┐ ┌──────────┐                            │
│  │   SSO    │ │  IdP     │                            │
│  │ (SAML/   │ │ (Azure/  │                            │
│  │  OIDC)   │ │  Okta)   │                            │
│  └──────────┘ └──────────┘                            │
└─────────────────────────────────────────────────────────┘
```

### 4.2 技术架构分层

**表现层 (Presentation Layer)**
- React + TypeScript
- Ant Design / shadcn/ui组件库
- React Router路由管理
- Axios HTTP客户端

**应用层 (Application Layer)**
- Express RESTful API
- JWT认证中间件
- RBAC权限检查中间件
- 审计日志服务

**数据层 (Data Layer)**
- 内存数据库（开发/演示）
- 可扩展至PostgreSQL/MySQL/MongoDB
- 审计日志只追加模式

**集成层 (Integration Layer)**
- SSO集成（SAML/OIDC）
- IdP组声明解析
- 外部系统API集成

---

## 5. 数据模型设计

### 5.1 核心实体关系图

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│   User   │◄──┐  ┌──►│   Role   │◄──┐  ┌──►│Permission│
└──────────┘   │  │   └──────────┘   │  │   └──────────┘
               │  │                   │  │
               │  │   ┌──────────┐   │  │
               └──┼──►│UserRole  │◄──┼──┘
                  │   │Assignment│   │
                  │   └──────────┘   │
                  │                  │
                  │   ┌──────────┐   │
                  └──►│ IdPGroup │   │
                      │ Mapping  │   │
                      └──────────┘   │
                                     │
                      ┌──────────┐   │
                      │ AuditLog │◄──┘
                      └──────────┘
```

### 5.2 数据模型详细设计

#### 5.2.1 User (用户)

```typescript
interface User {
  // 基础标识
  id: string;                    // 内部ID（UUID）
  name: string;                  // 显示名称
  email: string;                 // 邮箱（唯一）
  phone?: string;                // 手机号（可选）
  
  // IdP集成
  idpUserId: string;             // IdP用户ID（不可变，唯一）
  idpSource: string;             // IdP来源：'Azure AD' | 'Okta' | 'Google' | 'Other'
  idpGroups?: string[];          // IdP组/声明（只读，来自SSO）
  lastLogin?: string;             // 最后登录时间（ISO 8601）
  
  // 状态与上下文
  status: UserStatus;            // 'ACTIVE' | 'INACTIVE' | 'READ_ONLY'
  tenantId: string;             // 租户ID
  
  // 数据范围
  customers?: string[];          // 关联的客户IDs
  warehouses?: string[];         // 关联的仓库IDs
  regions?: string[];            // 关联的区域IDs
  
  // 角色分配
  roleAssignments: {
    manual: string[];            // 手动分配的角色IDs
    idpDerived: string[];        // IdP组映射的角色IDs（只读）
  };
  
  // 元数据
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  createdBy?: string;            // 创建者ID
  updatedBy?: string;            // 更新者ID
}

enum UserStatus {
  ACTIVE = 'ACTIVE',             // 活跃
  INACTIVE = 'INACTIVE',         // 禁用
  READ_ONLY = 'READ_ONLY'        // 只读
}
```

#### 5.2.2 Role (角色)

```typescript
interface Role {
  // 基础信息
  id: string;                    // 角色ID（UUID）
  name: string;                  // 角色名称（唯一）
  description?: string;           // 描述
  type: RoleType;                // 'INTERNAL' | 'CUSTOMER'
  status: RoleStatus;            // 'ACTIVE' | 'DEPRECATED'
  
  // 环境
  environment?: Environment;      // 'STAGING' | 'PROD'
  
  // 权限配置
  permissions: Permission[];      // 权限列表（模块→页面→操作）
  
  // 默认数据范围
  defaultDataScope?: {
    customers?: string[];
    warehouses?: string[];
    regions?: string[];
  };
  
  // 元数据
  usageCount: number;             // 使用此角色的用户数量
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  modifiedBy?: string;            // 最后修改者
}

enum RoleType {
  INTERNAL = 'INTERNAL',          // 内部角色
  CUSTOMER = 'CUSTOMER'           // 客户角色
}

enum RoleStatus {
  ACTIVE = 'ACTIVE',              // 活跃（可分配）
  DEPRECATED = 'DEPRECATED'       // 已废弃（不可新分配，保留现有）
}

enum Environment {
  STAGING = 'STAGING',
  PROD = 'PROD'
}
```

#### 5.2.3 Permission (权限)

```typescript
interface Permission {
  // 权限层级
  module: Module;                 // 模块
  page: string;                   // 页面/功能名称
  pageCode: string;               // 页面代码（唯一标识）
  
  // 操作权限
  operations: Operation[];          // 允许的操作列表
  
  // 数据范围（可选，覆盖角色默认范围）
  dataScope?: {
    customers?: string[];
    warehouses?: string[];
    regions?: string[];
  };
}

enum Module {
  KPI = 'KPI',
  INBOUND = 'INBOUND',
  INVENTORY = 'INVENTORY',
  OUTBOUND = 'OUTBOUND',
  RETURNS = 'RETURNS',
  FINANCE = 'FINANCE',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN',
  ADMIN = 'ADMIN'
}

enum Operation {
  VIEW = 'VIEW',                  // 查看
  CREATE = 'CREATE',              // 创建
  EDIT = 'EDIT',                  // 编辑
  DELETE = 'DELETE',              // 删除
  APPROVE = 'APPROVE',            // 审批
  EXPORT = 'EXPORT'               // 导出
}

// 权限示例
const examplePermission: Permission = {
  module: Module.INVENTORY,
  page: 'Inventory Status',
  pageCode: 'inventory-status',
  operations: [Operation.VIEW, Operation.EXPORT],
  dataScope: {
    warehouses: ['warehouse-1', 'warehouse-2']
  }
};
```

#### 5.2.4 IdP Group Mapping (IdP组映射)

```typescript
interface IdpGroupMapping {
  id: string;                     // 映射ID
  idpSource: string;              // IdP来源
  groupClaim: string;              // IdP组/声明值（如：'ITEM_CUST_ADMIN'）
  mappedRoleIds: string[];         // 映射的角色IDs（多对多）
  status: 'ACTIVE' | 'INACTIVE';  // 状态
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// 示例：Azure AD组 'ITEM_CUST_ADMIN' 映射到角色 'Customer Admin' 和 'CSR'
```

#### 5.2.5 Audit Log (审计日志)

```typescript
interface AuditLog {
  id: string;                     // 日志ID
  timestamp: string;               // 时间戳（ISO 8601）
  
  // 操作者信息
  actor: {
    userId: string;                // 用户ID
    username: string;               // 用户名
    email: string;                  // 邮箱
    idpSource?: string;             // IdP来源
  };
  
  // 操作信息
  actionType: ActionType;           // 操作类型
  targetType: TargetType;          // 目标类型
  targetId: string;                // 目标ID
  
  // 变更详情
  previousValue?: any;             // 变更前值（JSON）
  newValue?: any;                 // 变更后值（JSON）
  changes?: ChangeDetail[];        // 变更详情（结构化）
  
  // 上下文
  ipAddress?: string;              // IP地址
  userAgent?: string;              // 用户代理
  tenantId: string;                // 租户ID
}

enum ActionType {
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

enum TargetType {
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION',
  IDP_MAPPING = 'IDP_MAPPING'
}

interface ChangeDetail {
  field: string;                   // 字段名
  oldValue: any;                   // 旧值
  newValue: any;                   // 新值
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED';
}
```

#### 5.2.6 Customer / Warehouse / Region (业务实体)

```typescript
interface Customer {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  customerId: string;              // 所属客户
  regionId?: string;               // 所属区域
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface Region {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 6. API设计

### 6.1 API基础规范

**Base URL**: `/api/v1`

**认证**: Bearer Token (JWT)

**响应格式**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

### 6.2 用户管理API

#### 6.2.1 获取用户列表

```
GET /api/v1/users
Query Parameters:
  - page: number (default: 1)
  - pageSize: number (default: 10)
  - search?: string (搜索：姓名/邮箱)
  - customerId?: string
  - warehouseId?: string
  - roleId?: string
  - status?: UserStatus
  - idpSource?: string

Response: ApiResponse<PaginatedResponse<User>>
```

#### 6.2.2 获取用户详情

```
GET /api/v1/users/:id

Response: ApiResponse<UserDetail>
```

**UserDetail扩展**:
```typescript
interface UserDetail extends User {
  effectiveRoles: {
    manual: Role[];
    idpDerived: Role[];
  };
  effectivePermissions: Permission[];
  effectiveAccessSummary: string;  // 人类可读的权限摘要
}
```

#### 6.2.3 创建用户

```
POST /api/v1/users
Body: {
  name: string;
  email: string;
  idpUserId: string;
  idpSource: string;
  customerIds?: string[];
  warehouseIds?: string[];
  regionIds?: string[];
  manualRoleIds?: string[];
}

Response: ApiResponse<User>
```

#### 6.2.4 更新用户

```
PUT /api/v1/users/:id
Body: {
  name?: string;
  email?: string;
  status?: UserStatus;
  customerIds?: string[];
  warehouseIds?: string[];
  regionIds?: string[];
  manualRoleIds?: string[];
}

Response: ApiResponse<User>
```

#### 6.2.5 分配角色

```
POST /api/v1/users/:id/roles
Body: {
  roleIds: string[];
}

Response: ApiResponse<{ assigned: string[] }>
```

#### 6.2.6 移除角色

```
DELETE /api/v1/users/:id/roles/:roleId

Response: ApiResponse<{ removed: boolean }>
```

#### 6.2.7 克隆用户

```
POST /api/v1/users/:id/clone
Body: {
  name: string;
  email: string;
  idpUserId: string;
  idpSource: string;
}

Response: ApiResponse<User>
```

### 6.3 角色管理API

#### 6.3.1 获取角色列表

```
GET /api/v1/roles
Query Parameters:
  - page: number
  - pageSize: number
  - type?: RoleType
  - status?: RoleStatus
  - module?: Module
  - environment?: Environment

Response: ApiResponse<PaginatedResponse<Role>>
```

#### 6.3.2 获取角色详情

```
GET /api/v1/roles/:id

Response: ApiResponse<RoleDetail>
```

**RoleDetail扩展**:
```typescript
interface RoleDetail extends Role {
  assignedUsers: User[];
  impactPreview: string;  // 权限影响预览
}
```

#### 6.3.3 创建角色

```
POST /api/v1/roles
Body: {
  name: string;
  description?: string;
  type: RoleType;
  environment?: Environment;
  permissions: Permission[];
  defaultDataScope?: DataScope;
}

Response: ApiResponse<Role>
```

#### 6.3.4 更新角色

```
PUT /api/v1/roles/:id
Body: {
  name?: string;
  description?: string;
  status?: RoleStatus;
  permissions?: Permission[];
  defaultDataScope?: DataScope;
}

Response: ApiResponse<Role>
```

**注意**: 更新权限时会记录变更diff

#### 6.3.5 废弃角色

```
POST /api/v1/roles/:id/deprecate

Response: ApiResponse<Role>
```

#### 6.3.6 克隆角色

```
POST /api/v1/roles/:id/clone
Body: {
  name: string;
  description?: string;
}

Response: ApiResponse<Role>
```

#### 6.3.7 获取角色变更预览

```
POST /api/v1/roles/:id/preview-changes
Body: {
  permissions: Permission[];
  defaultDataScope?: DataScope;
}

Response: ApiResponse<{
  changes: ChangeDetail[];
  impactSummary: string;
}>
```

### 6.4 权限矩阵API

#### 6.4.1 获取权限矩阵

```
GET /api/v1/permission-matrix
Query Parameters:
  - roleIds?: string[] (过滤特定角色)
  - modules?: Module[] (过滤特定模块)
  - types?: RoleType[] (过滤角色类型)

Response: ApiResponse<PermissionMatrix>
```

**PermissionMatrix结构**:
```typescript
interface PermissionMatrix {
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
```

#### 6.4.2 导出权限矩阵

```
GET /api/v1/permission-matrix/export
Query Parameters: (同获取权限矩阵)
Response: CSV文件下载
```

### 6.5 审计日志API

#### 6.5.1 获取审计日志

```
GET /api/v1/audit-logs
Query Parameters:
  - page: number
  - pageSize: number
  - startDate?: string (ISO 8601)
  - endDate?: string (ISO 8601)
  - actionType?: ActionType
  - targetType?: TargetType
  - targetId?: string
  - actorId?: string

Response: ApiResponse<PaginatedResponse<AuditLog>>
```

#### 6.5.2 导出审计日志

```
GET /api/v1/audit-logs/export
Query Parameters: (同获取审计日志)
Response: CSV文件下载
```

### 6.6 IdP组映射API

#### 6.6.1 获取映射列表

```
GET /api/v1/idp-mappings
Query Parameters:
  - idpSource?: string
  - status?: 'ACTIVE' | 'INACTIVE'

Response: ApiResponse<IdpGroupMapping[]>
```

#### 6.6.2 创建映射

```
POST /api/v1/idp-mappings
Body: {
  idpSource: string;
  groupClaim: string;
  mappedRoleIds: string[];
}

Response: ApiResponse<IdpGroupMapping>
```

#### 6.6.3 更新映射

```
PUT /api/v1/idp-mappings/:id
Body: {
  mappedRoleIds?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
}

Response: ApiResponse<IdpGroupMapping>
```

#### 6.6.4 删除映射

```
DELETE /api/v1/idp-mappings/:id

Response: ApiResponse<{ deleted: boolean }>
```

### 6.7 SSO集成API

#### 6.7.1 SSO回调处理

```
POST /api/v1/auth/sso/callback
Body: {
  idpUserId: string;
  idpSource: string;
  email: string;
  name: string;
  groups?: string[];  // IdP组声明
}

Response: ApiResponse<{
  token: string;
  user: User;
  effectiveRoles: Role[];
}>
```

**处理流程**:
1. 根据`idpUserId`查找或创建用户
2. 解析`groups`，应用IdP组映射
3. 合并手动分配角色和IdP派生角色
4. 生成JWT token返回

---

## 7. 前端页面设计

### 7.1 信息架构

```
System Management
└── Access Control
    ├── Users (用户管理)
    ├── Roles (角色管理)
    ├── Permission Matrix (权限矩阵)
    ├── Audit Log (审计日志)
    └── IdP Mapping (IdP组映射)
```

### 7.2 页面详细设计

#### 7.2.1 Users页面

**列表视图**:
- **列**: Name, Email, Customer, Warehouses, Roles (count), Status, Last Login, IdP Source
- **过滤器**: Customer, Warehouse, Role, Status, IdP Source
- **搜索**: 姓名/邮箱搜索
- **操作**: 查看详情、编辑、删除、克隆

**详情视图** (Modal/Drawer):
- **Profile标签页**:
  - 身份信息（姓名、邮箱、电话）
  - IdP信息（IdP名称、外部ID、只读组/角色声明）
  
- **Roles标签页**:
  - "From IdP group mapping"部分（只读）
    - 显示IdP派生角色
    - 显示来源组信息（tooltip）
  - "Manual assignment"部分（可管理）
    - 显示手动分配角色
    - 添加/移除角色按钮
  
- **Effective Access标签页**:
  - 人类可读的权限摘要
  - 示例: "Can view Inventory Status for warehouses 146-El Paso; cannot edit Finance invoices"

#### 7.2.2 Roles页面

**列表视图**:
- **列**: Role name, Description, Type, Modules, # Assigned Users, Status, Last Modified, Modified By
- **过滤器**: Module, Type, Status, Environment
- **操作**: 查看详情、编辑、废弃、克隆

**详情/编辑视图**:
- **Header**: Name, Description, Type, Status, Environment
- **Scope**: 默认数据范围（Customer/Warehouse/Region）
- **Permissions编辑器**:
  - 按模块折叠（Accordion）
  - 每个模块内表格：
    - 行: 页面/功能
    - 列: 操作（View/Create/Edit/Delete/Approve/Export）
    - 复选框选择
  - 权限工具提示（每个权限的通俗解释）
- **Impact Preview**: 关键能力摘要
- **变更预览**: 编辑时显示diff（变更前 vs 变更后）

**高风险操作确认**:
- Finance写权限、Outbound创建、Admin访问等需要确认对话框
- 显示影响摘要

#### 7.2.3 Permission Matrix页面

**只读视图**:
- **表格结构**:
  - 行: 角色
  - 列: 模块 → 页面 → 操作
  - 单元格: 权限标记（✓/✗）
- **过滤器**: Role, Module, Type
- **导出**: CSV导出按钮

**优化**:
- 支持展开/折叠模块
- 颜色编码（有权限=绿色，无权限=灰色）
- 支持按列排序

#### 7.2.4 Audit Log页面

**列表视图**:
- **列**: Timestamp, Actor, Action Type, Target Type, Target, Changes Summary
- **过滤器**: Date Range, Action Type, Target Type, Actor
- **搜索**: 目标名称搜索
- **导出**: CSV导出按钮

**详情视图** (点击展开):
- 完整变更详情
- 变更前后对比（JSON格式，高亮差异）
- 操作者信息
- IP地址和用户代理

#### 7.2.5 IdP Mapping页面

**列表视图**:
- **列**: IdP Source, Group/Claim Value, Mapped Roles, Status
- **过滤器**: IdP Source, Status
- **操作**: 创建、编辑、删除

**创建/编辑表单**:
- IdP Source选择
- Group/Claim Value输入
- 角色多选（支持搜索）
- 状态选择

---

## 8. 权限模型

### 8.1 权限层级结构

```
Module (模块)
  └── Page (页面/功能)
      └── Operation (操作)
          └── Data Scope (数据范围，可选)
```

### 8.2 模块定义

| 模块 | 代码 | 描述 |
|------|------|------|
| KPI | `KPI` | 关键绩效指标 |
| Inbound | `INBOUND` | 入库管理 |
| Inventory | `INVENTORY` | 库存管理 |
| Outbound | `OUTBOUND` | 出库管理 |
| Returns | `RETURNS` | 退货管理 |
| Finance | `FINANCE` | 财务管理 |
| Supply Chain | `SUPPLY_CHAIN` | 供应链管理 |
| Admin | `ADMIN` | 系统管理 |

### 8.3 操作类型

| 操作 | 代码 | 描述 |
|------|------|------|
| View | `VIEW` | 查看数据 |
| Create | `CREATE` | 创建数据 |
| Edit | `EDIT` | 编辑数据 |
| Delete | `DELETE` | 删除数据 |
| Approve | `APPROVE` | 审批操作 |
| Export | `EXPORT` | 导出数据 |

### 8.4 权限计算逻辑

**有效权限 = 所有角色的权限并集**

1. 收集用户的所有角色（手动 + IdP派生）
2. 合并所有角色的权限
3. 应用数据范围限制（Customer/Warehouse/Region）
4. 返回最终有效权限

**示例**:
```
用户角色: [Customer Admin, CSR]
Customer Admin权限: Inventory.Status [VIEW, EXPORT], Outbound.Orders [CREATE, EDIT]
CSR权限: Inventory.Status [VIEW], Returns.Management [VIEW, CREATE]

有效权限:
- Inventory.Status: [VIEW, EXPORT]  (并集)
- Outbound.Orders: [CREATE, EDIT]
- Returns.Management: [VIEW, CREATE]
```

---

## 9. UI/UX设计规范

### 9.1 设计系统 (Item Design System)

#### 9.1.1 颜色系统

**主色**:
- Primary: `#753BBD` (紫色 - 创新)
- Accent: `#F97316` (橙色 - 动态能量)

**语义色**:
- Success: `#15803D` (绿色)
- Warning: `#e79f04` (黄色)
- Danger: `#F0283C` (红色)
- Info: `#666666` (灰色)

**文本色**:
- Primary: `#181818` (浅色模式) / `#ffffff` (深色模式)
- Secondary: `#666666` (浅色模式) / `#999999` (深色模式)

#### 9.1.2 字体系统

**字体**: Satoshi (几何无衬线字体)

**字号**:
- H1: 128px (Hero标题)
- H2: 96px (页面标题)
- H3: 64px (章节标题)
- H4: 48px (子章节)
- H5: 36px (卡片标题)
- H6: 28px (小标题)
- Body: 16px (正文)
- Button: 14px (按钮)

#### 9.1.3 间距系统

| Token | Value | 用途 |
|-------|-------|------|
| xs | 4px | 紧密间距 |
| sm | 8px | 相关元素 |
| md | 16px | 标准间距 |
| lg | 24px | 章节间距 |
| xl | 32px | 主要章节 |
| 2xl | 48px | 页面章节 |
| 3xl | 64px | Hero区域 |

#### 9.1.4 组件库

**推荐**: shadcn/ui (React) 或 Element Plus (Vue)

**关键组件**:
- Table (表格)
- Accordion (折叠面板)
- Dialog (对话框)
- Dropdown (下拉菜单)
- Tooltip (工具提示)
- Badge (徽章)

### 9.2 交互规范

#### 9.2.1 高风险操作确认

**触发条件**:
- 授予Finance写权限
- 授予Outbound创建权限
- 授予Admin访问权限
- 删除角色/用户

**确认对话框内容**:
- 操作描述
- 影响摘要
- 受影响用户数量
- 确认输入（如：输入"DELETE"确认删除）

#### 9.2.2 权限工具提示

每个权限复选框应显示工具提示，解释该权限的作用：

```
示例:
"View Inventory Status" → "允许查看库存状态页面，包括当前库存水平、SKU详情等"
"Create Outbound Orders" → "允许创建新的出库订单，这是一个高风险操作"
```

#### 9.2.3 视觉区分

**手动角色 vs IdP派生角色**:
- 手动角色: 蓝色标签，可编辑图标
- IdP派生角色: 灰色标签，锁定图标，只读

**有效权限 vs 可编辑配置**:
- 有效权限: 只读视图，使用只读样式
- 可编辑配置: 可编辑表单，使用输入样式

### 9.3 响应式设计

**断点**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**适配策略**:
- 表格在小屏幕转为卡片视图
- 过滤器折叠为抽屉
- 详情视图使用全屏Modal

---

## 10. 实施计划

### 10.1 第一阶段：核心功能 (4-6周)

**目标**: 实现基础RBAC功能

**任务**:
1. ✅ 数据模型实现
   - User, Role, Permission模型
   - 数据库迁移脚本
   
2. ✅ 审计日志系统
   - AuditLog模型
   - 审计日志服务
   - 审计日志API
   
3. ✅ 用户管理
   - 用户CRUD API
   - 用户列表/详情页面
   - 角色分配功能
   
4. ✅ 角色管理
   - 角色CRUD API
   - 角色列表/详情页面
   - 权限编辑器（基础版）
   
5. ✅ 权限矩阵
   - 权限矩阵API
   - 权限矩阵页面
   - CSV导出功能

**交付物**:
- 可用的用户和角色管理功能
- 基础权限矩阵视图
- 审计日志记录

### 10.2 第二阶段：增强功能 (4-6周)

**目标**: 完善权限模型和IdP集成

**任务**:
1. ✅ IdP集成
   - IdP字段扩展
   - SSO回调处理
   - IdP组映射功能
   
2. ✅ 细粒度权限模型
   - 模块→页面→操作层级
   - 权限编辑器增强
   - 权限影响预览
   
3. ✅ 数据范围扩展
   - Warehouse/Region支持
   - 数据范围配置UI
   
4. ✅ 角色状态管理
   - Deprecated状态
   - 环境标识
   - 变更预览（diff）
   
5. ✅ 用户详情页增强
   - 完整详情视图
   - 有效权限摘要
   - 角色来源区分

**交付物**:
- 完整的IdP集成
- 细粒度权限模型
- 增强的用户/角色管理

### 10.3 第三阶段：优化与完善 (2-4周)

**目标**: 用户体验优化和性能提升

**任务**:
1. ✅ 用户克隆功能
2. ✅ UI/UX优化（应用设计系统）
3. ✅ 性能优化（权限矩阵查询、审计日志查询）
4. ✅ 文档完善
5. ✅ 测试覆盖

**交付物**:
- 完整的RBAC系统
- 优化的用户体验
- 完整的文档和测试

---

## 11. 技术栈与依赖

### 11.1 后端技术栈

- **运行时**: Node.js >= 18.0.0
- **框架**: Express.js 4.x
- **语言**: TypeScript 5.x
- **认证**: JWT (jsonwebtoken)
- **数据库**: PostgreSQL 14+ (生产) / 内存数据库 (开发)
- **ORM**: Prisma / TypeORM (可选)
- **日志**: Winston / Pino

### 11.2 前端技术栈

- **框架**: React 18.x
- **语言**: TypeScript 5.x
- **构建工具**: Vite 5.x
- **UI组件库**: Ant Design 5.x / shadcn/ui
- **路由**: React Router 6.x
- **状态管理**: React Context / Zustand (可选)
- **HTTP客户端**: Axios

### 11.3 外部依赖

- **SSO**: SAML 2.0 / OIDC (由IAM团队提供)
- **IdP**: Azure AD / Okta / Google Workspace
- **监控**: 现有监控堆栈
- **日志**: 现有日志系统

### 11.4 开发工具

- **代码质量**: ESLint, Prettier
- **测试**: Jest, React Testing Library
- **API文档**: Swagger/OpenAPI
- **版本控制**: Git

---

## 12. 安全考虑

### 12.1 认证与授权

- 所有API端点需要JWT认证
- 基于角色的访问控制（RBAC）
- 前端路由守卫
- 后端权限中间件

### 12.2 数据安全

- 审计日志防篡改（只追加模式）
- 敏感数据加密存储
- SQL注入防护（使用参数化查询）
- XSS防护（输入验证和输出转义）

### 12.3 审计与合规

- 所有权限变更记录审计日志
- 审计日志不可删除（仅归档）
- 支持审计日志导出
- 满足合规要求（SOC 2, ISO 27001等）

---

## 13. 性能优化

### 13.1 数据库优化

- 权限矩阵查询使用缓存
- 审计日志分表/分区
- 索引优化（userId, roleId, timestamp等）

### 13.2 API优化

- 权限计算缓存（Redis）
- 批量查询优化
- 分页查询

### 13.3 前端优化

- 虚拟滚动（长列表）
- 懒加载（权限矩阵）
- 代码分割

---

## 14. 测试策略

### 14.1 单元测试

- 权限计算逻辑
- 数据模型验证
- 工具函数

### 14.2 集成测试

- API端点测试
- 数据库操作测试
- SSO集成测试

### 14.3 E2E测试

- 用户管理流程
- 角色管理流程
- 权限分配流程

---

## 15. 部署与运维

### 15.1 部署环境

- **开发**: 本地开发环境
- **测试**: 测试环境（Staging）
- **生产**: 生产环境（Prod）

### 15.2 监控指标

- API响应时间
- 错误率
- 权限计算性能
- 审计日志写入性能

### 15.3 备份与恢复

- 数据库定期备份
- 审计日志归档策略
- 灾难恢复计划

---

## 附录

### A. 术语表

- **RBAC**: Role-Based Access Control (基于角色的访问控制)
- **IdP**: Identity Provider (身份提供商)
- **SSO**: Single Sign-On (单点登录)
- **SAML**: Security Assertion Markup Language
- **OIDC**: OpenID Connect
- **JWT**: JSON Web Token

### B. 参考文档

- RBAC Admin Portal PRD v0.2
- Item Design System (design.item.com)
- OAuth 2.0 / OIDC规范
- SAML 2.0规范

---

**文档版本**: 1.0  
**最后更新**: 2025年12月  
**维护者**: 开发团队

