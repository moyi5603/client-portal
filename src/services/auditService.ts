import { AuditLog, ActionType, TargetType, ChangeDetail, TokenPayload, Account, Role, AccountType, RoleStatus } from '../types';
import { generateId } from '../utils/uuid';

class AuditService {
  private logs: AuditLog[] = [];

  /**
   * 记录审计日志
   */
  log(
    actor: TokenPayload,
    actionType: ActionType,
    targetType: TargetType,
    targetId: string,
    targetName: string,
    previousValue?: any,
    newValue?: any,
    changes?: ChangeDetail[],
    ipAddress?: string,
    userAgent?: string,
    timestamp?: string
  ): void {
    const description = this.generateDescription(actionType, targetName, previousValue, newValue, changes);
    
    const log: AuditLog = {
      id: generateId(),
      timestamp: timestamp || new Date().toISOString(),
      actor: {
        userId: actor.accountId,
        username: actor.username,
        email: '' // 可以从用户信息中获取
      },
      actionType,
      targetType,
      targetId,
      targetName,
      description,
      tenantId: actor.tenantId
    };

    this.logs.push(log);
    console.log('[Audit]', actionType, targetType, targetId, 'by', actor.username);
  }

  /**
   * 生成操作描述
   */
  private generateDescription(
    actionType: ActionType,
    targetName: string,
    previousValue?: any,
    newValue?: any,
    changes?: ChangeDetail[]
  ): string {
    switch (actionType) {
      case ActionType.ACCOUNT_CREATED:
        return this.generateAccountCreatedDescription(targetName, newValue);
      
      case ActionType.ACCOUNT_UPDATED:
        return this.generateAccountUpdatedDescription(targetName, changes);
      
      case ActionType.ACCOUNT_DELETED:
        return `Account deleted: ${targetName}`;
      
      case ActionType.ACCOUNT_PASSWORD_RESET:
        return `重置密码，账号：${targetName}`;
      
      case ActionType.ROLE_CREATED:
        return this.generateRoleCreatedDescription(targetName, newValue);
      
      case ActionType.ROLE_UPDATED:
        return this.generateRoleUpdatedDescription(targetName, changes);
      
      case ActionType.ROLE_COPIED:
        return this.generateRoleCopiedDescription(previousValue, newValue);
      
      case ActionType.ROLE_DELETED:
        return `Role deleted: ${targetName} (${previousValue?.id || ''})`;
      
      default:
        return `${actionType}: ${targetName}`;
    }
  }

