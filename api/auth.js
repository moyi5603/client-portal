// 认证API
import mockData from './mock-data.js';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      
      // 查找用户
      const user = mockData.accounts.find(acc => acc.username === username);
      
      if (user && password === 'admin123') {
        // 获取用户角色信息
        const userRoles = user.roles.map(roleId => mockData.getRoleById(roleId)).filter(Boolean);
        
        res.status(200).json({
          success: true,
          data: {
            token: 'jwt-token-' + Date.now(),
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              accountType: user.accountType,
              tenantId: user.tenantId,
              roles: userRoles,
              customerIds: user.customerIds || [],
              facilityIds: user.facilityIds || [],
              customerFacilityMappings: user.customerFacilityMappings || []
            }
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}