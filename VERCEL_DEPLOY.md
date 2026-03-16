# Vercel 部署说明

## 🎯 使用 static-deploy 分支

为了解决部署问题，我们创建了一个专门的 `static-deploy` 分支，只包含必要的静态文件。

### 在 Vercel 中切换分支

1. 登录 Vercel Dashboard
2. 找到 client-portal 项目
3. 点击 Settings
4. 在 Git 部分，将 Production Branch 改为 `static-deploy`
5. 点击 Save
6. 触发重新部署

### 文件结构

```
static-deploy 分支/
├── index.html              # 完整的Portal应用（单文件）
├── client-mock-data.js     # Mock数据（如果需要）
├── assets/                 # 静态资源
└── README.md              # 说明文档
```

### 应用特性

✅ **完整的Portal界面** - 登录 + 管理系统  
✅ **纯静态部署** - 无构建依赖  
✅ **单文件应用** - 所有代码在index.html中  
✅ **响应式设计** - 支持各种设备  
✅ **Mock登录** - admin/admin123  

### 功能模块

- 📊 仪表盘 - 系统概览
- 👥 账号管理 - 用户管理
- 🔐 角色管理 - 权限配置  
- 📋 菜单管理 - 菜单结构
- 📝 审计日志 - 操作记录

### 部署优势

- 🚀 **快速部署** - 无构建时间
- 💰 **零成本** - 纯静态文件
- 🔧 **易维护** - 单文件结构
- 📱 **兼容性好** - 支持所有浏览器

## 🔄 如果需要回到原分支

如果以后需要使用React版本，可以将分支改回 `stable-version`，但需要解决构建问题。

## 📞 支持

如果部署仍有问题，请检查：
1. Vercel项目设置中的分支是否为 `static-deploy`
2. 是否有任何构建命令被设置
3. 输出目录是否为空或根目录