import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, Select, Table, Tag, Space, Radio, Tooltip, Avatar, Input, 
  Button, Row, Col, Typography, Divider 
} from 'antd';
import { 
  UserOutlined, EyeOutlined, PlusOutlined, EditOutlined, 
  DeleteOutlined, CheckCircleOutlined, DownloadOutlined,
  ReloadOutlined, InfoCircleOutlined
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

// 模块配置（包含颜色和显示名称）- 与角色管理保持一致
const MODULE_CONFIG: Record<string, { name: string; color: string }> = {
  'DASHBOARDS': { name: 'Dashboards', color: '#722ed1' },
  'PURCHASE_MANAGEMENT': { name: 'Purchase Management', color: '#fa8c16' },
  'SALES_ORDER': { name: 'Sales Order', color: '#52c41a' },
  'WORK_ORDER': { name: 'Work Order', color: '#eb2f96' },
  'INBOUND': { name: 'Inbound', color: '#f5222d' },
  'INVENTORY': { name: 'Inventory', color: '#1890ff' },
  'OUTBOUND': { name: 'Outbound', color: '#722ed1' },
  'RETURNS': { name: 'Returns', color: '#fa8c16' },
  'YARD_MANAGEMENT': { name: 'Yard Management', color: '#52c41a' },
  'SUPPLY_CHAIN': { name: 'Supply Chain Mgmt', color: '#eb2f96' },
  'FINANCE': { name: 'Finance', color: '#f5222d' },
  'SYSTEM_MANAGEMENT': { name: 'System Management', color: '#1890ff' },
  'PERMISSION_MANAGEMENT': { name: 'Permission Management', color: '#722ed1' }
};

// 操作图标映射（基于角色管理中的功能配置）
const OPERATION_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  'VIEW': { icon: <EyeOutlined />, color: '#52c41a' },
  'CREATE': { icon: <PlusOutlined />, color: '#52c41a' },
  'EDIT': { icon: <EditOutlined />, color: '#722ed1' },
  'DELETE': { icon: <DeleteOutlined />, color: '#f5222d' },
  'EXPORT': { icon: <DownloadOutlined />, color: '#1890ff' },
  'IMPORT': { icon: <ReloadOutlined />, color: '#1890ff' },
  'CANCEL': { icon: <DeleteOutlined />, color: '#faad14' },
  // 将所有 download、print 相关操作都映射为导出
  'PRINT_PACKING_SLIP': { icon: <DownloadOutlined />, color: '#1890ff' },
  'DOWNLOAD_PDF': { icon: <DownloadOutlined />, color: '#1890ff' },
  'DOWNLOAD_TEMPLATE': { icon: <DownloadOutlined />, color: '#1890ff' },
  'DOWNLOAD': { icon: <DownloadOutlined />, color: '#1890ff' },
  // 将 inventory、attachment、setting、reload 相关操作归纳为编辑
  'HOLD_INVENTORY': { icon: <EditOutlined />, color: '#722ed1' },
  'RELEASE_INVENTORY': { icon: <EditOutlined />, color: '#722ed1' },
  'ADD_ATTACHMENT': { icon: <EditOutlined />, color: '#722ed1' },
  'SET_ALERT': { icon: <EditOutlined />, color: '#722ed1' },
  'SET_DEFAULT': { icon: <EditOutlined />, color: '#722ed1' },
  'RELOAD': { icon: <EditOutlined />, color: '#722ed1' },
  // 将所有 import 相关操作都映射为导入
  'IMPORT_RMA': { icon: <ReloadOutlined />, color: '#1890ff' },
  'BATCH_IMPORT': { icon: <ReloadOutlined />, color: '#1890ff' },
  'RESET_FIELDS': { icon: <ReloadOutlined />, color: '#faad14' },
  'PAY': { icon: <CheckCircleOutlined />, color: '#52c41a' },
  // 将 invoice detail 归纳为查看
  'INVOICE_DETAIL': { icon: <EyeOutlined />, color: '#52c41a' }
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
    module: 'ALL',
    permissionType: 'ALL_MENUS' // 'ALL_MENUS' | 'ALL_RULES'
  });
  const [roleNameFilter, setRoleNameFilter] = useState('');

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
        console.log('Loaded roles:', rolesResponse.data.data.items?.length || 0);
      }

      // 加载账号列表
      const accountsResponse = await api.get('/accounts', {
        params: { page: 1, pageSize: 1000 }
      });
      if (accountsResponse.data.success) {
        setAccounts(accountsResponse.data.data.items || []);
        console.log('Loaded accounts:', accountsResponse.data.data.items?.length || 0);
        console.log('Accounts data:', accountsResponse.data.data.items);
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

    // 角色状态过滤 - 只显示活跃角色
    result = result.filter(r => r.status === 'ACTIVE');

    // 角色名称过滤
    if (roleNameFilter) {
      const lowerRoleFilter = roleNameFilter.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(lowerRoleFilter)
      );
    }

    // 模块过滤
    if (filters.module !== 'ALL') {
      result = result.filter(r => 
        r.permissions.some(p => p.module === filters.module)
      );
    }

    // 只显示有权限的角色
    result = result.filter(r => r.permissions.length > 0);

    return result;
  }, [roles, filters, roleNameFilter]);

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
        render: (text: string, record: any) => (
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
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
          
          // 合并导出相关操作
          const exportOperations = ['EXPORT', 'PRINT_PACKING_SLIP', 'DOWNLOAD_PDF', 'DOWNLOAD_TEMPLATE', 'DOWNLOAD'];
          const hasExport = permissions.some((op: string) => exportOperations.includes(op));
          
          // 合并编辑相关操作（包括 inventory、attachment、setting、reload 操作）
          const editOperations = ['EDIT', 'HOLD_INVENTORY', 'RELEASE_INVENTORY', 'ADD_ATTACHMENT', 'SET_ALERT', 'SET_DEFAULT', 'RELOAD'];
          const hasEdit = permissions.some((op: string) => editOperations.includes(op));
          
          // 合并导入相关操作
          const importOperations = ['IMPORT', 'IMPORT_RMA', 'BATCH_IMPORT'];
          const hasImport = permissions.some((op: string) => importOperations.includes(op));
          
          // 合并查看相关操作（包括 invoice detail）
          const viewOperations = ['VIEW', 'INVOICE_DETAIL'];
          const hasView = permissions.some((op: string) => viewOperations.includes(op));
          
          const otherOperations = permissions.filter((op: string) => 
            !exportOperations.includes(op) && !editOperations.includes(op) && !importOperations.includes(op) && !viewOperations.includes(op)
          );
          
          const displayOperations = [...otherOperations];
          if (hasView) {
            displayOperations.push('VIEW');
          }
          if (hasEdit) {
            displayOperations.push('EDIT');
          }
          if (hasExport) {
            displayOperations.push('EXPORT');
          }
          if (hasImport) {
            displayOperations.push('IMPORT');
          }
          
          return (
            <Space size={4} wrap>
              {displayOperations.map((op: string) => {
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
          <span>{text}</span>
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
        
        // 合并导出相关操作
        const exportOperations = ['EXPORT', 'PRINT_PACKING_SLIP', 'DOWNLOAD_PDF', 'DOWNLOAD_TEMPLATE', 'DOWNLOAD'];
        const hasExport = permissions.some(op => exportOperations.includes(op));
        
        // 合并编辑相关操作（包括 inventory、attachment、setting、reload 操作）
        const editOperations = ['EDIT', 'HOLD_INVENTORY', 'RELEASE_INVENTORY', 'ADD_ATTACHMENT', 'SET_ALERT', 'SET_DEFAULT', 'RELOAD'];
        const hasEdit = permissions.some(op => editOperations.includes(op));
        
        // 合并导入相关操作
        const importOperations = ['IMPORT', 'IMPORT_RMA', 'BATCH_IMPORT'];
        const hasImport = permissions.some(op => importOperations.includes(op));
        
        // 合并查看相关操作（包括 invoice detail）
        const viewOperations = ['VIEW', 'INVOICE_DETAIL'];
        const hasView = permissions.some(op => viewOperations.includes(op));
        
        const otherOperations = permissions.filter(op => 
          !exportOperations.includes(op) && !editOperations.includes(op) && !importOperations.includes(op) && !viewOperations.includes(op)
        );
        
        const displayOperations = [...otherOperations];
        if (hasView) {
          displayOperations.push('VIEW');
        }
        if (hasEdit) {
          displayOperations.push('EDIT');
        }
        if (hasExport) {
          displayOperations.push('EXPORT');
        }
        if (hasImport) {
          displayOperations.push('IMPORT');
        }
        
        return (
          <Space wrap>
            {displayOperations.map(op => {
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
    // 对于列表视图，我们需要使用所有活跃角色，然后在权限级别进行模块过滤
    const activeRoles = roles.filter(r => r.status === 'ACTIVE' && r.permissions.length > 0);
    
    activeRoles.forEach(role => {
      // 应用角色名称过滤
      let shouldIncludeRole = true;
      if (roleNameFilter) {
        const lowerRoleFilter = roleNameFilter.toLowerCase();
        shouldIncludeRole = role.name.toLowerCase().includes(lowerRoleFilter);
      }
      
      if (shouldIncludeRole) {
        role.permissions.forEach(perm => {
          // 应用模块过滤 - 在权限级别进行过滤
          if (filters.module === 'ALL' || perm.module === filters.module) {
            const moduleConfig = MODULE_CONFIG[perm.module] || { name: perm.module, color: '#666' };
            data.push({
              key: `${role.id}-${perm.module}-${perm.pageCode}`,
              roleName: role.name,
              module: perm.module,
              parentMenuName: moduleConfig.name, // 一级菜单名（模块）
              menuName: perm.page, // 二级菜单名（页面）
              permissions: perm.operations, // 所拥有权限
              users: getAccountsWithRole(role.id) // 拥有该角色的账号
            });
          }
        });
      }
    });

    return data;
  }, [roles, filters.module, roleNameFilter]);

  const handleReset = () => {
    setFilters({
      module: 'ALL',
      permissionType: 'ALL_MENUS'
    });
    setRoleNameFilter('');
    setViewMode('matrix');
  };

  return (
    <div>
      {/* 标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {t('permission.title')}
          </Title>
        </div>
      </div>

      {/* 过滤器和搜索 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
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
            <div style={{ marginBottom: 8 }}>{t('permission.roleName')}</div>
            <Input
              placeholder={t('permission.searchRoleName')}
              value={roleNameFilter}
              onChange={(e) => setRoleNameFilter(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 8 }}>&nbsp;</div>
            <Space>
              <Button onClick={handleReset}>{t('common.reset')}</Button>
              <Button type="primary">{t('common.search')}</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 权限图例 */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            {t('permission.permissionLegend')}
          </div>
          <Space wrap>
            {(() => {
              // 定义唯一的操作类型，相关操作归纳合并
              const uniqueOperations = [
                { key: 'VIEW', icon: <EyeOutlined />, color: '#52c41a', label: t('operation.VIEW') },
                { key: 'CREATE', icon: <PlusOutlined />, color: '#52c41a', label: t('operation.CREATE') },
                { key: 'EDIT', icon: <EditOutlined />, color: '#722ed1', label: t('operation.EDIT') },
                { key: 'DELETE', icon: <DeleteOutlined />, color: '#f5222d', label: t('operation.DELETE') },
                { key: 'EXPORT', icon: <DownloadOutlined />, color: '#1890ff', label: t('operation.EXPORT') },
                { key: 'IMPORT', icon: <ReloadOutlined />, color: '#1890ff', label: t('operation.IMPORT') },
                { key: 'CANCEL', icon: <DeleteOutlined />, color: '#faad14', label: t('operation.CANCEL') },
                { key: 'PAY', icon: <CheckCircleOutlined />, color: '#52c41a', label: t('operation.PAY') }
              ];

              return uniqueOperations.map(config => (
                <Tag 
                  key={config.key}
                  color={config.color === '#52c41a' ? 'success' : 
                         config.color === '#722ed1' ? 'purple' :
                         config.color === '#f5222d' ? 'error' :
                         config.color === '#faad14' ? 'warning' : 'processing'}
                  icon={config.icon}
                >
                  {config.label}
                </Tag>
              ));
            })()}
          </Space>
        </Space>
      </Card>

      {/* 视图切换和表格 */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            {viewMode === 'matrix' ? t('permission.matrixView') : t('permission.listView')}
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
              <Radio.Button value="matrix">{t('permission.matrixView')}</Radio.Button>
              <Radio.Button value="list">{t('permission.listView')}</Radio.Button>
            </Radio.Group>
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
                t('permission.showingRoles', { 
                  start: range[0].toString(), 
                  end: range[1].toString(), 
                  total: total.toString() 
                })
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
                t('permission.showingPermissions', { 
                  start: range[0].toString(), 
                  end: range[1].toString(), 
                  total: total.toString() 
                })
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default PermissionView;
