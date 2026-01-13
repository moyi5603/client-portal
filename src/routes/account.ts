import express from 'express';
import { authenticate, requireAccountType, AuthRequest } from '../middleware/auth';
import { db } from '../database/models';
import { generateAccountId } from '../utils/uuid';
import { validateUniqueAccountInfo, validateCustomerIds, validateFacilityIds, validateRoleIds } from '../utils/validation';
import { Account, AccountType, AccountStatus, ApiResponse, PaginatedResponse, ActionType, TargetType } from '../types';
import { auditService } from '../services/auditService';

const router = express.Router();

// 所有路由需要认证
router.use(authenticate);

// 创建客户子账号
router.post('/customer', requireAccountType(AccountType.MAIN), async (req: AuthRequest, res) => {
  try {
    const { username, email, phone, password, customerIds, facilityIds, roleIds, status } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名、邮箱和密码不能为空'
      } as ApiResponse);
    }

    const tenantId = req.user!.tenantId;

    // 验证唯一性
    const uniqueCheck = validateUniqueAccountInfo(tenantId, username, email, phone);
    if (!uniqueCheck.valid) {
      return res.status(400).json({
        success: false,
        error: uniqueCheck.error
      } as ApiResponse);
    }

    // 验证Customer IDs
    if (customerIds && customerIds.length > 0) {
      const customerCheck = validateCustomerIds(customerIds);
      if (!customerCheck.valid) {
        return res.status(400).json({
          success: false,
          error: customerCheck.error
        } as ApiResponse);
      }
    }

    // 验证Facility IDs
    if (facilityIds && facilityIds.length > 0) {
      const facilityCheck = validateFacilityIds(facilityIds);
      if (!facilityCheck.valid) {
        return res.status(400).json({
          success: false,
          error: facilityCheck.error
        } as ApiResponse);
      }
    }

    // 验证角色IDs
    if (roleIds && roleIds.length > 0) {
      const roleCheck = validateRoleIds(roleIds);
      if (!roleCheck.valid) {
        return res.status(400).json({
          success: false,
          error: roleCheck.error
        } as ApiResponse);
      }
    }

    const account: Account = {
      id: generateAccountId(),
      username,
      email,
      phone,
      accountType: AccountType.CUSTOMER,
      status: status || AccountStatus.ACTIVE,
      tenantId,
      customerIds: customerIds || [],
      facilityIds: facilityIds || [],
      roles: roleIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.accountId
    };

    db.createAccount(account, password);

    // 记录审计日志
    auditService.log(
      req.user!,
      ActionType.ACCOUNT_CREATED,
      TargetType.ACCOUNT,
      account.id,
      account.username,
      undefined,
      account
    );

    res.status(201).json({
      success: true,
      data: account
    } as ApiResponse<Account>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '创建客户子账号失败'
    } as ApiResponse);
  }
});

// 创建Partner账号
router.post('/partner', requireAccountType(AccountType.MAIN), async (req: AuthRequest, res) => {
  try {
    const { username, email, phone, password, accessibleCustomerIds, accessibleFacilityIds, roleIds, status } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名、邮箱和密码不能为空'
      } as ApiResponse);
    }

    const tenantId = req.user!.tenantId;

    // 验证唯一性
    const uniqueCheck = validateUniqueAccountInfo(tenantId, username, email, phone);
    if (!uniqueCheck.valid) {
      return res.status(400).json({
        success: false,
        error: uniqueCheck.error
      } as ApiResponse);
    }

    // 验证Customer IDs
    if (accessibleCustomerIds && accessibleCustomerIds.length > 0) {
      const customerCheck = validateCustomerIds(accessibleCustomerIds);
      if (!customerCheck.valid) {
        return res.status(400).json({
          success: false,
          error: customerCheck.error
        } as ApiResponse);
      }
    }

    // 验证Facility IDs
    if (accessibleFacilityIds && accessibleFacilityIds.length > 0) {
      const facilityCheck = validateFacilityIds(accessibleFacilityIds);
      if (!facilityCheck.valid) {
        return res.status(400).json({
          success: false,
          error: facilityCheck.error
        } as ApiResponse);
      }
    }

    // 验证角色IDs
    if (roleIds && roleIds.length > 0) {
      const roleCheck = validateRoleIds(roleIds);
      if (!roleCheck.valid) {
        return res.status(400).json({
          success: false,
          error: roleCheck.error
        } as ApiResponse);
      }
    }

    const account: Account = {
      id: generateAccountId(),
      username,
      email,
      phone,
      accountType: AccountType.PARTNER,
      status: status || AccountStatus.ACTIVE,
      tenantId,
      accessibleCustomerIds: accessibleCustomerIds || [],
      accessibleFacilityIds: accessibleFacilityIds || [],
      roles: roleIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.accountId
    };

    db.createAccount(account, password);

    // 记录审计日志
    auditService.log(
      req.user!,
      ActionType.ACCOUNT_CREATED,
      TargetType.ACCOUNT,
      account.id,
      account.username,
      undefined,
      account
    );

    res.status(201).json({
      success: true,
      data: account
    } as ApiResponse<Account>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '创建Partner账号失败'
    } as ApiResponse);
  }
});

