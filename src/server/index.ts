import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountRoutes from '../routes/account';
import roleRoutes from '../routes/role';
import menuRoutes from '../routes/menu';
import permissionRoutes from '../routes/permission';
import authRoutes from '../routes/auth';
import auditRoutes from '../routes/audit';
import permissionMatrixRoutes from '../routes/permission-matrix';
import idpMappingRoutes from '../routes/idp-mapping';
import { initTestData } from '../database/init';

dotenv.config();

// 初始化测试数据
initTestData();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/permission-matrix', permissionMatrixRoutes);
app.use('/api/idp-mappings', idpMappingRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;

