import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/models';

export const generateId = (): string => {
  return uuidv4();
};

/**
 * 生成简短的账号ID，格式：ACC-001, ACC-002, ...
 * 自动查找数据库中最大编号并递增
 */
export const generateAccountId = (): string => {
  const allAccounts = db.getAllAccounts();
  const prefix = 'ACC-';
  
  // 提取所有以ACC-开头的账号ID，获取编号部分
  const numbers = allAccounts
    .map(account => {
      if (account.id.startsWith(prefix)) {
        const numStr = account.id.substring(prefix.length);
        const num = parseInt(numStr, 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    })
    .filter(num => num > 0);
  
  // 找到最大编号，如果没有则从0开始
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  
  // 生成新编号（3位数字，不足补0）
  const newNumber = maxNumber + 1;
  const paddedNumber = String(newNumber).padStart(3, '0');
  
  return `${prefix}${paddedNumber}`;
};

/**
 * 生成角色ID，格式：ROLE-001, ROLE-002, ...
 * 自动查找数据库中最大编号并递增
 */
export const generateRoleId = (): string => {
  const allRoles = db.getAllRoles();
  const prefix = 'ROLE-';
  
  // 提取所有以ROLE-开头的角色ID，获取编号部分
  const numbers = allRoles
    .map(role => {
      if (role.id.startsWith(prefix)) {
        const numStr = role.id.substring(prefix.length);
        const num = parseInt(numStr, 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    })
    .filter(num => num > 0);
  
  // 找到最大编号，如果没有则从0开始
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  
  // 生成新编号（3位数字，不足补0）
  const newNumber = maxNumber + 1;
  const paddedNumber = String(newNumber).padStart(3, '0');
  
  return `${prefix}${paddedNumber}`;
};

