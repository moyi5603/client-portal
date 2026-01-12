import express from 'express';
import conversationAgent from '../services/conversationAgent';
import pageGenerator from '../services/pageGenerator';
import apiDiscoveryService from '../services/apiDiscoveryService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @endpoint POST /api/page-designer/chat
 * @method POST
 * @description 处理用户对话消息
 * @param {string} message - 用户消息
 * @param {string} sessionId - 会话ID（可选）
 * @returns {object} 对话响应
 * @permissions user
 * @category page-designer
 */
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: '消息内容不能为空'
      });
    }

    const result = await conversationAgent.processMessage(userId, message, sessionId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      success: false,
      message: '处理对话时发生错误'
    });
  }
});

/**
 * @endpoint GET /api/page-designer/conversation/:sessionId
 * @method GET
 * @description 获取对话历史
 * @param {string} sessionId - 会话ID
 * @returns {array} 对话历史记录
 * @permissions user
 * @category page-designer
 */
router.get('/conversation/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const history = conversationAgent.getConversationHistory(userId, sessionId);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: '获取对话历史失败'
    });
  }
});

/**
 * @endpoint POST /api/page-designer/generate
 * @method POST
 * @description 生成页面代码
 * @param {object} config - 页面配置
 * @returns {object} 生成的页面代码
 * @permissions user
 * @category page-designer
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const config = req.body;
    const userId = req.user.id;

    // 验证配置
    if (!config.type || !config.entity) {
      return res.status(400).json({
        success: false,
        message: '页面类型和实体名称不能为空'
      });
    }

    // 生成页面
    const generatedPage = pageGenerator.generatePage(config);

    // 保存到数据库（这里需要实现数据库保存逻辑）
    // await saveUserPage(userId, config, generatedPage);

    res.json({
      success: true,
      data: generatedPage
    });
  } catch (error) {
    console.error('Page generation error:', error);
    res.status(500).json({
      success: false,
      message: '生成页面时发生错误'
    });
  }
});

/**
 * @endpoint GET /api/page-designer/apis
 * @method GET
 * @description 获取可用的API列表
 * @param {string} search - 搜索关键词（可选）
 * @param {string} category - API分类（可选）
 * @returns {array} API列表
 * @permissions user
 * @category page-designer
 */
router.get('/apis', authenticateToken, async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let apis = apiDiscoveryService.getAllAPIs();
    
    // 按分类筛选
    if (category) {
      apis = apis.filter(api => api.category === category);
    }
    
    // 按关键词搜索
    if (search) {
      const keywords = (search as string).split(' ');
      apis = apiDiscoveryService.searchAPIs('search', keywords);
    }

    res.json({
      success: true,
      data: apis
    });
  } catch (error) {
    console.error('Get APIs error:', error);
    res.status(500).json({
      success: false,
      message: '获取API列表失败'
    });
  }
});

/**
 * @endpoint GET /api/page-designer/templates
 * @method GET
 * @description 获取页面模板列表
 * @returns {array} 模板列表
 * @permissions user
 * @category page-designer
 */
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: 'list',
        name: '列表页面',
        description: '显示数据列表，支持搜索、筛选、分页等功能',
        preview: '/images/templates/list-preview.png',
        supportedOperations: ['list', 'search', 'filter', 'create', 'edit', 'delete']
      },
      {
        id: 'form',
        name: '表单页面',
        description: '数据录入和编辑表单',
        preview: '/images/templates/form-preview.png',
        supportedOperations: ['create', 'edit', 'validate']
      },
      {
        id: 'detail',
        name: '详情页面',
        description: '显示单条记录的详细信息',
        preview: '/images/templates/detail-preview.png',
        supportedOperations: ['view', 'edit']
      },
      {
        id: 'dashboard',
        name: '仪表板',
        description: '数据统计和图表展示',
        preview: '/images/templates/dashboard-preview.png',
        supportedOperations: ['view', 'filter', 'export']
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: '获取模板列表失败'
    });
  }
});

/**
 * @endpoint POST /api/page-designer/preview
 * @method POST
 * @description 预览生成的页面
 * @param {object} config - 页面配置
 * @returns {object} 页面预览数据
 * @permissions user
 * @category page-designer
 */
router.post('/preview', authenticateToken, async (req, res) => {
  try {
    const config = req.body;

    // 生成预览代码
    const previewData = pageGenerator.generatePage(config);

    res.json({
      success: true,
      data: {
        component: previewData.componentCode,
        style: previewData.styleCode,
        config: previewData.configCode
      }
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).json({
      success: false,
      message: '生成预览失败'
    });
  }
});

/**
 * @endpoint DELETE /api/page-designer/conversation/:sessionId
 * @method DELETE
 * @description 清除对话上下文
 * @param {string} sessionId - 会话ID
 * @returns {object} 操作结果
 * @permissions user
 * @category page-designer
 */
router.delete('/conversation/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    conversationAgent.clearContext(userId, sessionId);

    res.json({
      success: true,
      message: '对话上下文已清除'
    });
  } catch (error) {
    console.error('Clear context error:', error);
    res.status(500).json({
      success: false,
      message: '清除对话上下文失败'
    });
  }
});

export default router;