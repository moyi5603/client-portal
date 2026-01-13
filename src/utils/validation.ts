import { AccountType, RoleStatus } from '../types';
import { db } from '../database/models';

// 验证用户名、邮箱、手机号在主账号内是否唯一
// tenantId代表主账号标识，同一主账号下的所有子账号共享相同的tenantId
export const validateUniqueAccountInfo = (
  tenantId: string,
  username: string,
  email: string,
  phone?: string,
  excludeAccountId?: string
): { valid: boolean; error?: string } => {
  // 获取同一主账号下的所有账号（包括主账号本身和所有子账号）
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

    // 只有当手机号不为空时才进行唯一性检查
    if (phone && phone.trim() && account.phone && account.phone === phone) {
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

// 验证Facility IDs是否存在
export const validateFacilityIds = (facilityIds: string[]): { valid: boolean; error?: string } => {
  for (const facilityId of facilityIds) {
    const facility = db.getFacility(facilityId);
    if (!facility) {
      return { valid: false, error: `Facility ID ${facilityId} 不存在` };
    }
  }
  return { valid: true };
};

// 验证角色IDs是否存在且为启用状态
export const validateRoleIds = (roleIds: string[]): { valid: boolean; error?: string } => {
  for (const roleId of roleIds) {
    const role = db.getRole(roleId);
    if (!role) {
      return { valid: false, error: `角色 ID ${roleId} 不存在` };
    }
    // 检查角色状态是否为ACTIVE
    if (role.status !== RoleStatus.ACTIVE) {
      return { valid: false, error: `角色 ${role.name} 不是启用状态，无法分配` };
    }
  }
  return { valid: true };
};

