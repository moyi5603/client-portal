export interface DataSource {
  name: string;
  displayName: string;
  description: string;
  availableOperations: string[];
  fields: string[];
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  displayName: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

export interface DataQuery {
  dataSource: string;
  fields?: string[];
  filters?: DataFilter[];
  sorting?: DataSort[];
  pagination?: {
    page: number;
    pageSize: number;
  };
  aggregation?: DataAggregation[];
}

export interface DataFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'between';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface DataSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DataAggregation {
  field: string;
  operation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  alias?: string;
}

export interface DataResult {
  data: any[];
  total: number;
  page?: number;
  pageSize?: number;
  aggregations?: { [key: string]: any };
  metadata?: {
    executionTime: number;
    dataSource: string;
    cached: boolean;
  };
}