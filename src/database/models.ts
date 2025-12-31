import { 
  Account, Role, Customer, Menu, FunctionPermission, 
  AccountType, AccountStatus, RoleType, DataPermissionType,
  User, IdpGroupMapping, Warehouse, Region, UserStatus, RoleStatus, Environment
} from '../types';

// 内存数据库（实际项目中应使用真实数据库）
class Database {
  // 账号数据（兼容旧代码）
  accounts: Map<string, Account> = new Map();
  
  // 用户数据（新设计）
  users: Map<string, User> = new Map();
  usersByIdpUserId: Map<string, string> = new Map(); // idpUserId -> userId 映射
  
  // 角色数据
  roles: Map<string, Role> = new Map();
  
  // Customer数据（由Central系统管理，这里仅做示例）
  customers: Map<string, Customer> = new Map();
  
  // Warehouse数据
  warehouses: Map<string, Warehouse> = new Map();
  
  // Region数据
  regions: Map<string, Region> = new Map();
  
  // 菜单数据（系统预定义）
  menus: Map<string, Menu> = new Map();
  
  // 功能权限数据
  functionPermissions: Map<string, FunctionPermission> = new Map();
  
  // IdP组映射
  idpMappings: Map<string, IdpGroupMapping> = new Map();
  
  // 账号密码映射（实际应使用加密存储）
  accountPasswords: Map<string, string> = new Map();

  constructor() {
    this.initDefaultData();
  }

