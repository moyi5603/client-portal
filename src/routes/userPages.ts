import express from 'express';
import { authenticate } from '../middleware/auth';
import userPageService from '../services/userPageService';

const router = express.Router();

// 使用authenticate作为authenticateToken的别名
const authenticateToken = authenticate;

// 简单的审计日志中间件（占位符）
const auditLog = (req: any, res: any, next: any) => {
  next();
};

// 辅助函数：从请求中获取用户ID
const getUserId = (req: any): string | null => {
  return req.user?.accountId || req.user?.userId || req.user?.id || null;
};

/**
 * @endpoint POST /api/user-pages
 * @method POST
 * @description 创建用户页面
 * @param {string} name - 页面名称
 * @param {string} description - 页面描述（可选）
 * @param {string} pageType - 页面类型
 * @param {object} config - 页面配置
 * @param {string} componentCode - 组件代码
 * @param {string} styleCode - 样式代码
 * @param {string} configCode - 配置代码
 * @param {array} apiCalls - API调用列表
 * @param {array} dependencies - 依赖列表
 * @returns {object} 创建的页面信息
 * @permissions user
 * @category user-pages
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const pageData = req.body;

    // 验证必要字段
    if (!pageData.name || !pageData.pageType) {
      return res.status(400).json({
        success: false,
        message: '页面名称和类型不能为空'
      });
    }

    const userPage = await userPageService.createUserPage(userId, pageData);

    res.json({
      success: true,
      data: userPage,
      message: '页面创建成功'
    });
  } catch (error) {
    console.error('Create user page error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '创建页面失败'
    });
  }
});

/**
 * @endpoint GET /api/user-pages
 * @method GET
 * @description 获取用户页面列表
 * @param {number} page - 页码（可选）
 * @param {number} pageSize - 每页大小（可选）
 * @param {string} status - 状态筛选（可选）
 * @param {string} pageType - 类型筛选（可选）
 * @returns {object} 页面列表
 * @permissions user
 * @category user-pages
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }
    
    const { page, pageSize, status, pageType } = req.query;

    const options: any = {};
    if (page) options.page = parseInt(page as string);
    if (pageSize) options.pageSize = parseInt(pageSize as string);
    if (status && status !== 'all') options.status = status as string;
    if (pageType && pageType !== 'all') options.pageType = pageType as string;

    const pages = userPageService.getUserPages(userId, options);

    res.json({
      success: true,
      data: {
        items: pages,
        total: pages.length
      }
    });
  } catch (error) {
    console.error('Get user pages error:', error);
    res.status(500).json({
      success: false,
      message: '获取页面列表失败'
    });
  }
});

/**
 * @endpoint GET /api/user-pages/statistics
 * @method GET
 * @description 获取用户页面统计信息
 * @returns {object} 统计信息
 * @permissions user
 * @category user-pages
 */
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const statistics = userPageService.getPageStatistics(userId);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get page statistics error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
});

/**
 * @endpoint GET /api/user-pages/:id
 * @method GET
 * @description 获取页面详情
 * @param {string} id - 页面ID
 * @returns {object} 页面详情
 * @permissions user
 * @category user-pages
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const page = userPageService.getPageById(id, userId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      });
    }

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Get page detail error:', error);
    res.status(500).json({
      success: false,
      message: '获取页面详情失败'
    });
  }
});

/**
 * @endpoint PUT /api/user-pages/:id
 * @method PUT
 * @description 更新页面
 * @param {string} id - 页面ID
 * @param {object} updates - 更新数据
 * @returns {object} 更新后的页面信息
 * @permissions user
 * @category user-pages
 */
router.put('/:id', authenticateToken, auditLog, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const updatedPage = await userPageService.updateUserPage(
      id, 
      userId, 
      updates, 
      updates.changeDescription
    );

    res.json({
      success: true,
      data: updatedPage,
      message: '页面更新成功'
    });
  } catch (error) {
    console.error('Update user page error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新页面失败'
    });
  }
});

/**
 * @endpoint DELETE /api/user-pages/:id
 * @method DELETE
 * @description 删除页面
 * @param {string} id - 页面ID
 * @returns {object} 操作结果
 * @permissions user
 * @category user-pages
 */
router.delete('/:id', authenticateToken, auditLog, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await userPageService.deletePage(id, userId);

    res.json({
      success: true,
      message: '页面删除成功'
    });
  } catch (error) {
    console.error('Delete user page error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '删除页面失败'
    });
  }
});

/**
 * @endpoint POST /api/user-pages/:id/publish
 * @method POST
 * @description 发布页面
 * @param {string} id - 页面ID
 * @returns {object} 发布后的页面信息
 * @permissions user
 * @category user-pages
 */
router.post('/:id/publish', authenticateToken, auditLog, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const publishedPage = await userPageService.publishPage(id, userId);

    res.json({
      success: true,
      data: publishedPage,
      message: '页面发布成功'
    });
  } catch (error) {
    console.error('Publish page error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '发布页面失败'
    });
  }
});

/**
 * @endpoint POST /api/user-pages/:id/unpublish
 * @method POST
 * @description 取消发布页面
 * @param {string} id - 页面ID
 * @returns {object} 取消发布后的页面信息
 * @permissions user
 * @category user-pages
 */
router.post('/:id/unpublish', authenticateToken, auditLog, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const unpublishedPage = await userPageService.unpublishPage(id, userId);

    res.json({
      success: true,
      data: unpublishedPage,
      message: '已取消发布'
    });
  } catch (error) {
    console.error('Unpublish page error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '取消发布失败'
    });
  }
});

