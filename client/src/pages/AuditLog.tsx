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
import { useLocale } from '../contexts/LocaleContext';
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

const AuditLogPage: React.FC = () => {
  const { t } = useLocale();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // 操作类型映射
  const ACTION_TYPE_MAP: Record<string, { label: string; color: string }> = {
    'ACCOUNT_CREATED': { label: t('actionType.ACCOUNT_CREATED'), color: 'green' },
    'ACCOUNT_UPDATED': { label: t('actionType.ACCOUNT_UPDATED'), color: 'blue' },
    'ACCOUNT_DELETED': { label: t('actionType.ACCOUNT_DELETED'), color: 'red' },
    'ROLE_CREATED': { label: t('actionType.ROLE_CREATED'), color: 'green' },
    'ROLE_UPDATED': { label: t('actionType.ROLE_UPDATED'), color: 'blue' },
    'ROLE_COPIED': { label: t('role.copySuccess'), color: 'cyan' },
    'ROLE_DELETED': { label: t('actionType.ROLE_DELETED'), color: 'red' }
  };

  // 目标类型映射
  const TARGET_TYPE_MAP: Record<string, { label: string; color: string }> = {
    'ACCOUNT': { label: t('targetType.ACCOUNT'), color: 'blue' },
    'ROLE': { label: t('targetType.ROLE'), color: 'purple' }
  };

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
      console.error(t('auditLog.loadFailed'), error);
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
      title: t('auditLog.timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (text: string) => {
        return dayjs(text).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    {
      title: t('auditLog.actor'),
      key: 'actor',
      width: 120,
      render: (_: any, record: AuditLog) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.actor.username}</div>
        </div>
      )
    },
    {
      title: t('auditLog.actionType'),
      dataIndex: 'actionType',
      key: 'actionType',
      width: 100,
      render: (actionType: string) => {
        const config = ACTION_TYPE_MAP[actionType] || { label: actionType, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: t('auditLog.targetType'),
      key: 'target',
      width: 180,
      render: (_: any, record: AuditLog) => {
        const typeConfig = TARGET_TYPE_MAP[record.targetType] || { label: record.targetType, color: 'default' };
        return (
          <div>
            <div style={{ fontWeight: 500 }}>{record.targetName}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
              {record.targetId}
            </div>
          </div>
        );
      }
    },
    {
      title: t('common.description'),
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
            {t('auditLog.title')}
          </Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadLogs}>
            {t('auditLog.refresh')}
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
            <div style={{ marginBottom: 8 }}>{t('auditLog.actor')}</div>
            <Input
              placeholder={t('auditLog.searchActorId')}
              value={filters.actorName}
              onChange={(e) => setFilters({ ...filters, actorName: e.target.value })}
              allowClear
            />
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('auditLog.targetId')}</div>
            <Input
              placeholder={t('auditLog.searchTargetId')}
              value={filters.targetName}
              onChange={(e) => setFilters({ ...filters, targetName: e.target.value })}
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
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) =>
              t('pagination.showing', { 
                start: range[0].toString(), 
                end: range[1].toString(), 
                total: total.toString() 
              }).replace('角色', '记录')
          }}
        />
      </Card>
    </div>
  );
};

export default AuditLogPage;