  // 初始化默认数据
  initDefaultData() {
    // 初始化默认菜单
    const defaultMenus: Menu[] = [
      { id: 'menu-1', name: '订单管理', code: 'order', path: '/order', order: 1 },
      { id: 'menu-2', name: '库存管理', code: 'inventory', path: '/inventory', order: 2 },
      { id: 'menu-3', name: '运输管理', code: 'transport', path: '/transport', order: 3 },
      { id: 'menu-4', name: '账号管理', code: 'account', path: '/account', order: 4 },
      { id: 'menu-5', name: '角色管理', code: 'role', path: '/role', order: 5 },
      { id: 'menu-6', name: '权限管理', code: 'permission', path: '/permission', order: 6 },
    ];

    defaultMenus.forEach(menu => {
      this.menus.set(menu.id, menu);
    });

    // 初始化默认功能权限
    const defaultFunctions: FunctionPermission[] = [
      { id: 'func-1', name: '查看订单', code: 'order:view', menuId: 'menu-1', action: 'view' },
      { id: 'func-2', name: '创建订单', code: 'order:create', menuId: 'menu-1', action: 'create' },
      { id: 'func-3', name: '编辑订单', code: 'order:update', menuId: 'menu-1', action: 'update' },
      { id: 'func-4', name: '删除订单', code: 'order:delete', menuId: 'menu-1', action: 'delete' },
      { id: 'func-5', name: '查看库存', code: 'inventory:view', menuId: 'menu-2', action: 'view' },
      { id: 'func-6', name: '编辑库存', code: 'inventory:update', menuId: 'menu-2', action: 'update' },
    ];

    defaultFunctions.forEach(func => {
      this.functionPermissions.set(func.id, func);
    });

    // 初始化示例Customer（实际由Central系统管理）
    const defaultCustomers: Customer[] = [
      { id: 'customer-1', name: '客户A', code: 'CUST-A', description: '客户A描述', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'customer-2', name: '客户B', code: 'CUST-B', description: '客户B描述', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    defaultCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
  }

  // 账号操作
  createAccount(account: Account, password: string): void {
    this.accounts.set(account.id, account);
    this.accountPasswords.set(account.id, password);
  }

  getAccount(id: string): Account | undefined {
    return this.accounts.get(id);
  }

  getAccountByUsername(username: string, tenantId: string): Account | undefined {
    return Array.from(this.accounts.values()).find(
      acc => acc.username === username && acc.tenantId === tenantId
    );
  }

  updateAccount(id: string, updates: Partial<Account>): boolean {
    const account = this.accounts.get(id);
    if (!account) return false;
    this.accounts.set(id, { ...account, ...updates, updatedAt: new Date().toISOString() });
    return true;
  }

  deleteAccount(id: string): boolean {
    this.accountPasswords.delete(id);
    return this.accounts.delete(id);
  }

  getAllAccounts(tenantId: string): Account[] {
    return Array.from(this.accounts.values()).filter(acc => acc.tenantId === tenantId);
  }

  verifyPassword(accountId: string, password: string): boolean {
    const storedPassword = this.accountPasswords.get(accountId);
    return storedPassword === password; // 实际应使用bcrypt验证
  }

  // 角色操作
  createRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  getRole(id: string): Role | undefined {
    return this.roles.get(id);
  }

  getAllRoles(tenantId?: string): Role[] {
    const roles = Array.from(this.roles.values());
    // 如果指定了tenantId，可以过滤（这里简化处理）
    return roles;
  }

  updateRole(id: string, updates: Partial<Role>): boolean {
    const role = this.roles.get(id);
    if (!role) return false;
    this.roles.set(id, { ...role, ...updates, updatedAt: new Date().toISOString() });
    return true;
  }

  deleteRole(id: string): boolean {
    return this.roles.delete(id);
  }

  // Customer操作
  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  getAllCustomers(tenantId?: string): Customer[] {
    return Array.from(this.customers.values());
  }

  // 菜单操作
  getAllMenus(): Menu[] {
    return Array.from(this.menus.values()).sort((a, b) => a.order - b.order);
  }

  getMenu(id: string): Menu | undefined {
    return this.menus.get(id);
  }

  // 功能权限操作
  getAllFunctionPermissions(): FunctionPermission[] {
    return Array.from(this.functionPermissions.values());
  }

  getFunctionPermission(id: string): FunctionPermission | undefined {
    return this.functionPermissions.get(id);
  }

  // ========== User操作（新设计） ==========
  createUser(user: User): void {
    this.users.set(user.id, user);
    this.usersByIdpUserId.set(user.idpUserId, user.id);
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByIdpUserId(idpUserId: string, idpSource: string): User | undefined {
    const userId = this.usersByIdpUserId.get(idpUserId);
    if (!userId) return undefined;
    const user = this.users.get(userId);
    if (user && user.idpSource === idpSource) {
      return user;
    }
    return undefined;
  }

  updateUser(id: string, updates: Partial<User>): boolean {
    const user = this.users.get(id);
    if (!user) return false;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return true;
  }

  deleteUser(id: string): boolean {
    const user = this.users.get(id);
    if (user) {
      this.usersByIdpUserId.delete(user.idpUserId);
    }
    return this.users.delete(id);
  }

  getAllUsers(tenantId?: string): User[] {
    const users = Array.from(this.users.values());
    if (tenantId) {
      return users.filter(u => u.tenantId === tenantId);
    }
    return users;
  }

  // ========== IdP映射操作 ==========
  createIdpMapping(mapping: IdpGroupMapping): void {
    this.idpMappings.set(mapping.id, mapping);
  }

  getIdpMapping(id: string): IdpGroupMapping | undefined {
    return this.idpMappings.get(id);
  }

  getAllIdpMappings(): IdpGroupMapping[] {
    return Array.from(this.idpMappings.values());
  }

  getIdpMappingsByGroup(idpSource: string, groupClaim: string): IdpGroupMapping[] {
    return Array.from(this.idpMappings.values()).filter(
      m => m.idpSource === idpSource && m.groupClaim === groupClaim && m.status === 'ACTIVE'
    );
  }

  updateIdpMapping(id: string, updates: Partial<IdpGroupMapping>): boolean {
    const mapping = this.idpMappings.get(id);
    if (!mapping) return false;
    this.idpMappings.set(id, { ...mapping, ...updates, updatedAt: new Date().toISOString() });
    return true;
  }

  deleteIdpMapping(id: string): boolean {
    return this.idpMappings.delete(id);
  }

  // ========== Warehouse操作 ==========
  createWarehouse(warehouse: Warehouse): void {
    this.warehouses.set(warehouse.id, warehouse);
  }

  getWarehouse(id: string): Warehouse | undefined {
    return this.warehouses.get(id);
  }

  getAllWarehouses(customerId?: string): Warehouse[] {
    const warehouses = Array.from(this.warehouses.values());
    if (customerId) {
      return warehouses.filter(w => w.customerId === customerId);
    }
    return warehouses;
  }

  // ========== Region操作 ==========
  createRegion(region: Region): void {
    this.regions.set(region.id, region);
  }

  getRegion(id: string): Region | undefined {
    return this.regions.get(id);
  }

  getAllRegions(): Region[] {
    return Array.from(this.regions.values());
  }
}

export const db = new Database();

