import express from 'express';
import { authenticate, requireAccountType, AuthRequest } from '../middleware/auth';
import { db } from '../database/models';
import { generateId, generateRoleId } from '../utils/uuid';
import { validateCustomerIds } from '../utils/validation';
import { Role, RoleStatus, ApiResponse, PaginatedResponse, Permission } from '../types';
import { auditService } from '../services/auditService';
import { ActionType, TargetType } from '../types';

const router = express.Router();

router.use(authenticate);

// 创建角色
router.post('/', requireAccountType('MAIN'), async (req: AuthRequest, res) => {
  try {
    const { name, description, status, permissions } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: '角色名称不能为空'
      } as ApiResponse);
    }

    const role: Role = {
      id: generateRoleId(),
      name,
      description,
      status: (status as RoleStatus) || RoleStatus.ACTIVE,
      permissions: permissions || [],
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.accountId,
      modifiedBy: req.user!.accountId
    };

    db.createRole(role);

    // 记录审计日志
    auditService.log(
      req.user!,
      ActionType.ROLE_CREATED,
      TargetType.ROLE,
      role.id,
      role.name,
      undefined,
      role
    );

    res.status(201).json({
      success: true,
      data: role
    } as ApiResponse<Role>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '创建角色失败'
    } as ApiResponse);
  }
});

// 获取角色列表
router.get('/', requireAccountType('MAIN'), async (req: AuthRequest, res) => {
  try {
    const { page = 1, pageSize = 10, status, module } = req.query;
    let roles = db.getAllRoles();

    // 过滤
    if (status) {
      roles = roles.filter(role => role.status === status);
    }
    if (module && module !== 'ALL') {
      roles = roles.filter(role => 
        role.permissions.some(p => p.module === module)
      );
    }

    // 计算使用数量
    const accounts = db.getAllAccounts(req.user!.tenantId);
    roles = roles.map(role => {
      const usageCount = accounts.filter(acc => acc.roles.includes(role.id)).length;
      return { ...role, usageCount };
    });

    // 分页
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const start = (pageNum - 1) * pageSizeNum;
    const end = start + pageSizeNum;
    const paginatedRoles = roles.slice(start, end);

    res.json({
      success: true,
      data: {
        items: paginatedRoles,
        total: roles.length,
        page: pageNum,
        pageSize: pageSizeNum
      }
    } as ApiResponse<PaginatedResponse<Role>>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取角色列表失败'
    } as ApiResponse);
  }
});

// 获取角色详情
router.get('/:id', requireAccountType('MAIN'), async (req: AuthRequest, res) => {
  try {
    const role = db.getRole(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: '角色不存在'
      } as ApiResponse);
    }

    // 计算使用数量
    const accounts = db.getAllAccounts(req.user!.tenantId);
    const usageCount = accounts.filter(acc => acc.roles.includes(role.id)).length;
    const roleWithUsage = { ...role, usageCount };

    res.json({
      success: true,
      data: roleWithUsage
    } as ApiResponse<Role>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取角色详情失败'
    } as ApiResponse);
  }
});

// 更新角色
router.put('/:id', requireAccountType('MAIN'), async (req: AuthRequest, res) => {
  try {
    const role = db.getRole(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: '角色不存在'
      } as ApiResponse);
    }

    // 检查是否为系统预设角色
    if (role.isSystemRole) {
      return res.status(403).json({
        success: false,
        error: '系统预设角色不允许编辑'
      } as ApiResponse);
    }

    const { name, description, status, permissions } = req.body;
    const previousValue = { ...role };

    const updates: Partial<Role> = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status as RoleStatus;
    if (permissions) updates.permissions = permissions as Permission[];
    updates.modifiedBy = req.user!.accountId;

    const updated = db.updateRole(role.id, updates);
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: '更新角色失败'
      } as ApiResponse);
    }

    const updatedRole = db.getRole(role.id);

    // 记录审计日志
    const changes = auditService.computeChanges(previousValue, updatedRole!);
    auditService.log(
      req.user!,
      ActionType.ROLE_UPDATED,
      TargetType.ROLE,
      role.id,
      role.name,
      previousValue,
      updatedRole,
      changes
    );

    res.json({
      success: true,
      data: updatedRole
    } as ApiResponse<Role>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '更新角色失败'
    } as ApiResponse);
  }
});

// 复制角色
router.post('/:id/copy', requireAccountType('MAIN'), async (req: AuthRequest, res) => {
  try {
    const sourceRole = db.getRole(req.params.id);
    if (!sourceRole) {
      return res.status(404).json({
        success: false,
        error: '源角色不存在'
      } as ApiResponse);
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: '新角色名称不能为空'
      } as ApiResponse);
    }

    // 创建新角色
    const newRole: Role = {
      id: generateRoleId(),
      name,
      description: sourceRole.description,
      status: sourceRole.status,
      permissions: [...sourceRole.permissions], // 深拷贝权限
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.accountId,
      modifiedBy: req.user!.accountId
    };

    db.createRole(newRole);

    // 记录审计日志 - 角色复制记录为创建
    auditService.log(
      req.user!,
      ActionType.ROLE_CREATED,
      TargetType.ROLE,
      newRole.id,
      newRole.name,
      undefined,
      newRole
    );

    res.status(201).json({
      success: true,
      data: newRole
    } as ApiResponse<Role>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '复制角色失败'
    } as ApiResponse);
  }
});

// 删除角色
router.delete('/:id', requireAccountType('MAIN'), async (req: AuthRequest, res) => {
  try {
    const role = db.getRole(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: '角色不存在'
      } as ApiResponse);
    }

    // 检查是否为系统预设角色
    if (role.isSystemRole) {
      return res.status(403).json({
        success: false,
        error: '系统预设角色不允许删除'
      } as ApiResponse);
    }

    // 检查是否被使用
    const accounts = db.getAllAccounts(req.user!.tenantId);
    const isUsed = accounts.some(acc => acc.roles.includes(role.id));
    if (isUsed) {
      return res.status(400).json({
        success: false,
        error: '角色正在使用中，无法删除'
      } as ApiResponse);
    }

    const deleted = db.deleteRole(role.id);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: '删除角色失败'
      } as ApiResponse);
    }

    // 记录审计日志
    auditService.log(
      req.user!,
      ActionType.ROLE_DELETED,
      TargetType.ROLE,
      role.id,
      role.name,
      role,
      undefined
    );

    res.json({
      success: true,
      message: '角色删除成功'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '删除角色失败'
    } as ApiResponse);
  }
});

export default router;

