// 角色管理 API
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
  },
  {
    id: 'ROLE-002',
    name: 'System Administrator',
    description: 'System management access',
    status: 'ACTIVE',
    permissions: [],
    usageCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: {
        items: mockRoles,
        total: mockRoles.length
      }
    });
  } else if (req.method === 'POST') {
    const newRole = {
      id: `ROLE-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };
    mockRoles.push(newRole);
    res.status(201).json({
      success: true,
      data: newRole
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}