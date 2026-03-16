# Render 部署指南

Render 是 Railway 的优秀替代品，同样免费且易用。

## 部署后端到 Render

1. **访问 Render**
   - 打开：https://render.com
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New +"
   - 选择 "Web Service"
   - 连接 GitHub 仓库：`moyi5603/client-portal`

3. **配置设置**
   ```
   Name: client-portal-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm run start:server
   ```

4. **添加环境变量**
   ```
   NODE_ENV=production
   PORT=10000
   ```

5. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成
   - 获取 URL：`https://client-portal-backend.onrender.com`

## 优势
- ✅ 免费额度充足
- ✅ 自动 HTTPS
- ✅ 支持自定义域名
- ✅ 自动部署
- ✅ 详细日志