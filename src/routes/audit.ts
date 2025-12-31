import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse, ActionType, TargetType } from '../types';

const router = express.Router();

router.use(authenticate);

// 获取审计日志列表
router.get('/', async (req: AuthRequest, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      startDate,
      endDate,
      actionType,
      targetType,
      targetId,
      actorId
    } = req.query;

    const filters: any = {
      tenantId: req.user!.tenantId
    };

    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;
    if (actionType) filters.actionType = actionType as ActionType;
    if (targetType) filters.targetType = targetType as TargetType;
    if (targetId) filters.targetId = targetId as string;
    if (actorId) filters.actorId = actorId as string;

    const allLogs = auditService.query(filters);

    // 分页
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const start = (pageNum - 1) * pageSizeNum;
    const end = start + pageSizeNum;
    const paginatedLogs = allLogs.slice(start, end);

    res.json({
      success: true,
      data: {
        items: paginatedLogs,
        total: allLogs.length,
        page: pageNum,
        pageSize: pageSizeNum
      }
    } as ApiResponse<PaginatedResponse<any>>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取审计日志失败'
    } as ApiResponse);
  }
});

// 导出审计日志
router.get('/export', async (req: AuthRequest, res) => {
  try {
    const {
      startDate,
      endDate,
      actionType,
      targetType,
      targetId,
      actorId
    } = req.query;

    const filters: any = {
      tenantId: req.user!.tenantId
    };

    if (startDate) filters.startDate = startDate as string;
    if (endDate) filters.endDate = endDate as string;
    if (actionType) filters.actionType = actionType as ActionType;
    if (targetType) filters.targetType = targetType as TargetType;
    if (targetId) filters.targetId = targetId as string;
    if (actorId) filters.actorId = actorId as string;

    const logs = auditService.query(filters);

    // 转换为CSV格式
    const csvHeaders = ['时间戳', '操作者', '操作类型', '目标类型', '目标ID', '变更摘要'];
    const csvRows = logs.map(log => [
      log.timestamp,
      log.actor.username,
      log.actionType,
      log.targetType,
      log.targetId,
      log.changes ? `${log.changes.length}项变更` : '无变更'
    ]);

    const csv = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
    res.send('\ufeff' + csv); // BOM for Excel
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '导出审计日志失败'
    } as ApiResponse);
  }
});

export default router;

