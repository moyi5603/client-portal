# 超级管理员角色说明

## 概述

系统已成功预设了一个超级管理员角色（Super Administrator），该角色具有以下特点：

## 角色特性

### 1. 角色信息
- **角色ID**: `ROLE-000`
- **角色名称**: Super Administrator
- **描述**: Super administrator with all permissions (actions disabled)
- **状态**: 启用（ACTIVE）
- **类型**: 系统预设角色（isSystemRole: true）

### 2. 权限配置
超级管理员角色拥有系统中所有模块的权限，包括：

#### 完整权限的模块：
- **仪表板 (DASHBOARDS)**: 查看
- **采购管理 (PURCHASE_MANAGEMENT)**: 查看、创建、导出
- **销售订单 (SALES_ORDER)**: 查看
- **工单管理 (WORK_ORDER)**: 查看
- **入库管理 (INBOUND)**: 查看、编辑、导出、取消等
- **库存管理 (INVENTORY)**: 查看、导出、库存操作等
- **出库管理 (OUTBOUND)**: 查看、导出、下载PDF等
- **退货管理 (RETURNS)**: 查看、导出
- **堆场管理 (YARD_MANAGEMENT)**: 查看、导出
- **供应链 (SUPPLY_CHAIN)**: 查看、编辑、创建、导出
- **财务管理 (FINANCE)**: 查看、创建、导出
- **系统管理 (SYSTEM_MANAGEMENT)**: 查看、创建、编辑、删除、导出

#### 受限权限的模块：
- **权限管理 (PERMISSION_MANAGEMENT)**: 
  - 账号管理：仅查看权限（禁用创建、编辑、删除操作）
  - 角色管理：仅查看权限（禁用创建、编辑、删除操作）
  - 权限查看：查看权限
  - 操作记录：查看、导出权限

### 3. 系统保护机制

#### 前端保护：
- 角色列表中显示"系统角色"标识
- 编辑按钮被禁用，显示"系统角色只读"提示
- 删除按钮被禁用，显示"系统角色受保护"提示
- 可以复制该角色创建新角色

#### 后端保护：
- API层面禁止编辑系统角色（返回403错误）
- API层面禁止删除系统角色（返回403错误）
- 系统角色不会被意外修改或删除

### 4. 主账号分配
- 系统主账号（admin）**默认只分配超级管理员角色**
- 主账号不会分配其他角色，确保权限的纯净性
- 主账号通过超级管理员角色获得系统的完整访问权限
- 在权限管理模块中，主账号的操作权限被适当限制，确保系统安全

## 设计理念

### 权限分离原则
超级管理员角色的设计遵循权限分离原则：
1. **业务权限**: 拥有所有业务模块的完整权限
2. **管理权限**: 在权限管理模块中仅有查看权限，防止权限滥用
3. **系统保护**: 角色本身受到系统级保护，不可被修改或删除

### 安全考虑
1. **防止权限升级**: 通过限制权限管理操作，防止用户通过修改角色来获得更高权限
2. **审计追踪**: 所有操作都会被记录在审计日志中
3. **角色隔离**: 系统角色与普通角色在功能上明确区分

## 使用说明

### 登录信息
- **组织代码**: admin
- **用户名**: admin  
- **密码**: admin123

### 功能验证
1. 登录后可以访问所有业务模块
2. 在角色管理页面可以看到超级管理员角色，但无法编辑或删除
3. 可以复制超级管理员角色创建新的自定义角色
4. 在权限管理相关页面，操作权限受到适当限制

## 技术实现

### 数据结构
```typescript
interface Role {
  id: string;
  name: string;
  description?: string;
  status: RoleStatus;
  permissions: Permission[];
  usageCount: number;
  isSystemRole?: boolean; // 系统角色标识
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  modifiedBy?: string;
}
```

### 权限配置示例
```typescript
{
  module: Module.PERMISSION_MANAGEMENT,
  page: 'Account Management',
  pageCode: 'account-management',
  operations: [Operation.VIEW] // 仅查看权限
}
```

## 扩展说明

如需创建其他系统预设角色，可以参考超级管理员角色的实现方式：
1. 在数据库初始化时创建角色，设置 `isSystemRole: true`
2. 在前端界面中添加相应的保护逻辑
3. 在后端API中添加系统角色的保护检查

这样可以确保系统的稳定性和安全性。