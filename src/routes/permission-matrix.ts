import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { db } from '../database/models';
import { ApiResponse, PermissionMatrix, Module, RoleType } from '../types';

const router = express.Router();

router.use(authenticate);

// 获取权限矩阵
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { roleIds, modules, types } = req.query;

    let roles = db.getAllRoles();

    // 过滤角色
    if (roleIds) {
      const roleIdArray = (roleIds as string).split(',');
      roles = roles.filter(r => roleIdArray.includes(r.id));
    }

    if (types) {
      const typeArray = (types as string).split(',') as RoleType[];
      roles = roles.filter(r => typeArray.includes(r.type));
    }

    // 获取所有模块
    const allModules = Object.values(Module);

    // 构建权限矩阵
    const matrix: PermissionMatrix['matrix'] = {};

    roles.forEach(role => {
      matrix[role.id] = {};

      // 初始化模块
      allModules.forEach(module => {
        matrix[role.id][module] = {};
      });

      // 填充权限
      role.permissions.forEach(perm => {
        if (!matrix[role.id][perm.module]) {
          matrix[role.id][perm.module] = {};
        }
        matrix[role.id][perm.module][perm.pageCode] = perm.operations;
      });
    });

    // 过滤模块（如果指定）
    let filteredModules = allModules;
    if (modules) {
      const moduleArray = (modules as string).split(',') as Module[];
      filteredModules = moduleArray;
    }

    const result: PermissionMatrix = {
      roles,
      modules: filteredModules,
      matrix
    };

    res.json({
      success: true,
      data: result
    } as ApiResponse<PermissionMatrix>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取权限矩阵失败'
    } as ApiResponse);
  }
});

// 导出权限矩阵为CSV
router.get('/export', async (req: AuthRequest, res) => {
  try {
    const { roleIds, modules, types } = req.query;

    let roles = db.getAllRoles();

    if (roleIds) {
      const roleIdArray = (roleIds as string).split(',');
      roles = roles.filter(r => roleIdArray.includes(r.id));
    }

    if (types) {
      const typeArray = (types as string).split(',') as RoleType[];
      roles = roles.filter(r => typeArray.includes(r.type));
    }

    const allModules = Object.values(Module);
    let filteredModules = allModules;
    if (modules) {
      const moduleArray = (modules as string).split(',') as Module[];
      filteredModules = moduleArray;
    }

    // 构建CSV
    const csvRows: string[] = [];
    
    // 表头
    const headers = ['角色', '模块', '页面', '操作'];
    csvRows.push(headers.join(','));

    // 数据行
    roles.forEach(role => {
      filteredModules.forEach(module => {
        const modulePerms = role.permissions.filter(p => p.module === module);
        
        if (modulePerms.length === 0) {
          // 没有权限的行
          csvRows.push([role.name, module, '-', '-'].map(cell => `"${cell}"`).join(','));
        } else {
          modulePerms.forEach(perm => {
            csvRows.push([
              role.name,
              module,
              perm.page,
              perm.operations.join('; ')
            ].map(cell => `"${cell}"`).join(','));
          });
        }
      });
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=permission-matrix-${Date.now()}.csv`);
    res.send('\ufeff' + csv); // BOM for Excel
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '导出权限矩阵失败'
    } as ApiResponse);
  }
});

export default router;

