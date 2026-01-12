import fs from 'fs';
import path from 'path';

interface PageTemplate {
  name: string;
  type: 'list' | 'form' | 'detail' | 'dashboard';
  template: string;
  requiredProps: string[];
  supportedOperations: string[];
}

interface GeneratedPage {
  componentCode: string;
  styleCode: string;
  configCode: string;
  apiCalls: string[];
  dependencies: string[];
}

class PageGenerator {
  private templates: Map<string, PageTemplate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  // 加载页面模板
  private loadTemplates() {
    // 列表页面模板
    this.templates.set('list', {
      name: 'ListPage',
      type: 'list',
      template: this.getListTemplate(),
      requiredProps: ['entity', 'fields', 'apis'],
      supportedOperations: ['list', 'search', 'filter', 'edit', 'delete', 'create']
    });

    // 表单页面模板
    this.templates.set('form', {
      name: 'FormPage',
      type: 'form',
      template: this.getFormTemplate(),
      requiredProps: ['entity', 'fields', 'apis'],
      supportedOperations: ['create', 'edit', 'validate']
    });

    // 详情页面模板
    this.templates.set('detail', {
      name: 'DetailPage',
      type: 'detail',
      template: this.getDetailTemplate(),
      requiredProps: ['entity', 'fields', 'apis'],
      supportedOperations: ['view', 'edit']
    });
  }

  // 生成页面代码
  public generatePage(config: {
    type: 'list' | 'form' | 'detail' | 'dashboard';
    entity: string;
    operations: string[];
    fields: string[];
    apis: any[];
    layout?: string;
    theme?: string;
  }): GeneratedPage {
    const template = this.templates.get(config.type);
    if (!template) {
      throw new Error(`Template not found for type: ${config.type}`);
    }

    // 生成组件代码
    const componentCode = this.generateComponentCode(template, config);
    
    // 生成样式代码
    const styleCode = this.generateStyleCode(config);
    
    // 生成配置代码
    const configCode = this.generateConfigCode(config);
    
    // 提取API调用
    const apiCalls = this.extractApiCalls(config.apis);
    
    // 确定依赖
    const dependencies = this.determineDependencies(config);

    return {
      componentCode,
      styleCode,
      configCode,
      apiCalls,
      dependencies
    };
  }

  // 生成组件代码
  private generateComponentCode(template: PageTemplate, config: any): string {
    let code = template.template;
    
    // 替换模板变量
    code = code.replace(/\{\{ENTITY_NAME\}\}/g, this.capitalize(config.entity));
    code = code.replace(/\{\{ENTITY_NAME_LOWER\}\}/g, config.entity.toLowerCase());
    code = code.replace(/\{\{FIELDS\}\}/g, this.generateFieldsCode(config.fields));
    code = code.replace(/\{\{API_CALLS\}\}/g, this.generateApiCallsCode(config.apis));
    code = code.replace(/\{\{OPERATIONS\}\}/g, this.generateOperationsCode(config.operations));
    code = code.replace(/\{\{IMPORTS\}\}/g, this.generateImportsCode(config));
    
    return code;
  }

  // 生成字段代码
  private generateFieldsCode(fields: string[]): string {
    return fields.map(field => {
      return `    {
      title: '${this.getFieldDisplayName(field)}',
      dataIndex: '${field}',
      key: '${field}',
      ${this.getFieldConfig(field)}
    }`;
    }).join(',\n');
  }

  // 获取字段显示名称
  private getFieldDisplayName(field: string): string {
    const displayNames: { [key: string]: string } = {
      'id': 'ID',
      'username': '用户名',
      'email': '邮箱',
      'role': '角色',
      'status': '状态',
      'createdAt': '创建时间',
      'updatedAt': '更新时间',
      'name': '名称',
      'description': '描述',
      'permissions': '权限',
      'path': '路径',
      'icon': '图标',
      'parentId': '父级ID',
      'order': '排序'
    };
    
    return displayNames[field] || field;
  }

  // 获取字段配置
  private getFieldConfig(field: string): string {
    const configs: { [key: string]: string } = {
      'id': 'width: 80',
      'status': 'render: (status: string) => <Tag color={status === "active" ? "green" : "red"}>{status}</Tag>',
      'createdAt': 'render: (date: string) => new Date(date).toLocaleString()',
      'updatedAt': 'render: (date: string) => new Date(date).toLocaleString()',
      'email': 'ellipsis: true',
      'description': 'ellipsis: true, width: 200'
    };
    
    return configs[field] || '';
  }

  // 生成API调用代码
  private generateApiCallsCode(apis: any[]): string {
    return apis.map(api => {
      const functionName = this.generateFunctionName(api.endpoint, api.method);
      return `
  const ${functionName} = async (${this.generateApiParams(api)}) => {
    try {
      const response = await fetch('${api.endpoint}', {
        method: '${api.method}',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        ${api.method !== 'GET' ? 'body: JSON.stringify(data)' : ''}
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('${functionName} error:', error);
      throw error;
    }
  };`;
    }).join('\n');
  }

  // 生成函数名
  private generateFunctionName(endpoint: string, method: string): string {
    const parts = endpoint.split('/').filter(part => part && !part.startsWith(':'));
    const resource = parts[parts.length - 1] || 'data';
    
    const methodMap: { [key: string]: string } = {
      'GET': 'get',
      'POST': 'create',
      'PUT': 'update',
      'DELETE': 'delete'
    };
    
    return `${methodMap[method] || method.toLowerCase()}${this.capitalize(resource)}`;
  }

