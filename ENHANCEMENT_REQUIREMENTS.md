# 权限系统增强需求清单

基于RBAC Admin Portal需求文档，当前系统需要补充以下功能：

## 📋 核心缺失功能

### 1. 审计日志系统 ⚠️ **高优先级**

**当前状态**: 完全没有审计日志功能

**需要实现**:
- [ ] 创建审计日志数据模型
- [ ] 记录所有权限相关变更：
  - 角色创建、更新、废弃
  - 权限变更（变更前后对比）
  - 角色分配和移除
  - 用户创建、更新、删除
- [ ] 审计日志字段：
  - timestamp（时间戳）
  - actor（操作者：userId + IdP信息）
  - actionType（操作类型）
  - target（目标：role/user/mapping）
  - previousValue（变更前值）
  - newValue（变更后值）
- [ ] 审计日志查询API
- [ ] 审计日志导出功能（CSV）
- [ ] 审计日志前端页面（只读，支持过滤和导出）

**实现位置**:
- `src/types/index.ts` - 添加AuditLog类型
- `src/database/models.ts` - 添加审计日志存储
- `src/routes/audit.ts` - 创建审计日志API
- `client/src/pages/AuditLog.tsx` - 创建审计日志页面

---

### 2. 权限矩阵视图 ⚠️ **高优先级**

**当前状态**: 没有权限矩阵功能

**需要实现**:
- [ ] 创建权限矩阵数据模型
- [ ] 按角色和模块展示权限的只读视图
- [ ] 支持过滤：角色、模块、类型（Internal/Customer）
- [ ] 权限矩阵导出为CSV（用于审计）
- [ ] 权限矩阵前端页面

**实现位置**:
- `src/routes/permission-matrix.ts` - 创建权限矩阵API
- `client/src/pages/PermissionMatrix.tsx` - 创建权限矩阵页面

---

### 3. IdP集成支持 ⚠️ **高优先级**

**当前状态**: 账号模型缺少IdP相关字段

**需要补充的字段**:
```typescript
interface Account {
  // 现有字段...
  idpUserId?: string;        // IdP用户ID（不可变）
  idpSource?: string;         // IdP来源（Azure AD, Okta等）
  lastLogin?: string;         // 最后登录时间（来自SSO）
  idpGroups?: string[];      // IdP组/声明（只读）
  roleAssignments?: {
    manual: string[];        // 手动分配的角色
    idpDerived: string[];    // 来自IdP组映射的角色
  };
}
```

**需要实现**:
- [ ] 更新Account类型定义
- [ ] 用户列表显示IdP来源和最后登录时间
- [ ] 用户详情页区分手动角色和IdP派生角色
- [ ] IdP组到角色映射功能（见第4点）

---

### 4. IdP组到角色映射 ⚠️ **中优先级**

**当前状态**: 完全没有此功能

**需要实现**:
- [ ] 创建IdP组映射数据模型
- [ ] 映射关系：IdP组/声明值 → 一个或多个角色
- [ ] 支持多对多映射（一个组可映射多个角色，一个角色可映射多个组）
- [ ] IdP组映射管理页面（在Roles或Access Control下）
- [ ] 显示列：IdP来源、组/声明值、映射的角色、状态
- [ ] SSO登录时自动解析组声明并应用映射角色
- [ ] 用户详情页显示IdP派生角色（只读）

**实现位置**:
- `src/types/index.ts` - 添加IdpGroupMapping类型
- `src/database/models.ts` - 添加映射存储
- `src/routes/idp-mapping.ts` - 创建映射API
- `client/src/pages/IdpMapping.tsx` - 创建映射管理页面

---

### 5. 角色状态扩展 ⚠️ **中优先级**

**当前状态**: 角色只有基本字段，缺少状态管理

**需要补充**:
```typescript
enum RoleStatus {
  ACTIVE = 'ACTIVE',           // 活跃
  DEPRECATED = 'DEPRECATED'    // 已废弃（不允许新分配，但保留现有分配）
}

interface Role {
  // 现有字段...
  status: RoleStatus;          // 角色状态
  environment?: 'STAGING' | 'PROD';  // 环境标识
  modifiedBy?: string;         // 最后修改者
}
```

**需要实现**:
- [ ] 更新Role类型定义
- [ ] 角色列表显示状态和环境
- [ ] 废弃角色功能（标记为DEPRECATED，不允许新分配）
- [ ] 角色编辑时显示变更预览（diff）

---

### 6. 更细粒度的权限模型 ⚠️ **高优先级**

**当前状态**: 权限模型较简单（菜单+功能），需要更细粒度

**需要实现**:
- [ ] 权限层级结构：模块 → 页面/功能 → 操作
- [ ] 支持的模块：KPI, Inbound, Inventory, Outbound, Returns, Finance, Supply Chain, Admin
- [ ] 操作类型：View, Create, Edit, Delete, Approve, Export
- [ ] 权限编辑器：按模块折叠，表格形式（行=页面，列=操作）
- [ ] 权限影响预览：显示关键能力摘要

