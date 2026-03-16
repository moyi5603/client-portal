const express = require('express');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    platform: 'vercel'
  });
});

// 基本路由
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Client Portal API is running on Vercel!',
    version: '1.0.0'
  });
});

// API 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working on Vercel!' });
});

// 导出为 Vercel 函数
module.exports = app;