import apiDiscoveryService from './apiDiscoveryService';

interface ConversationContext {
  userId: string;
  sessionId: string;
  currentIntent: string;
  extractedRequirements: PageRequirement[];
  selectedAPIs: string[];
  pageConfig: any;
  conversationHistory: Message[];
}

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface PageRequirement {
  type: 'list' | 'form' | 'detail' | 'dashboard' | 'custom';
  entity: string;
  operations: string[];
  filters?: string[];
  fields?: string[];
  layout?: string;
}

class ConversationAgent {
  private contexts: Map<string, ConversationContext> = new Map();

  // 处理用户消息
  async processMessage(userId: string, message: string, sessionId?: string): Promise<{
    response: string;
    suggestions?: string[];
    pagePreview?: any;
    needsConfirmation?: boolean;
    apis?: any[];
  }> {
    const context = this.getOrCreateContext(userId, sessionId);
    
    // 添加用户消息到历史
    context.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // 分析用户意图
    const intent = await this.analyzeIntent(message, context);
    context.currentIntent = intent.type;

    let response = '';
    let suggestions: string[] = [];
    let pagePreview: any = null;
    let needsConfirmation = false;
    let apis: any[] = [];

    switch (intent.type) {
      case 'create_page':
        const result = await this.handleCreatePage(intent, context);
        response = result.response;
        suggestions = result.suggestions;
        apis = result.apis;
        needsConfirmation = result.needsConfirmation;
        break;

      case 'modify_page':
        const modifyResult = await this.handleModifyPage(intent, context);
        response = modifyResult.response;
        pagePreview = modifyResult.pagePreview;
        break;

      case 'confirm_design':
        const confirmResult = await this.handleConfirmDesign(intent, context);
        response = confirmResult.response;
        pagePreview = confirmResult.pagePreview;
        break;

      case 'clarification':
        response = await this.handleClarification(intent, context);
        break;

      default:
        response = "我理解您想要创建或修改页面。请告诉我您具体需要什么功能？";
        suggestions = [
          "创建用户管理页面",
          "创建数据展示页面", 
          "创建表单页面",
          "修改现有页面"
        ];
    }

    // 添加Agent响应到历史
    context.conversationHistory.push({
      role: 'agent',
      content: response,
      timestamp: new Date(),
      metadata: { intent: intent.type, apis, suggestions }
    });

    return {
      response,
      suggestions,
      pagePreview,
      needsConfirmation,
      apis
    };
  }

  // 分析用户意图
  private async analyzeIntent(message: string, context: ConversationContext): Promise<{
    type: string;
    entities: string[];
    operations: string[];
    confidence: number;
  }> {
    const messageLower = message.toLowerCase();
    
    // 简化的意图识别逻辑（实际项目中可以使用NLP库或AI服务）
    if (messageLower.includes('创建') || messageLower.includes('新建') || messageLower.includes('create')) {
      return {
        type: 'create_page',
        entities: this.extractEntities(message),
        operations: this.extractOperations(message),
        confidence: 0.9
      };
    }
    
    if (messageLower.includes('修改') || messageLower.includes('编辑') || messageLower.includes('更新')) {
      return {
        type: 'modify_page',
        entities: this.extractEntities(message),
        operations: this.extractOperations(message),
        confidence: 0.8
      };
    }
    
    if (messageLower.includes('好的') || messageLower.includes('确认') || messageLower.includes('是的')) {
      return {
        type: 'confirm_design',
        entities: [],
        operations: [],
        confidence: 0.9
      };
    }
    
    return {
      type: 'clarification',
      entities: this.extractEntities(message),
      operations: this.extractOperations(message),
      confidence: 0.5
    };
  }

  // 提取实体（如：用户、角色、菜单等）
  private extractEntities(message: string): string[] {
    const entities: string[] = [];
    const entityKeywords = {
      'user': ['用户', '账号', 'user', 'account'],
      'role': ['角色', 'role'],
      'menu': ['菜单', 'menu'],
      'permission': ['权限', 'permission'],
      'audit': ['审计', '日志', 'log', 'audit']
    };

    Object.entries(entityKeywords).forEach(([entity, keywords]) => {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        entities.push(entity);
      }
    });

