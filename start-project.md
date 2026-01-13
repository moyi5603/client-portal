# 项目启动指南

## 当前运行状态

✅ **后端服务器**: 运行在 http://localhost:3003
✅ **前端服务器**: 运行在 http://localhost:5173

## 访问应用

1. 打开浏览器访问: http://localhost:5173
2. 使用以下测试账号登录:
   - 用户名: `admin`
   - 密码: `admin123`

## 功能说明

### 已实现的功能
- ✅ 用户登录/登出
- ✅ 账号管理
- ✅ 角色管理  
- ✅ 菜单管理
- ✅ 权限查看
- ✅ 操作记录
- ✅ 页面设计器入口（基础界面）
- ✅ 用户页面管理入口（基础界面）

### 新增的编辑器功能
- 📝 **页面设计器**: `/page-designer` - AI对话式页面创建
- 📄 **我的页面**: `/user-pages` - 个人页面管理

### 功能特点
1. **AI对话引擎**: 通过自然语言创建页面
2. **可视化编辑**: 拖拽式组件编辑
3. **数据权限控制**: 基于角色的数据访问
4. **版本管理**: 页面版本控制和回滚
5. **个人菜单**: 发布页面自动添加到个人菜单

## 技术架构

### 前端技术栈
- React 18 + TypeScript
- Ant Design + Radix UI
- React Router
- Axios
- React DnD (拖拽功能)
- Monaco Editor (代码编辑)

### 后端技术栈  
- Node.js + Express
- TypeScript
- JWT认证
- 内存数据存储

## 开发说明

### 目录结构
```
client/                          # 前端代码
├── src/
│   ├── components/
│   │   ├── PageDesigner/        # 页面设计器组件
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── PagePreview.tsx
│   │   │   └── DragDropEditor.tsx
│   │   └── ui/                  # UI组件库
│   ├── pages/
│   │   ├── PageDesigner.tsx     # 页面设计器页面
│   │   └── UserPageManagement.tsx # 用户页面管理
│   └── utils/
src/                             # 后端代码
├── services/                    # 业务服务层
│   ├── conversationAgent.ts    # AI对话引擎
│   ├── pageGenerator.ts        # 页面生成器
│   ├── dataPermissionService.ts # 数据权限服务
│   ├── dataCalculationEngine.ts # 数据计算引擎
│   └── userPageService.ts      # 用户页面服务
├── routes/                      # API路由
└── types/                       # 类型定义
```

### 核心服务说明

1. **ConversationAgent**: AI对话引擎，负责理解用户需求并生成页面配置
2. **PageGenerator**: 页面生成器，基于模板生成React组件代码
3. **DataPermissionService**: 数据权限管理，控制用户数据访问权限
4. **DataCalculationEngine**: 数据计算引擎，提供统计和分析功能
5. **UserPageService**: 用户页面管理，处理页面CRUD和版本控制

## 下一步开发计划

### 短期目标 (1-2周)
- [ ] 完善AI对话逻辑
- [ ] 实现基础组件库
- [ ] 添加数据库持久化
- [ ] 完善权限验证

### 中期目标 (1-2月)  
- [ ] 增强可视化编辑器
- [ ] 实现更多页面模板
- [ ] 添加数据源集成
- [ ] 优化用户体验

### 长期目标 (3-6月)
- [ ] 支持多人协作
- [ ] 建立模板市场
- [ ] 高级数据分析
- [ ] 企业级集成

## 故障排除

### 常见问题
1. **端口冲突**: 如果3003端口被占用，修改 `src/server/simple-server.ts` 中的PORT
2. **前端连接失败**: 检查 `client/src/utils/api.ts` 中的baseURL配置
3. **依赖问题**: 运行 `npm install` 安装缺失依赖

### 重启服务
如果遇到问题，可以重启服务：
```bash
# 停止所有进程，然后重新启动
npm run dev:server  # 后端
cd client && npm run dev  # 前端
```

## 联系信息
如有问题，请查看项目文档或联系开发团队。