/**
 * @endpoint GET /api/user-pages/:id/versions
 * @method GET
 * @description 获取页面版本历史
 * @param {string} id - 页面ID
 * @returns {array} 版本历史列表
 * @permissions user
 * @category user-pages
 */
router.get('/:id/versions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const versions = userPageService.getVersionHistory(id, userId);

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error('Get version history error:', error);
    res.status(500).json({
      success: false,
      message: '获取版本历史失败'
    });
  }
});

/**
 * @endpoint POST /api/user-pages/:id/rollback/:versionId
 * @method POST
 * @description 回滚到指定版本
 * @param {string} id - 页面ID
 * @param {string} versionId - 版本ID
 * @returns {object} 回滚后的页面信息
 * @permissions user
 * @category user-pages
 */
router.post('/:id/rollback/:versionId', authenticateToken, auditLog, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, versionId } = req.params;

    const rolledBackPage = await userPageService.rollbackToVersion(id, versionId, userId);

    res.json({
      success: true,
      data: rolledBackPage,
      message: '版本回滚成功'
    });
  } catch (error) {
    console.error('Rollback version error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '版本回滚失败'
    });
  }
});

/**
 * @endpoint GET /api/personal-menu
 * @method GET
 * @description 获取个人菜单
 * @returns {array} 个人菜单列表
 * @permissions user
 * @category personal-menu
 */
router.get('/personal-menu', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const menuItems = userPageService.getPersonalMenu(userId);

    res.json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('Get personal menu error:', error);
    res.status(500).json({
      success: false,
      message: '获取个人菜单失败'
    });
  }
});

/**
 * @endpoint POST /api/personal-menu
 * @method POST
 * @description 添加到个人菜单
 * @param {string} pageId - 页面ID
 * @param {string} menuName - 菜单名称
 * @param {string} menuIcon - 菜单图标（可选）
 * @param {number} menuOrder - 菜单排序（可选）
 * @returns {object} 菜单项信息
 * @permissions user
 * @category personal-menu
 */
router.post('/personal-menu', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { pageId, menuName, menuIcon, menuOrder } = req.body;

    if (!pageId || !menuName) {
      return res.status(400).json({
        success: false,
        message: '页面ID和菜单名称不能为空'
      });
    }

    const menuItem = await userPageService.addToPersonalMenu(userId, pageId, {
      menuName,
      menuIcon,
      menuOrder
    });

    res.json({
      success: true,
      data: menuItem,
      message: '添加到个人菜单成功'
    });
  } catch (error) {
    console.error('Add to personal menu error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '添加到个人菜单失败'
    });
  }
});

/**
 * @endpoint PUT /api/personal-menu/:pageId
 * @method PUT
 * @description 更新菜单项
 * @param {string} pageId - 页面ID
 * @param {object} updates - 更新数据
 * @returns {object} 更新后的菜单项信息
 * @permissions user
 * @category personal-menu
 */
router.put('/personal-menu/:pageId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { pageId } = req.params;
    const updates = req.body;

    const updatedMenuItem = await userPageService.updateMenuItem(userId, pageId, updates);

    res.json({
      success: true,
      data: updatedMenuItem,
      message: '菜单项更新成功'
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '菜单项更新失败'
    });
  }
});

/**
 * @endpoint DELETE /api/personal-menu/:pageId
 * @method DELETE
 * @description 从个人菜单移除
 * @param {string} pageId - 页面ID
 * @returns {object} 操作结果
 * @permissions user
 * @category personal-menu
 */
router.delete('/personal-menu/:pageId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { pageId } = req.params;

    await userPageService.removeFromPersonalMenu(userId, pageId);

    res.json({
      success: true,
      message: '从个人菜单移除成功'
    });
  } catch (error) {
    console.error('Remove from personal menu error:', error);
    res.status(500).json({
      success: false,
      message: '从个人菜单移除失败'
    });
  }
});

/**
 * @endpoint PUT /api/personal-menu/reorder
 * @method PUT
 * @description 菜单排序
 * @param {array} menuOrder - 页面ID排序数组
 * @returns {object} 操作结果
 * @permissions user
 * @category personal-menu
 */
router.put('/personal-menu/reorder', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { menuOrder } = req.body;

    if (!Array.isArray(menuOrder)) {
      return res.status(400).json({
        success: false,
        message: '菜单排序数据格式错误'
      });
    }

    await userPageService.reorderMenuItems(userId, menuOrder);

    res.json({
      success: true,
      message: '菜单排序更新成功'
    });
  } catch (error) {
    console.error('Reorder menu items error:', error);
    res.status(500).json({
      success: false,
      message: '菜单排序更新失败'
    });
  }
});

/**
 * @endpoint GET /api/user-pages/:id/preview
 * @method GET
 * @description 预览页面
 * @param {string} id - 页面ID
 * @returns {object} 页面预览数据
 * @permissions user
 * @category user-pages
 */
router.get('/:id/preview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const page = userPageService.getPageById(id, userId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: '页面不存在'
      });
    }

    // 生成预览HTML
    const previewHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.name} - 预览</title>
    <link rel="stylesheet" href="https://unpkg.com/antd@4.24.0/dist/antd.min.css">
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f0f2f5;
        }
        ${page.styleCode}
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/antd@4.24.0/dist/antd.min.js"></script>
    
    <script type="text/babel">
        ${page.componentCode}
        
        ReactDOM.render(React.createElement(GeneratedPage), document.getElementById('root'));
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(previewHTML);
  } catch (error) {
    console.error('Preview page error:', error);
    res.status(500).json({
      success: false,
      message: '页面预览失败'
    });
  }
});

export default router;