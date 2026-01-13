# 编辑器管理功能设计文档

## 1. 系统架构概览

基于现有实现，编辑器管理功能采用以下架构：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面层     │    │   AI对话引擎     │    │   数据服务层     │
│                │    │                │    │                │
│ - ChatInterface │◄──►│ ConversationAgent│◄──►│ APIDiscovery   │
│ - PagePreview   │    │ - 意图识别      │    │ - 数据权限校验  │
│ - PageDesigner  │    │ - 需求解析      │    │ - API自动发现   │
└─────────────────┘    │ - 上下文管理    │    │ - 数据计算组合  │
                       └─────────────────┘    └─────────────────┘
                                ▲                       ▲
                                │                       │
                                ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  页面生成引擎    │    │   发布管理层     │    │   菜单存储层     │
│                │    │                │    │                │
│ - PageGenerator │    │ - 版本控制      │    │ - 个人菜单管理  │
│ - 模板引擎      │    │ - 权限控制      │    │ - 页面持久化    │
│ - 代码生成      │    │ - 发布流程      │    │ - 存储限制管理  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2. 核心功能模块设计

### 2.1 AI对话引擎增强

#### 当前实现状态
✅ 基础对话框架已实现
✅ 意图识别基础逻辑
✅ 实体和操作提取
✅ 对话上下文管理

#### 需要增强的功能

**智能需求解析**
```typescript
interface RequirementAnalyzer {
  // 深度需求分析
  analyzeRequirement(message: string, context: ConversationContext): Promise<{
    dataRequirements: DataRequirement[];
    uiRequirements: UIRequirement[];
    businessLogic: BusinessRule[];
    missingInfo: string[];
  }>;
  
  // 需求澄清
  generateClarificationQuestions(analysis: any): string[];
  
  // 可行性验证
  validateFeasibility(requirements: any, userPermissions: string[]): ValidationResult;
}
```

**多轮对话优化**
```typescript
interface ConversationFlow {
  // 对话状态管理
  currentState: 'initial' | 'requirement_gathering' | 'design_confirmation' | 'generation' | 'refinement';
  
  // 智能追问
  generateFollowUpQuestions(currentRequirements: any): string[];
  
  // 上下文记忆
  maintainContext(sessionId: string, maxTurns: number): void;
}
```

### 2.2 数据服务层扩展

#### 当前实现状态
✅ API自动发现框架
✅ 基础权限校验概念

#### 需要实现的功能

**数据权限管理**
```typescript
interface DataPermissionService {
  // 检查用户数据访问权限
  checkDataAccess(userId: string, dataSource: string, operation: string): Promise<boolean>;
  
  // 获取用户可访问的数据源
  getAccessibleDataSources(userId: string): Promise<DataSource[]>;
  
  // 数据脱敏处理
  sanitizeData(data: any, userPermissions: string[]): any;
}
```

**数据计算引擎**
```typescript
interface DataCalculationEngine {
  // 内置计算函数
  sum(data: any[], field: string): number;
  average(data: any[], field: string): number;
  percentage(part: number, total: number): number;
  compareWithPrevious(current: any[], previous: any[], field: string): ComparisonResult;
  
  // 多数据源关联
  joinDataSources(sources: DataSource[], joinConditions: JoinCondition[]): Promise<any[]>;
  
  // 结果缓存
  cacheResult(key: string, result: any, ttl: number): void;
  getCachedResult(key: string): any | null;
}
```

### 2.3 页面生成引擎优化

#### 当前实现状态
✅ 基础模板系统
✅ 代码生成框架
✅ 组件、样式、配置生成

#### 需要增强的功能

**组件库扩展**
```typescript
interface ComponentLibrary {
  // 数据展示组件
  dataCard: ComponentTemplate;
  chartComponents: {
    lineChart: ComponentTemplate;
    barChart: ComponentTemplate;
    pieChart: ComponentTemplate;
    areaChart: ComponentTemplate;
  };
  
  // 交互组件
  filterPanel: ComponentTemplate;
  searchBox: ComponentTemplate;
  dateRangePicker: ComponentTemplate;
  
  // 布局组件
  gridLayout: ComponentTemplate;
  cardLayout: ComponentTemplate;
  dashboardLayout: ComponentTemplate;
}
```

