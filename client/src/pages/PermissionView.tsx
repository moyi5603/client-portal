import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, Select, Table, Tag, Space, Radio, Tooltip, Avatar, Input, 
  Checkbox, Button, Row, Col, Breadcrumb, Typography, Divider 
} from 'antd';
import { 
  UserOutlined, EyeOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, CheckCircleOutlined, DownloadOutlined,
  ReloadOutlined, ExportOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

interface Role {
  id: string;
  name: string;
  description?: string;
  type: 'INTERNAL' | 'CUSTOMER';
  status: 'ACTIVE' | 'DEPRECATED';
  permissions: Permission[];
  usageCount: number;
}

interface Permission {
  module: string;
  page: string;
  pageCode: string;
  operations: string[];
}

interface Account {
  id: string;
  username: string;
  roles: string[];
}

// 模块配置（包含颜色和显示名称）
const MODULE_CONFIG: Record<string, { name: string; color: string }> = {
  'KPI': { name: 'KPI Dashboard', color: '#722ed1' },
  'INBOUND': { name: 'Order Management', color: '#fa8c16' },
  'INVENTORY': { name: 'Inventory', color: '#52c41a' },
  'OUTBOUND': { name: 'Order Management', color: '#fa8c16' },
  'RETURNS': { name: 'Returns', color: '#eb2f96' },
  'FINANCE': { name: 'Finance', color: '#f5222d' },
  'SUPPLY_CHAIN': { name: 'Supply Chain', color: '#1890ff' },
  'ADMIN': { name: 'System', color: '#722ed1' }
};

// 操作图标映射
const OPERATION_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  'VIEW': { icon: <EyeOutlined />, color: '#52c41a' },
  'CREATE': { icon: <PlusOutlined />, color: '#52c41a' },
  'EDIT': { icon: <EditOutlined />, color: '#722ed1' },
  'DELETE': { icon: <DeleteOutlined />, color: '#f5222d' },
  'APPROVE': { icon: <CheckCircleOutlined />, color: '#faad14' },
  'EXPORT': { icon: <DownloadOutlined />, color: '#1890ff' }
};

