# Client Portal 权限管理系统

## 项目概述

Client Portal（OMS/Portal系统）是一个统一的门户系统，整合多个业务系统（WMS、TMS等）的数据和功能。本系统实现了完善的权限管理体系，确保不同客户的数据安全隔离，并为不同角色的用户提供合适的访问权限。

## AI协作规则

**⚠️ 重要：AI助手协作规则**

在与AI助手（如Claude、ChatGPT等）协作开发时，请遵循以下规则：

### 🚫 禁止自动提交
- **永远不要自动执行git提交操作**
- AI助手不得自动执行 `git add`、`git commit`、`git push` 命令
- 所有代码提交必须由人工手动控制

### ✅ 允许的操作
- 代码修改和文件更新
- 运行测试和构建命令
- 启动/停止开发服务器
- 查看文件内容和项目状态

### 📋 工作流程
1. AI助手进行代码修改
2. AI助手报告完成的更改内容
3. 开发者审查更改
4. 开发者手动决定是否提交更改
5. 开发者手动执行git操作

### 💡 提醒
在每次新的AI对话开始时，请提醒AI助手遵守此规则：
"永远不要自动提交更新"

## 核心功能

### 1. 账号管理
- **客户子账号管理**：创建、编辑、删除客户子账号，分配Customer和角色
- **Partner账号管理**：创建、编辑、删除Partner账号，配置可访问Customer和角色
- **账号状态管理**：支持启用、禁用、暂停状态
- **唯一性验证**：用户名、邮箱、手机号在同一租户内唯一

### 2. 角色管理
- **角色创建和编辑**：支持系统角色、客户角色、Partner角色
- **权限分配**：菜单权限、功能权限、数据权限配置
- **使用统计**：显示角色使用数量，防止误删正在使用的角色
- **数据权限**：支持全部数据或指定Customer的数据权限

### 3. 菜单管理
- **菜单查看**：树形结构展示所有系统菜单
- **权限配置**：通过角色为账号分配可见菜单
- **系统预定义**：菜单由系统预定义，不能创建或删除

### 4. 权限查看
- **我的权限**：查看当前用户的所有角色和权限
- **账号权限查看**：主账号可以查看任意账号的权限详情
- **权限树展示**：按模块分组展示菜单和功能权限

## 技术栈

### 后端
- **Node.js** + **Express** + **TypeScript**
- **JWT** 认证
- **内存数据库**（可替换为真实数据库）

### 前端
- **React** + **TypeScript**
- **Ant Design** UI组件库
- **React Router** 路由管理
- **Axios** HTTP客户端
- **Vite** 构建工具

## 项目结构

```
.
├── src/                    # 后端源代码
│   ├── server/            # Express服务器
│   │   ├── index.ts      # 服务器入口
│   │   └── routes/       # 路由定义
│   ├── middleware/       # 中间件
│   │   ├── auth.ts       # 认证中间件
│   │   └── permission.ts # 权限中间件
│   ├── database/         # 数据库模型
│   │   ├── models.ts     # 数据模型
│   │   └── init.ts       # 初始化脚本
│   ├── types/            # TypeScript类型定义
│   └── utils/            # 工具函数
├── client/                # 前端源代码
│   ├── src/
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 公共组件
│   │   ├── contexts/     # React Context
│   │   └── utils/        # 工具函数
│   └── package.json
├── package.json          # 后端依赖
└── README.md
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 启动开发服务器

```bash
# 同时启动前端和后端（推荐）
npm run dev

# 或者分别启动
npm run dev:server  # 后端：http://localhost:3001
npm run dev:client  # 前端：http://localhost:3000
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 默认测试账号

系统初始化时会创建以下测试数据：

- **租户ID**: `admin`
- **主账号用户名**: `admin`
- **主账号密码**: `admin123`

## API接口文档

### 认证接口

#### 登录
```
POST /api/auth/login
Body: {
  username: string,
  password: string,
  tenantId: string
}
```

### 账号管理接口

#### 创建客户子账号
```
POST /api/accounts/customer
Headers: Authorization: Bearer {token}
Body: {
  username: string,
  email: string,
  phone: string,
  password: string,
  customerIds: string[],
  roleIds: string[],
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}
```

#### 创建Partner账号
```
POST /api/accounts/partner
Headers: Authorization: Bearer {token}
Body: {
  username: string,
  email: string,
  phone: string,
  password: string,
  accessibleCustomerIds: string[],
  roleIds: string[],
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}
```

#### 获取账号列表
```
GET /api/accounts?page=1&pageSize=10&accountType=CUSTOMER&status=ACTIVE
Headers: Authorization: Bearer {token}
```

