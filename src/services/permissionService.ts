import { User, Role, Permission, Module, Operation } from '../types';
import { db } from '../database/models';

class PermissionService {
  /**
   * 计算用户的有效权限
   */
  computeEffectivePermissions(user: User, roles: Role[]): Permission[] {
    const permissionMap = new Map<string, Permission>();

    // 合并所有角色的权限
    roles.forEach(role => {
      role.permissions.forEach(perm => {
        const key = `${perm.module}:${perm.pageCode}`;
        const existing = permissionMap.get(key);

        if (existing) {
          // 合并操作权限（并集）
          const mergedOps = [...new Set([...existing.operations, ...perm.operations])];
          permissionMap.set(key, {
            ...existing,
            operations: mergedOps,
            // 合并数据范围（交集）
            dataScope: this.mergeDataScope(existing.dataScope, perm.dataScope)
          });
        } else {
          permissionMap.set(key, { ...perm });
        }
      });
    });

    // 应用用户数据范围限制
    const effectivePermissions = Array.from(permissionMap.values()).map(perm => {
      if (perm.dataScope) {
        return {
          ...perm,
          dataScope: this.applyUserDataScope(perm.dataScope, user)
        };
      }
      return perm;
    });

    return effectivePermissions;
  }

  /**
   * 合并数据范围
   */
  private mergeDataScope(scope1?: Permission['dataScope'], scope2?: Permission['dataScope']): Permission['dataScope'] {
    if (!scope1 && !scope2) return undefined;
    if (!scope1) return scope2;
    if (!scope2) return scope1;

    return {
      customers: this.intersectArrays(scope1.customers, scope2.customers),
      warehouses: this.intersectArrays(scope1.warehouses, scope2.warehouses),
      regions: this.intersectArrays(scope1.regions, scope2.regions)
    };
  }

  /**
   * 应用用户数据范围限制
   */
  private applyUserDataScope(permissionScope: Permission['dataScope'], user: User): Permission['dataScope'] {
    if (!permissionScope) return undefined;

    return {
      customers: this.intersectArrays(permissionScope.customers, user.customers),
      warehouses: this.intersectArrays(permissionScope.warehouses, user.warehouses),
      regions: this.intersectArrays(permissionScope.regions, user.regions)
    };
  }

  /**
   * 数组交集
   */
  private intersectArrays(arr1?: string[], arr2?: string[]): string[] | undefined {
    if (!arr1 && !arr2) return undefined;
    if (!arr1) return arr2;
    if (!arr2) return arr1;

    const set2 = new Set(arr2);
    const intersection = arr1.filter(item => set2.has(item));
    return intersection.length > 0 ? intersection : undefined;
  }

  /**
   * 生成人类可读的权限摘要
   */
  generateAccessSummary(permissions: Permission[]): string {
    const summaries: string[] = [];

    // 按模块分组
    const byModule = new Map<Module, Permission[]>();
    permissions.forEach(perm => {
      if (!byModule.has(perm.module)) {
        byModule.set(perm.module, []);
      }
      byModule.get(perm.module)!.push(perm);
    });

    byModule.forEach((perms, module) => {
      const moduleSummary: string[] = [];
      perms.forEach(perm => {
        const ops = perm.operations.join(', ');
        const scope = this.formatDataScope(perm.dataScope);
        moduleSummary.push(`${perm.page}: ${ops}${scope ? ` (${scope})` : ''}`);
      });
      summaries.push(`${module}: ${moduleSummary.join('; ')}`);
    });

    return summaries.join('\n');
  }

  /**
   * 格式化数据范围
   */
  private formatDataScope(scope?: Permission['dataScope']): string {
    if (!scope) return '';

    const parts: string[] = [];
    if (scope.customers && scope.customers.length > 0) {
      parts.push(`Customers: ${scope.customers.length}`);
    }
    if (scope.warehouses && scope.warehouses.length > 0) {
      parts.push(`Warehouses: ${scope.warehouses.length}`);
    }
    if (scope.regions && scope.regions.length > 0) {
      parts.push(`Regions: ${scope.regions.length}`);
    }

    return parts.join(', ');
  }

  /**
   * 检查用户是否有特定权限
   */
  hasPermission(
    user: User,
    module: Module,
    pageCode: string,
    operation: Operation,
    dataScope?: { customerId?: string; warehouseId?: string; regionId?: string }
  ): boolean {
    // 获取用户的所有角色
    const allRoleIds = [...user.roleAssignments.manual, ...user.roleAssignments.idpDerived];
    const roles = allRoleIds.map(id => db.getRole(id)).filter(Boolean) as Role[];

    // 计算有效权限
    const effectivePermissions = this.computeEffectivePermissions(user, roles);

    // 查找匹配的权限
    const permission = effectivePermissions.find(
      p => p.module === module && p.pageCode === pageCode
    );

    if (!permission) return false;

    // 检查操作权限
    if (!permission.operations.includes(operation)) return false;

    // 检查数据范围（如果有指定）
    if (dataScope && permission.dataScope) {
      if (dataScope.customerId && permission.dataScope.customers) {
        if (!permission.dataScope.customers.includes(dataScope.customerId)) {
          return false;
        }
      }
      if (dataScope.warehouseId && permission.dataScope.warehouses) {
        if (!permission.dataScope.warehouses.includes(dataScope.warehouseId)) {
          return false;
        }
      }
      if (dataScope.regionId && permission.dataScope.regions) {
        if (!permission.dataScope.regions.includes(dataScope.regionId)) {
          return false;
        }
      }
    }

    return true;
  }
}

export const permissionService = new PermissionService();

