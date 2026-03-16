const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3003;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// 基本路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Client Portal Backend is running!',
    version: '1.0.0'
  });
});

// API 路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
});

module.exports = app;