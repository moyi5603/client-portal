import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/models';
import { generateToken } from '../middleware/auth';
import { LoginCredentials, ApiResponse, TokenPayload, AccountType } from '../types';

const router = express.Router();

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password, tenantId }: LoginCredentials & { tenantId: string } = req.body;

    console.log('登录请求:', { username, tenantId, hasPassword: !!password });

    if (!username || !password || !tenantId) {
      return res.status(400).json({
        success: false,
        error: '用户名、密码和租户ID不能为空'
      } as ApiResponse);
    }

    const account = db.getAccountByUsername(username, tenantId);
    console.log('查找账号结果:', account ? '找到' : '未找到');
    
    if (!account) {
      // 调试：列出所有账号
      const allAccounts = db.getAllAccounts(tenantId);
      console.log('租户下的所有账号:', allAccounts.map(acc => ({ username: acc.username, tenantId: acc.tenantId })));
      
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      } as ApiResponse);
    }

    // 验证密码（实际应使用bcrypt）
    const isValidPassword = db.verifyPassword(account.id, password);
    console.log('密码验证结果:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      } as ApiResponse);
    }

    if (account.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: '账号已被禁用'
      } as ApiResponse);
    }

    // 生成Token
    const tokenPayload: TokenPayload = {
      accountId: account.id,
      username: account.username,
      accountType: account.accountType as AccountType,
      tenantId: account.tenantId,
      customerIds: account.customerIds,
      accessibleCustomerIds: account.accessibleCustomerIds
    };

    const token = generateToken(tokenPayload);

    res.json({
      success: true,
      data: {
        token,
        account: {
          id: account.id,
          username: account.username,
          email: account.email,
          accountType: account.accountType,
          tenantId: account.tenantId
        }
      }
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || '登录失败'
    } as ApiResponse);
  }
});

export default router;

