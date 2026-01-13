import { DataSource } from '../types/dataSource';

interface CalculationResult {
  value: any;
  metadata: {
    calculationType: string;
    dataPoints: number;
    calculatedAt: Date;
    cacheKey?: string;
  };
}

interface ComparisonResult {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface JoinCondition {
  leftField: string;
  rightField: string;
  type: 'inner' | 'left' | 'right' | 'full';
}

interface AggregationConfig {
  field: string;
  operation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
  groupBy?: string[];
  filter?: (item: any) => boolean;
}

class DataCalculationEngine {
  private cache: Map<string, { result: any; expiry: Date }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

  // 基础计算函数

  // 求和
  sum(data: any[], field: string, filter?: (item: any) => boolean): CalculationResult {
    const cacheKey = this.generateCacheKey('sum', field, data.length, filter?.toString());
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    const filteredData = filter ? data.filter(filter) : data;
    const value = filteredData.reduce((sum, item) => {
      const fieldValue = this.getNestedValue(item, field);
      return sum + (typeof fieldValue === 'number' ? fieldValue : 0);
    }, 0);

    const result: CalculationResult = {
      value,
      metadata: {
        calculationType: 'sum',
        dataPoints: filteredData.length,
        calculatedAt: new Date(),
        cacheKey
      }
    };

    this.cacheResult(cacheKey, result);
    return result;
  }

  // 平均值
  average(data: any[], field: string, filter?: (item: any) => boolean): CalculationResult {
    const cacheKey = this.generateCacheKey('avg', field, data.length, filter?.toString());
    const cached = this.getCachedResult(cacheKey);
    if (cached) return cached;

    const filteredData = filter ? data.filter(filter) : data;
    const sum = filteredData.reduce((total, item) => {
      const fieldValue = this.getNestedValue(item, field);
      return total + (typeof fieldValue === 'number' ? fieldValue : 0);
    }, 0);

    const value = filteredData.length > 0 ? sum / filteredData.length : 0;

    const result: CalculationResult = {
      value,
      metadata: {
        calculationType: 'average',
        dataPoints: filteredData.length,
        calculatedAt: new Date(),
        cacheKey
      }
    };

    this.cacheResult(cacheKey, result);
    return result;
  }

  // 百分比计算
  percentage(part: number, total: number, precision: number = 2): CalculationResult {
    const value = total > 0 ? Number(((part / total) * 100).toFixed(precision)) : 0;

    return {
      value,
      metadata: {
        calculationType: 'percentage',
        dataPoints: 2,
        calculatedAt: new Date()
      }
    };
  }