  /**
   * 生成创建账号描述
   */
  private generateAccountCreatedDescription(username: string, accountData: Account): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive'
    };

    const status = statusMap[accountData.status] || accountData.status;
    const phone = accountData.phone || 'None';
    const firstName = accountData.firstName || 'None';
    const lastName = accountData.lastName || 'None';
    
    // 处理Customer信息
    const customerIds = accountData.customerIds || accountData.accessibleCustomerIds || [];
    const customers = customerIds.length > 0 ? customerIds.join(', ') : 'None';
    
    // 处理角色信息
    const roles = accountData.roles && accountData.roles.length > 0 ? accountData.roles.join(', ') : 'None';

    return `Account created: ${username}\nEmail: ${accountData.email}\nPhone: ${phone}\nFirst Name: ${firstName}\nLast Name: ${lastName}\nStatus: ${status}\nAccessible Customers: ${customers}\nRoles: ${roles}`;
  }

  /**
   * 生成编辑账号描述
   */
  private generateAccountUpdatedDescription(username: string, changes?: ChangeDetail[]): string {
    if (!changes || changes.length === 0) {
      return `Account updated: ${username}`;
    }

    const fieldMap: Record<string, string> = {
      'email': 'Email',
      'phone': 'Phone',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'status': 'Status',
      'customerIds': 'Accessible Customers',
      'accessibleCustomerIds': 'Accessible Customers',
      'roles': 'Roles'
    };

    const statusMap: Record<string, string> = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive'
    };

    const changeDescriptions = changes.map(change => {
      const fieldName = fieldMap[change.field] || change.field;
      let oldValue = change.oldValue;
      let newValue = change.newValue;

      // 特殊处理状态字段
      if (change.field === 'status') {
        oldValue = statusMap[oldValue] || oldValue;
        newValue = statusMap[newValue] || newValue;
      }

      // 特殊处理数组字段
      if (Array.isArray(oldValue)) {
        oldValue = oldValue.join(', ') || 'None';
      }
      if (Array.isArray(newValue)) {
        newValue = newValue.join(', ') || 'None';
      }

      return `Modified <${fieldName}> from <${oldValue}> to <${newValue}>`;
    });

    return `Account updated:\n${changeDescriptions.join('\n')}`;
  }

  /**
   * 生成创建角色描述
   */
  private generateRoleCreatedDescription(roleName: string, roleData: Role): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': 'Active',
      'DEPRECATED': 'Deprecated'
    };

    const status = statusMap[roleData.status] || roleData.status;
    const description = roleData.description || 'None';
    
    // 处理权限配置
    const permissionConfig = this.formatPermissions(roleData.permissions);

    return `Role created: ${roleName} (${roleData.id})\nDescription: ${description}\nStatus: ${status}\nPermission Configuration:\n${permissionConfig}`;
  }

  /**
   * 生成编辑角色描述
   */
  private generateRoleUpdatedDescription(roleName: string, changes?: ChangeDetail[]): string {
    if (!changes || changes.length === 0) {
      return `Role updated: ${roleName}`;
    }

    const fieldMap: Record<string, string> = {
      'name': 'Role Name',
      'description': 'Description',
      'status': 'Status',
      'permissions': 'Permission Configuration'
    };

    const statusMap: Record<string, string> = {
      'ACTIVE': 'Active',
      'DEPRECATED': 'Deprecated'
    };

    const changeDescriptions: string[] = [];

    changes.forEach(change => {
      const fieldName = fieldMap[change.field] || change.field;
      let oldValue = change.oldValue;
      let newValue = change.newValue;

      // 特殊处理状态字段
      if (change.field === 'status') {
        oldValue = statusMap[oldValue] || oldValue;
        newValue = statusMap[newValue] || newValue;
        changeDescriptions.push(`Modified <${fieldName}> from <${oldValue}> to <${newValue}>`);
      }
      // 特殊处理权限字段
      else if (change.field === 'permissions') {
        const permissionChanges = this.analyzePermissionChanges(oldValue, newValue);
        changeDescriptions.push(...permissionChanges);
      }
      // 其他字段
      else {
        changeDescriptions.push(`Modified <${fieldName}> from <${oldValue}> to <${newValue}>`);
      }
    });

    return `Role updated:\n${changeDescriptions.join('\n')}`;
  }

  /**
   * 分析权限配置变更
   */
  private analyzePermissionChanges(oldPermissions: any[], newPermissions: any[]): string[] {
    const changes: string[] = [];
    
    if (!oldPermissions) oldPermissions = [];
    if (!newPermissions) newPermissions = [];

    // 创建权限映射表，以 module-pageCode 为key
    const oldPermMap = new Map<string, string[]>();
    const newPermMap = new Map<string, string[]>();

    oldPermissions.forEach(perm => {
      const key = `${perm.module}-${perm.pageCode}`;
      oldPermMap.set(key, perm.operations || []);
    });

    newPermissions.forEach(perm => {
      const key = `${perm.module}-${perm.pageCode}`;
      newPermMap.set(key, perm.operations || []);
    });

    // 获取所有涉及的权限页面
    const allKeys = new Set([...oldPermMap.keys(), ...newPermMap.keys()]);

    allKeys.forEach(key => {
      const oldOps = oldPermMap.get(key) || [];
      const newOps = newPermMap.get(key) || [];
      
      // 如果操作权限有变化
      if (JSON.stringify(oldOps.sort()) !== JSON.stringify(newOps.sort())) {
        const [module, pageCode] = key.split('-');
        const moduleName = this.getModuleName(module);
        const pageName = this.getPageName(pageCode, newPermissions.find(p => p.pageCode === pageCode)?.page);
        
        const oldOpsText = oldOps.length > 0 ? this.formatOperations(oldOps) : 'None';
        const newOpsText = newOps.length > 0 ? this.formatOperations(newOps) : 'None';
        
        changes.push(`Modified <Permission Configuration> ${moduleName}-${pageName} from <${oldOpsText}> to <${newOpsText}>`);
      }
    });

    return changes;
  }

  /**
   * 获取模块名称
   */
  private getModuleName(module: string): string {
    const moduleMap: Record<string, string> = {
      'DASHBOARDS': 'Dashboards',
      'PURCHASE_MANAGEMENT': 'Purchase Management',
      'SALES_ORDER': 'Sales Order',
      'WORK_ORDER': 'Work Order',
      'INBOUND': 'Inbound',
      'INVENTORY': 'Inventory',
      'OUTBOUND': 'Outbound',
      'RETURNS': 'Returns',
      'YARD_MANAGEMENT': 'Yard Management',
      'SUPPLY_CHAIN': 'Supply Chain Mgmt',
      'FINANCE': 'Finance',
      'SYSTEM_MANAGEMENT': 'System Management',
      'PERMISSION_MANAGEMENT': 'Permission Management'
    };
    return moduleMap[module] || module;
  }

  /**
   * 获取页面名称
   */
  private getPageName(pageCode: string, pageName?: string): string {
    return pageName || pageCode;
  }

  /**
   * 格式化操作列表
   */
  private formatOperations(operations: string[]): string {
    const operationMap: Record<string, string> = {
      'VIEW': 'View',
      'CREATE': 'Create',
      'EDIT': 'Edit',
      'DELETE': 'Delete',
      'EXPORT': 'Export',
      'APPROVE': 'Approve',
      'CANCEL': 'Cancel',
      'IMPORT': 'Import',
      'PRINT_PACKING_SLIP': 'Print Packing Slip',
      'DOWNLOAD_PDF': 'Download PDF',
      'DOWNLOAD_TEMPLATE': 'Download Template',
      'DOWNLOAD': 'Download',
      'HOLD_INVENTORY': 'Hold Inventory',
      'RELEASE_INVENTORY': 'Release Inventory',
      'ADD_ATTACHMENT': 'Add Attachment',
      'SET_ALERT': 'Set Alert',
      'SET_DEFAULT': 'Set Default',
      'RELOAD': 'Reload',
      'IMPORT_RMA': 'Import RMA',
      'BATCH_IMPORT': 'Batch Import',
      'RESET_FIELDS': 'Reset Fields',
      'PAY': 'Pay',
      'INVOICE_DETAIL': 'Invoice Detail'
    };

    return operations.map(op => operationMap[op] || op).join(', ');
  }

  /**
   * 生成复制角色描述
   */
  private generateRoleCopiedDescription(sourceRole: Role, newRole: Role): string {
    return `Role copied: ${sourceRole.name} (${sourceRole.id}), created role: ${newRole.name} (${newRole.id})`;
  }

  /**
   * 格式化权限配置
   */
  private formatPermissions(permissions: any[]): string {
    if (!permissions || permissions.length === 0) {
      return 'None';
    }

    const moduleMap: Record<string, string> = {
      'DASHBOARDS': 'Dashboards',
      'PURCHASE_MANAGEMENT': 'Purchase Management',
      'SALES_ORDER': 'Sales Order',
      'WORK_ORDER': 'Work Order',
      'INBOUND': 'Inbound',
      'INVENTORY': 'Inventory',
      'OUTBOUND': 'Outbound',
      'RETURNS': 'Returns',
      'YARD_MANAGEMENT': 'Yard Management',
      'SUPPLY_CHAIN': 'Supply Chain Mgmt',
      'FINANCE': 'Finance',
      'SYSTEM_MANAGEMENT': 'System Management',
      'PERMISSION_MANAGEMENT': 'Permission Management'
    };

    const operationMap: Record<string, string> = {
      'VIEW': 'View',
      'CREATE': 'Create',
      'EDIT': 'Edit',
      'DELETE': 'Delete',
      'EXPORT': 'Export',
      'APPROVE': 'Approve'
    };

    const permissionStrings = permissions.map(perm => {
      const moduleName = moduleMap[perm.module] || perm.module;
      const operations = perm.operations.map((op: string) => operationMap[op] || op).join(', ');
      return `${moduleName}-${perm.page} (${operations})`;
    });

    // 每3个权限配置换一行，避免单行过长
    const lines: string[] = [];
    for (let i = 0; i < permissionStrings.length; i += 3) {
      lines.push(permissionStrings.slice(i, i + 3).join(', '));
    }

    return lines.join('\n');
  }

  /**
   * 查询审计日志
   */
  query(filters: {
    startDate?: string;
    endDate?: string;
    actionType?: ActionType;
    targetType?: TargetType;
    targetName?: string;
    actorName?: string;
    tenantId?: string;
  }): AuditLog[] {
    let result = [...this.logs];

    if (filters.tenantId) {
      result = result.filter(log => log.tenantId === filters.tenantId);
    }

    if (filters.startDate) {
      result = result.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      result = result.filter(log => log.timestamp <= filters.endDate!);
    }

    if (filters.actionType) {
      result = result.filter(log => log.actionType === filters.actionType);
    }

    if (filters.targetType) {
      result = result.filter(log => log.targetType === filters.targetType);
    }

    if (filters.targetName) {
      result = result.filter(log => 
        log.targetName.toLowerCase().includes(filters.targetName!.toLowerCase())
      );
    }

    if (filters.actorName) {
      result = result.filter(log => 
        log.actor.username.toLowerCase().includes(filters.actorName!.toLowerCase())
      );
    }

    // 按时间倒序排列
    return result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * 获取所有日志（用于导出）
   */
  getAll(tenantId?: string): AuditLog[] {
    if (tenantId) {
      return this.logs.filter(log => log.tenantId === tenantId);
    }
    return [...this.logs];
  }

  /**
   * 计算变更详情
   */
  computeChanges(previous: any, current: any): ChangeDetail[] {
    const changes: ChangeDetail[] = [];

    // 需要过滤的系统内部字段
    const systemFields = [
      'updatedAt',
      'createdAt', 
      'modifiedBy',
      'createdBy',
      'usageCount',
      'id',
      'tenantId'
    ];

    if (!previous && current) {
      // 新增
      Object.keys(current).forEach(key => {
        if (!systemFields.includes(key)) {
          changes.push({
            field: key,
            oldValue: undefined,
            newValue: current[key],
            changeType: 'ADDED'
          });
        }
      });
    } else if (previous && !current) {
      // 删除
      Object.keys(previous).forEach(key => {
        if (!systemFields.includes(key)) {
          changes.push({
            field: key,
            oldValue: previous[key],
            newValue: undefined,
            changeType: 'REMOVED'
          });
        }
      });
    } else if (previous && current) {
      // 修改
      const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);
      allKeys.forEach(key => {
        // 跳过系统内部字段
        if (systemFields.includes(key)) {
          return;
        }

        const oldVal = previous[key];
        const newVal = current[key];

        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          if (oldVal === undefined) {
            changes.push({
              field: key,
              oldValue: undefined,
              newValue: newVal,
              changeType: 'ADDED'
            });
          } else if (newVal === undefined) {
            changes.push({
              field: key,
              oldValue: oldVal,
              newValue: undefined,
              changeType: 'REMOVED'
            });
          } else {
            changes.push({
              field: key,
              oldValue: oldVal,
              newValue: newVal,
              changeType: 'MODIFIED'
            });
          }
        }
      });
    }

    return changes;
  }
}

export const auditService = new AuditService();