// 获取账号列表
router.get('/', requireAccountType(AccountType.MAIN), async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;
    const { 
      page = 1, 
      pageSize = 10, 
      accountType, 
      status,
      username,
      email,
      phone,
      customerIds
    } = req.query;

    let accounts = db.getAllAccounts(tenantId);

    // 过滤
    if (accountType) {
      accounts = accounts.filter(acc => acc.accountType === accountType);
    }
    if (status) {
      accounts = accounts.filter(acc => acc.status === status);
    }
    // 用户名模糊搜索
    if (username) {
      const usernameStr = (username as string).toLowerCase();
      accounts = accounts.filter(acc => 
        acc.username.toLowerCase().includes(usernameStr)
      );
    }
    // 邮箱模糊搜索
    if (email) {
      const emailStr = (email as string).toLowerCase();
      accounts = accounts.filter(acc => 
        acc.email.toLowerCase().includes(emailStr)
      );
    }
    // 手机号模糊搜索
    if (phone) {
      const phoneStr = phone as string;
      accounts = accounts.filter(acc => 
        acc.phone && acc.phone.includes(phoneStr)
      );
    }
    // Customer筛选（支持多选，使用AND逻辑：账号必须包含所有选中的Customer）
    // 账号类型只起到标签作用，客户子账号和Partner子账号逻辑相同
    if (customerIds) {
      const customerIdArray = Array.isArray(customerIds) 
        ? customerIds 
        : [customerIds];
      accounts = accounts.filter(acc => {
        // 主账号显示所有，不筛选
        if (acc.accountType === AccountType.MAIN) {
          return true;
        }
        // 子账号统一检查：使用customerIds或accessibleCustomerIds（必须包含所有选中的Customer）
        const accountCustomerIds = acc.customerIds || acc.accessibleCustomerIds || [];
        return accountCustomerIds.length > 0 && 
               customerIdArray.every(cid => accountCustomerIds.includes(cid as string));
      });
    }

    // 分页
    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const start = (pageNum - 1) * pageSizeNum;
    const end = start + pageSizeNum;
    const paginatedAccounts = accounts.slice(start, end);

    res.json({
      success: true,
      data: {
        items: paginatedAccounts,
        total: accounts.length,
        page: pageNum,
        pageSize: pageSizeNum
      }
    } as ApiResponse<PaginatedResponse<Account>>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取账号列表失败'
    } as ApiResponse);
  }
});

// 获取账号详情
router.get('/:id', requireAccountType(AccountType.MAIN), async (req: AuthRequest, res) => {
  try {
    const account = db.getAccount(req.params.id);
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
        error: '无权访问该账号'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: account
    } as ApiResponse<Account>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '获取账号详情失败'
    } as ApiResponse);
  }
});

