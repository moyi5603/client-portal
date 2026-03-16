# 🚀 一键部署指南

## 前置条件
- GitHub 账号
- Railway 账号（使用 GitHub 登录）
- Vercel 账号（使用 GitHub 登录）

## 🔥 最简单的部署方法

### 1. 部署后端到 Railway

#### 方法 A：通过 Railway 网站（推荐）
1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择 `moyi5603/client-portal` 仓库
6. Railway 会自动检测配置并开始部署
7. 等待 2-3 分钟完成部署
8. 复制生成的 URL（类似：`https://client-portal-production-xxxx.up.railway.app`）

#### 方法 B：通过 Railway CLI
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录（会打开浏览器）
railway login

# 初始化项目
railway init

# 部署
railway up
```

### 2. 部署前端到 Vercel

#### 方法 A：通过 Vercel 网站（推荐）
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 `moyi5603/client-portal` 仓库
5. 配置设置：
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: cd client && npm run build
   Output Directory: client/dist
   Install Command: cd client && npm install
   ```
6. 添加环境变量：
   ```
   VITE_API_URL = https://your-railway-url.up.railway.app/api
   ```
7. 点击 "Deploy"

#### 方法 B：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm install -g vercel

# 在项目根目录
vercel

# 生产环境部署
vercel --prod
```

## 🎯 部署后的配置

### 1. 获取 Railway 后端 URL
部署完成后，在 Railway 控制台获取 URL，类似：
`https://client-portal-production-xxxx.up.railway.app`

### 2. 更新 Vercel 环境变量
1. 在 Vercel 项目设置中
2. 进入 "Environment Variables"
3. 更新 `VITE_API_URL` 为：`https://your-railway-url.up.railway.app/api`
4. 重新部署前端

### 3. 测试部署
- 前端 URL：`https://client-portal-xxx.vercel.app`
- 后端 URL：`https://client-portal-production-xxx.up.railway.app`
- 登录信息：`admin` / `admin123`

## 🔧 故障排除

### Railway 部署失败
- 检查构建日志
- 确保 `railway.toml` 配置正确
- 检查 Node.js 版本兼容性

### Vercel 部署失败
- 检查构建命令是否正确
- 确保环境变量设置正确
- 检查 `vercel.json` 配置

### CORS 错误
- 确保后端 CORS 配置包含前端域名
- 检查 API URL 是否正确

## 📞 需要帮助？
如果遇到问题，请检查：
1. GitHub 仓库是否公开
2. 所有配置文件是否正确提交
3. 环境变量是否设置正确