    return entities;
  }

  // 提取操作（如：列表、添加、编辑、删除等）
  private extractOperations(message: string): string[] {
    const operations: string[] = [];
    const operationKeywords = {
      'list': ['列表', '显示', '查看', 'list', 'show', 'view'],
      'create': ['添加', '新建', '创建', 'add', 'create', 'new'],
      'edit': ['编辑', '修改', '更新', 'edit', 'update', 'modify'],
      'delete': ['删除', 'delete', 'remove'],
      'search': ['搜索', '查找', 'search', 'find'],
      'filter': ['筛选', '过滤', 'filter']
    };

    Object.entries(operationKeywords).forEach(([operation, keywords]) => {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        operations.push(operation);
      }
    });

    return operations;
  }

  // 处理创建页面请求
  private async handleCreatePage(intent: any, context: ConversationContext): Promise<{
    response: string;
    suggestions: string[];
    apis: any[];
    needsConfirmation: boolean;
  }> {
    const { entities, operations } = intent;
    
    if (entities.length === 0) {
      return {
        response: "请告诉我您想要创建什么类型的页面？比如用户管理、角色管理、菜单管理等。",
        suggestions: ["用户管理页面", "角色管理页面", "菜单管理页面", "审计日志页面"],
        apis: [],
        needsConfirmation: false
      };
    }

    // 搜索相关API
    const keywords = [...entities, ...operations];
    const matchedAPIs = apiDiscoveryService.searchAPIs(context.currentIntent, keywords);
    
    // 生成页面需求
    const requirement: PageRequirement = {
      type: this.determinePageType(operations),
      entity: entities[0],
      operations: operations,
      fields: this.suggestFields(entities[0]),
      layout: 'standard'
    };

    context.extractedRequirements.push(requirement);

    const response = this.generateCreatePageResponse(requirement, matchedAPIs);
    
    return {
      response,
      suggestions: this.generateSuggestions(requirement),
      apis: matchedAPIs.slice(0, 5), // 返回前5个最相关的API
      needsConfirmation: true
    };
  }

  // 确定页面类型
  private determinePageType(operations: string[]): 'list' | 'form' | 'detail' | 'dashboard' | 'custom' {
    if (operations.includes('list') || operations.includes('search') || operations.includes('filter')) {
      return 'list';
    }
    if (operations.includes('create') || operations.includes('edit')) {
      return 'form';
    }
    if (operations.includes('view')) {
      return 'detail';
    }
    return 'custom';
  }

  // 建议字段
  private suggestFields(entity: string): string[] {
    const fieldMappings: { [key: string]: string[] } = {
      'user': ['id', 'username', 'email', 'role', 'status', 'createdAt'],
      'role': ['id', 'name', 'description', 'permissions', 'createdAt'],
      'menu': ['id', 'name', 'path', 'icon', 'parentId', 'order'],
      'permission': ['id', 'name', 'resource', 'action', 'description']
    };
    
    return fieldMappings[entity] || ['id', 'name', 'createdAt'];
  }

  // 生成创建页面的响应
  private generateCreatePageResponse(requirement: PageRequirement, apis: any[]): string {
    let response = `好的，我来帮您创建${requirement.entity}管理页面。\n\n`;
    
    response += `根据您的需求，页面将包含：\n`;
    requirement.operations.forEach(op => {
      const opNames: { [key: string]: string } = {
        'list': '数据列表显示',
        'create': '新增功能',
        'edit': '编辑功能',
        'delete': '删除功能',
        'search': '搜索功能',
        'filter': '筛选功能'
      };
      response += `- ${opNames[op] || op}\n`;
    });

    if (apis.length > 0) {
      response += `\n我发现系统有以下相关API：\n`;
      apis.slice(0, 3).forEach(api => {
        response += `- ${api.method} ${api.endpoint} - ${api.description}\n`;
      });
    }

    response += `\n这样的设计符合您的需求吗？如果需要调整，请告诉我。`;
    
    return response;
  }

  // 生成建议
  private generateSuggestions(requirement: PageRequirement): string[] {
    const suggestions = [];
    
    if (!requirement.operations.includes('search')) {
      suggestions.push("添加搜索功能");
    }
    if (!requirement.operations.includes('filter')) {
      suggestions.push("添加筛选功能");
    }
    if (!requirement.operations.includes('edit')) {
      suggestions.push("添加编辑功能");
    }
    
    suggestions.push("修改页面布局");
    suggestions.push("添加批量操作");
    
    return suggestions;
  }

  // 处理修改页面请求
  private async handleModifyPage(intent: any, context: ConversationContext): Promise<{
    response: string;
    pagePreview: any;
  }> {
    // 实现页面修改逻辑
    return {
      response: "页面修改功能正在开发中...",
      pagePreview: null
    };
  }

  // 处理确认设计
  private async handleConfirmDesign(intent: any, context: ConversationContext): Promise<{
    response: string;
    pagePreview: any;
  }> {
    if (context.extractedRequirements.length === 0) {
      return {
        response: "请先告诉我您想要创建什么页面。",
        pagePreview: null
      };
    }

    // 生成页面代码
    const pageCode = await this.generatePageCode(context.extractedRequirements[0], context);
    
    return {
      response: "好的，我已经为您生成了页面。您可以在预览窗口中查看效果。",
      pagePreview: pageCode
    };
  }

  // 处理澄清请求
  private async handleClarification(intent: any, context: ConversationContext): Promise<string> {
    return "请告诉我您想要创建什么类型的页面，以及需要哪些功能？";
  }

  // 生成页面代码
  private async generatePageCode(requirement: PageRequirement, context: ConversationContext): Promise<any> {
    // 这里会调用页面生成引擎
    return {
      component: `// Generated ${requirement.entity} management page`,
      config: requirement,
      apis: context.selectedAPIs
    };
  }

  // 获取或创建对话上下文
  private getOrCreateContext(userId: string, sessionId?: string): ConversationContext {
    const contextId = sessionId || `${userId}_default`;
    
    if (!this.contexts.has(contextId)) {
      this.contexts.set(contextId, {
        userId,
        sessionId: contextId,
        currentIntent: '',
        extractedRequirements: [],
        selectedAPIs: [],
        pageConfig: {},
        conversationHistory: []
      });
    }
    
    return this.contexts.get(contextId)!;
  }

  // 获取对话历史
  public getConversationHistory(userId: string, sessionId?: string): Message[] {
    const context = this.getOrCreateContext(userId, sessionId);
    return context.conversationHistory;
  }

  // 清除对话上下文
  public clearContext(userId: string, sessionId?: string): void {
    const contextId = sessionId || `${userId}_default`;
    this.contexts.delete(contextId);
  }
}

export default new ConversationAgent();