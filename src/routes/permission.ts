import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../database/models';
import { ApiResponse, AccountType } from '../types';

const router = express.Router();

router.use(authenticate);

// 获取当前用户的权限
router.get('/my-permissions', async (req: AuthRequest, res) => {
  try {
    const account = db.getAccount(req.user!.accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: '账号不存在'
      } as ApiResponse);
    }

    // 获取所有角色
    const roles = account.roles.map(roleId => db.getRole(roleId)).filter(Boolean);

    // 收集所有权限
    const menuPermissionSet = new Set<string>();
    const functionPermissionSet = new Set<string>();

    roles.forEach(role => {
      role!.menuPermissions.forEach(menuId => menuPermissionSet.add(menuId));
      role!.functionPermissions.forEach(funcId => functionPermissionSet.add(funcId));
    });

    // 获取菜单和功能权限详情
    const menus = Array.from(menuPermissionSet).map(menuId => db.getMenu(menuId)).filter(Boolean);
    const functions = Array.from(functionPermissionSet).map(funcId => db.getFunctionPermission(funcId)).filter(Boolean);

    // 按模块分组
    const menuMap = new Map<string, any>();
    menus.forEach(menu => {
      if (menu) {
        menuMap.set(menu.id, menu);
      }
    });

    const functionMap = new Map<string, any>();
    functions.forEach(func => {
      if (func) {
        const menuId = func.menuId;
        if (!functionMap.has(menuId)) {
          functionMap.set(menuId, []);
        }
        functionMap.get(menuId)!.push(func);
      }
    });

    // 构建权限树
    const permissionTree = menus.map(menu => ({
      menu,
      functions: functionMap.get(menu!.id) || []
    }));

    res.json({
      success: true,
      data: {
        account: {
          id: account.id,
          username: account.username,
          accountType: account.accountType,
          customerIds: account.customerIds,
          accessibleCustomerIds: account.accessibleCustomerIds
        },
        roles: roles.map(role => ({
          id: role!.id,
          name: role!.name,
          description: role!.description,
          type: role!.type
        })),
        permissions: {
          menus: Array.from(menuPermissionSet),
          functions: Array.from(functionPermissionSet),
          tree: permissionTree
        },
        dataPermission: {
          // 账号类型只起到标签作用，统一使用customerIds或accessibleCustomerIds
          customerIds: account.customerIds || account.accessibleCustomerIds || [],
          type: account.accountType === AccountType.MAIN ? 'ALL' : 'ASSIGNED'
        }
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取权限信息失败'
    } as ApiResponse);
  }
});

// 查看指定账号的权限（主账号专用）
router.get('/account/:accountId', async (req: AuthRequest, res) => {
  try {
    // 只有主账号可以查看其他账号的权限
    if (req.user!.accountType !== AccountType.MAIN) {
      return res.status(403).json({
        success: false,
        error: '无权查看其他账号的权限'
      } as ApiResponse);
    }

    const { accountId } = req.params;
    const account = db.getAccount(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: '账号不存在'
      } as ApiResponse);
    }

    // 检查租户权限
    if (account.tenantId !== req.user!.tenantId) {
      return res.status(403).json({
        success: false,
        error: '无权查看该账号的权限'
      } as ApiResponse);
    }

    // 获取所有角色
    const roles = account.roles.map(roleId => db.getRole(roleId)).filter(Boolean);

    // 收集所有权限
    const menuPermissionSet = new Set<string>();
    const functionPermissionSet = new Set<string>();

    roles.forEach(role => {
      role!.menuPermissions.forEach(menuId => menuPermissionSet.add(menuId));
      role!.functionPermissions.forEach(funcId => functionPermissionSet.add(funcId));
    });

    // 获取菜单和功能权限详情
    const menus = Array.from(menuPermissionSet).map(menuId => db.getMenu(menuId)).filter(Boolean);
    const functions = Array.from(functionPermissionSet).map(funcId => db.getFunctionPermission(funcId)).filter(Boolean);

    // 按模块分组
    const functionMap = new Map<string, any>();
    functions.forEach(func => {
      if (func) {
        const menuId = func.menuId;
        if (!functionMap.has(menuId)) {
          functionMap.set(menuId, []);
        }
        functionMap.get(menuId)!.push(func);
      }
    });

    // 构建权限树
    const permissionTree = menus.map(menu => ({
      menu,
      functions: functionMap.get(menu!.id) || []
    }));

    res.json({
      success: true,
      data: {
        account: {
          id: account.id,
          username: account.username,
          email: account.email,
          accountType: account.accountType,
          status: account.status,
          customerIds: account.customerIds,
          accessibleCustomerIds: account.accessibleCustomerIds
        },
        roles: roles.map(role => ({
          id: role!.id,
          name: role!.name,
          description: role!.description,
          type: role!.type,
          dataPermissionType: role!.dataPermissionType,
          accessibleCustomerIds: role!.accessibleCustomerIds
        })),
        permissions: {
          menus: Array.from(menuPermissionSet),
          functions: Array.from(functionPermissionSet),
          tree: permissionTree
        },
        dataPermission: {
          // 账号类型只起到标签作用，统一使用customerIds或accessibleCustomerIds
          customerIds: account.customerIds || account.accessibleCustomerIds || [],
          type: account.accountType === AccountType.MAIN ? 'ALL' : 'ASSIGNED'
        }
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取账号权限失败'
    } as ApiResponse);
  }
});

// 获取所有Customer列表（用于权限配置）
router.get('/customers', async (req: AuthRequest, res) => {
  try {
    const customers = db.getAllCustomers();
    res.json({
      success: true,
      data: customers
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取Customer列表失败'
    } as ApiResponse);
  }
});

// 获取所有Facility列表（用于权限配置）
router.get('/facilities', async (req: AuthRequest, res) => {
  try {
    const facilities = db.getAllFacilities();
    res.json({
      success: true,
      data: facilities
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取Facility列表失败'
    } as ApiResponse);
  }
});

export default router;

