# 快速启动指南

## 第一步：安装依赖

```bash
# 在项目根目录安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

## 第二步：启动开发服务器

```bash
# 方式1：同时启动前后端（推荐）
npm run dev

# 方式2：分别启动
# 终端1：启动后端
npm run dev:server

# 终端2：启动前端
npm run dev:client
```

## 第三步：访问系统

1. 打开浏览器访问：http://localhost:3000
2. 使用以下账号登录：
   - **租户ID**: `admin`
   - **用户名**: `admin`
   - **密码**: `admin123`

## 功能测试

### 1. 创建客户子账号
- 进入"账号管理"页面
- 点击"创建账号"
- 选择账号类型为"客户子账号"
- 填写账号信息并选择Customer和角色
- 保存

### 2. 创建角色
- 进入"角色管理"页面
- 点击"创建角色"
- 填写角色信息
- 选择菜单权限和功能权限
- 配置数据权限（全部数据或指定Customer）
- 保存

### 3. 查看权限
- 进入"权限查看"页面
- 查看"我的权限"了解当前账号的权限
- 如果是主账号，可以在"账号权限查看"标签页查看其他账号的权限

### 4. 菜单管理
- 进入"菜单管理"页面
- 选择账号查看其可见菜单
- 菜单权限通过角色进行配置

## 常见问题

### 1. 端口被占用
如果3000或3001端口被占用，可以修改：
- 后端端口：修改 `src/server/index.ts` 中的 `PORT`
- 前端端口：修改 `client/vite.config.ts` 中的 `port`

### 2. 依赖安装失败
尝试清除缓存后重新安装：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 3. 前端无法连接后端
检查：
- 后端服务是否正常启动（访问 http://localhost:3001/health）
- 前端代理配置是否正确（`client/vite.config.ts`）

## 下一步

- 阅读 `README.md` 了解详细的功能说明和API文档
- 根据实际需求修改数据库模型（`src/database/models.ts`）
- 添加更多菜单和功能权限
- 集成真实数据库

