// 账号管理API
const accounts = [
  {
    id: 'ACC-001',
    username: 'admin',
    email: 'admin@example.com',
    accountType: 'MAIN',
    status: 'ACTIVE',
    roles: ['ROLE-000'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-002',
    username: 'john.smith',
    email: 'john.smith@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-001'],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-003',
    username: 'jane.doe',
    email: 'jane.doe@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002'],
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-004',
    username: 'mike.wilson',
    email: 'mike.wilson@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-003'],
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-005',
    username: 'sarah.johnson',
    email: 'sarah.johnson@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-004'],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-006',
    username: 'david.brown',
    email: 'david.brown@example.com',
    accountType: 'SUB',
    status: 'INACTIVE',
    roles: ['ROLE-003'],
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-007',
    username: 'lisa.davis',
    email: 'lisa.davis@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002', 'ROLE-003'],
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-008',
    username: 'robert.miller',
    email: 'robert.miller@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-001'],
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        data: {
          items: accounts,
          total: accounts.length
        }
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};