// 账号管理API
const accounts = [
  {
    id: 'ACC-001',
    username: 'admin',
    email: 'admin@example.com',
    accountType: 'MAIN',
    status: 'ACTIVE',
    roles: ['ROLE-001'],
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-002',
    username: 'john.smith',
    email: 'john.smith@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002'],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-003',
    username: 'mary.johnson',
    email: 'mary.johnson@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-003'],
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-004',
    username: 'david.wilson',
    email: 'david.wilson@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-004'],
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-005',
    username: 'sarah.brown',
    email: 'sarah.brown@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-005'],
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-006',
    username: 'mike.davis',
    email: 'mike.davis@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-006'],
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-007',
    username: 'lisa.garcia',
    email: 'lisa.garcia@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-003', 'ROLE-006'],
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-008',
    username: 'tom.martinez',
    email: 'tom.martinez@example.com',
    accountType: 'SUB',
    status: 'INACTIVE',
    roles: ['ROLE-006'],
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-009',
    username: 'anna.rodriguez',
    email: 'anna.rodriguez@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-004', 'ROLE-006'],
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ACC-010',
    username: 'james.lee',
    email: 'james.lee@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002', 'ROLE-006'],
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: {
        items: accounts,
        total: accounts.length
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}