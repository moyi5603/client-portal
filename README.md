# Client Portal Permission System

一个现代化的客户门户权限管理系统，支持菜单管理、角色管理和账号管理。

## 🚀 超简单一键部署

### 方法 1：运行部署脚本（推荐）

**Windows 用户：**
```bash
# 双击运行或在命令行执行
deploy.bat
```

**Mac/Linux 用户：**
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法 2：手动一键部署

1. **部署后端**：点击 [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/nodejs?referralCode=bonus)

2. **部署前端**：点击 [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/moyi5603/client-portal)

### 方法 3：命令行部署

```bash
# 1. 安装工具
npm install -g @railway/cli vercel

# 2. 部署后端
railway login
railway init
railway up

# 3. 部署前端  
cd client
vercel login
vercel --prod
```

## 🏗️ 项目结构

```
client-portal/
├── client/                 # 前端 React 应用
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── src/                    # 后端 Node.js 应用
│   ├── server/
│   ├── routes/
│   └── database/
├── railway.toml           # Railway 部署配置
├── vercel.json           # Vercel 部署配置
└── package.json          # 后端依赖
```

## 🔧 本地开发

### 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client && npm install
```

### 启动开发服务器
```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:server  # 后端: http://localhost:3003
npm run dev:client  # 前端: http://localhost:5173
```

## 🌟 功能特性

- ✅ **菜单管理**：层级菜单结构，支持中英文翻译
- ✅ **角色管理**：细粒度权限控制，支持 button-1 和 button-2 操作
- ✅ **账号管理**：用户账号管理（已移除密码重置功能）
- ✅ **权限查看**：权限矩阵展示
- ✅ **审计日志**：操作记录追踪
- ✅ **响应式设计**：支持各种设备尺寸

## 🔐 默认登录信息

```
用户名: admin
密码: admin123
```

## 📚 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式
- Radix UI 组件库
- React Router 路由
- Axios HTTP 客户端

### 后端
- Node.js + Express
- TypeScript
- 内存数据库（开发环境）
- JWT 身份验证
- CORS 跨域支持

## 🚀 部署指南

详细部署说明请查看 [deploy.md](./deploy.md)

### 环境变量

#### 前端 (Vercel)
```
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

#### 后端 (Railway)
```
NODE_ENV=production
PORT=3003
```

## 📝 开发说明

### 添加新功能
1. 后端：在 `src/routes/` 添加新路由
2. 前端：在 `client/src/pages/` 添加新页面
3. 更新路由配置：`client/src/App.tsx`

### 数据库
当前使用内存数据库，生产环境建议使用：
- PostgreSQL
- MySQL
- MongoDB

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License