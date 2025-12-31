import { AuditLog, ActionType, TargetType, ChangeDetail, TokenPayload } from '../types';
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
    previousValue?: any,
    newValue?: any,
    changes?: ChangeDetail[],
    ipAddress?: string,
    userAgent?: string,
    timestamp?: string
  ): void {
    const log: AuditLog = {
      id: generateId(),
      timestamp: timestamp || new Date().toISOString(),
      actor: {
        userId: actor.accountId,
        username: actor.username,
        email: '', // 可以从用户信息中获取
        idpSource: actor.accountType as any
      },
      actionType,
      targetType,
      targetId,
      previousValue,
      newValue,
      changes,
      ipAddress,
      userAgent,
      tenantId: actor.tenantId
    };

    this.logs.push(log);
    console.log('[Audit]', actionType, targetType, targetId, 'by', actor.username);
  }

  /**
   * 查询审计日志
   */
  query(filters: {
    startDate?: string;
    endDate?: string;
    actionType?: ActionType;
    targetType?: TargetType;
    targetId?: string;
    actorId?: string;
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

    if (filters.targetId) {
      result = result.filter(log => log.targetId === filters.targetId);
    }

    if (filters.actorId) {
      result = result.filter(log => log.actor.userId === filters.actorId);
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

    if (!previous && current) {
      // 新增
      Object.keys(current).forEach(key => {
        changes.push({
          field: key,
          oldValue: undefined,
          newValue: current[key],
          changeType: 'ADDED'
        });
      });
    } else if (previous && !current) {
      // 删除
      Object.keys(previous).forEach(key => {
        changes.push({
          field: key,
          oldValue: previous[key],
          newValue: undefined,
          changeType: 'REMOVED'
        });
      });
    } else if (previous && current) {
      // 修改
      const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);
      allKeys.forEach(key => {
        const oldVal = previous[key];
        const newVal = current[key];

        if (oldVal !== newVal) {
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

