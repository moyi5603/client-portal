# Mock数据完整转换总结

## 概述
已将所有后端数据完整转换为mock数据，确保Vercel部署时有丰富的测试数据，与本地运行的后端数据完全一致。

## 转换的数据类型

### 1. 账号数据 (accounts)
- **数量**: 8个账号 (1个主账号 + 7个子账号)
- **主账号**: admin (ROLE-000 超级管理员)
- **子账号**: john.smith, jane.doe, mike.johnson, sarah.wilson, david.brown, lisa.garcia, robert.davis
- **包含字段**: 
  - 基本信息: id, username, email, phone, accountType, status
  - 权限信息: roles, customerIds, facilityIds, customerFacilityMappings
  - 时间戳: createdAt, updatedAt, lastLoginAt

### 2. 角色数据 (roles)
- **数量**: 4个角色
- **角色列表**:
  - ROLE-000: Super Administrator (超级管理员) - 拥有所有权限但权限管理模块操作受限
  - ROLE-001: System Administrator (系统管理员) - 系统管理和权限管理权限
  - ROLE-002: Customer Administrator (客户管理员) - 客户相关权限
  - ROLE-003: Customer Service Representative (客户服务代表) - 客服相关权限
- **权限结构**: 完整的模块-页面-操作三级权限结构
- **包含字段**: id, name, description, status, permissions, usageCount, isSystemRole

### 3. 菜单数据 (menus)
- **数量**: 完整的菜单树结构
- **主要模块**:
  - Dashboard (工作台)
  - Purchase Management (采购管理)
  - Order Management (订单管理) 
  - Transportation Management (运输管理)
  - System Management (系统管理)
  - Permission Management (权限管理)
- **包含字段**: id, name, code, path, parentId, icon, order, type, status, componentPath

### 4. 审计日志数据 (auditLogs)
- **数量**: 5条模拟操作记录
- **操作类型**: 
  - 角色创建 (1小时前)
  - 账号更新 (45分钟前) 
  - 账号创建 (30分钟前)
  - 角色更新 (20分钟前)
  - 角色复制 (10分钟前)
- **包含字段**: id, timestamp, actor, actionType, targetType, targetId, description, changes

### 5. 用户页面数据 (userPages)
- **数量**: 4个用户自定义页面
- **页面列表**:
  - 订单统计看板 (dashboard类型)
  - 待发货订单列表 (list类型)
  - 库存报表 (list类型)
  - 客户分析报表 (dashboard类型)
- **包含字段**: id, name, description, pageType, config, componentCode, styleCode

### 6. 客户数据 (customers)
- **数量**: 4个客户
- **客户列表**: ABC Corporation, XYZ Industries, Global Logistics Ltd, Tech Solutions Inc
- **包含字段**: id, name, code, description, createdAt, updatedAt

### 7. 设施数据 (facilities)
- **数量**: 5个设施
- **设施类型**: WAREHOUSE, DISTRIBUTION_CENTER, COLD_STORAGE, PROCESSING_CENTER
- **包含字段**: id, name, code, description, address, type, status

### 8. 权限矩阵数据 (permissionMatrix)
- **结构**: 角色-模块-页面-操作四级矩阵
- **用途**: 权限查看页面的数据展示
- **包含**: 所有角色的完整权限映射关系

## API端点

### 已创建的API文件
1. `api/auth.js` - 认证API (登录验证)
2. `api/accounts.js` - 账号管理API (CRUD操作)
3. `api/roles.js` - 角色管理API (CRUD操作)
4. `api/menus.js` - 菜单管理API (CRUD操作)
5. `api/audit-logs.js` - 审计日志API (查询、过滤、分页)
6. `api/user-pages.js` - 用户页面API (CRUD操作)
7. `api/customers.js` - 客户数据API (查询)
8. `api/facilities.js` - 设施数据API (查询)
9. `api/permission-matrix.js` - 权限矩阵API (查询)
10. `api/test.js` - API测试端点
11. `api/mock-data.js` - 核心mock数据文件

### API功能特性
- **完整CRUD**: 支持创建、读取、更新、删除操作
- **数据过滤**: 支持按状态、类型、时间范围等过滤
- **分页支持**: 审计日志等支持分页查询
- **关联查询**: 支持通过ID获取关联数据
- **统计功能**: 提供数据计数和统计方法

## 数据一致性保证

### 与后端数据完全一致
- **账号角色关系**: 完全对应后端的角色分配
- **权限结构**: 使用相同的模块-页面-操作权限模型
- **数据关联**: 保持客户-设施映射关系
- **时间戳**: 使用真实的时间戳数据
- **状态管理**: 保持相同的状态枚举值

### 辅助功能
- **查询函数**: 提供按ID、状态、类型等查询方法
- **过滤函数**: 支持复杂的数据过滤需求
- **统计函数**: 提供数据计数和统计功能
- **更新函数**: 支持角色使用次数等动态更新

## 登录凭据
- **用户名**: admin
- **密码**: admin123
- **支持所有账号**: 所有mock账号都使用相同密码 admin123

## 部署优势
1. **丰富数据**: 提供完整的业务场景测试数据
2. **功能完整**: 支持所有前端功能的数据需求
3. **性能优化**: 本地数据访问，无需外部数据库
4. **易于维护**: 集中管理，便于数据更新和扩展
5. **开发友好**: 提供完整的API接口，便于前端开发测试

## 使用方式
```javascript
// 在API函数中使用
const mockData = require('./mock-data');

// 获取所有账号
const accounts = mockData.accounts;

// 使用辅助函数
const account = mockData.getAccountById('ACC-000');
const activeRoles = mockData.getRolesByStatus('ACTIVE');
```

这个完整的mock数据系统确保了Vercel部署后的应用具有与本地开发环境完全一致的数据体验。