// 更新账号
router.put('/:id', requireAccountType(AccountType.MAIN), async (req: AuthRequest, res) => {
  try {
    const account = db.getAccount(req.params.id);
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
        error: '无权访问该账号'
      } as ApiResponse);
    }

    const { username, email, phone, customerIds, accessibleCustomerIds, facilityIds, accessibleFacilityIds, roleIds, status } = req.body;

    // 验证唯一性（排除当前账号）
    if (username || email || phone) {
      const uniqueCheck = validateUniqueAccountInfo(
        req.user!.tenantId,
        username || account.username,
        email || account.email,
        phone || account.phone,
        account.id
      );
      if (!uniqueCheck.valid) {
        return res.status(400).json({
          success: false,
          error: uniqueCheck.error
        } as ApiResponse);
      }
    }

    // 账号类型只起到标签作用，统一处理Customer IDs
    // 优先使用accessibleCustomerIds，如果没有则使用customerIds
    const finalCustomerIds = accessibleCustomerIds || customerIds;
    if (finalCustomerIds) {
      const customerCheck = validateCustomerIds(finalCustomerIds);
      if (!customerCheck.valid) {
        return res.status(400).json({
          success: false,
          error: customerCheck.error
        } as ApiResponse);
      }
    }

    // 统一处理Facility IDs
    // 优先使用accessibleFacilityIds，如果没有则使用facilityIds
    const finalFacilityIds = accessibleFacilityIds || facilityIds;
    if (finalFacilityIds) {
      const facilityCheck = validateFacilityIds(finalFacilityIds);
      if (!facilityCheck.valid) {
        return res.status(400).json({
          success: false,
          error: facilityCheck.error
        } as ApiResponse);
      }
    }

    // 验证角色IDs
    if (roleIds) {
      const roleCheck = validateRoleIds(roleIds);
      if (!roleCheck.valid) {
        return res.status(400).json({
          success: false,
          error: roleCheck.error
        } as ApiResponse);
      }
    }

    const updates: Partial<Account> = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    // 账号类型只起到标签作用，统一处理Customer IDs
    // 根据账号类型设置对应字段以保持数据一致性
    if (finalCustomerIds) {
      if (account.accountType === AccountType.CUSTOMER) {
        updates.customerIds = finalCustomerIds;
        // 清除accessibleCustomerIds以保持数据一致性
        updates.accessibleCustomerIds = [];
      } else if (account.accountType === AccountType.PARTNER) {
        updates.accessibleCustomerIds = finalCustomerIds;
        // 清除customerIds以保持数据一致性
        updates.customerIds = [];
      }
    }
    // 统一处理Facility IDs
    // 根据账号类型设置对应字段以保持数据一致性
    if (finalFacilityIds) {
      if (account.accountType === AccountType.CUSTOMER) {
        updates.facilityIds = finalFacilityIds;
        // 清除accessibleFacilityIds以保持数据一致性
        updates.accessibleFacilityIds = [];
      } else if (account.accountType === AccountType.PARTNER) {
        updates.accessibleFacilityIds = finalFacilityIds;
        // 清除facilityIds以保持数据一致性
        updates.facilityIds = [];
      }
    }
    if (roleIds) updates.roles = roleIds;
    if (status) updates.status = status as AccountStatus;

    const updated = db.updateAccount(account.id, updates);
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: '更新账号失败'
      } as ApiResponse);
    }

    const updatedAccount = db.getAccount(account.id);
    
    // 记录审计日志
    if (Object.keys(updates).length > 0) {
      const changes = auditService.computeChanges(account, updatedAccount);
      auditService.log(
        req.user!,
        ActionType.ACCOUNT_UPDATED,
        TargetType.ACCOUNT,
        account.id,
        account.username,
        account,
        updatedAccount,
        changes
      );
    }

    res.json({
      success: true,
      data: updatedAccount
    } as ApiResponse<Account>);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '更新账号失败'
    } as ApiResponse);
  }
});

// 删除账号
router.delete('/:id', requireAccountType(AccountType.MAIN), async (req: AuthRequest, res) => {
  try {
    const account = db.getAccount(req.params.id);
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
        error: '无权访问该账号'
      } as ApiResponse);
    }

    const deleted = db.deleteAccount(account.id);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: '删除账号失败'
      } as ApiResponse);
    }

    // 记录审计日志
    auditService.log(
      req.user!,
      ActionType.ACCOUNT_DELETED,
      TargetType.ACCOUNT,
      account.id,
      account.username,
      account,
      undefined
    );

    res.json({
      success: true,
      message: '账号删除成功'
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '删除账号失败'
    } as ApiResponse);
  }
});

export default router;

