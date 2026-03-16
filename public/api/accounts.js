// 账号管理API
const mockData = require('./mock-data');

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
          items: mockData.accounts,
          total: mockData.getAccountsCount()
        }
      });
    } else if (req.method === 'POST') {
      // 创建新账号
      const newAccount = req.body;
      const id = `ACC-${String(mockData.getAccountsCount() + 1).padStart(3, '0')}`;
      const account = { 
        ...newAccount, 
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.accounts.push(account);
      
      res.status(201).json({
        success: true,
        data: account
      });
    } else if (req.method === 'PUT') {
      // 更新账号
      const { id, ...updates } = req.body;
      const accountIndex = mockData.accounts.findIndex(acc => acc.id === id);
      if (accountIndex !== -1) {
        mockData.accounts[accountIndex] = {
          ...mockData.accounts[accountIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        res.status(200).json({
          success: true,
          data: mockData.accounts[accountIndex]
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }
    } else if (req.method === 'DELETE') {
      // 删除账号
      const { id } = req.query;
      const accountIndex = mockData.accounts.findIndex(acc => acc.id === id);
      if (accountIndex !== -1) {
        mockData.accounts.splice(accountIndex, 1);
        res.status(200).json({
          success: true,
          message: 'Account deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }
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