const PermissionView: React.FC = () => {
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [roles, setRoles] = useState<Role[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 过滤器状态
  const [filters, setFilters] = useState({
    roleType: 'ALL',
    module: 'ALL',
    permissionType: 'ALL_MENUS', // 'ALL_MENUS' | 'ALL_RULES'
    roleStatus: 'ACTIVE'
  });
  const [searchText, setSearchText] = useState('');
  const [showDisabled, setShowDisabled] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载角色列表
      const rolesResponse = await api.get('/roles', {
        params: { page: 1, pageSize: 1000 }
      });
      if (rolesResponse.data.success) {
        setRoles(rolesResponse.data.data.items || []);
      }

      // 加载账号列表
      const accountsResponse = await api.get('/accounts', {
        params: { page: 1, pageSize: 1000 }
      });
      if (accountsResponse.data.success) {
        setAccounts(accountsResponse.data.data.items || []);
      }
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取拥有某个角色的账号列表
  const getAccountsWithRole = (roleId: string): Account[] => {
    return accounts.filter(acc => acc.roles.includes(roleId));
  };

  // 获取角色在某个模块下的所有权限
  const getModulePermissions = (role: Role, module: string): string[] => {
    const permissions = role.permissions.filter(p => p.module === module);
    const operations = new Set<string>();
    permissions.forEach(p => {
      p.operations.forEach(op => operations.add(op));
    });
    return Array.from(operations);
  };

  // 过滤后的角色列表
  const filteredRoles = useMemo(() => {
    let result = roles;

    // 角色类型过滤
    if (filters.roleType !== 'ALL') {
      result = result.filter(r => r.type === filters.roleType);
    }

    // 角色状态过滤
    if (filters.roleStatus === 'ACTIVE') {
      result = result.filter(r => r.status === 'ACTIVE');
    } else if (!showDisabled) {
      result = result.filter(r => r.status === 'ACTIVE');
    }

    // 模块过滤
    if (filters.module !== 'ALL') {
      result = result.filter(r => 
        r.permissions.some(p => p.module === filters.module)
      );
    }

    // 搜索过滤
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(lowerSearch) ||
        r.description?.toLowerCase().includes(lowerSearch) ||
        r.permissions.some(p => 
          p.module.toLowerCase().includes(lowerSearch) ||
          p.page.toLowerCase().includes(lowerSearch)
        )
      );
    }

    // 显示空权限过滤
    if (!showEmpty) {
      result = result.filter(r => r.permissions.length > 0);
    }

    return result;
  }, [roles, filters, searchText, showDisabled, showEmpty]);

  // 获取所有模块列表
  const allModules = useMemo(() => {
    const moduleSet = new Set<string>();
    filteredRoles.forEach(role => {
      role.permissions.forEach(p => moduleSet.add(p.module));
    });
    return Array.from(moduleSet).sort();
  }, [filteredRoles]);

  // Matrix视图：以角色为行，一级菜单（模块）为列
  const matrixColumns: ColumnsType<any> = useMemo(() => {
    const cols: ColumnsType<any> = [
      {
        title: t('role.name'),
        dataIndex: 'roleName',
        key: 'roleName',
        fixed: 'left',
        width: 220,
        sorter: (a, b) => a.roleName.localeCompare(b.roleName),
        render: (text: string, record: any) => (
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
            <Space size={4}>
              <Tag color={record.roleType === 'INTERNAL' ? 'blue' : 'purple'} size="small">
                {record.roleType === 'INTERNAL' ? t('common.internal') : t('common.customer')}
              </Tag>
            </Space>
          </div>
        )
      }
    ];

    // 添加一级菜单（模块）列
    allModules.forEach(module => {
      const config = MODULE_CONFIG[module] || { name: module, color: '#666' };
      cols.push({
        title: (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: config.color,
              margin: '0 auto 4px'
            }} />
            <div>{config.name}</div>
          </div>
        ),
        key: `module-${module}`,
        align: 'center' as const,
        width: 150,
        render: (_: any, record: any) => {
          const permissions = record[`module-${module}`] || [];
          if (permissions.length === 0) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          return (
            <Space size={4} wrap>
              {permissions.map((op: string) => {
                const opConfig = OPERATION_ICONS[op];
                if (!opConfig) return null;
                return (
                  <Tooltip key={op} title={t(`operation.${op}`) || op}>
                    <span style={{ color: opConfig.color, fontSize: 16 }}>
                      {opConfig.icon}
                    </span>
                  </Tooltip>
                );
              })}
            </Space>
          );
        }
      });
    });

    // 添加用户列（每行最后缩略展示拥有该角色的用户）
    cols.push({
      title: t('role.users'),
      key: 'users',
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        const users = record.users || [];
        if (users.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const userNames = users.map((u: Account) => u.username).join(', ');
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Space wrap>
                {users.slice(0, 3).map((user: Account) => (
                  <Tooltip key={user.id} title={user.username}>
                    <Avatar size="small" icon={<UserOutlined />} />
                  </Tooltip>
                ))}
                {users.length > 3 && (
                  <Tooltip title={users.slice(3).map((u: Account) => u.username).join(', ')}>
                    <Tag>+{users.length - 3}</Tag>
                  </Tooltip>
                )}
              </Space>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <span style={{ fontWeight: 500 }}>{users.length}</span> {t('role.users')}: {userNames}
            </div>
          </div>
        );
      }
    });

    return cols;
  }, [allModules, t]);

  const matrixData = useMemo(() => {
    return filteredRoles.map(role => {
      const row: any = {
        key: role.id,
        roleName: role.name,
        roleType: role.type,
        users: getAccountsWithRole(role.id)
      };

      // 为每个一级菜单（模块）设置权限
      allModules.forEach(module => {
        row[`module-${module}`] = getModulePermissions(role, module);
      });

      return row;
    });
  }, [filteredRoles, allModules]);

  // List视图：以角色+权限为行
  const listColumns: ColumnsType<any> = [
    {
      title: t('role.name'),
      dataIndex: 'roleName',
      key: 'roleName',
      width: 200,
      fixed: 'left' as const,
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Tag 
            color={record.roleType === 'INTERNAL' ? 'blue' : 'purple'} 
            size="small"
            style={{ marginTop: 4 }}
          >
            {record.roleType === 'INTERNAL' ? t('common.internal') : t('common.customer')}
          </Tag>
        </div>
      )
    },
    {
      title: t('role.module'),
      dataIndex: 'parentMenuName',
      key: 'parentMenuName',
      width: 180,
      render: (text: string, record: any) => {
        const config = MODULE_CONFIG[record.module] || { name: text, color: '#666' };
        return (
          <Space>
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: config.color,
              display: 'inline-block'
            }} />
            <span>{text}</span>
          </Space>
        );
      }
    },
    {
      title: t('role.feature'),
      dataIndex: 'menuName',
      key: 'menuName',
      width: 180
    },
    {
      title: t('role.permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      width: 300,
      render: (permissions: string[]) => {
        if (!permissions || permissions.length === 0) {
          return <Tag color="default">-</Tag>;
        }
        return (
          <Space wrap>
            {permissions.map(op => {
              const opConfig = OPERATION_ICONS[op];
              if (!opConfig) return null;
              return (
                <Tag 
                  key={op} 
                  color={opConfig.color === '#52c41a' ? 'success' : 
                         opConfig.color === '#722ed1' ? 'purple' :
                         opConfig.color === '#f5222d' ? 'error' :
                         opConfig.color === '#faad14' ? 'warning' : 'processing'}
                  icon={opConfig.icon}
                >
                  {opConfig.color === '#52c41a' && op === 'VIEW' ? '' : 
                   opConfig.color === '#52c41a' && op === 'CREATE' ? '+ ' : ''}
                  {t(`operation.${op}`) || op}
                </Tag>
              );
            })}
          </Space>
        );
      }
    },
    {
      title: t('nav.users'),
      dataIndex: 'users',
      key: 'users',
      width: 250,
      render: (users: Account[]) => {
        if (!users || users.length === 0) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        const userNames = users.map(u => u.username).join(', ');
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Space wrap>
                {users.slice(0, 3).map((user: Account) => (
                  <Tooltip key={user.id} title={user.username}>
                    <Avatar size="small" icon={<UserOutlined />} />
                  </Tooltip>
                ))}
                {users.length > 3 && (
                  <Tooltip title={users.slice(3).map(u => u.username).join(', ')}>
                    <Tag>+{users.length - 3}</Tag>
                  </Tooltip>
                )}
              </Space>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <span style={{ fontWeight: 500 }}>{users.length}</span> {t('role.users')}: {userNames}
            </div>
          </div>
        );
      }
    }
  ];

  const listData = useMemo(() => {
    const data: any[] = [];
    
    // 以角色名+二级菜单（页面）维度展示
    filteredRoles.forEach(role => {
      role.permissions.forEach(perm => {
        const moduleConfig = MODULE_CONFIG[perm.module] || { name: perm.module, color: '#666' };
        data.push({
          key: `${role.id}-${perm.module}-${perm.pageCode}`,
          roleName: role.name,
          roleType: role.type,
          module: perm.module,
          parentMenuName: moduleConfig.name, // 一级菜单名（模块）
          menuName: perm.page, // 二级菜单名（页面）
          permissions: perm.operations, // 所拥有权限
          users: getAccountsWithRole(role.id) // 拥有该角色的账号
        });
      });
    });

    return data;
  }, [filteredRoles]);

  const handleReset = () => {
    setFilters({
      roleType: 'ALL',
      module: 'ALL',
      permissionType: 'ALL_MENUS',
      roleStatus: 'ACTIVE'
    });
    setSearchText('');
    setShowDisabled(false);
    setShowEmpty(false);
    setViewMode('matrix');
  };

  const handleExport = () => {
    // TODO: 实现导出CSV功能
    console.log('导出CSV');
  };

  return (
    <div>
      {/* 面包屑 */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/roles')}>{t('nav.systemManagement')}</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a onClick={() => navigate('/roles')}>{t('nav.accessControl')}</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{t('nav.permissionMatrix')}</Breadcrumb.Item>
      </Breadcrumb>

      {/* 标题和操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {t('nav.permissionMatrix')}
          </Title>
          <Text type="secondary">
            {viewMode === 'matrix' 
              ? t('permissionMatrix.matrixSubtitle')
              : t('permissionMatrix.listSubtitle')}
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} />
          <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
            Export CSV
          </Button>
        </Space>
      </div>

      {/* 过滤器和搜索 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('common.type')}</div>
            <Select
              style={{ width: '100%' }}
              value={filters.roleType}
              onChange={(value) => setFilters({ ...filters, roleType: value })}
            >
              <Option value="ALL">{t('filter.allTypes')}</Option>
              <Option value="INTERNAL">{t('common.internal')}</Option>
              <Option value="CUSTOMER">{t('common.customer')}</Option>
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('role.module')}</div>
            <Select
              style={{ width: '100%' }}
              value={filters.module}
              onChange={(value) => setFilters({ ...filters, module: value })}
            >
              <Option value="ALL">{t('filter.allModules')}</Option>
              {Object.keys(MODULE_CONFIG).map(module => (
                <Option key={module} value={module}>
                  {MODULE_CONFIG[module].name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <div style={{ marginBottom: 8 }}>{t('common.status')}</div>
            <Select
              style={{ width: '100%' }}
              value={filters.roleStatus}
              onChange={(value) => setFilters({ ...filters, roleStatus: value })}
            >
              <Option value="ACTIVE">Active Only</Option>
              <Option value="ALL">All</Option>
            </Select>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Search
              placeholder={viewMode === 'matrix' 
                ? 'Search roles, modules...' 
                : 'Search roles, features, permissions...'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={12}>
            <Space>
              <Checkbox checked={showDisabled} onChange={(e) => setShowDisabled(e.target.checked)}>
                Show Disabled
              </Checkbox>
              {viewMode === 'matrix' && (
                <Checkbox checked={showEmpty} onChange={(e) => setShowEmpty(e.target.checked)}>
                  Show Empty
                </Checkbox>
              )}
              <Button onClick={handleReset}>{t('common.reset')}</Button>
              <Button type="primary">Apply Filters</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 权限图例 */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            {t('permissionMatrix.legend')}
          </div>
          <Space wrap>
            {Object.keys(OPERATION_ICONS).map(op => {
              const opConfig = OPERATION_ICONS[op];
              return (
                <Tag 
                  key={op}
                  color={opConfig.color === '#52c41a' ? 'success' : 
                         opConfig.color === '#722ed1' ? 'purple' :
                         opConfig.color === '#f5222d' ? 'error' :
                         opConfig.color === '#faad14' ? 'warning' : 'processing'}
                  icon={opConfig.icon}
                >
                  {opConfig.color === '#52c41a' && op === 'VIEW' ? '' : 
                   opConfig.color === '#52c41a' && op === 'CREATE' ? '+ ' : ''}
                  {t(`operation.${op}`) || op}
                </Tag>
              );
            })}
          </Space>
        </Space>
      </Card>

      {/* 视图切换和表格 */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            {viewMode === 'matrix' ? t('permissionMatrix.matrixTitle') : t('permissionMatrix.listTitle')}
          </Title>
          <Space>
            <Radio.Group 
              value={viewMode} 
              onChange={(e) => {
                setViewMode(e.target.value);
                // 同步更新权限类型过滤器
                if (e.target.value === 'matrix') {
                  setFilters({ ...filters, permissionType: 'ALL_MENUS' });
                } else {
                  setFilters({ ...filters, permissionType: 'ALL_RULES' });
                }
              }}
            >
              <Radio.Button value="matrix">{t('permissionMatrix.typeAllMenus')}</Radio.Button>
              <Radio.Button value="list">{t('permissionMatrix.typeAllRules')}</Radio.Button>
            </Radio.Group>
            <Button icon={<ReloadOutlined />} onClick={loadData} />
          </Space>
        </div>

        {viewMode === 'matrix' ? (
          <Table
            columns={matrixColumns}
            dataSource={matrixData}
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `Showing ${range[0]} to ${range[1]} of ${total} roles`
            }}
          />
        ) : (
          <Table
            columns={listColumns}
            dataSource={listData}
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total, range) => 
                `Showing ${range[0]} to ${range[1]} of ${total} permission entries`
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default PermissionView;