**新的权限结构**:
```typescript
interface Permission {
  module: string;              // 模块：KPI, Inbound, Inventory等
  page: string;                // 页面/功能：Inventory Status, SN Lookup等
  operations: string[];         // 操作：view, create, edit, delete, approve, export
  dataScope?: {                // 数据范围（可选）
    warehouses?: string[];
    customers?: string[];
    regions?: string[];
  };
}
```

---

### 7. 数据范围扩展 ⚠️ **中优先级**

**当前状态**: 只支持Customer级别的数据权限

**需要扩展**:
- [ ] 支持Warehouse（仓库）级别的数据权限
- [ ] 支持Region（区域）级别的数据权限
- [ ] 用户关联的warehouse和region信息
- [ ] 角色默认数据范围模式

**需要更新**:
```typescript
interface Account {
  // 现有字段...
  warehouses?: string[];        // 关联的仓库
  regions?: string[];          // 关联的区域
}

interface Role {
  // 现有字段...
  defaultDataScope?: {
    warehouses?: string[];
    customers?: string[];
    regions?: string[];
  };
}
```

---

### 8. 用户克隆功能 ⚠️ **低优先级**

**当前状态**: 没有用户克隆功能

**需要实现**:
- [ ] 用户克隆API（复制角色和范围，仅手动角色）
- [ ] 用户克隆前端功能
- [ ] 克隆时排除IdP派生角色

---

### 9. 权限变更Diff预览 ⚠️ **中优先级**

**当前状态**: 角色编辑时没有变更预览

**需要实现**:
- [ ] 角色编辑时显示变更对比（变更前 vs 变更后）
- [ ] 变更预览UI（高亮显示新增/删除/修改的权限）
- [ ] 保存前确认对话框，显示影响摘要

---

### 10. 用户列表增强 ⚠️ **中优先级**

**当前状态**: 用户列表功能较基础

**需要增强**:
- [ ] 显示列：Name, Email, Customer, Warehouses, Roles（数量）, Status, Last Login, IdP source
- [ ] 过滤器：Customer, Warehouse, Role, Status, IdP source
- [ ] 搜索功能

---

### 11. 角色列表增强 ⚠️ **中优先级**

**当前状态**: 角色列表功能较基础

**需要增强**:
- [ ] 显示列：Role name, Description, Type, Modules, # Assigned Users, Status, Last Modified, Modified By
- [ ] 过滤器：Module, Type, Status, Environment
- [ ] 显示角色适用的模块列表

---

### 12. 用户详情页增强 ⚠️ **中优先级**

**当前状态**: 没有专门的用户详情页

**需要实现**:
- [ ] 用户详情页（Profile + Roles + Effective Access）
- [ ] Profile部分：身份信息、IdP信息（IdP名称、外部ID、只读组/角色声明）
- [ ] Roles部分：
  - 按来源分组显示所有有效角色
  - "From IdP group mapping"（只读，显示组信息）
  - "Manual assignment"（可管理）
- [ ] Effective Access摘要：人类可读的关键能力描述

---

## 🎨 UI/UX增强

### 设计系统集成
- [ ] 应用Item Design System颜色系统（紫色主题 #753BBD）
- [ ] 使用shadcn/ui组件模式
- [ ] 支持暗色模式
- [ ] 遵循间距token（4, 8, 16, 24, 32, 48, 64px）

### 交互增强
- [ ] 高风险操作确认对话框（Finance写权限、Outbound创建、Admin访问）
- [ ] 权限工具提示（每个权限的通俗解释）
- [ ] 清晰区分：
  - 有效权限 vs 可编辑配置
  - 手动角色 vs IdP派生角色

---

## 📊 优先级总结

### 🔴 高优先级（必须实现）
1. ✅ 审计日志系统
2. ✅ 权限矩阵视图
3. ✅ IdP集成支持
4. ✅ 更细粒度的权限模型

### 🟡 中优先级（重要功能）
5. ✅ IdP组到角色映射
6. ✅ 角色状态扩展
7. ✅ 数据范围扩展（Warehouse/Region）
8. ✅ 权限变更Diff预览
9. ✅ 用户/角色列表增强
10. ✅ 用户详情页增强

### 🟢 低优先级（可选功能）
11. ✅ 用户克隆功能

---

## 🛠️ 实施建议

### 第一阶段：核心功能
1. 实现审计日志系统（基础功能）
2. 实现权限矩阵视图
3. 扩展IdP集成字段
4. 实现更细粒度的权限模型

### 第二阶段：增强功能
5. 实现IdP组映射
6. 扩展角色状态管理
7. 扩展数据范围支持
8. 实现变更预览

### 第三阶段：优化
9. 用户克隆功能
10. UI/UX优化
11. 性能优化

---

## 📝 注意事项

1. **向后兼容**: 所有新功能需要保持与现有系统的兼容性
2. **数据迁移**: 需要考虑现有数据的迁移策略
3. **性能**: 权限矩阵和审计日志查询需要考虑性能优化
4. **安全性**: 审计日志必须防篡改，建议使用只追加模式
5. **可扩展性**: 权限模型需要支持未来新增模块和操作类型

