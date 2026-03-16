// 账号管理 API
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
  },
  {
    id: 'ACC-002',
    username: 'john.smith',
    email: 'john@example.com',
    accountType: 'SUB',
    status: 'ACTIVE',
    roles: ['ROLE-002'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: {
        items: mockAccounts,
        total: mockAccounts.length
      }
    });
  } else if (req.method === 'POST') {
    const newAccount = {
      id: `ACC-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockAccounts.push(newAccount);
    res.status(201).json({
      success: true,
      data: newAccount
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}