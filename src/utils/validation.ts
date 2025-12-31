import { AccountType } from '../types';
import { db } from '../database/models';

// 验证用户名、邮箱、手机号在租户内是否唯一
export const validateUniqueAccountInfo = (
  tenantId: string,
  username: string,
  email: string,
  phone: string,
  excludeAccountId?: string
): { valid: boolean; error?: string } => {
  const accounts = db.getAllAccounts(tenantId);

  for (const account of accounts) {
    if (excludeAccountId && account.id === excludeAccountId) {
      continue;
    }

    if (account.username === username) {
      return { valid: false, error: '用户名已存在' };
    }

    if (account.email === email) {
      return { valid: false, error: '邮箱已存在' };
    }

    if (account.phone === phone) {
      return { valid: false, error: '手机号已存在' };
    }
  }

  return { valid: true };
};

// 验证Customer IDs是否存在
export const validateCustomerIds = (customerIds: string[]): { valid: boolean; error?: string } => {
  for (const customerId of customerIds) {
    const customer = db.getCustomer(customerId);
    if (!customer) {
      return { valid: false, error: `Customer ID ${customerId} 不存在` };
    }
  }
  return { valid: true };
};

// 验证角色IDs是否存在
export const validateRoleIds = (roleIds: string[]): { valid: boolean; error?: string } => {
  for (const roleId of roleIds) {
    const role = db.getRole(roleId);
    if (!role) {
      return { valid: false, error: `角色 ID ${roleId} 不存在` };
    }
  }
  return { valid: true };
};

