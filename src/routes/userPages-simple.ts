import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// 简化的用户页面管理路由，用于测试
router.get('/', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        items: [],
        total: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取页面列表失败'
    });
  }
});

router.get('/statistics', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalPages: 0,
        publishedPages: 0,
        draftPages: 0,
        pagesByType: {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
});

export default router;