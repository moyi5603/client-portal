import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'zh-CN' | 'en-US';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// 翻译资源
const translations: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    // 通用
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.create': '创建',
    'common.search': '搜索',
    'common.reset': '重置',
    'common.import': '导入',
    'common.export': '导出',
    'common.copy': '复制',
    'common.selectAll': '全选',
    'common.clearAll': '清空',
    'common.copyFrom': '从...复制',
    'common.actions': '操作',
    'common.status': '状态',
    'common.type': '类型',
    'common.description': '描述',
    'common.active': '启用',
    'common.deprecated': '已废弃',
    'common.internal': '内部',
    'common.customer': '客户',
    'common.production': '生产环境',
    'common.staging': '测试环境',
    'common.all': '全部',
    
    // 导航
    'nav.systemManagement': '系统管理',
    'nav.accessControl': '访问控制',
    'nav.users': '用户',
    'nav.roles': '角色',
    'nav.permissionMatrix': '权限矩阵',
    'nav.auditLog': '操作记录',
    
    // 操作记录
    'auditLog.title': '操作记录',
    'auditLog.subtitle': '记录所有影响权限与系统配置的变更操作',
    'auditLog.refresh': '刷新',
    'auditLog.export': '导出CSV',
    'auditLog.timestamp': '时间戳',
    'auditLog.actor': '操作者',
    'auditLog.actionType': '操作类型',
    'auditLog.targetType': '目标类型',
    'auditLog.targetId': '目标ID',
    'auditLog.changes': '变更摘要',
    'auditLog.dateRange': '时间范围',
    'auditLog.actorId': '操作者ID',
    'auditLog.searchActorId': '搜索操作者ID',
    'auditLog.searchTargetId': '搜索目标ID',
    'auditLog.reset': '重置',
    'auditLog.applyFilters': '应用筛选',
    'auditLog.loadFailed': '加载操作记录失败',
    'auditLog.exportFailed': '导出失败',
    'auditLog.actorEmail': '操作者邮箱',
    'auditLog.ipAddress': 'IP地址',
    'auditLog.userAgent': '用户代理',
    'auditLog.changeDetails': '变更详情',
    'auditLog.previousValue': '变更前值',
    'auditLog.newValue': '变更后值',
    'auditLog.changesCount': '项变更',
    'auditLog.noChanges': '无变更',
    'nav.accountManagement': '账号管理',
    'nav.roleManagement': '角色管理',
    'nav.menuManagement': '菜单管理',
    'nav.permissionView': '权限查看',
    
    // 权限矩阵
    'permissionMatrix.title': '权限矩阵',
    'permissionMatrix.matrixSubtitle': '跨角色和模块的权限概览',
    'permissionMatrix.listSubtitle': '跨角色和功能的详细权限列表',
    'permissionMatrix.legend': '权限图例',
    'permissionMatrix.matrixTitle': '角色权限矩阵',
    'permissionMatrix.listTitle': '角色权限列表',
    'permissionMatrix.typeAllMenus': '按所有菜单',
    'permissionMatrix.typeAllRules': '按所有规则',
    
    // 角色管理
    'role.title': '角色管理',
    'role.create': '创建角色',
    'role.edit': '编辑角色',
    'role.createTitle': '创建角色',
    'role.editTitle': '编辑角色',
    'role.subtitle': '配置角色详情和权限',
    'role.name': '角色名称',
    'role.nameRequired': '请输入角色名称',
    'role.nameTooltip': '角色的唯一标识符（用于日志和API引用）',
    'role.namePlaceholder': '例如：客户服务代表',
    'role.id': '角色ID',
    'role.idTooltip': '系统生成的标识符（无法修改）',
    'role.idAuto': '自动生成',
    'role.description': '描述',
    'role.descriptionPlaceholder': '描述角色的用途和职责...',
    'role.type': '角色类型',
    'role.typeRequired': '请选择角色类型',
    'role.typeCustomer': '客户',
    'role.typeCustomerDesc': '仅限于客户特定数据和资源',
    'role.typeInternal': '内部',
    'role.typeInternalDesc': '适用于具有系统访问权限的组织员工',
    'role.status': '状态',
    'role.statusRequired': '请选择状态',
    'role.statusActive': '启用',
    'role.statusActiveDesc': '角色可用于分配',
    'role.statusDeprecated': '已废弃',
    'role.statusDeprecatedDesc': '不允许新分配，现有用户保留访问权限',
    'role.dataScope': '默认数据范围',
    'role.dataScopeAll': '全部数据（无限制）',
    'role.dataScopeAssigned': '客户特定（在用户设置时分配）',
    'role.environment': '环境',
    'role.environmentRequired': '请选择环境',
    'role.environmentProd': '生产环境',
    'role.environmentStaging': '测试环境',
    'role.permissions': '权限配置',
    'role.roleDetails': '角色详情',
    'role.module': '模块',
    'role.modules': '模块',
    'role.users': '用户数',
    'role.lastModified': '最后修改',
    'role.modifiedBy': '由',
    'role.system': '系统',
    'role.feature': '功能',
    'role.saveChanges': '保存更改',
    'role.duplicate': '复制',
    'role.deleteConfirm': '确定要删除这个角色吗？',
    'role.deleteSuccess': '删除成功',
    'role.deleteFailed': '删除失败',
    'role.createSuccess': '创建成功',
    'role.updateSuccess': '更新成功',
    'role.saveFailed': '保存失败',
    'role.copySuccess': '角色复制成功',
    'role.copyFailed': '复制失败',
    'role.loadFailed': '加载角色列表失败',
    'role.loadDetailFailed': '加载角色详情失败',
    
    // 过滤器
    'filter.allModules': '所有模块',
    'filter.allTypes': '所有类型',
    'filter.searchPlaceholder': '搜索角色名称',
    
    // 模块
    'module.KPI': 'KPI仪表板',
    'module.INBOUND': '入库管理',
    'module.INVENTORY': '库存管理',
    'module.OUTBOUND': '出库管理',
    'module.RETURNS': '退货管理',
    'module.FINANCE': '财务管理',
    'module.SUPPLY_CHAIN': '供应链管理',
    'module.ADMIN': '系统管理',
    
    // 操作
    'operation.VIEW': '查看',
    'operation.CREATE': '创建',
    'operation.EDIT': '编辑',
    'operation.DELETE': '删除',
    'operation.APPROVE': '审批',
    'operation.EXPORT': '导出',
    
    // 页面功能
    'page.dashboard-view': '仪表板视图',
    'page.performance-metrics': '绩效指标',
    'page.custom-reports': '自定义报表',
    'page.receiving': '收货管理',
    'page.put-away': '上架管理',
    'page.inbound-orders': '入库订单',
    'page.inventory-status': '库存状态',
    'page.sn-lookup': '序列号查询',
    'page.cycle-count': '循环盘点',
    'page.order-list': '订单列表',
    'page.order-details': '订单详情',
    'page.order-fulfillment': '订单履约',
    'page.returns-processing': '退货处理',
    'page.returns-list': '退货列表',
    'page.invoice-list': '发票列表',
    'page.financial-reports': '财务报表',
    'page.supplier-management': '供应商管理',
    'page.purchase-orders': '采购订单',
    'page.user-management': '用户管理',
    'page.role-management': '角色管理',
    'page.system-settings': '系统设置',
    
    // 工具提示
    'tooltip.dashboard-view': '查看KPI仪表板和指标',
    'tooltip.performance-metrics': '查看绩效指标',
    'tooltip.custom-reports': '创建和查看自定义报表',
    'tooltip.receiving': '管理入库收货',
    'tooltip.put-away': '管理上架操作',
    'tooltip.inbound-orders': '查看和管理入库订单',
    'tooltip.inventory-status': '查看当前库存水平',
    'tooltip.sn-lookup': '按序列号搜索',
    'tooltip.cycle-count': '执行循环盘点',
    'tooltip.order-list': '查看和管理出库订单',
    'tooltip.order-details': '查看详细订单信息',
    'tooltip.order-fulfillment': '处理订单履约',
    'tooltip.returns-processing': '处理退货',
    'tooltip.returns-list': '查看退货列表',
    'tooltip.invoice-list': '查看发票',
    'tooltip.financial-reports': '查看财务报表',
    'tooltip.supplier-management': '管理供应商',
    'tooltip.purchase-orders': '管理采购订单',
    'tooltip.user-management': '管理用户',
    'tooltip.role-management': '管理角色',
    'tooltip.system-settings': '配置系统设置',
    
    // 分页
    'pagination.showing': '显示第 {start} 到 {end} 条，共 {total} 条角色',
  },
  'en-US': {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.reset': 'Reset',
    'common.import': 'Import',
    'common.export': 'Export',
    'common.copy': 'Copy',
    'common.selectAll': 'Select All',
    'common.clearAll': 'Clear All',
    'common.copyFrom': 'Copy From...',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.type': 'Type',
    'common.description': 'Description',
    'common.active': 'Active',
    'common.deprecated': 'Deprecated',
    'common.internal': 'Internal',
    'common.customer': 'Customer',
    'common.production': 'Production',
    'common.staging': 'Staging',
    'common.all': 'All',
    
    // Navigation
    'nav.systemManagement': 'System Management',
    'nav.accessControl': 'Access Control',
    'nav.users': 'Users',
    'nav.roles': 'Roles',
    'nav.permissionMatrix': 'Permission Matrix',
    'nav.auditLog': 'Operation Log',
    
    // Operation Log
    'auditLog.title': 'Operation Log',
    'auditLog.subtitle': 'Record all changes affecting permissions and system configuration',
    'auditLog.refresh': 'Refresh',
    'auditLog.export': 'Export CSV',
    'auditLog.timestamp': 'Timestamp',
    'auditLog.actor': 'Actor',
    'auditLog.actionType': 'Action Type',
    'auditLog.targetType': 'Target Type',
    'auditLog.targetId': 'Target ID',
    'auditLog.changes': 'Changes Summary',
    'auditLog.dateRange': 'Date Range',
    'auditLog.actorId': 'Actor ID',
    'auditLog.searchActorId': 'Search actor ID',
    'auditLog.searchTargetId': 'Search target ID',
    'auditLog.reset': 'Reset',
    'auditLog.applyFilters': 'Apply Filters',
    'auditLog.loadFailed': 'Failed to load operation logs',
    'auditLog.exportFailed': 'Export failed',
    'auditLog.actorEmail': 'Actor Email',
    'auditLog.ipAddress': 'IP Address',
    'auditLog.userAgent': 'User Agent',
    'auditLog.changeDetails': 'Change Details',
    'auditLog.previousValue': 'Previous Value',
    'auditLog.newValue': 'New Value',
    'auditLog.changesCount': 'changes',
    'auditLog.noChanges': 'No changes',
    'nav.accountManagement': 'Account Management',
    'nav.roleManagement': 'Role Management',
    'nav.menuManagement': 'Menu Management',
    'nav.permissionView': 'Permission View',
    
    // Permission Matrix
    'permissionMatrix.title': 'Permission Matrix',
    'permissionMatrix.matrixSubtitle': 'Overview of permissions across roles and modules',
    'permissionMatrix.listSubtitle': 'Detailed permission list across roles and features',
    'permissionMatrix.legend': 'Permission Legend',
    'permissionMatrix.matrixTitle': 'Role Permission Matrix',
    'permissionMatrix.listTitle': 'Role Permission List',
    'permissionMatrix.typeAllMenus': 'All Menus',
    'permissionMatrix.typeAllRules': 'All Rules',
    
    // Role Management
    'role.title': 'Role Management',
    'role.create': 'Create Role',
    'role.edit': 'Edit Role',
    'role.createTitle': 'Create Role',
    'role.editTitle': 'Edit Role',
    'role.subtitle': 'Configure role details and permissions',
    'role.name': 'Role Name',
    'role.nameRequired': 'Please enter role name',
    'role.nameTooltip': 'Unique identifier for the role (used in logs and API references)',
    'role.namePlaceholder': 'e.g., Customer Service Representative',
    'role.id': 'Role ID',
    'role.idTooltip': 'System-generated identifier (cannot be modified)',
    'role.idAuto': 'Auto-generated',
    'role.description': 'Description',
    'role.descriptionPlaceholder': 'Describe the role\'s purpose and responsibilities...',
    'role.type': 'Role Type',
    'role.typeRequired': 'Please select role type',
    'role.typeCustomer': 'Customer',
    'role.typeCustomerDesc': 'Limited to customer-specific data and resources',
    'role.typeInternal': 'Internal',
    'role.typeInternalDesc': 'For organization employees with system access',
    'role.status': 'Status',
    'role.statusRequired': 'Please select status',
    'role.statusActive': 'Active',
    'role.statusActiveDesc': 'Role is available for assignment',
    'role.statusDeprecated': 'Deprecated',
    'role.statusDeprecatedDesc': 'No new assignments, existing users retain access',
    'role.dataScope': 'Default Data Scope',
    'role.dataScopeAll': 'All data (no restrictions)',
    'role.dataScopeAssigned': 'Customer-specific (Assigned during user setup)',
    'role.environment': 'Environment',
    'role.environmentRequired': 'Please select environment',
    'role.environmentProd': 'Production',
    'role.environmentStaging': 'Staging',
    'role.permissions': 'Permission Configuration',
    'role.roleDetails': 'Role Details',
    'role.module': 'Module',
    'role.modules': 'Modules',
    'role.users': 'Users',
    'role.lastModified': 'Last Modified',
    'role.modifiedBy': 'by',
    'role.system': 'System',
    'role.feature': 'Feature',
    'role.saveChanges': 'Save Changes',
    'role.duplicate': 'Duplicate',
    'role.deleteConfirm': 'Are you sure you want to delete this role?',
    'role.deleteSuccess': 'Deleted successfully',
    'role.deleteFailed': 'Delete failed',
    'role.createSuccess': 'Created successfully',
    'role.updateSuccess': 'Updated successfully',
    'role.saveFailed': 'Save failed',
    'role.copySuccess': 'Role duplicated successfully',
    'role.copyFailed': 'Duplicate failed',
    'role.loadFailed': 'Failed to load role list',
    'role.loadDetailFailed': 'Failed to load role details',
    
    // Filters
    'filter.allModules': 'All Modules',
    'filter.allTypes': 'All Types',
    'filter.searchPlaceholder': 'Search by role name',
    
    // Modules
    'module.KPI': 'KPI Dashboard',
    'module.INBOUND': 'Inbound',
    'module.INVENTORY': 'Inventory',
    'module.OUTBOUND': 'Outbound',
    'module.RETURNS': 'Returns',
    'module.FINANCE': 'Finance',
    'module.SUPPLY_CHAIN': 'Supply Chain',
    'module.ADMIN': 'Admin',
    
    // Operations
    'operation.VIEW': 'View',
    'operation.CREATE': 'Create',
    'operation.EDIT': 'Edit',
    'operation.DELETE': 'Delete',
    'operation.APPROVE': 'Approve',
    'operation.EXPORT': 'Export',
    
    // Page Features
    'page.dashboard-view': 'Dashboard View',
    'page.performance-metrics': 'Performance Metrics',
    'page.custom-reports': 'Custom Reports',
    'page.receiving': 'Receiving',
    'page.put-away': 'Put Away',
    'page.inbound-orders': 'Inbound Orders',
    'page.inventory-status': 'Inventory Status',
    'page.sn-lookup': 'SN Lookup',
    'page.cycle-count': 'Cycle Count',
    'page.order-list': 'Order List',
    'page.order-details': 'Order Details',
    'page.order-fulfillment': 'Order Fulfillment',
    'page.returns-processing': 'Returns Processing',
    'page.returns-list': 'Returns List',
    'page.invoice-list': 'Invoice List',
    'page.financial-reports': 'Financial Reports',
    'page.supplier-management': 'Supplier Management',
    'page.purchase-orders': 'Purchase Orders',
    'page.user-management': 'User Management',
    'page.role-management': 'Role Management',
    'page.system-settings': 'System Settings',
    
    // Tooltips
    'tooltip.dashboard-view': 'View KPI dashboard and metrics',
    'tooltip.performance-metrics': 'View performance metrics',
    'tooltip.custom-reports': 'Create and view custom reports',
    'tooltip.receiving': 'Manage inbound receiving',
    'tooltip.put-away': 'Manage put away operations',
    'tooltip.inbound-orders': 'View and manage inbound orders',
    'tooltip.inventory-status': 'View current inventory levels',
    'tooltip.sn-lookup': 'Search by serial number',
    'tooltip.cycle-count': 'Perform cycle counting',
    'tooltip.order-list': 'View and manage outbound orders',
    'tooltip.order-details': 'View detailed order information',
    'tooltip.order-fulfillment': 'Process order fulfillment',
    'tooltip.returns-processing': 'Handle returns',
    'tooltip.returns-list': 'View returns list',
    'tooltip.invoice-list': 'View invoices',
    'tooltip.financial-reports': 'View financial reports',
    'tooltip.supplier-management': 'Manage suppliers',
    'tooltip.purchase-orders': 'Manage purchase orders',
    'tooltip.user-management': 'Manage users',
    'tooltip.role-management': 'Manage roles',
    'tooltip.system-settings': 'Configure system settings',
    
    // Pagination
    'pagination.showing': 'Showing {start} to {end} of {total} roles',
  }
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale');
    return (saved as Locale) || 'zh-CN';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[locale][key] || key;
    
    // 替换参数
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      });
    }
    
    return text;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
};

