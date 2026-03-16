// 用户页面API
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
      const { userId, status, pageType } = req.query;
      
      let pages = mockData.userPages;
      
      // 用户过滤
      if (userId) {
        pages = mockData.getUserPagesByUserId(userId);
      }
      
      // 状态过滤
      if (status) {
        pages = pages.filter(page => page.status === status);
      }
      
      // 页面类型过滤
      if (pageType) {
        pages = pages.filter(page => page.pageType === pageType);
      }
      
      res.status(200).json({
        success: true,
        data: {
          items: pages,
          total: pages.length
        }
      });
    } else if (req.method === 'POST') {
      // 创建新用户页面
      const newPage = req.body;
      const id = `PAGE-${String(mockData.getUserPagesCount() + 1).padStart(3, '0')}`;
      const page = { 
        ...newPage, 
        id,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.userPages.push(page);
      
      res.status(201).json({
        success: true,
        data: page
      });
    } else if (req.method === 'PUT') {
      // 更新用户页面
      const { id, ...updates } = req.body;
      const pageIndex = mockData.userPages.findIndex(page => page.id === id);
      if (pageIndex !== -1) {
        mockData.userPages[pageIndex] = {
          ...mockData.userPages[pageIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // 如果是发布操作，设置发布时间
        if (updates.status === 'PUBLISHED') {
          mockData.userPages[pageIndex].publishedAt = new Date().toISOString();
        }
        
        res.status(200).json({
          success: true,
          data: mockData.userPages[pageIndex]
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Page not found'
        });
      }
    } else if (req.method === 'DELETE') {
      // 删除用户页面
      const { id } = req.query;
      const pageIndex = mockData.userPages.findIndex(page => page.id === id);
      if (pageIndex !== -1) {
        mockData.userPages.splice(pageIndex, 1);
        res.status(200).json({
          success: true,
          message: 'Page deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Page not found'
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