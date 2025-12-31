import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { db } from '../database/models';
import { AccountType, DataPermissionType } from '../types';

// 数据权限检查中间件
export const checkDataPermission = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: '未认证' });
  }

  const { accountType, customerIds, accessibleCustomerIds } = req.user;

  // 主账号可以访问所有Customer数据
  if (accountType === AccountType.MAIN) {
    return next();
  }

  // 获取请求中的customerId参数
  const requestedCustomerId = req.query.customerId as string || req.body.customerId;

  if (requestedCustomerId) {
    let allowedCustomerIds: string[] = [];

    if (accountType === AccountType.CUSTOMER) {
      allowedCustomerIds = customerIds || [];
    } else if (accountType === AccountType.PARTNER) {
      allowedCustomerIds = accessibleCustomerIds || [];
    }

    if (!allowedCustomerIds.includes(requestedCustomerId)) {
      return res.status(403).json({ 
        success: false, 
        error: '无权访问该Customer的数据' 
      });
    }
  }

  next();
};

// 过滤查询结果，只返回有权限的数据
export const filterDataByPermission = <T extends { customerId?: string }>(
  data: T[],
  user: { accountType: AccountType; customerIds?: string[]; accessibleCustomerIds?: string[] }
): T[] => {
  if (user.accountType === AccountType.MAIN) {
    return data; // 主账号可以访问所有数据
  }

  let allowedCustomerIds: string[] = [];
  if (user.accountType === AccountType.CUSTOMER) {
    allowedCustomerIds = user.customerIds || [];
  } else if (user.accountType === AccountType.PARTNER) {
    allowedCustomerIds = user.accessibleCustomerIds || [];
  }

  return data.filter(item => {
    if (!item.customerId) return true; // 没有customerId的数据允许访问
    return allowedCustomerIds.includes(item.customerId);
  });
};

