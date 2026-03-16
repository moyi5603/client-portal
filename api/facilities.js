// 设施数据API
import mockData from './mock-data.js';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { id, status } = req.query;
      
      if (id) {
        // 获取单个设施
        const facility = mockData.getFacilityById(id);
        if (facility) {
          res.status(200).json({
            success: true,
            data: facility
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Facility not found'
          });
        }
      } else {
        // 获取设施列表
        let facilities = mockData.facilities;
        
        // 状态过滤
        if (status) {
          facilities = mockData.getFacilitiesByStatus(status);
        }
        
        res.status(200).json({
          success: true,
          data: {
            items: facilities,
            total: facilities.length
          }
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