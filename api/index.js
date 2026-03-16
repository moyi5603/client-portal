// 主 API 入口
const express = require('express');
const cors = require('cors');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    platform: 'vercel'
  });
});

// 基本路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Client Portal API is running on Vercel!',
    version: '1.0.0'
  });
});

// 认证路由
app.post('/auth', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          username: 'admin',
          accountType: 'MAIN'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

// 菜单路由
app.get('/menus', (req, res) => {
  const mockMenus = [
    {
      id: '1',
      name: '工作台',
      code: 'dashboard',
      path: '/dashboard',
      order: 1,
      type: 'MENU',
      status: 'NORMAL',
      parentId: null,
      children: []
    },
    {
      id: '2',
      name: '系统管理',
      code: 'system',
      path: '/system',
      order: 2,
      type: 'DIRECTORY',
      status: 'NORMAL',
      parentId: null,
      children: [
        {
          id: '3',
          name: '菜单管理',
          code: 'menu-management',
          path: '/system/menus',
          order: 1,
          type: 'MENU',
          status: 'NORMAL',
          parentId: '2'
        }
      ]
    }
  ];
  
  res.json({
    success: true,
    data: mockMenus
  });
});

// 角色路由
app.get('/roles', (req, res) => {
  const mockRoles = [
    {
      id: 'ROLE-001',
      name: 'Super Administrator',
      description: 'Full system access',
      status: 'ACTIVE',
      permissions: [],
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: {
      items: mockRoles,
      total: mockRoles.length
    }
  });
});

// 账号路由
app.get('/accounts', (req, res) => {
  const mockAccounts = [
    {
      id: 'ACC-001',
      username: 'admin',
      email: 'admin@example.com',
      accountType: 'MAIN',
      status: 'ACTIVE',
      roles: ['ROLE-001'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: {
      items: mockAccounts,
      total: mockAccounts.length
    }
  });
});

// 导出为 Vercel 函数
module.exports = app;