**响应式布局生成**
```typescript
interface ResponsiveLayoutGenerator {
  // 自适应布局生成
  generateResponsiveLayout(components: Component[], screenSizes: ScreenSize[]): LayoutConfig;
  
  // 移动端优化
  optimizeForMobile(layout: LayoutConfig): LayoutConfig;
  
  // 布局预览
  generateLayoutPreview(layout: LayoutConfig): PreviewData;
}
```

### 2.4 可视化编辑器

#### 新增功能模块

**拖拽编辑器**
```typescript
interface DragDropEditor {
  // 组件拖拽
  enableComponentDrag(componentLibrary: Component[]): void;
  
  // 布局调整
  adjustLayout(dragEvent: DragEvent): void;
  
  // 实时预览
  updatePreview(changes: LayoutChange[]): void;
  
  // 撤销重做
  undo(): void;
  redo(): void;
  getHistory(): EditHistory[];
}
```

**属性编辑面板**
```typescript
interface PropertyPanel {
  // 组件属性编辑
  editComponentProps(component: Component): PropertyEditor;
  
  // 样式编辑
  editStyles(component: Component): StyleEditor;
  
  // 数据绑定
  bindData(component: Component, dataSource: DataSource): void;
  
  // 事件绑定
  bindEvents(component: Component, events: EventHandler[]): void;
}
```

### 2.5 发布管理系统

#### 需要实现的功能

**版本控制**
```typescript
interface VersionControl {
  // 保存版本
  saveVersion(pageId: string, config: PageConfig, userId: string): Promise<Version>;
  
  // 版本比较
  compareVersions(versionA: string, versionB: string): VersionDiff;
  
  // 版本回滚
  rollbackToVersion(pageId: string, versionId: string): Promise<void>;
  
  // 版本历史
  getVersionHistory(pageId: string): Promise<Version[]>;
}
```

**发布流程**
```typescript
interface PublishService {
  // 发布前检查
  prePublishCheck(pageConfig: PageConfig): Promise<CheckResult>;
  
  // 发布页面
  publishPage(pageId: string, userId: string): Promise<PublishedPage>;
  
  // 取消发布
  unpublishPage(pageId: string, userId: string): Promise<void>;
  
  // 发布状态管理
  getPublishStatus(pageId: string): PublishStatus;
}
```

### 2.6 个人菜单管理

#### 需要实现的功能

**菜单集成**
```typescript
interface PersonalMenuService {
  // 添加到个人菜单
  addToPersonalMenu(userId: string, pageId: string, menuConfig: MenuConfig): Promise<void>;
  
  // 菜单排序
  reorderMenuItems(userId: string, menuOrder: string[]): Promise<void>;
  
  // 菜单管理
  updateMenuItem(userId: string, pageId: string, updates: MenuItemUpdate): Promise<void>;
  removeMenuItem(userId: string, pageId: string): Promise<void>;
  
  // 获取个人菜单
  getPersonalMenu(userId: string): Promise<MenuItem[]>;
}
```

## 3. 数据库设计

### 3.1 用户页面表
```sql
CREATE TABLE user_pages (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  page_type ENUM('list', 'form', 'detail', 'dashboard', 'custom') NOT NULL,
  config JSON NOT NULL,
  component_code TEXT NOT NULL,
  style_code TEXT NOT NULL,
  config_code TEXT NOT NULL,
  api_calls JSON,
  dependencies JSON,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### 3.2 页面版本表
```sql
CREATE TABLE page_versions (
  id VARCHAR(36) PRIMARY KEY,
  page_id VARCHAR(36) NOT NULL,
  version_number INT NOT NULL,
  config JSON NOT NULL,
  component_code TEXT NOT NULL,
  style_code TEXT NOT NULL,
  config_code TEXT NOT NULL,
  change_description TEXT,
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (page_id) REFERENCES user_pages(id) ON DELETE CASCADE,
  UNIQUE KEY uk_page_version (page_id, version_number)
);
```

### 3.3 个人菜单表
```sql
CREATE TABLE personal_menus (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  page_id VARCHAR(36) NOT NULL,
  menu_name VARCHAR(255) NOT NULL,
  menu_icon VARCHAR(100),
  menu_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (page_id) REFERENCES user_pages(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_page (user_id, page_id),
  INDEX idx_user_order (user_id, menu_order)
);
```

### 3.4 对话会话表
```sql
CREATE TABLE conversation_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  context JSON,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_user_session (user_id, session_id),
  INDEX idx_last_activity (last_activity)
);
```

## 4. API接口设计

### 4.1 用户页面管理API

```typescript
// 保存页面
POST /api/user-pages
{
  name: string;
  description?: string;
  config: PageConfig;
  componentCode: string;
  styleCode: string;
  configCode: string;
  apiCalls: string[];
  dependencies: string[];
}

