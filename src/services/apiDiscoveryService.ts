import { Router } from 'express';
import fs from 'fs';
import path from 'path';

interface APIMetadata {
  endpoint: string;
  method: string;
  description: string;
  parameters: any;
  responseSchema: any;
  requiredPermissions: string[];
  category: string;
  examples: any[];
}

class APIDiscoveryService {
  private apiMetadata: Map<string, APIMetadata> = new Map();

  constructor() {
    this.scanRoutes();
  }

  // 扫描路由文件，自动发现API
  private scanRoutes() {
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesDir);

    routeFiles.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        this.extractAPIFromFile(path.join(routesDir, file));
      }
    });
  }

  // 从路由文件中提取API信息
  private extractAPIFromFile(filePath: string) {
    // 这里可以使用AST解析或者注释解析来提取API信息
    // 简化示例：假设我们有标准的注释格式
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 解析注释中的API文档
    const apiMatches = content.match(/\/\*\*[\s\S]*?\*\//g);
    
    if (apiMatches) {
      apiMatches.forEach(comment => {
        const apiInfo = this.parseAPIComment(comment);
        if (apiInfo) {
          this.apiMetadata.set(apiInfo.endpoint, apiInfo);
        }
      });
    }
  }

  // 解析API注释
  private parseAPIComment(comment: string): APIMetadata | null {
    // 解析JSDoc风格的注释
    const endpointMatch = comment.match(/@endpoint\s+(\S+)/);
    const methodMatch = comment.match(/@method\s+(\S+)/);
    const descMatch = comment.match(/@description\s+(.+)/);
    
    if (endpointMatch && methodMatch) {
      return {
        endpoint: endpointMatch[1],
        method: methodMatch[1],
        description: descMatch ? descMatch[1] : '',
        parameters: this.extractParameters(comment),
        responseSchema: this.extractResponseSchema(comment),
        requiredPermissions: this.extractPermissions(comment),
        category: this.extractCategory(comment),
        examples: this.extractExamples(comment)
      };
    }
    
    return null;
  }

  // 根据用户需求搜索匹配的API
  public searchAPIs(userIntent: string, keywords: string[]): APIMetadata[] {
    const results: APIMetadata[] = [];
    
    this.apiMetadata.forEach(api => {
      let score = 0;
      
      // 关键词匹配
      keywords.forEach(keyword => {
        if (api.description.toLowerCase().includes(keyword.toLowerCase())) {
          score += 2;
        }
        if (api.endpoint.toLowerCase().includes(keyword.toLowerCase())) {
          score += 3;
        }
        if (api.category.toLowerCase().includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      
      if (score > 0) {
        results.push(api);
      }
    });
    
    return results.sort((a, b) => this.calculateRelevance(b, userIntent) - this.calculateRelevance(a, userIntent));
  }

  private calculateRelevance(api: APIMetadata, intent: string): number {
    // 计算API与用户意图的相关性
    let score = 0;
    const intentLower = intent.toLowerCase();
    
    if (api.description.toLowerCase().includes(intentLower)) score += 3;
    if (api.endpoint.toLowerCase().includes(intentLower)) score += 2;
    if (api.category.toLowerCase().includes(intentLower)) score += 1;
    
    return score;
  }

  private extractParameters(comment: string): any {
    // 提取参数信息
    const paramMatches = comment.match(/@param\s+\{([^}]+)\}\s+(\w+)\s+(.+)/g);
    const params: any = {};
    
    if (paramMatches) {
      paramMatches.forEach(match => {
        const parts = match.match(/@param\s+\{([^}]+)\}\s+(\w+)\s+(.+)/);
        if (parts) {
          params[parts[2]] = {
            type: parts[1],
            description: parts[3],
            required: !parts[1].includes('?')
          };
        }
      });
    }
    
    return params;
  }

  private extractResponseSchema(comment: string): any {
    // 提取响应结构
    const responseMatch = comment.match(/@returns\s+\{([^}]+)\}\s+(.+)/);
    return responseMatch ? {
      type: responseMatch[1],
      description: responseMatch[2]
    } : {};
  }

  private extractPermissions(comment: string): string[] {
    const permMatch = comment.match(/@permissions\s+(.+)/);
    return permMatch ? permMatch[1].split(',').map(p => p.trim()) : [];
  }

  private extractCategory(comment: string): string {
    const catMatch = comment.match(/@category\s+(.+)/);
    return catMatch ? catMatch[1] : 'general';
  }

  private extractExamples(comment: string): any[] {
    const exampleMatches = comment.match(/@example\s+([\s\S]*?)(?=@|\*\/)/g);
    return exampleMatches ? exampleMatches.map(ex => ex.replace('@example', '').trim()) : [];
  }

  public getAllAPIs(): APIMetadata[] {
    return Array.from(this.apiMetadata.values());
  }

  public getAPIByEndpoint(endpoint: string): APIMetadata | undefined {
    return this.apiMetadata.get(endpoint);
  }
}

export default new APIDiscoveryService();