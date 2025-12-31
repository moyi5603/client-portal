import express from 'express';
import { authenticate, requireAccountType, AuthRequest } from '../middleware/auth';
import { db } from '../database/models';
import { generateId } from '../utils/uuid';
import { validateUniqueAccountInfo, validateCustomerIds, validateRoleIds } from '../utils/validation';
import { Account, AccountType, AccountStatus, ApiResponse, PaginatedResponse } from '../types';

const router = express.Router();

// 所有路由需要认证
router.use(authenticate);

// 创建客户子账号
router.post('/customer', requireAccountType(AccountType.MAIN), async (req: AuthRequest, res) => {
  try {
    const { username, email, phone, password, customerIds, roleIds, status } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名、邮箱、手机号和密码不能为空'
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
      id: generateId(),
      username,
      email,
      phone,
      accountType: AccountType.CUSTOMER,
      status: status || AccountStatus.ACTIVE,
      tenantId,
      customerIds: customerIds || [],
      roles: roleIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.accountId
    };

    db.createAccount(account, password);

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
    const { username, email, phone, password, accessibleCustomerIds, roleIds, status } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: '用户名、邮箱、手机号和密码不能为空'
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
      id: generateId(),
      username,
      email,
      phone,
      accountType: AccountType.PARTNER,
      status: status || AccountStatus.ACTIVE,
      tenantId,
      accessibleCustomerIds: accessibleCustomerIds || [],
      roles: roleIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.accountId
    };

    db.createAccount(account, password);

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
    const { page = 1, pageSize = 10, accountType, status } = req.query;

    let accounts = db.getAllAccounts(tenantId);

    // 过滤
    if (accountType) {
      accounts = accounts.filter(acc => acc.accountType === accountType);
    }
    if (status) {
      accounts = accounts.filter(acc => acc.status === status);
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

    const { username, email, phone, customerIds, accessibleCustomerIds, roleIds, status } = req.body;

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

    // 验证Customer IDs
    if (customerIds) {
      const customerCheck = validateCustomerIds(customerIds);
      if (!customerCheck.valid) {
        return res.status(400).json({
          success: false,
          error: customerCheck.error
        } as ApiResponse);
      }
    }

    if (accessibleCustomerIds) {
      const customerCheck = validateCustomerIds(accessibleCustomerIds);
      if (!customerCheck.valid) {
        return res.status(400).json({
          success: false,
          error: customerCheck.error
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
    if (customerIds) updates.customerIds = customerIds;
    if (accessibleCustomerIds) updates.accessibleCustomerIds = accessibleCustomerIds;
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

