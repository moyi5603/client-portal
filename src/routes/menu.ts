import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../database/models';
import { ApiResponse, Menu } from '../types';

const router = express.Router();

router.use(authenticate);

// 获取所有菜单（树形结构）
router.get('/', async (req: AuthRequest, res) => {
  try {
    const menus = db.getAllMenus();
    
    // 构建树形结构
    const menuMap = new Map<string, Menu>();
    const rootMenus: Menu[] = [];

    // 第一遍：创建所有菜单的映射
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 第二遍：构建树形结构
    menus.forEach(menu => {
      const menuNode = menuMap.get(menu.id)!;
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(menuNode);
      } else {
        rootMenus.push(menuNode);
      }
    });

    res.json({
      success: true,
      data: rootMenus
    } as ApiResponse<Menu[]>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取菜单列表失败'
    } as ApiResponse);
  }
});

// 获取账号可见菜单
router.get('/account/:accountId', async (req: AuthRequest, res) => {
  try {
    const { accountId } = req.params;
    const account = db.getAccount(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: '账号不存在'
      } as ApiResponse);
    }

    // 检查权限（主账号可以查看所有账号，其他账号只能查看自己）
    if (req.user!.accountType !== 'MAIN' && req.user!.accountId !== accountId) {
      return res.status(403).json({
        success: false,
        error: '无权查看该账号的菜单'
      } as ApiResponse);
    }

    // 获取账号的所有角色
    const roles = account.roles.map(roleId => db.getRole(roleId)).filter(Boolean) as any[];

    // 收集所有菜单权限
    const menuPermissionSet = new Set<string>();
    roles.forEach(role => {
      role.menuPermissions.forEach((menuId: string) => menuPermissionSet.add(menuId));
    });

    // 获取所有菜单并过滤
    const allMenus = db.getAllMenus();
    const visibleMenus = allMenus.filter(menu => menuPermissionSet.has(menu.id));

    res.json({
      success: true,
      data: visibleMenus
    } as ApiResponse<Menu[]>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取账号菜单失败'
    } as ApiResponse);
  }
});

// 为账号分配菜单（通过角色）
router.post('/account/:accountId/assign', async (req: AuthRequest, res) => {
  try {
    // 菜单权限通过角色管理，这里提供接口用于批量分配角色
    const { accountId } = req.params;
    const { roleIds } = req.body;

    const account = db.getAccount(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: '账号不存在'
      } as ApiResponse);
    }

    // 只有主账号可以分配
    if (req.user!.accountType !== 'MAIN') {
      return res.status(403).json({
        success: false,
        error: '无权分配菜单权限'
      } as ApiResponse);
    }

    // 更新账号的角色
    db.updateAccount(accountId, { roles: roleIds || [] });

    const updatedAccount = db.getAccount(accountId);
    res.json({
      success: true,
      data: updatedAccount,
      message: '菜单权限分配成功'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '分配菜单权限失败'
    } as ApiResponse);
  }
});

// 创建菜单
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, code, path, parentId, icon, order, type, isExternal, visible, status, componentPath, routeParams } = req.body;
    
    // 验证必填字段
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: '菜单名称和编码为必填项'
      } as ApiResponse);
    }
    
    // 检查编码是否已存在
    const existingMenus = db.getAllMenus();
    if (existingMenus.some(m => m.code === code)) {
      return res.status(400).json({
        success: false,
        error: '菜单编码已存在'
      } as ApiResponse);
    }
    
    const newMenu: Menu = {
      id: `menu-${Date.now()}`,
      name,
      code,
      path: path || `/${code}`,
      parentId,
      icon,
      order: order || 0,
      type: type || 'MENU',
      isExternal: isExternal || false,
      visible: visible !== false,
      status: status || 'NORMAL',
      componentPath,
      routeParams
    };
    
    db.createMenu(newMenu);
    
    res.json({
      success: true,
      data: newMenu,
      message: '菜单创建成功'
    } as ApiResponse<Menu>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '创建菜单失败'
    } as ApiResponse);
  }
});

// 更新菜单
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const menu = db.getMenu(id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: '菜单不存在'
      } as ApiResponse);
    }
    
    // 检查编码是否冲突
    if (updates.code && updates.code !== menu.code) {
      const existingMenus = db.getAllMenus();
      if (existingMenus.some(m => m.code === updates.code && m.id !== id)) {
        return res.status(400).json({
          success: false,
          error: '菜单编码已存在'
        } as ApiResponse);
      }
    }
    
    const success = db.updateMenu(id, updates);
    
    if (success) {
      const updatedMenu = db.getMenu(id);
      res.json({
        success: true,
        data: updatedMenu,
        message: '菜单更新成功'
      } as ApiResponse<Menu>);
    } else {
      res.status(500).json({
        success: false,
        error: '更新菜单失败'
      } as ApiResponse);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '更新菜单失败'
    } as ApiResponse);
  }
});

// 删除菜单
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const menu = db.getMenu(id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: '菜单不存在'
      } as ApiResponse);
    }
    
    // 检查是否有子菜单
    const allMenus = db.getAllMenus();
    const hasChildren = allMenus.some(m => m.parentId === id);
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        error: '该菜单下有子菜单，无法删除'
      } as ApiResponse);
    }
    
    const success = db.deleteMenu(id);
    
    if (success) {
      res.json({
        success: true,
        message: '菜单删除成功'
      } as ApiResponse);
    } else {
      res.status(500).json({
        success: false,
        error: '删除菜单失败'
      } as ApiResponse);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '删除菜单失败'
    } as ApiResponse);
  }
});

export default router;

