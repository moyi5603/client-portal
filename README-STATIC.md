# Client Portal - 静态部署版本

这是一个纯静态的Client Portal应用，专为Vercel部署优化。

## 🚀 特性

- ✅ 纯HTML/CSS/JavaScript - 无构建依赖
- ✅ 完整的Portal界面 - 登录 + 管理系统
- ✅ 响应式设计 - 支持各种设备
- ✅ 零配置部署 - 直接上传到任何静态托管

## 📁 文件结构

```
├── index.html          # 完整的Portal应用
├── README.md          # 说明文档
└── .gitignore         # Git忽略文件
```

## 🔑 登录信息

- 用户名: `admin`
- 密码: `admin123`

## 🎯 功能模块

- 📊 仪表盘 - 系统概览
- 👥 账号管理 - 用户管理
- 🔐 角色管理 - 权限配置
- 📋 菜单管理 - 菜单结构
- 📝 审计日志 - 操作记录

## 🌐 部署说明

### Vercel部署
1. 将代码推送到GitHub
2. 在Vercel中连接仓库
3. 确保没有设置构建命令
4. 部署完成

### 其他静态托管
- Netlify
- GitHub Pages
- Surge.sh
- Firebase Hosting

## 💡 技术说明

这个版本将所有代码打包在单个HTML文件中，包括：
- CSS样式
- JavaScript逻辑
- 完整的UI组件
- 模拟数据和API

无需任何外部依赖或构建过程，可以直接在浏览器中运行。