  // 生成API参数
  private generateApiParams(api: any): string {
    const params = [];
    
    if (api.method !== 'GET') {
      params.push('data: any');
    }
    
    if (api.endpoint.includes(':id')) {
      params.push('id: string | number');
    }
    
    return params.join(', ');
  }

  // 生成操作代码
  private generateOperationsCode(operations: string[]): string {
    const operationButtons = operations.map(op => {
      switch (op) {
        case 'create':
          return `<Button type="primary" onClick={handleCreate}>新增</Button>`;
        case 'edit':
          return `<Button onClick={() => handleEdit(record)}>编辑</Button>`;
        case 'delete':
          return `<Button danger onClick={() => handleDelete(record.id)}>删除</Button>`;
        case 'search':
          return `<Input.Search placeholder="搜索..." onSearch={handleSearch} />`;
        default:
          return '';
      }
    }).filter(Boolean);
    
    return operationButtons.join('\n      ');
  }

  // 生成导入代码
  private generateImportsCode(config: any): string {
    const imports = [
      "import React, { useState, useEffect } from 'react';",
      "import { Table, Button, Input, Modal, Form, message, Tag } from 'antd';"
    ];
    
    if (config.operations.includes('search')) {
      imports.push("import { SearchOutlined } from '@ant-design/icons';");
    }
    
    return imports.join('\n');
  }

  // 生成样式代码
  private generateStyleCode(config: any): string {
    return `
.${config.entity.toLowerCase()}-page {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.${config.entity.toLowerCase()}-page .page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.${config.entity.toLowerCase()}-page .search-bar {
  margin-bottom: 16px;
}

.${config.entity.toLowerCase()}-page .table-container {
  background: #fff;
}

.${config.entity.toLowerCase()}-page .action-buttons {
  display: flex;
  gap: 8px;
}
`;
  }

  // 生成配置代码
  private generateConfigCode(config: any): string {
    return `
export const ${config.entity}PageConfig = {
  entity: '${config.entity}',
  operations: ${JSON.stringify(config.operations)},
  fields: ${JSON.stringify(config.fields)},
  apis: ${JSON.stringify(config.apis.map((api: any) => ({
    endpoint: api.endpoint,
    method: api.method,
    description: api.description
  })))},
  layout: '${config.layout || 'standard'}',
  permissions: ${JSON.stringify(config.apis.flatMap((api: any) => api.requiredPermissions || []))}
};
`;
  }

  // 提取API调用
  private extractApiCalls(apis: any[]): string[] {
    return apis.map(api => `${api.method} ${api.endpoint}`);
  }

  // 确定依赖
  private determineDependencies(config: any): string[] {
    const dependencies = ['react', 'antd'];
    
    if (config.operations.includes('search')) {
      dependencies.push('@ant-design/icons');
    }
    
    return dependencies;
  }

  // 获取列表页面模板
  private getListTemplate(): string {
    return `{{IMPORTS}}

interface {{ENTITY_NAME}}PageProps {
  // Props interface
}

const {{ENTITY_NAME}}Page: React.FC<{{ENTITY_NAME}}PageProps> = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  {{API_CALLS}}

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await get{{ENTITY_NAME}}();
      setData(result.data || []);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    // 创建逻辑
  };

  const handleEdit = (record: any) => {
    // 编辑逻辑
  };

  const handleDelete = async (id: string | number) => {
    try {
      await delete{{ENTITY_NAME}}(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // 搜索逻辑
  };

  const columns = [
{{FIELDS}}
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          {{OPERATIONS}}
        </div>
      ),
    },
  ];

  return (
    <div className="{{ENTITY_NAME_LOWER}}-page">
      <div className="page-header">
        <h2>{{ENTITY_NAME}}管理</h2>
        <div>
          {{OPERATIONS}}
        </div>
      </div>
      
      <div className="search-bar">
        <Input.Search
          placeholder="搜索{{ENTITY_NAME}}..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            total: data.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </div>
    </div>
  );
};

export default {{ENTITY_NAME}}Page;`;
  }

  // 获取表单页面模板
  private getFormTemplate(): string {
    return `{{IMPORTS}}
import { Form, Input, Select, DatePicker, Switch } from 'antd';

interface {{ENTITY_NAME}}FormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  loading?: boolean;
}

const {{ENTITY_NAME}}Form: React.FC<{{ENTITY_NAME}}FormProps> = ({
  initialValues,
  onSubmit,
  loading = false
}) => {
  const [form] = Form.useForm();

  {{API_CALLS}}

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      message.success('保存成功');
      form.resetFields();
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <div className="{{ENTITY_NAME_LOWER}}-form">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        {{FIELDS}}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => form.resetFields()}>
            重置
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default {{ENTITY_NAME}}Form;`;
  }

  // 获取详情页面模板
  private getDetailTemplate(): string {
    return `{{IMPORTS}}
import { Descriptions, Card } from 'antd';

interface {{ENTITY_NAME}}DetailProps {
  id: string | number;
}

const {{ENTITY_NAME}}Detail: React.FC<{{ENTITY_NAME}}DetailProps> = ({ id }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  {{API_CALLS}}

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await get{{ENTITY_NAME}}(id);
      setData(result.data);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!data) {
    return <div>数据不存在</div>;
  }

  return (
    <div className="{{ENTITY_NAME_LOWER}}-detail">
      <Card title="{{ENTITY_NAME}}详情" loading={loading}>
        <Descriptions column={2} bordered>
          {{FIELDS}}
        </Descriptions>
      </Card>
    </div>
  );
};

export default {{ENTITY_NAME}}Detail;`;
  }

  // 工具方法：首字母大写
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default new PageGenerator();