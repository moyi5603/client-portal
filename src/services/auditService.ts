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
        return `删除账号：${targetName}`;
      
      case ActionType.ROLE_CREATED:
        return this.generateRoleCreatedDescription(targetName, newValue);
      
      case ActionType.ROLE_UPDATED:
        return this.generateRoleUpdatedDescription(targetName, changes);
      
      case ActionType.ROLE_COPIED:
        return this.generateRoleCopiedDescription(previousValue, newValue);
      
      case ActionType.ROLE_DELETED:
        return `删除角色：${targetName}（${previousValue?.id || ''}）`;
      
      default:
        return `${actionType}: ${targetName}`;
    }
  }

  /**
   * 生成创建账号描述
   */
  private generateAccountCreatedDescription(username: string, accountData: Account): string {
    const accountTypeMap: Record<string, string> = {
      'MAIN': '主账号',
      'CUSTOMER': '客户子账号',
      'PARTNER': 'Partner账号'
    };

    const statusMap: Record<string, string> = {
      'ACTIVE': '启用',
      'INACTIVE': '禁用',
      'SUSPENDED': '暂停'
    };

    const accountType = accountTypeMap[accountData.accountType] || accountData.accountType;
    const status = statusMap[accountData.status] || accountData.status;
    const phone = accountData.phone || '无';
    
    // 处理Customer信息
    const customerIds = accountData.customerIds || accountData.accessibleCustomerIds || [];
    const customers = customerIds.length > 0 ? customerIds.join('、') : '无';
    
    // 处理角色信息
    const roles = accountData.roles && accountData.roles.length > 0 ? accountData.roles.join('、') : '无';

    return `创建账号：${username}\n账号类型：${accountType}\n邮箱：${accountData.email}\n手机号：${phone}\n状态：${status}\n可访问customer：${customers}\n角色：${roles}`;
  }

  /**
   * 生成编辑账号描述
   */
  private generateAccountUpdatedDescription(username: string, changes?: ChangeDetail[]): string {
    if (!changes || changes.length === 0) {
      return `编辑账号：${username}`;
    }

    const fieldMap: Record<string, string> = {
      'email': '邮箱',
      'phone': '手机号',
      'status': '状态',
      'customerIds': '可访问customer',
      'accessibleCustomerIds': '可访问customer',
      'roles': '角色'
    };

    const statusMap: Record<string, string> = {
      'ACTIVE': '启用',
      'INACTIVE': '禁用',
      'SUSPENDED': '暂停'
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
        oldValue = oldValue.join('、') || '无';
      }
      if (Array.isArray(newValue)) {
        newValue = newValue.join('、') || '无';
      }

      return `修改<${fieldName}>由<${oldValue}>改为<${newValue}>`;
    });

    return `编辑账号：\n${changeDescriptions.join('\n')}`;
  }

  /**
   * 生成创建角色描述
   */
  private generateRoleCreatedDescription(roleName: string, roleData: Role): string {
    const statusMap: Record<string, string> = {
      'ACTIVE': '启用',
      'DEPRECATED': '已废弃'
    };

    const status = statusMap[roleData.status] || roleData.status;
    const description = roleData.description || '无';
    
    // 处理权限配置
    const permissionConfig = this.formatPermissions(roleData.permissions);

    return `创建角色：${roleName}（${roleData.id}）\n描述：${description}\n状态：${status}\n权限配置：\n${permissionConfig}`;
  }

  /**
   * 生成编辑角色描述
   */
  private generateRoleUpdatedDescription(roleName: string, changes?: ChangeDetail[]): string {
    if (!changes || changes.length === 0) {
      return `编辑角色：${roleName}`;
    }

    const fieldMap: Record<string, string> = {
      'name': '角色名称',
      'description': '描述',
      'status': '状态',
      'permissions': '权限配置'
    };

    const statusMap: Record<string, string> = {
      'ACTIVE': '启用',
      'DEPRECATED': '已废弃'
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
        changeDescriptions.push(`修改<${fieldName}>由<${oldValue}>改为<${newValue}>`);
      }
      // 特殊处理权限字段
      else if (change.field === 'permissions') {
        const permissionChanges = this.analyzePermissionChanges(oldValue, newValue);
        changeDescriptions.push(...permissionChanges);
      }
      // 其他字段
      else {
        changeDescriptions.push(`修改<${fieldName}>由<${oldValue}>改为<${newValue}>`);
      }
    });

    return `编辑角色：\n${changeDescriptions.join('\n')}`;
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
        
        const oldOpsText = oldOps.length > 0 ? this.formatOperations(oldOps) : '无';
        const newOpsText = newOps.length > 0 ? this.formatOperations(newOps) : '无';
        
        changes.push(`修改<权限配置>${moduleName}-${pageName}由<${oldOpsText}>改为<${newOpsText}>`);
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
      'VIEW': '查看',
      'CREATE': '创建',
      'EDIT': '编辑',
      'DELETE': '删除',
      'EXPORT': '导出',
      'APPROVE': '审批',
      'CANCEL': 'Cancel',
      'IMPORT': '导入',
      'PRINT_PACKING_SLIP': '打印装箱单',
      'DOWNLOAD_PDF': '下载PDF',
      'DOWNLOAD_TEMPLATE': '下载模板',
      'DOWNLOAD': '下载',
      'HOLD_INVENTORY': '冻结库存',
      'RELEASE_INVENTORY': '释放库存',
      'ADD_ATTACHMENT': '添加附件',
      'SET_ALERT': '设置提醒',
      'SET_DEFAULT': '设为默认',
      'RELOAD': '重新加载',
      'IMPORT_RMA': '导入RMA',
      'BATCH_IMPORT': '批量导入',
      'RESET_FIELDS': '重置字段',
      'PAY': '支付',
      'INVOICE_DETAIL': '发票详情'
    };

    return operations.map(op => operationMap[op] || op).join('、');
  }

  /**
   * 生成复制角色描述
   */
  private generateRoleCopiedDescription(sourceRole: Role, newRole: Role): string {
    return `复制角色：${sourceRole.name}（${sourceRole.id}），创建角色：${newRole.name}（${newRole.id}）`;
  }

  /**
   * 格式化权限配置
   */
  private formatPermissions(permissions: any[]): string {
    if (!permissions || permissions.length === 0) {
      return '无';
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
      'VIEW': '查看',
      'CREATE': '创建',
      'EDIT': '编辑',
      'DELETE': '删除',
      'EXPORT': '导出',
      'APPROVE': '审批'
    };

    const permissionStrings = permissions.map(perm => {
      const moduleName = moduleMap[perm.module] || perm.module;
      const operations = perm.operations.map((op: string) => operationMap[op] || op).join('、');
      return `${moduleName}-${perm.page}（${operations}）`;
    });

    // 每3个权限配置换一行，避免单行过长
    const lines: string[] = [];
    for (let i = 0; i < permissionStrings.length; i += 3) {
      lines.push(permissionStrings.slice(i, i + 3).join('、'));
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

