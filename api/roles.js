// 角色管理API
const roles = [
  {
    id: 'ROLE-001',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    status: 'ACTIVE',
    permissions: ['*'],
    usageCount: 1,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-002',
    name: 'System Administrator',
    description: 'System management access',
    status: 'ACTIVE',
    permissions: ['system.*', 'menu.*', 'role.*', 'account.*'],
    usageCount: 2,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-003',
    name: 'Purchase Manager',
    description: 'Purchase management permissions',
    status: 'ACTIVE',
    permissions: ['purchase.*', 'supplier.*'],
    usageCount: 5,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-004',
    name: 'Order Manager',
    description: 'Order management permissions',
    status: 'ACTIVE',
    permissions: ['order.*', 'order.view', 'order.create', 'order.edit'],
    usageCount: 8,
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-005',
    name: 'Transport Manager',
    description: 'Transportation management permissions',
    status: 'ACTIVE',
    permissions: ['transport.*', 'vehicle.*'],
    usageCount: 3,
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-006',
    name: 'Viewer',
    description: 'Read-only access to most modules',
    status: 'ACTIVE',
    permissions: ['*.view'],
    usageCount: 12,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-007',
    name: 'Disabled Role',
    description: 'This role is currently disabled',
    status: 'INACTIVE',
    permissions: [],
    usageCount: 0,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = (req, res) => {
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
          items: roles,
          total: roles.length
        }
      });
    } else {
      res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};