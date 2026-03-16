// 客户数据API
import mockData from './mock-data';

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
      const { id } = req.query;
      
      if (id) {
        // 获取单个客户
        const customer = mockData.getCustomerById(id);
        if (customer) {
          res.status(200).json({
            success: true,
            data: customer
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Customer not found'
          });
        }
      } else {
        // 获取所有客户
        res.status(200).json({
          success: true,
          data: {
            items: mockData.customers,
            total: mockData.getCustomersCount()
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