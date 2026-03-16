// 菜单管理API
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

  try {
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        data: mockData.menus
      });
    } else if (req.method === 'POST') {
      // 创建新菜单
      const newMenu = req.body;
      const id = `MENU-${String(mockData.getMenusCount() + 1).padStart(3, '0')}`;
      const menu = { 
        ...newMenu, 
        id,
        children: []
      };
      mockData.menus.push(menu);
      
      res.status(201).json({
        success: true,
        data: menu
      });
    } else if (req.method === 'PUT') {
      // 更新菜单
      const { id, ...updates } = req.body;
      const menuIndex = mockData.menus.findIndex(menu => menu.id === id);
      if (menuIndex !== -1) {
        mockData.menus[menuIndex] = {
          ...mockData.menus[menuIndex],
          ...updates
        };
        res.status(200).json({
          success: true,
          data: mockData.menus[menuIndex]
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Menu not found'
        });
      }
    } else if (req.method === 'DELETE') {
      // 删除菜单
      const { id } = req.query;
      const menuIndex = mockData.menus.findIndex(menu => menu.id === id);
      if (menuIndex !== -1) {
        mockData.menus.splice(menuIndex, 1);
        res.status(200).json({
          success: true,
          message: 'Menu deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Menu not found'
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