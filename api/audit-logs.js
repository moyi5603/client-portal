// 审计日志API
import mockData from './mock-data';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { startTime, endTime, actionType, targetType, page = 1, pageSize = 20 } = req.query;
      
      let logs = mockData.auditLogs;
      
      // 时间范围过滤
      if (startTime && endTime) {
        logs = mockData.getAuditLogsByTimeRange(startTime, endTime);
      }
      
      // 操作类型过滤
      if (actionType) {
        logs = logs.filter(log => log.actionType === actionType);
      }
      
      // 目标类型过滤
      if (targetType) {
        logs = logs.filter(log => log.targetType === targetType);
      }
      
      // 分页
      const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
      const endIndex = startIndex + parseInt(pageSize);
      const paginatedLogs = logs.slice(startIndex, endIndex);
      
      res.status(200).json({
        success: true,
        data: {
          items: paginatedLogs,
          total: logs.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
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
}