  // 同比/环比计算
  compareWithPrevious(
    current: any[], 
    previous: any[], 
    field: string, 
    operation: 'sum' | 'avg' | 'count' = 'sum'
  ): ComparisonResult {
    let currentValue: number;
    let previousValue: number;

    switch (operation) {
      case 'sum':
        currentValue = this.sum(current, field).value;
        previousValue = this.sum(previous, field).value;
        break;
      case 'avg':
        currentValue = this.average(current, field).value;
        previousValue = this.average(previous, field).value;
        break;
      case 'count':
        currentValue = current.length;
        previousValue = previous.length;
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    const change = currentValue - previousValue;
    const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable';
    if (Math.abs(changePercentage) < 0.01) {
      trend = 'stable';
    } else if (changePercentage > 0) {
      trend = 'up';
    } else {
      trend = 'down';
    }

    return {
      current: currentValue,
      previous: previousValue,
      change,
      changePercentage: Number(changePercentage.toFixed(2)),
      trend
    };
  }

  // 高级聚合计算
  aggregate(data: any[], config: AggregationConfig): CalculationResult {
    const { field, operation, groupBy, filter } = config;
    
    let processedData = filter ? data.filter(filter) : data;

    if (groupBy && groupBy.length > 0) {
      // 分组聚合
      const grouped = this.groupBy(processedData, groupBy);
      const result: { [key: string]: any } = {};

      Object.entries(grouped).forEach(([key, items]) => {
        result[key] = this.performAggregation(items, field, operation);
      });

      return {
        value: result,
        metadata: {
          calculationType: `grouped_${operation}`,
          dataPoints: processedData.length,
          calculatedAt: new Date()
        }
      };
    } else {
      // 简单聚合
      const value = this.performAggregation(processedData, field, operation);
      
      return {
        value,
        metadata: {
          calculationType: operation,
          dataPoints: processedData.length,
          calculatedAt: new Date()
        }
      };
    }
  }

  // 多数据源关联
  async joinDataSources(
    sources: { data: any[]; alias: string }[], 
    joinConditions: JoinCondition[]
  ): Promise<any[]> {
    if (sources.length < 2) {
      throw new Error('At least two data sources are required for join operation');
    }

    let result = sources[0].data.map(item => ({ [`${sources[0].alias}`]: item }));

    for (let i = 1; i < sources.length; i++) {
      const rightSource = sources[i];
      const joinCondition = joinConditions[i - 1];

      result = this.performJoin(
        result,
        rightSource.data,
        joinCondition,
        sources[0].alias,
        rightSource.alias
      );
    }

    return result;
  }

  // 时间序列分析
  timeSeriesAnalysis(
    data: any[], 
    dateField: string, 
    valueField: string, 
    interval: 'day' | 'week' | 'month' | 'year' = 'day'
  ): CalculationResult {
    const grouped = this.groupByTimeInterval(data, dateField, interval);
    const timeSeries: { [key: string]: number } = {};

    Object.entries(grouped).forEach(([timeKey, items]) => {
      timeSeries[timeKey] = this.sum(items, valueField).value;
    });

    // 计算趋势
    const values = Object.values(timeSeries);
    const trend = this.calculateTrend(values);

    return {
      value: {
        series: timeSeries,
        trend,
        totalPeriods: Object.keys(timeSeries).length,
        averageValue: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      },
      metadata: {
        calculationType: 'time_series',
        dataPoints: data.length,
        calculatedAt: new Date()
      }
    };
  }

  // 排名计算
  ranking(
    data: any[], 
    field: string, 
    order: 'asc' | 'desc' = 'desc', 
    limit?: number
  ): CalculationResult {
    const sorted = [...data].sort((a, b) => {
      const aValue = this.getNestedValue(a, field);
      const bValue = this.getNestedValue(b, field);
      
      if (order === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    const ranked = sorted.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    const result = limit ? ranked.slice(0, limit) : ranked;

    return {
      value: result,
      metadata: {
        calculationType: 'ranking',
        dataPoints: data.length,
        calculatedAt: new Date()
      }
    };
  }

  // 分布分析
  distribution(data: any[], field: string, buckets: number = 10): CalculationResult {
    const values = data.map(item => this.getNestedValue(item, field)).filter(v => typeof v === 'number');
    
    if (values.length === 0) {
      return {
        value: [],
        metadata: {
          calculationType: 'distribution',
          dataPoints: 0,
          calculatedAt: new Date()
        }
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const bucketSize = (max - min) / buckets;

    const distribution = Array(buckets).fill(0).map((_, index) => ({
      range: {
        min: min + index * bucketSize,
        max: min + (index + 1) * bucketSize
      },
      count: 0,
      percentage: 0
    }));

    values.forEach(value => {
      const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), buckets - 1);
      distribution[bucketIndex].count++;
    });

    // 计算百分比
    distribution.forEach(bucket => {
      bucket.percentage = Number(((bucket.count / values.length) * 100).toFixed(2));
    });

    return {
      value: distribution,
      metadata: {
        calculationType: 'distribution',
        dataPoints: values.length,
        calculatedAt: new Date()
      }
    };
  }

  // 私有辅助方法

  private performAggregation(data: any[], field: string, operation: string): any {
    switch (operation) {
      case 'sum':
        return this.sum(data, field).value;
      case 'avg':
        return this.average(data, field).value;
      case 'count':
        return data.length;
      case 'min':
        return Math.min(...data.map(item => this.getNestedValue(item, field)).filter(v => typeof v === 'number'));
      case 'max':
        return Math.max(...data.map(item => this.getNestedValue(item, field)).filter(v => typeof v === 'number'));
      case 'distinct':
        return [...new Set(data.map(item => this.getNestedValue(item, field)))].length;
      default:
        throw new Error(`Unsupported aggregation operation: ${operation}`);
    }
  }

  private groupBy(data: any[], fields: string[]): { [key: string]: any[] } {
    return data.reduce((groups, item) => {
      const key = fields.map(field => this.getNestedValue(item, field)).join('|');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as { [key: string]: any[] });
  }

  private groupByTimeInterval(
    data: any[], 
    dateField: string, 
    interval: 'day' | 'week' | 'month' | 'year'
  ): { [key: string]: any[] } {
    return data.reduce((groups, item) => {
      const date = new Date(this.getNestedValue(item, dateField));
      let key: string;

      switch (interval) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as { [key: string]: any[] });
  }

  private performJoin(
    leftData: any[], 
    rightData: any[], 
    condition: JoinCondition, 
    leftAlias: string, 
    rightAlias: string
  ): any[] {
    const result: any[] = [];

    leftData.forEach(leftItem => {
      const leftValue = this.getNestedValue(leftItem[leftAlias], condition.leftField);
      const matchingRightItems = rightData.filter(rightItem => 
        this.getNestedValue(rightItem, condition.rightField) === leftValue
      );

      if (matchingRightItems.length > 0) {
        matchingRightItems.forEach(rightItem => {
          result.push({
            ...leftItem,
            [rightAlias]: rightItem
          });
        });
      } else if (condition.type === 'left' || condition.type === 'full') {
        result.push({
          ...leftItem,
          [rightAlias]: null
        });
      }
    });

    // 处理右连接的情况
    if (condition.type === 'right' || condition.type === 'full') {
      rightData.forEach(rightItem => {
        const rightValue = this.getNestedValue(rightItem, condition.rightField);
        const hasMatch = leftData.some(leftItem => 
          this.getNestedValue(leftItem[leftAlias], condition.leftField) === rightValue
        );

        if (!hasMatch) {
          result.push({
            [leftAlias]: null,
            [rightAlias]: rightItem
          });
        }
      });
    }

    return result;
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (values.length < 2) return 'stable';

    let increases = 0;
    let decreases = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) {
        increases++;
      } else if (values[i] < values[i - 1]) {
        decreases++;
      }
    }

    const changeRatio = Math.abs(increases - decreases) / (values.length - 1);

    if (changeRatio < 0.3) {
      return 'volatile';
    } else if (increases > decreases) {
      return 'increasing';
    } else if (decreases > increases) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private generateCacheKey(...parts: (string | number | undefined)[]): string {
    return parts.filter(p => p !== undefined).join('|');
  }

  // 缓存管理
  cacheResult(key: string, result: any, ttl?: number): void {
    const expiry = new Date(Date.now() + (ttl || this.CACHE_TTL));
    this.cache.set(key, { result, expiry });
  }

  getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > new Date()) {
      return cached.result;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanupExpiredCache(): void {
    const now = new Date();
    for (const [key, cached] of this.cache.entries()) {
      if (cached.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }
}

export default new DataCalculationEngine();