// 获取用户页面列表
GET /api/user-pages?page=1&pageSize=10&status=published

// 获取页面详情
GET /api/user-pages/:id

// 更新页面
PUT /api/user-pages/:id

// 删除页面
DELETE /api/user-pages/:id

// 发布页面
POST /api/user-pages/:id/publish

// 取消发布
POST /api/user-pages/:id/unpublish
```

### 4.2 版本管理API

```typescript
// 获取版本历史
GET /api/user-pages/:id/versions

// 创建新版本
POST /api/user-pages/:id/versions

// 回滚到指定版本
POST /api/user-pages/:id/rollback/:versionId

// 比较版本
GET /api/user-pages/:id/versions/compare?from=v1&to=v2
```

### 4.3 个人菜单API

```typescript
// 获取个人菜单
GET /api/personal-menu

// 添加到个人菜单
POST /api/personal-menu
{
  pageId: string;
  menuName: string;
  menuIcon?: string;
  menuOrder?: number;
}

// 更新菜单项
PUT /api/personal-menu/:pageId

// 删除菜单项
DELETE /api/personal-menu/:pageId

// 菜单排序
PUT /api/personal-menu/reorder
{
  menuOrder: string[];
}
```

## 5. 前端组件设计

### 5.1 增强的页面设计器组件

```typescript
interface EnhancedPageDesigner {
  // 左侧：对话界面 + 组件库
  leftPanel: {
    chatInterface: ChatInterface;
    componentLibrary: ComponentLibrary;
    templateGallery: TemplateGallery;
  };
  
  // 中间：可视化编辑器
  centerPanel: {
    dragDropCanvas: DragDropCanvas;
    componentTree: ComponentTree;
    previewTabs: PreviewTabs;
  };
  
  // 右侧：属性编辑面板
  rightPanel: {
    propertyEditor: PropertyEditor;
    styleEditor: StyleEditor;
    dataBindingPanel: DataBindingPanel;
  };
  
  // 底部：代码编辑器
  bottomPanel: {
    codeEditor: CodeEditor;
    consoleOutput: ConsoleOutput;
  };
}
```

### 5.2 页面管理界面

```typescript
interface PageManagement {
  // 页面列表
  pageList: {
    searchFilter: SearchFilter;
    pageGrid: PageGrid;
    pagination: Pagination;
  };
  
  // 页面详情
  pageDetail: {
    basicInfo: PageBasicInfo;
    versionHistory: VersionHistory;
    publishStatus: PublishStatus;
    menuSettings: MenuSettings;
  };
}
```

## 6. 实施计划

### Phase 1: 核心功能完善 (2周)
- [ ] 完善AI对话引擎的需求解析能力
- [ ] 实现数据权限校验系统
- [ ] 扩展页面生成器的组件库
- [ ] 实现基础的拖拽编辑功能

### Phase 2: 发布管理系统 (1.5周)
- [ ] 实现版本控制系统
- [ ] 开发发布流程管理
- [ ] 实现个人菜单集成
- [ ] 添加页面预览优化

### Phase 3: 高级功能 (2周)
- [ ] 实现可视化编辑器
- [ ] 添加属性编辑面板
- [ ] 实现数据计算引擎
- [ ] 优化响应式布局生成

### Phase 4: 用户体验优化 (1周)
- [ ] 界面交互优化
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 用户指导和帮助系统

## 7. 技术选型建议

### 前端技术栈
- **拖拽编辑**: `react-dnd` 或 `@dnd-kit/core`
- **代码编辑**: `@monaco-editor/react`
- **图表组件**: `recharts` 或 `antv/g2plot`
- **布局系统**: `react-grid-layout`

### 后端技术栈
- **AI能力**: 集成OpenAI API或本地部署的开源模型
- **代码生成**: 模板引擎 + AST操作
- **版本控制**: Git-like版本管理或数据库版本控制

### 数据存储
- **页面配置**: JSON格式存储在MySQL
- **代码文件**: 可选择文件系统或对象存储
- **缓存**: Redis用于计算结果缓存

这个设计基于现有的实现进行了全面的扩展和优化，保持了架构的一致性，同时添加了PRD中要求的所有核心功能。