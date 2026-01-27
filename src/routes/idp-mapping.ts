import express from 'express';
import { authenticate, requireAccountType, AuthRequest } from '../middleware/auth';
import { db } from '../database/models';
import { generateId } from '../utils/uuid';
import { auditService } from '../services/auditService';
import { IdpGroupMapping, ApiResponse, ActionType, TargetType } from '../types';
import { AccountType } from '../types';

const router = express.Router();

router.use(authenticate);
router.use(requireAccountType(AccountType.MAIN)); // 只有主账号可以管理IdP映射

// 获取IdP映射列表
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { idpSource, status } = req.query;
    let mappings = db.getAllIdpMappings();

    if (idpSource) {
      mappings = mappings.filter(m => m.idpSource === idpSource);
    }

    if (status) {
      mappings = mappings.filter(m => m.status === status);
    }

    res.json({
      success: true,
      data: mappings
    } as ApiResponse<IdpGroupMapping[]>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取IdP映射列表失败'
    } as ApiResponse);
  }
});

// 创建IdP映射
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { idpSource, groupClaim, mappedRoleIds, status } = req.body;

    if (!idpSource || !groupClaim || !mappedRoleIds || !Array.isArray(mappedRoleIds)) {
      return res.status(400).json({
        success: false,
        error: 'IdP来源、组声明和映射角色不能为空'
      } as ApiResponse);
    }

    // 验证角色是否存在
    for (const roleId of mappedRoleIds) {
      const role = db.getRole(roleId);
      if (!role) {
        return res.status(400).json({
          success: false,
          error: `角色 ${roleId} 不存在`
        } as ApiResponse);
      }
    }

    const mapping: IdpGroupMapping = {
      id: generateId(),
      idpSource,
      groupClaim,
      mappedRoleIds,
      status: status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.accountId
    };

    db.createIdpMapping(mapping);

    // 记录审计日志
    auditService.log(
      req.user!,
      ActionType.IDP_MAPPING_CREATED,
      TargetType.IDP_MAPPING,
      mapping.id,
      mapping.groupClaim,
      undefined,
      mapping
    );

    res.status(201).json({
      success: true,
      data: mapping
    } as ApiResponse<IdpGroupMapping>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '创建IdP映射失败'
    } as ApiResponse);
  }
});

// 更新IdP映射
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const mapping = db.getIdpMapping(req.params.id);
    if (!mapping) {
      return res.status(404).json({
        success: false,
        error: 'IdP映射不存在'
      } as ApiResponse);
    }

    const { mappedRoleIds, status } = req.body;
    const previousValue = { ...mapping };

    const updates: Partial<IdpGroupMapping> = {};
    if (mappedRoleIds) {
      // 验证角色
      for (const roleId of mappedRoleIds) {
        const role = db.getRole(roleId);
        if (!role) {
          return res.status(400).json({
            success: false,
            error: `角色 ${roleId} 不存在`
          } as ApiResponse);
        }
      }
      updates.mappedRoleIds = mappedRoleIds;
    }
    if (status) {
      updates.status = status;
    }

    const updated = db.updateIdpMapping(mapping.id, updates);
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: '更新IdP映射失败'
      } as ApiResponse);
    }

    const updatedMapping = db.getIdpMapping(mapping.id);

    // 记录审计日志
    const changes = auditService.computeChanges(previousValue, updatedMapping!);
    auditService.log(
      req.user!,
      ActionType.IDP_MAPPING_UPDATED,
      TargetType.IDP_MAPPING,
      mapping.id,
      mapping.groupClaim,
      previousValue,
      updatedMapping,
      changes
    );

    res.json({
      success: true,
      data: updatedMapping
    } as ApiResponse<IdpGroupMapping>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '更新IdP映射失败'
    } as ApiResponse);
  }
});

// 删除IdP映射
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const mapping = db.getIdpMapping(req.params.id);
    if (!mapping) {
      return res.status(404).json({
        success: false,
        error: 'IdP映射不存在'
      } as ApiResponse);
    }

    const deleted = db.deleteIdpMapping(mapping.id);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: '删除IdP映射失败'
      } as ApiResponse);
    }

    // 记录审计日志
    auditService.log(
      req.user!,
      ActionType.IDP_MAPPING_DELETED,
      TargetType.IDP_MAPPING,
      mapping.id,
      mapping.groupClaim,
      mapping,
      undefined
    );

    res.json({
      success: true,
      message: 'IdP映射删除成功'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '删除IdP映射失败'
    } as ApiResponse);
  }
});

export default router;

