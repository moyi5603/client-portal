import { v4 as uuidv4 } from 'uuid';
import dataPermissionService from './dataPermissionService';

interface UserPage {
  id: string;
  userId: string;
  name: string;
  description?: string;
  pageType: 'list' | 'form' | 'detail' | 'dashboard' | 'custom';
  config: PageConfig;
  componentCode: string;
  styleCode: string;
  configCode: string;
  apiCalls: string[];
  dependencies: string[];
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface PageConfig {
  entity: string;
  operations: string[];
  fields: string[];
  layout: string;
  theme?: string;
  dataSources: string[];
  calculations?: CalculationConfig[];
  filters?: FilterConfig[];
}

interface CalculationConfig {
  id: string;
  name: string;
  type: 'sum' | 'avg' | 'count' | 'percentage' | 'comparison';
  field: string;
  groupBy?: string[];
  filter?: any;
}

interface FilterConfig {
  field: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: any[];
  defaultValue?: any;
}

interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  config: PageConfig;
  componentCode: string;
  styleCode: string;
  configCode: string;
  changeDescription?: string;
  createdBy: string;
  createdAt: Date;
}

interface PersonalMenuItem {
  id: string;
  userId: string;
  pageId: string;
  menuName: string;
  menuIcon?: string;
  menuOrder: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class UserPageService {
  private pages: Map<string, UserPage> = new Map();
  private versions: Map<string, PageVersion[]> = new Map();
  private personalMenus: Map<string, PersonalMenuItem[]> = new Map();
  private readonly MAX_PAGES_PER_USER = 10;
  private readonly MAX_VERSIONS_PER_PAGE = 20;

  // 创建用户页面
  async createUserPage(
    userId: string,
    pageData: {
      name: string;
      description?: string;
      pageType: 'list' | 'form' | 'detail' | 'dashboard' | 'custom';
      config: PageConfig;
      componentCode: string;
      styleCode: string;
      configCode: string;
      apiCalls: string[];
      dependencies: string[];
    }
  ): Promise<UserPage> {
    // 检查用户页面数量限制
    const userPages = this.getUserPages(userId);
    if (userPages.length >= this.MAX_PAGES_PER_USER) {
      throw new Error(`用户最多只能创建${this.MAX_PAGES_PER_USER}个页面`);
    }

    // 验证数据权限
    await this.validateDataPermissions(userId, pageData.config.dataSources);

    // 验证页面配置
    this.validatePageConfig(pageData.config);

    const pageId = uuidv4();
    const now = new Date();

    const userPage: UserPage = {
      id: pageId,
      userId,
      name: pageData.name,
      description: pageData.description,
      pageType: pageData.pageType,
      config: pageData.config,
      componentCode: pageData.componentCode,
      styleCode: pageData.styleCode,
      configCode: pageData.configCode,
      apiCalls: pageData.apiCalls,
      dependencies: pageData.dependencies,
      status: 'draft',
      version: 1,
      createdAt: now,
      updatedAt: now
    };

    this.pages.set(pageId, userPage);

    // 创建初始版本
    await this.createPageVersion(pageId, userPage, userId, '初始版本');

    return userPage;
  }

  // 更新用户页面
  async updateUserPage(
    pageId: string,
    userId: string,
    updates: Partial<UserPage>,
    changeDescription?: string
  ): Promise<UserPage> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error('页面不存在');
    }

    if (page.userId !== userId) {
      throw new Error('无权限修改此页面');
    }

    // 如果更新了数据源，需要重新验证权限
    if (updates.config?.dataSources) {
      await this.validateDataPermissions(userId, updates.config.dataSources);
    }

    // 如果更新了配置，需要验证
    if (updates.config) {
      this.validatePageConfig(updates.config);
    }

    const updatedPage: UserPage = {
      ...page,
      ...updates,
      updatedAt: new Date(),
      version: page.version + 1
    };

    this.pages.set(pageId, updatedPage);

    // 创建新版本
    if (updates.config || updates.componentCode || updates.styleCode || updates.configCode) {
      await this.createPageVersion(pageId, updatedPage, userId, changeDescription);
    }

