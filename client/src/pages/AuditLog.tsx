import React, { useState, useEffect, useMemo } from 'react';
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
  Typography,
  Descriptions,
  Collapse,
  Tooltip
} from 'antd';
import {
  ReloadOutlined,
  ExportOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import api from '../utils/api';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Search } = Input;

interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    userId: string;
    username: string;
    email: string;
    idpSource?: string;
  };
  actionType: string;
  targetType: string;
  targetId: string;
  previousValue?: any;
  newValue?: any;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    changeType: string;
  }>;
  ipAddress?: string;
  userAgent?: string;
  tenantId: string;
}

// 操作类型映射
const ACTION_TYPE_MAP: Record<string, { label: string; color: string }> = {
  'ROLE_CREATED': { label: '创建角色', color: 'green' },
  'ROLE_UPDATED': { label: '更新角色', color: 'blue' },
  'ROLE_DEPRECATED': { label: '弃用角色', color: 'default' },
  'PERMISSION_ADDED': { label: '添加权限', color: 'green' },
  'PERMISSION_REMOVED': { label: '移除权限', color: 'red' },
  'PERMISSION_MODIFIED': { label: '修改权限', color: 'orange' },
  'USER_CREATED': { label: '创建用户', color: 'green' },
  'USER_UPDATED': { label: '更新用户', color: 'blue' },
  'USER_DELETED': { label: '删除用户', color: 'red' },
  'USER_STATUS_CHANGED': { label: '用户状态变更', color: 'orange' },
  'ROLE_ASSIGNED': { label: '分配角色', color: 'green' },
  'ROLE_REMOVED': { label: '移除角色', color: 'red' },
  'IDP_MAPPING_CREATED': { label: '创建IdP映射', color: 'green' },
  'IDP_MAPPING_UPDATED': { label: '更新IdP映射', color: 'blue' },
  'IDP_MAPPING_DELETED': { label: '删除IdP映射', color: 'red' }
};

// 目标类型映射
const TARGET_TYPE_MAP: Record<string, { label: string; color: string }> = {
  'USER': { label: '用户', color: 'blue' },
  'ROLE': { label: '角色', color: 'purple' },
  'PERMISSION': { label: '权限', color: 'orange' },
  'IDP_MAPPING': { label: 'IdP映射', color: 'cyan' }
};

