// 角色管理API
import mockData from './mock-data';

export default async function handler(req, res) {
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
          items: mockData.roles,
          total: mockData.getRolesCount()
        }
      });
    } else if (req.method === 'POST') {
      // 创建新角色
      const newRole = req.body;
      const id = `ROLE-${String(mockData.getRolesCount() + 1).padStart(3, '0')}`;
      const role = { 
        ...newRole, 
        id,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.roles.push(role);
      
      res.status(201).json({
        success: true,
        data: role
      });
    } else if (req.method === 'PUT') {
      // 更新角色
      const { id, ...updates } = req.body;
      const roleIndex = mockData.roles.findIndex(role => role.id === id);
      if (roleIndex !== -1) {
        mockData.roles[roleIndex] = {
          ...mockData.roles[roleIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        res.status(200).json({
          success: true,
          data: mockData.roles[roleIndex]
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Role not found'
        });
      }
    } else if (req.method === 'DELETE') {
      // 删除角色
      const { id } = req.query;
      const roleIndex = mockData.roles.findIndex(role => role.id === id);
      if (roleIndex !== -1) {
        mockData.roles.splice(roleIndex, 1);
        res.status(200).json({
          success: true,
          message: 'Role deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Role not found'
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
}