import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../routes/auth';
import accountRoutes from '../routes/account';
import roleRoutes from '../routes/role';
import menuRoutes from '../routes/menu';
import auditRoutes from '../routes/audit';
import userPagesRoutes from '../routes/userPages-simple';
import { initTestData } from '../database/init';

dotenv.config();

// 初始化测试数据
try {
  initTestData();
} catch (error) {
  console.log('Test data initialization skipped due to errors');
}

const app = express();
const PORT = process.env.PORT || 3003;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路由
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/user-pages', userPagesRoutes);
app.use('/api/personal-menu', userPagesRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 简化的页面设计器API
app.post('/api/page-designer/chat', (req, res) => {
  res.json({
    success: true,
    data: {
      response: "页面设计器功能正在开发中，请稍后再试。",
      suggestions: ["创建订单统计页面", "创建待发货订单列表", "创建库存报表"],
      pagePreview: null
    }
  });
});

app.listen(PORT, () => {
  console.log(`简化服务器运行在 http://localhost:${PORT}`);
});

export default app;