#### 获取账号详情
```
GET /api/accounts/:id
Headers: Authorization: Bearer {token}
```

#### 更新账号
```
PUT /api/accounts/:id
Headers: Authorization: Bearer {token}
Body: {
  username?: string,
  email?: string,
  phone?: string,
  customerIds?: string[],
  accessibleCustomerIds?: string[],
  roleIds?: string[],
  status?: string
}
```

#### 删除账号
```
DELETE /api/accounts/:id
Headers: Authorization: Bearer {token}
```

### 角色管理接口

#### 创建角色
```
POST /api/roles
Headers: Authorization: Bearer {token}
Body: {
  name: string,
  description?: string,
  type: 'SYSTEM' | 'CUSTOMER' | 'PARTNER',
  menuPermissions: string[],
  functionPermissions: string[],
  dataPermissionType: 'ALL' | 'ASSIGNED',
  accessibleCustomerIds?: string[]
}
```

#### 获取角色列表
```
GET /api/roles?page=1&pageSize=10&type=CUSTOMER
Headers: Authorization: Bearer {token}
```

#### 获取角色详情
```
GET /api/roles/:id
Headers: Authorization: Bearer {token}
```

#### 更新角色
```
PUT /api/roles/:id
Headers: Authorization: Bearer {token}
Body: { ... }
```

#### 删除角色
```
DELETE /api/roles/:id
Headers: Authorization: Bearer {token}
```

### 菜单管理接口

#### 获取所有菜单
```
GET /api/menus
Headers: Authorization: Bearer {token}
```

#### 获取账号可见菜单
```
GET /api/menus/account/:accountId
Headers: Authorization: Bearer {token}
```

### 权限查看接口

#### 获取我的权限
```
GET /api/permissions/my-permissions
Headers: Authorization: Bearer {token}
```

#### 获取账号权限
```
GET /api/permissions/account/:accountId
Headers: Authorization: Bearer {token}
```

#### 获取Customer列表
```
GET /api/permissions/customers
Headers: Authorization: Bearer {token}
```

## 权限体系说明

### 账号类型

1. **主账号（MAIN）**
   - 权限来源：由Central系统配置
   - 权限范围：可以访问租户下所有Customer的数据
   - 管理权限：可以管理Customer、子账号、角色等

2. **客户子账号（CUSTOMER）**
   - 权限来源：由主账号通过portal-central模块配置
   - 权限范围：可以通过权限配置访问多个Customer的数据
   - 数据权限：通过角色权限绑定多个Customer的数据访问权限

3. **Partner账号（PARTNER）**
   - 权限来源：由主账号通过portal-central模块配置
   - 权限范围：可以访问多个Customer
   - 数据权限：通过权限配置绑定多个Customer的数据访问权限

### 数据隔离规则

- **数据查询**：用户只能查询所属Customer或授权Customer的数据
- **数据创建**：创建的数据自动关联到用户所属Customer
- **数据修改**：只能修改所属Customer的数据
- **数据删除**：只能删除所属Customer的数据

### 权限中间件

系统提供了以下权限中间件：

1. **authenticate**：JWT认证中间件
2. **requireAccountType**：账号类型权限检查
3. **checkDataPermission**：数据权限检查
4. **filterDataByPermission**：数据过滤函数

## 与Central系统集成

### 权限策略同步
- 同步方式：Central系统配置权限策略后，同步到portal-central模块
- 同步内容：权限策略、角色定义、权限配置
- 子账号的内容需根据主账号的权限范围内进行设置

### 主账号权限管理
- 权限来源：主账号的权限由Central系统配置
- 权限范围：主账号可以管理Customer、子账号、角色等
- 权限限制：主账号的权限受Central系统权限策略限制

## 开发说明

### 添加新的菜单
在 `src/database/models.ts` 的 `initDefaultData` 方法中添加菜单定义。

### 添加新的功能权限
在 `src/database/models.ts` 的 `initDefaultData` 方法中添加功能权限定义。

### 替换数据库
当前使用内存数据库，可以替换为真实数据库（如MySQL、PostgreSQL、MongoDB等）。只需修改 `src/database/models.ts` 中的实现。

## 注意事项

1. **生产环境配置**
   - 修改JWT_SECRET为强密码
   - 使用真实数据库替换内存数据库
   - 配置HTTPS
   - 实现密码加密存储（当前为明文，仅用于演示）

2. **安全性**
   - 密码应使用bcrypt加密存储
   - 实现请求频率限制
   - 添加CORS配置
   - 实现审计日志

3. **扩展性**
   - Customer管理应由Central系统提供API
   - 菜单和功能权限应由配置中心管理
   - 实现权限缓存机制提升性能

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。