    return updatedPage;
  }

  // 发布页面
  async publishPage(pageId: string, userId: string): Promise<UserPage> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error('页面不存在');
    }

    if (page.userId !== userId) {
      throw new Error('无权限发布此页面');
    }

    // 发布前检查
    await this.prePublishCheck(page);

    const publishedPage: UserPage = {
      ...page,
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date()
    };

    this.pages.set(pageId, publishedPage);

    // 自动添加到个人菜单
    await this.addToPersonalMenu(userId, pageId, {
      menuName: page.name,
      menuIcon: this.getDefaultIcon(page.pageType),
      menuOrder: await this.getNextMenuOrder(userId)
    });

    return publishedPage;
  }

  // 取消发布页面
  async unpublishPage(pageId: string, userId: string): Promise<UserPage> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error('页面不存在');
    }

    if (page.userId !== userId) {
      throw new Error('无权限取消发布此页面');
    }

    const unpublishedPage: UserPage = {
      ...page,
      status: 'draft',
      publishedAt: undefined,
      updatedAt: new Date()
    };

    this.pages.set(pageId, unpublishedPage);

    // 从个人菜单中移除
    await this.removeFromPersonalMenu(userId, pageId);

    return unpublishedPage;
  }

  // 删除页面
  async deletePage(pageId: string, userId: string): Promise<void> {
    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error('页面不存在');
    }

    if (page.userId !== userId) {
      throw new Error('无权限删除此页面');
    }

    // 删除页面
    this.pages.delete(pageId);

    // 删除版本历史
    this.versions.delete(pageId);

    // 从个人菜单中移除
    await this.removeFromPersonalMenu(userId, pageId);
  }

  // 获取用户页面列表
  getUserPages(
    userId: string,
    options?: {
      status?: 'draft' | 'published' | 'archived';
      pageType?: string;
      page?: number;
      pageSize?: number;
    }
  ): UserPage[] {
    let userPages = Array.from(this.pages.values()).filter(page => page.userId === userId);

    // 状态筛选
    if (options?.status) {
      userPages = userPages.filter(page => page.status === options.status);
    }

    // 类型筛选
    if (options?.pageType) {
      userPages = userPages.filter(page => page.pageType === options.pageType);
    }

    // 排序
    userPages.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // 分页
    if (options?.page && options?.pageSize) {
      const start = (options.page - 1) * options.pageSize;
      const end = start + options.pageSize;
      userPages = userPages.slice(start, end);
    }

    return userPages;
  }

  // 获取页面详情
  getPageById(pageId: string, userId: string): UserPage | null {
    const page = this.pages.get(pageId);
    if (!page || page.userId !== userId) {
      return null;
    }
    return page;
  }

  // 版本管理

  // 创建页面版本
  private async createPageVersion(
    pageId: string,
    page: UserPage,
    userId: string,
    changeDescription?: string
  ): Promise<PageVersion> {
    const versions = this.versions.get(pageId) || [];
    
    // 限制版本数量
    if (versions.length >= this.MAX_VERSIONS_PER_PAGE) {
      versions.shift(); // 删除最旧的版本
    }

    const version: PageVersion = {
      id: uuidv4(),
      pageId,
      versionNumber: page.version,
      config: { ...page.config },
      componentCode: page.componentCode,
      styleCode: page.styleCode,
      configCode: page.configCode,
      changeDescription,
      createdBy: userId,
      createdAt: new Date()
    };

    versions.push(version);
    this.versions.set(pageId, versions);

    return version;
  }

  // 获取版本历史
  getVersionHistory(pageId: string, userId: string): PageVersion[] {
    const page = this.pages.get(pageId);
    if (!page || page.userId !== userId) {
      return [];
    }

    return this.versions.get(pageId) || [];
  }

  // 回滚到指定版本
  async rollbackToVersion(pageId: string, versionId: string, userId: string): Promise<UserPage> {
    const page = this.pages.get(pageId);
    if (!page || page.userId !== userId) {
      throw new Error('页面不存在或无权限');
    }

    const versions = this.versions.get(pageId) || [];
    const targetVersion = versions.find(v => v.id === versionId);
    if (!targetVersion) {
      throw new Error('版本不存在');
    }

    const rolledBackPage: UserPage = {
      ...page,
      config: { ...targetVersion.config },
      componentCode: targetVersion.componentCode,
      styleCode: targetVersion.styleCode,
      configCode: targetVersion.configCode,
      version: page.version + 1,
      updatedAt: new Date()
    };

    this.pages.set(pageId, rolledBackPage);

    // 创建回滚版本记录
    await this.createPageVersion(
      pageId,
      rolledBackPage,
      userId,
      `回滚到版本 ${targetVersion.versionNumber}`
    );

    return rolledBackPage;
  }

  // 个人菜单管理

  // 添加到个人菜单
  async addToPersonalMenu(
    userId: string,
    pageId: string,
    menuConfig: {
      menuName: string;
      menuIcon?: string;
      menuOrder?: number;
    }
  ): Promise<PersonalMenuItem> {
    const userMenus = this.personalMenus.get(userId) || [];
    
    // 检查是否已存在
    const existing = userMenus.find(menu => menu.pageId === pageId);
    if (existing) {
      throw new Error('页面已在个人菜单中');
    }

    const menuItem: PersonalMenuItem = {
      id: uuidv4(),
      userId,
      pageId,
      menuName: menuConfig.menuName,
      menuIcon: menuConfig.menuIcon,
      menuOrder: menuConfig.menuOrder || await this.getNextMenuOrder(userId),
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    userMenus.push(menuItem);
    this.personalMenus.set(userId, userMenus);

    return menuItem;
  }

  // 更新菜单项
  async updateMenuItem(
    userId: string,
    pageId: string,
    updates: Partial<PersonalMenuItem>
  ): Promise<PersonalMenuItem> {
    const userMenus = this.personalMenus.get(userId) || [];
    const menuIndex = userMenus.findIndex(menu => menu.pageId === pageId);
    
    if (menuIndex === -1) {
      throw new Error('菜单项不存在');
    }

    const updatedMenuItem: PersonalMenuItem = {
      ...userMenus[menuIndex],
      ...updates,
      updatedAt: new Date()
    };

    userMenus[menuIndex] = updatedMenuItem;
    this.personalMenus.set(userId, userMenus);

    return updatedMenuItem;
  }

  // 从个人菜单移除
  async removeFromPersonalMenu(userId: string, pageId: string): Promise<void> {
    const userMenus = this.personalMenus.get(userId) || [];
    const filteredMenus = userMenus.filter(menu => menu.pageId !== pageId);
    this.personalMenus.set(userId, filteredMenus);
  }

  // 菜单排序
  async reorderMenuItems(userId: string, menuOrder: string[]): Promise<void> {
    const userMenus = this.personalMenus.get(userId) || [];
    
    menuOrder.forEach((pageId, index) => {
      const menu = userMenus.find(m => m.pageId === pageId);
      if (menu) {
        menu.menuOrder = index;
        menu.updatedAt = new Date();
      }
    });

    this.personalMenus.set(userId, userMenus);
  }

  // 获取个人菜单
  getPersonalMenu(userId: string): PersonalMenuItem[] {
    const userMenus = this.personalMenus.get(userId) || [];
    return userMenus
      .filter(menu => menu.isVisible)
      .sort((a, b) => a.menuOrder - b.menuOrder);
  }

  // 私有辅助方法

  // 验证数据权限
  private async validateDataPermissions(userId: string, dataSources: string[]): Promise<void> {
    for (const dataSource of dataSources) {
      const hasAccess = await dataPermissionService.checkDataAccess(userId, dataSource, 'VIEW');
      if (!hasAccess) {
        throw new Error(`无权限访问数据源: ${dataSource}`);
      }
    }
  }

  // 验证页面配置
  private validatePageConfig(config: PageConfig): void {
    if (!config.entity) {
      throw new Error('页面实体不能为空');
    }

    if (!config.operations || config.operations.length === 0) {
      throw new Error('页面操作不能为空');
    }

    if (!config.fields || config.fields.length === 0) {
      throw new Error('页面字段不能为空');
    }

    if (!config.dataSources || config.dataSources.length === 0) {
      throw new Error('数据源不能为空');
    }
  }

  // 发布前检查
  private async prePublishCheck(page: UserPage): Promise<void> {
    // 检查必要字段
    if (!page.name || !page.componentCode) {
      throw new Error('页面名称和组件代码不能为空');
    }

    // 检查数据权限
    await this.validateDataPermissions(page.userId, page.config.dataSources);

    // 检查代码语法（简化检查）
    if (page.componentCode.includes('undefined') || page.componentCode.includes('null')) {
      console.warn('页面代码可能包含未定义的变量');
    }
  }

  // 获取默认图标
  private getDefaultIcon(pageType: string): string {
    const iconMap: { [key: string]: string } = {
      'list': 'table',
      'form': 'form',
      'detail': 'file-text',
      'dashboard': 'dashboard',
      'custom': 'setting'
    };
    return iconMap[pageType] || 'file';
  }

  // 获取下一个菜单排序号
  private async getNextMenuOrder(userId: string): Promise<number> {
    const userMenus = this.personalMenus.get(userId) || [];
    const maxOrder = userMenus.reduce((max, menu) => Math.max(max, menu.menuOrder), 0);
    return maxOrder + 1;
  }

  // 获取页面统计信息
  getPageStatistics(userId: string): {
    totalPages: number;
    publishedPages: number;
    draftPages: number;
    pagesByType: { [key: string]: number };
  } {
    const userPages = this.getUserPages(userId);
    
    const statistics = {
      totalPages: userPages.length,
      publishedPages: userPages.filter(p => p.status === 'published').length,
      draftPages: userPages.filter(p => p.status === 'draft').length,
      pagesByType: {} as { [key: string]: number }
    };

    userPages.forEach(page => {
      statistics.pagesByType[page.pageType] = (statistics.pagesByType[page.pageType] || 0) + 1;
    });

    return statistics;
  }
}

export default new UserPageService();