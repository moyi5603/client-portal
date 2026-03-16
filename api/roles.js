// 角色管理API
const roles = [
  {
    id: 'ROLE-000',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    status: 'ACTIVE',
    permissions: ['*'],
    usageCount: 1,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-001',
    name: 'System Administrator',
    description: 'System management access',
    status: 'ACTIVE',
    permissions: ['system.*', 'menu.*', 'role.*', 'account.*'],
    usageCount: 2,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-002',
    name: 'Customer Administrator',
    description: 'Customer management permissions',
    status: 'ACTIVE',
    permissions: ['customer.*', 'order.view'],
    usageCount: 3,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-003',
    name: 'Customer Service Representative',
    description: 'Customer support and service',
    status: 'ACTIVE',
    permissions: ['customer.view', 'order.view', 'support.*'],
    usageCount: 5,
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ROLE-004',
    name: 'Order Manager',
    description: 'Order management permissions',
    status: 'ACTIVE',
    permissions: ['order.*', 'inventory.view'],
    usageCount: 2,
    createdAt: new Date('2024-03-01').toISOString(),
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
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};