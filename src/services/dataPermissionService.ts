import { User } from '../types/user';
import { DataSource } from '../types/dataSource';

interface DataAccessRule {
  userId: string;
  dataSource: string;
  operations: string[];
  conditions?: any;
  expiresAt?: Date;
}

interface DataSanitizationRule {
  field: string;
  condition: (userPermissions: string[]) => boolean;
  action: 'hide' | 'mask' | 'encrypt';
}

class DataPermissionService {
  private accessRules: Map<string, DataAccessRule[]> = new Map();
  private sanitizationRules: Map<string, DataSanitizationRule[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  // 初始化默认权限规则
  private initializeDefaultRules() {
    // 用户数据访问规则
    this.addAccessRule('users', {
      userId: '*',
      dataSource: 'users',
      operations: ['VIEW'],
      conditions: { ownDataOnly: true }
    });

    // 角色数据访问规则
    this.addAccessRule('roles', {
      userId: '*',
      dataSource: 'roles',
      operations: ['VIEW'],
      conditions: { tenantScope: true }
    });

    // 订单数据访问规则
    this.addAccessRule('orders', {
      userId: '*',
      dataSource: 'orders',
      operations: ['VIEW'],
      conditions: { departmentScope: true, facilityScope: true }
    });

    // 库存数据访问规则
    this.addAccessRule('inventory', {
      userId: '*',
      dataSource: 'inventory',
      operations: ['VIEW'],
      conditions: { facilityScope: true }
    });

    // 数据脱敏规则
    this.addSanitizationRule('users', [
      {
        field: 'email',
        condition: (permissions) => !permissions.includes('VIEW_SENSITIVE_DATA'),
        action: 'mask'
      },
      {
        field: 'phone',
        condition: (permissions) => !permissions.includes('VIEW_CONTACT_INFO'),
        action: 'mask'
      }
    ]);
  }

  // 检查用户数据访问权限
  async checkDataAccess(userId: string, dataSource: string, operation: string): Promise<boolean> {
    try {
      // 获取用户权限
      const userPermissions = await this.getUserPermissions(userId);
      
      // 检查是否有超级管理员权限
      if (userPermissions.includes('SUPER_ADMIN')) {
        return true;
      }

      // 获取数据源的访问规则
      const rules = this.accessRules.get(dataSource) || [];
      
      // 检查通用规则
      const universalRules = rules.filter(rule => rule.userId === '*');
      const userSpecificRules = rules.filter(rule => rule.userId === userId);
      
      const applicableRules = [...universalRules, ...userSpecificRules];
      
      for (const rule of applicableRules) {
        if (rule.operations.includes(operation) || rule.operations.includes('*')) {
          // 检查条件
          if (await this.checkRuleConditions(rule, userId, dataSource)) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Data access check failed:', error);
      return false;
    }
  }

  // 获取用户可访问的数据源
  async getAccessibleDataSources(userId: string): Promise<DataSource[]> {
    const accessibleSources: DataSource[] = [];
    const userPermissions = await this.getUserPermissions(userId);

    // 预定义的数据源
    const allDataSources = [
      { name: 'users', displayName: '用户数据', description: '系统用户信息' },
      { name: 'roles', displayName: '角色数据', description: '用户角色和权限' },
      { name: 'orders', displayName: '订单数据', description: '物流订单信息' },
      { name: 'inventory', displayName: '库存数据', description: '仓库库存信息' },
      { name: 'shipments', displayName: '发货数据', description: '发货记录和状态' },
      { name: 'returns', displayName: '退货数据', description: '退货处理记录' },
      { name: 'finance', displayName: '财务数据', description: '财务相关数据' },
      { name: 'audit_logs', displayName: '审计日志', description: '系统操作记录' }
    ];

    for (const dataSource of allDataSources) {
      if (await this.checkDataAccess(userId, dataSource.name, 'VIEW')) {
        accessibleSources.push({
          ...dataSource,
          availableOperations: await this.getAvailableOperations(userId, dataSource.name),
          fields: await this.getAccessibleFields(userId, dataSource.name)
        });
      }
    }

    return accessibleSources;
  }

  // 数据脱敏处理
  sanitizeData(data: any, userPermissions: string[], dataSource: string): any {
    if (!data) return data;

    const rules = this.sanitizationRules.get(dataSource) || [];
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeItem(item, userPermissions, rules));
    } else {
      return this.sanitizeItem(data, userPermissions, rules);
    }
  }

  // 脱敏单个数据项
  private sanitizeItem(item: any, userPermissions: string[], rules: DataSanitizationRule[]): any {
    const sanitized = { ...item };

    rules.forEach(rule => {
      if (rule.condition(userPermissions) && sanitized[rule.field] !== undefined) {
        switch (rule.action) {
          case 'hide':
            delete sanitized[rule.field];
            break;
          case 'mask':
            sanitized[rule.field] = this.maskValue(sanitized[rule.field]);
            break;
          case 'encrypt':
            sanitized[rule.field] = this.encryptValue(sanitized[rule.field]);
            break;
        }
      }
    });

    return sanitized;
  }

  // 掩码处理
  private maskValue(value: any): string {
    if (typeof value !== 'string') {
      value = String(value);
    }

    if (value.includes('@')) {
      // 邮箱掩码
      const [username, domain] = value.split('@');
      const maskedUsername = username.length > 2 
        ? username.substring(0, 2) + '*'.repeat(username.length - 2)
        : '*'.repeat(username.length);
      return `${maskedUsername}@${domain}`;
    } else if (/^\d+$/.test(value)) {
      // 数字掩码（如手机号）
      return value.length > 4 
        ? value.substring(0, 3) + '*'.repeat(value.length - 6) + value.substring(value.length - 3)
        : '*'.repeat(value.length);
    } else {
      // 通用掩码
      return value.length > 2 
        ? value.substring(0, 1) + '*'.repeat(value.length - 2) + value.substring(value.length - 1)
        : '*'.repeat(value.length);
    }
  }

  // 加密处理
  private encryptValue(value: any): string {
    // 简单的加密示例，实际应用中应使用更安全的加密方法
    return Buffer.from(String(value)).toString('base64');
  }

  // 获取用户权限
  private async getUserPermissions(userId: string): Promise<string[]> {
    // 这里应该从数据库或缓存中获取用户权限
    // 简化示例
    return ['VIEW_BASIC_DATA', 'VIEW_OWN_DATA'];
  }

  // 检查规则条件
  private async checkRuleConditions(rule: DataAccessRule, userId: string, dataSource: string): Promise<boolean> {
    if (!rule.conditions) return true;

    // 检查过期时间
    if (rule.expiresAt && rule.expiresAt < new Date()) {
      return false;
    }

    // 检查租户范围
    if (rule.conditions.tenantScope) {
      // 实现租户范围检查逻辑
      return true;
    }

    // 检查部门范围
    if (rule.conditions.departmentScope) {
      // 实现部门范围检查逻辑
      return true;
    }

    // 检查facility范围
    if (rule.conditions.facilityScope) {
      // 实现facility范围检查逻辑
      return true;
    }

    // 检查只能访问自己的数据
    if (rule.conditions.ownDataOnly) {
      // 实现自有数据检查逻辑
      return true;
    }

    return true;
  }

  // 获取可用操作
  private async getAvailableOperations(userId: string, dataSource: string): Promise<string[]> {
    const operations = ['VIEW'];
    
    if (await this.checkDataAccess(userId, dataSource, 'CREATE')) {
      operations.push('CREATE');
    }
    if (await this.checkDataAccess(userId, dataSource, 'UPDATE')) {
      operations.push('UPDATE');
    }
    if (await this.checkDataAccess(userId, dataSource, 'DELETE')) {
      operations.push('DELETE');
    }
    if (await this.checkDataAccess(userId, dataSource, 'EXPORT')) {
      operations.push('EXPORT');
    }

    return operations;
  }

  // 获取可访问字段
  private async getAccessibleFields(userId: string, dataSource: string): Promise<string[]> {
    const userPermissions = await this.getUserPermissions(userId);
    const allFields = this.getDataSourceFields(dataSource);
    const rules = this.sanitizationRules.get(dataSource) || [];

    return allFields.filter(field => {
      const rule = rules.find(r => r.field === field);
      return !rule || !rule.condition(userPermissions) || rule.action !== 'hide';
    });
  }

  // 获取数据源字段
  private getDataSourceFields(dataSource: string): string[] {
    const fieldMappings: { [key: string]: string[] } = {
      'users': ['id', 'username', 'email', 'phone', 'role', 'status', 'createdAt', 'updatedAt'],
      'roles': ['id', 'name', 'description', 'permissions', 'status', 'createdAt'],
      'orders': ['id', 'orderNumber', 'customerId', 'status', 'totalAmount', 'createdAt'],
      'inventory': ['id', 'productId', 'warehouseId', 'quantity', 'reservedQuantity', 'updatedAt'],
      'shipments': ['id', 'orderId', 'trackingNumber', 'status', 'shippedAt', 'deliveredAt'],
      'returns': ['id', 'orderId', 'reason', 'status', 'requestedAt', 'processedAt'],
      'finance': ['id', 'transactionId', 'amount', 'type', 'status', 'createdAt'],
      'audit_logs': ['id', 'userId', 'action', 'resource', 'timestamp', 'details']
    };

    return fieldMappings[dataSource] || ['id', 'name', 'createdAt'];
  }

  // 添加访问规则
  private addAccessRule(dataSource: string, rule: Omit<DataAccessRule, 'userId'> & { userId: string }) {
    if (!this.accessRules.has(dataSource)) {
      this.accessRules.set(dataSource, []);
    }
    this.accessRules.get(dataSource)!.push(rule as DataAccessRule);
  }

  // 添加脱敏规则
  private addSanitizationRule(dataSource: string, rules: DataSanitizationRule[]) {
    this.sanitizationRules.set(dataSource, rules);
  }

  // 动态添加权限规则（管理员功能）
  async addUserAccessRule(adminUserId: string, rule: DataAccessRule): Promise<void> {
    // 检查管理员权限
    const adminPermissions = await this.getUserPermissions(adminUserId);
    if (!adminPermissions.includes('MANAGE_DATA_PERMISSIONS')) {
      throw new Error('Insufficient permissions to manage data access rules');
    }

    this.addAccessRule(rule.dataSource, rule);
  }

  // 检查用户facility权限
  async checkFacilityAccess(userId: string, facilityId: string): Promise<boolean> {
    try {
      // 这里应该从数据库获取用户的facility权限
      // 简化示例，实际应该查询用户账号的accessibleFacilityIds
      return true;
    } catch (error) {
      console.error('Facility access check failed:', error);
      return false;
    }
  }

  // 获取用户可访问的facility列表
  async getUserAccessibleFacilities(userId: string): Promise<string[]> {
    try {
      // 这里应该从数据库获取用户的facility权限
      // 简化示例，实际应该查询用户账号的accessibleFacilityIds
      return [];
    } catch (error) {
      console.error('Get user facilities failed:', error);
      return [];
    }
  }

  // 移除权限规则
  async removeUserAccessRule(adminUserId: string, dataSource: string, userId: string): Promise<void> {
    const adminPermissions = await this.getUserPermissions(adminUserId);
    if (!adminPermissions.includes('MANAGE_DATA_PERMISSIONS')) {
      throw new Error('Insufficient permissions to manage data access rules');
    }

    const rules = this.accessRules.get(dataSource);
    if (rules) {
      const filteredRules = rules.filter(rule => rule.userId !== userId);
      this.accessRules.set(dataSource, filteredRules);
    }
  }
}

export default new DataPermissionService();