const AuditLogPage: React.FC = () => {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  // 过滤器状态
  const [filters, setFilters] = useState({
    dateRange: null as [Dayjs, Dayjs] | null,
    actionType: 'ALL',
    targetType: 'ALL',
    actorId: '',
    targetId: ''
  });

  // 设置dayjs locale
  useEffect(() => {
    dayjs.locale(locale === 'zh-CN' ? 'zh-cn' : 'en');
  }, [locale]);

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

      if (filters.actorId) {
        params.actorId = filters.actorId;
      }

      if (filters.targetId) {
        params.targetId = filters.targetId;
      }

      const response = await api.get('/audit-logs', { params });
      if (response.data.success) {
        setLogs(response.data.data.items || []);
      }
    } catch (error) {
      console.error(t('auditLog.loadFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};

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

      if (filters.actorId) {
        params.actorId = filters.actorId;
      }

      if (filters.targetId) {
        params.targetId = filters.targetId;
      }

      const response = await api.get('/audit-logs/export', {
        params,
        responseType: 'blob'
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(t('auditLog.exportFailed'), error);
    }
  };

  const handleReset = () => {
    setFilters({
      dateRange: null,
      actionType: 'ALL',
      targetType: 'ALL',
      actorId: '',
      targetId: ''
    });
  };

  // 格式化变更详情
  const formatChanges = (changes?: Array<{ field: string; oldValue: any; newValue: any; changeType: string }>) => {
    if (!changes || changes.length === 0) {
      return null;
    }

    return (
      <div>
        {changes.map((change, index) => (
          <div key={index} style={{ marginBottom: 8 }}>
            <Text strong>{change.field}:</Text>
            <div style={{ marginLeft: 16, marginTop: 4 }}>
              <Tag color="red">删除: {JSON.stringify(change.oldValue)}</Tag>
              {' → '}
              <Tag color="green">新增: {JSON.stringify(change.newValue)}</Tag>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: t('auditLog.timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: (a, b) => a.timestamp.localeCompare(b.timestamp),
      render: (text: string) => {
        return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: t('auditLog.actor'),
      key: 'actor',
      width: 200,
      render: (_: any, record: AuditLog) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.actor.username}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            ID: {record.actor.userId}
          </div>
          {record.actor.idpSource && (
            <Tag size="small" style={{ marginTop: 4 }}>
              {record.actor.idpSource}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: t('auditLog.actionType'),
      dataIndex: 'actionType',
      key: 'actionType',
      width: 150,
      render: (actionType: string) => {
        const config = ACTION_TYPE_MAP[actionType] || { label: actionType, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: t('auditLog.targetType'),
      dataIndex: 'targetType',
      key: 'targetType',
      width: 120,
      render: (targetType: string) => {
        const config = TARGET_TYPE_MAP[targetType] || { label: targetType, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: t('auditLog.targetId'),
      dataIndex: 'targetId',
      key: 'targetId',
      width: 200,
      ellipsis: true
    },
    {
      title: t('auditLog.changes'),
      key: 'changes',
      width: 200,
      render: (_: any, record: AuditLog) => {
        if (record.changes && record.changes.length > 0) {
          return (
            <Tooltip title={`${record.changes.length}${t('auditLog.changesCount')}`}>
              <Tag color="blue">{record.changes.length}{t('auditLog.changesCount')}</Tag>
            </Tooltip>
          );
        }
        return <span style={{ color: '#999' }}>-</span>;
      }
    }
  ];

  const expandedRowRender = (record: AuditLog) => {
    return (
      <div style={{ padding: '16px 0' }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label={t('auditLog.actorEmail')}>
            {record.actor.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('auditLog.ipAddress')}>
            {record.ipAddress || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('auditLog.userAgent')} span={2}>
            {record.userAgent || '-'}
          </Descriptions.Item>
        </Descriptions>

        {(record.changes && record.changes.length > 0) && (
          <div style={{ marginTop: 16 }}>
            <Text strong>{t('auditLog.changeDetails')}：</Text>
            <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              {record.changes.map((change, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Text strong>{change.field}:</Text>
                  <div style={{ marginLeft: 16, marginTop: 4 }}>
                    {change.oldValue !== undefined && (
                      <Tag color="red" style={{ marginRight: 8 }}>
                        变更前: {typeof change.oldValue === 'object' ? JSON.stringify(change.oldValue) : String(change.oldValue)}
                      </Tag>
                    )}
                    {change.newValue !== undefined && (
                      <Tag color="green">
                        变更后: {typeof change.newValue === 'object' ? JSON.stringify(change.newValue) : String(change.newValue)}
                      </Tag>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(record.previousValue || record.newValue) && (
          <Collapse style={{ marginTop: 16 }}>
            {record.previousValue && (
              <Panel header={t('auditLog.previousValue')} key="previous">
                <pre style={{ background: '#fff', padding: 12, borderRadius: 4, overflow: 'auto' }}>
                  {JSON.stringify(record.previousValue, null, 2)}
                </pre>
              </Panel>
            )}
            {record.newValue && (
              <Panel header={t('auditLog.newValue')} key="new">
                <pre style={{ background: '#fff', padding: 12, borderRadius: 4, overflow: 'auto' }}>
                  {JSON.stringify(record.newValue, null, 2)}
                </pre>
              </Panel>
            )}
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* 标题和操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {t('nav.auditLog')}
          </Title>
          <Text type="secondary">
            {t('auditLog.subtitle')}
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadLogs}>
            {t('auditLog.refresh')}
          </Button>
          <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
            {t('auditLog.export')}
          </Button>
        </Space>
      </div>

      {/* 过滤器 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('auditLog.dateRange')}</div>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates as [Dayjs, Dayjs] | null })}
              showTime
            />
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('auditLog.actionType')}</div>
            <Select
              style={{ width: '100%' }}
              value={filters.actionType}
              onChange={(value) => setFilters({ ...filters, actionType: value })}
            >
              <Option value="ALL">{t('common.all')}</Option>
              {Object.keys(ACTION_TYPE_MAP).map(action => (
                <Option key={action} value={action}>
                  {ACTION_TYPE_MAP[action].label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('auditLog.targetType')}</div>
            <Select
              style={{ width: '100%' }}
              value={filters.targetType}
              onChange={(value) => setFilters({ ...filters, targetType: value })}
            >
              <Option value="ALL">{t('common.all')}</Option>
              {Object.keys(TARGET_TYPE_MAP).map(target => (
                <Option key={target} value={target}>
                  {TARGET_TYPE_MAP[target].label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('auditLog.actorId')}</div>
            <Input
              placeholder={t('auditLog.searchActorId')}
              value={filters.actorId}
              onChange={(e) => setFilters({ ...filters, actorId: e.target.value })}
              allowClear
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('auditLog.targetId')}</div>
            <Input
              placeholder={t('auditLog.searchTargetId')}
              value={filters.targetId}
              onChange={(e) => setFilters({ ...filters, targetId: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={18}>
            <Space>
              <Button onClick={handleReset}>{t('auditLog.reset')}</Button>
              <Button type="primary" onClick={loadLogs}>
                {t('auditLog.applyFilters')}
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
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys
          }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `显示第 ${range[0]} 到 ${range[1]} 条，共 ${total} 条日志`
          }}
        />
      </Card>
    </div>
  );
};

export default AuditLogPage;

