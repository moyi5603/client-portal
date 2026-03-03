# Account Type简化更新

## 更新概述

将Portal Admin账户管理中的Account Type简化为只有两种类型：
- 主账号 (MAIN)
- 子账号 (SUB)

## 主要变更

### 1. 类型定义更新 (`src/types/index.ts`)
```typescript
// 之前
export enum AccountType {
  MAIN = 'MAIN',           // 主账号
  CUSTOMER = 'CUSTOMER',   // 客户子账号
  PARTNER = 'PARTNER'      // Partner账号
}

// 之后
export enum AccountType {
  MAIN = 'MAIN',           // 主账号
  SUB = 'SUB'              // 子账号
}
```

### 2. 前端界面更新

#### Portal Admin账户管理 (`client/src/pages/PortalAdminAccountManagement.tsx`)
- 更新Account接口，将accountType类型限制为 `'MAIN' | 'SUB'`
- 创建子账号时，默认设置accountType为'SUB'
- 不在创建对话框中显示Account Type字段（自动设置）

#### 普通账户管理 (`client/src/pages/AccountManagement.tsx`)
- 移除创建账号对话框中的Account Type选择字段
- 默认创建的账号类型为'SUB'
- 更新API调用，使用新的`/accounts/sub`端点
- 移除Account Type字段的表单验证

### 3. 后端API更新

#### Portal Admin路由 (`src/routes/portalAdmin.ts`)
- 更新mock数据中的accountType值：
  - 主账号使用 'MAIN'
  - 子账号使用 'SUB'
- 创建子账号API默认设置accountType为'SUB'

#### 账户路由 (`src/routes/account.ts`)
- 新增`POST /accounts/sub`端点，用于创建子账号
- 更新现有的`/customer`和`/partner`端点，统一使用SUB类型
- 简化账号更新逻辑，统一处理customerIds和facilityIds
- 移除基于账号类型的条件判断

### 4. 数据库初始化更新 (`src/database/init.ts`)
- 主账号(admin)保持为 AccountType.MAIN
- 所有测试用户账号更新为 AccountType.SUB

### 5. 审计服务更新 (`src/services/auditService.ts`)
- 更新accountTypeMap映射：
  - 'MAIN': 'Main Account'
  - 'SUB': 'Sub-account'

## 功能说明

### 创建子账号

#### Portal Admin页面
- 在Portal Admin账户管理页面，点击主账号的"Create Sub-account"操作
- 填写子账号信息（用户名、邮箱、姓名、密码等）
- 系统自动将新账号的accountType设置为'SUB'
- 不需要用户手动选择账号类型

#### 普通账户管理页面
- 点击"Create Account"按钮
- 填写账号信息（用户名、邮箱、密码等）
- Account Type字段已移除，不再显示
- 系统自动将新账号的accountType设置为'SUB'

### 账号类型识别
- 主账号：可以创建子账号，拥有完整的管理权限
- 子账号：从属于主账号，可以被删除

## 影响范围

### 已更新的文件
1. `src/types/index.ts` - AccountType枚举定义
2. `client/src/pages/PortalAdminAccountManagement.tsx` - Portal Admin账户管理页面
3. `client/src/pages/AccountManagement.tsx` - 普通账户管理页面
4. `src/routes/portalAdmin.ts` - Portal Admin API路由
5. `src/routes/account.ts` - 账户API路由
6. `src/database/init.ts` - 数据库初始化脚本
7. `src/services/auditService.ts` - 审计服务

### API变更
- 新增：`POST /accounts/sub` - 创建子账号（推荐使用）
- 保留：`POST /accounts/customer` - 创建客户子账号（兼容旧代码，现在创建SUB类型）
- 保留：`POST /accounts/partner` - 创建Partner账号（兼容旧代码，现在创建SUB类型）

### 兼容性说明
- 旧的CUSTOMER和PARTNER类型不再使用
- 现有的`/customer`和`/partner`端点仍然可用，但会创建SUB类型的账号
- 现有数据需要迁移到新的MAIN/SUB类型
- 建议在生产环境部署前进行数据迁移

## 测试建议

1. 测试Portal Admin页面创建子账号功能，确认默认类型为SUB
2. 测试普通账户管理页面创建账号功能，确认Account Type字段已移除
3. 验证主账号和子账号的权限区分
4. 检查审计日志中账号类型的显示
5. 确认账号列表中类型显示正确
6. 测试账号编辑功能，确认数据正确保存

## 后续工作

如需在UI中显示账号类型，可以：
1. 在账号列表中添加"Account Type"列
2. 显示为"主账号"或"子账号"的中文标签
3. 使用不同的图标或徽章区分账号类型
