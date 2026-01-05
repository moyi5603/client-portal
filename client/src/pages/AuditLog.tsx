import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  DatePicker,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Typography
} from 'antd';
import {
  ReloadOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    userId: string;
    username: string;
    email: string;
  };
  actionType: string;
  targetType: string;
  targetId: string;
  targetName: string; // 操作对象名称（用户名或角色名）
  description: string; // 操作描述
  tenantId: string;
}

// 操作类型映射
const ACTION_TYPE_MAP: Record<string, { label: string; color: string }> = {
  'ACCOUNT_CREATED': { label: '创建账号', color: 'green' },
  'ACCOUNT_UPDATED': { label: '编辑账号', color: 'blue' },
  'ACCOUNT_DELETED': { label: '删除账号', color: 'red' },
  'ROLE_CREATED': { label: '创建角色', color: 'green' },
  'ROLE_UPDATED': { label: '编辑角色', color: 'blue' },
  'ROLE_COPIED': { label: '复制角色', color: 'cyan' },
  'ROLE_DELETED': { label: '删除角色', color: 'red' }
};

// 目标类型映射
const TARGET_TYPE_MAP: Record<string, { label: string; color: string }> = {
  'ACCOUNT': { label: '账号', color: 'blue' },
  'ROLE': { label: '角色', color: 'purple' }
};

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // 过滤器状态
  const [filters, setFilters] = useState({
    dateRange: null as [Dayjs, Dayjs] | null,
    actionType: 'ALL',
    targetType: 'ALL',
    actorName: '',
    targetName: ''
  });

  // 设置dayjs locale
  useEffect(() => {
    dayjs.locale('zh-cn');
  }, []);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        pageSize: 1000
      };

      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        params.startDate = filters.dateRange[0].startOf('day').toISOString();
        params.endDate = filters.dateRange[1].endOf('day').toISOString();
      }

      if (filters.actionType !== 'ALL') {
        params.actionType = filters.actionType;
      }

      if (filters.targetType !== 'ALL') {
        params.targetType = filters.targetType;
      }

      if (filters.actorName) {
        params.actorName = filters.actorName;
      }

      if (filters.targetName) {
        params.targetName = filters.targetName;
      }

      const response = await api.get('/audit-logs', { params });
      if (response.data.success) {
        setLogs(response.data.data.items || []);
      }
    } catch (error) {
      console.error('加载操作记录失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      dateRange: null,
      actionType: 'ALL',
      targetType: 'ALL',
      actorName: '',
      targetName: ''
    });
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: '操作时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (text: string) => {
        return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: '操作者',
      key: 'actor',
      width: 120,
      render: (_: any, record: AuditLog) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.actor.username}</div>
        </div>
      )
    },
    {
      title: '操作类型',
      dataIndex: 'actionType',
      key: 'actionType',
      width: 100,
      render: (actionType: string) => {
        const config = ACTION_TYPE_MAP[actionType] || { label: actionType, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: '操作对象',
      key: 'target',
      width: 180,
      render: (_: any, record: AuditLog) => {
        const typeConfig = TARGET_TYPE_MAP[record.targetType] || { label: record.targetType, color: 'default' };
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{record.targetName}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <Tag size="small" color={typeConfig.color}>{typeConfig.label}</Tag>
              {record.targetId}
            </div>
          </div>
        );
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <div style={{ 
          wordBreak: 'break-all', 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.4'
        }}>
          {text}
        </div>
      )
    }
  ];

  return (
    <div>
      {/* 标题和操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            操作记录
          </Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadLogs}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 过滤器 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>操作日期</div>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates as [Dayjs, Dayjs] | null })}
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>操作类型</div>
            <Select
              style={{ width: '100%' }}
              value={filters.actionType}
              onChange={(value) => setFilters({ ...filters, actionType: value })}
            >
              <Option value="ALL">全部</Option>
              {Object.keys(ACTION_TYPE_MAP).map(action => (
                <Option key={action} value={action}>
                  {ACTION_TYPE_MAP[action].label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>对象类型</div>
            <Select
              style={{ width: '100%' }}
              value={filters.targetType}
              onChange={(value) => setFilters({ ...filters, targetType: value })}
            >
              <Option value="ALL">全部</Option>
              {Object.keys(TARGET_TYPE_MAP).map(target => (
                <Option key={target} value={target}>
                  {TARGET_TYPE_MAP[target].label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>操作者</div>
            <Input
              placeholder="搜索操作者"
              value={filters.actorName}
              onChange={(e) => setFilters({ ...filters, actorName: e.target.value })}
              allowClear
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>操作对象</div>
            <Input
              placeholder="搜索操作对象"
              value={filters.targetName}
              onChange={(e) => setFilters({ ...filters, targetName: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={18}>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" onClick={loadLogs}>
                搜索
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 日志表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `显示第 ${range[0]} 到 ${range[1]} 条，共 ${total} 条记录`
          }}
        />
      </Card>
    </div>
  );
};

export default AuditLogPage;

