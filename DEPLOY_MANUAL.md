# 🚀 手动部署指南（推荐）

由于 CLI 工具需要浏览器认证，推荐使用网页界面部署，更简单可靠。

## 📋 部署清单

- [ ] 部署后端到 Railway
- [ ] 获取后端 URL
- [ ] 部署前端到 Vercel
- [ ] 配置环境变量
- [ ] 测试应用

## 🚂 步骤 1：部署后端到 Railway

### 1.1 访问 Railway
- 打开：https://railway.app
- 使用 GitHub 账号登录

### 1.2 创建项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择 `moyi5603/client-portal` 仓库
- 点击 "Deploy Now"

### 1.3 等待部署
- Railway 自动检测配置文件
- 大约 2-3 分钟完成
- 记录生成的 URL：`https://client-portal-production-xxxx.up.railway.app`

## ⚡ 步骤 2：部署前端到 Vercel

### 2.1 访问 Vercel
- 打开：https://vercel.com
- 使用 GitHub 账号登录

### 2.2 导入项目
- 点击 "New Project"
- 选择 `moyi5603/client-portal` 仓库
- 点击 "Import"

### 2.3 配置构建设置
```
Framework Preset: Other
Root Directory: ./
Build Command: cd client && npm run build
Output Directory: client/dist
Install Command: cd client && npm install
```

### 2.4 添加环境变量
```
Name: VITE_API_URL
Value: https://your-railway-url.up.railway.app/api
```
**重要**：用步骤 1.3 中的实际 Railway URL 替换

### 2.5 部署
- 点击 "Deploy"
- 等待 2-3 分钟完成

## 🎯 步骤 3：测试部署

### 3.1 访问应用
- 前端 URL：Vercel 提供的 URL
- 后端 URL：Railway 提供的 URL

### 3.2 测试登录
```
用户名: admin
密码: admin123
```

### 3.3 测试功能
- [ ] 菜单管理
- [ ] 角色管理
- [ ] 账号管理
- [ ] 权限查看
- [ ] 审计日志

## 🔧 故障排除

### 前端无法连接后端
1. 检查 Vercel 环境变量 `VITE_API_URL` 是否正确
2. 确保 Railway URL 以 `/api` 结尾
3. 重新部署前端

### Railway 部署失败
1. 检查构建日志
2. 确保 `railway.toml` 配置正确
3. 检查依赖是否完整

### CORS 错误
1. 确保后端 CORS 配置包含前端域名
2. 检查环境变量设置

## 📞 需要帮助？

如果遇到问题：
1. 检查部署日志中的错误信息
2. 确认所有 URL 和环境变量正确
3. 测试后端健康检查：`https://your-railway-url/health`

## 🎉 部署完成！

成功部署后，你将拥有：
- 🚂 Railway 后端：自动扩展，零配置
- ⚡ Vercel 前端：全球 CDN，极速访问
- 🔐 完整权限系统：菜单、角色、账号管理