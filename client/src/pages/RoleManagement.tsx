import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Table,
  Button,
  Form,
  Input,
  Select,
  Radio,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Checkbox,
  Collapse,
  Tooltip,
  message,
  Popconfirm,
  Modal
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  UploadOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';
import type { MenuProps } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

interface Role {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'DEPRECATED';
  permissions: Permission[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  modifiedBy?: string;
}

interface Permission {
  module: string;
  page: string;
  pageCode: string;
  operations: string[];
  dataScope?: {
    customers?: string[];
    warehouses?: string[];
    regions?: string[];
  };
}

const RoleManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { locale, t } = useLocale();
  const [form] = Form.useForm();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // 过滤器状态
  const [filters, setFilters] = useState({
    module: 'ALL',
    status: 'ACTIVE'
  });
  const [searchText, setSearchText] = useState('');
  
  // 权限选择状态
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, Record<string, string[]>>>({});
  
  // 用户列表Modal状态
  const [userListVisible, setUserListVisible] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [usersWithRole, setUsersWithRole] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 获取模块、操作和页面定义（在组件内部，使用 t 函数）
  const MODULES = [
    { value: 'KPI', label: t('module.KPI') },
    { value: 'INBOUND', label: t('module.INBOUND') },
    { value: 'INVENTORY', label: t('module.INVENTORY') },
    { value: 'OUTBOUND', label: t('module.OUTBOUND') },
    { value: 'RETURNS', label: t('module.RETURNS') },
    { value: 'FINANCE', label: t('module.FINANCE') },
    { value: 'SUPPLY_CHAIN', label: t('module.SUPPLY_CHAIN') },
    { value: 'ADMIN', label: t('module.ADMIN') }
  ];

  const OPERATIONS = [
    { value: 'VIEW', label: t('operation.VIEW') },
    { value: 'CREATE', label: t('operation.CREATE') },
    { value: 'EDIT', label: t('operation.EDIT') },
    { value: 'DELETE', label: t('operation.DELETE') },
    { value: 'EXPORT', label: t('operation.EXPORT') }
  ];

  const MODULE_PAGES: Record<string, Array<{ code: string; name: string; tooltip?: string }>> = {
    KPI: [
      { code: 'dashboard-view', name: t('page.dashboard-view'), tooltip: t('tooltip.dashboard-view') },
      { code: 'performance-metrics', name: t('page.performance-metrics'), tooltip: t('tooltip.performance-metrics') },
      { code: 'custom-reports', name: t('page.custom-reports'), tooltip: t('tooltip.custom-reports') }
    ],
    INBOUND: [
      { code: 'receiving', name: t('page.receiving'), tooltip: t('tooltip.receiving') },
      { code: 'put-away', name: t('page.put-away'), tooltip: t('tooltip.put-away') },
      { code: 'inbound-orders', name: t('page.inbound-orders'), tooltip: t('tooltip.inbound-orders') }
    ],
    INVENTORY: [
      { code: 'inventory-status', name: t('page.inventory-status'), tooltip: t('tooltip.inventory-status') },
      { code: 'sn-lookup', name: t('page.sn-lookup'), tooltip: t('tooltip.sn-lookup') },
      { code: 'cycle-count', name: t('page.cycle-count'), tooltip: t('tooltip.cycle-count') }
    ],
    OUTBOUND: [
      { code: 'order-list', name: t('page.order-list'), tooltip: t('tooltip.order-list') },
      { code: 'order-details', name: t('page.order-details'), tooltip: t('tooltip.order-details') },
      { code: 'order-fulfillment', name: t('page.order-fulfillment'), tooltip: t('tooltip.order-fulfillment') },
      { code: 'returns-processing', name: t('page.returns-processing'), tooltip: t('tooltip.returns-processing') }
    ],
    RETURNS: [
      { code: 'returns-list', name: t('page.returns-list'), tooltip: t('tooltip.returns-list') },
      { code: 'returns-processing', name: t('page.returns-processing'), tooltip: t('tooltip.returns-processing') }
    ],
    FINANCE: [
      { code: 'invoice-list', name: t('page.invoice-list'), tooltip: t('tooltip.invoice-list') },
      { code: 'financial-reports', name: t('page.financial-reports'), tooltip: t('tooltip.financial-reports') }
    ],
    SUPPLY_CHAIN: [
      { code: 'supplier-management', name: t('page.supplier-management'), tooltip: t('tooltip.supplier-management') },
      { code: 'purchase-orders', name: t('page.purchase-orders'), tooltip: t('tooltip.purchase-orders') }
    ],
    ADMIN: [
      { code: 'user-management', name: t('page.user-management'), tooltip: t('tooltip.user-management') },
      { code: 'role-management', name: t('page.role-management'), tooltip: t('tooltip.role-management') },
      { code: 'system-settings', name: t('page.system-settings'), tooltip: t('tooltip.system-settings') }
    ]
  };

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/roles', {
        params: {
          status: filters.status,
          module: filters.module !== 'ALL' ? filters.module : undefined
        }
      });
      if (response.data.success) {
        let data = response.data.data.items || [];
        
        // 搜索过滤（只搜索角色名称）
        if (searchText) {
          data = data.filter((role: Role) =>
            role.name.toLowerCase().includes(searchText.toLowerCase())
          );
        }
        
        setRoles(data);
      }
    } catch (error) {
      message.error(t('role.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [filters, searchText, t]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/roles' || path === '/roles/') {
      setIsEditMode(false);
      loadRoles();
    } else if (path === '/roles/create') {
      setIsEditMode(true);
      setEditingRole(null);
      form.resetFields();
      setSelectedPermissions({});
    } else if (params.id && path.includes('/edit')) {
      setIsEditMode(true);
      loadRoleForEdit(params.id);
    }
  }, [location.pathname, params.id, loadRoles, form]);

  const loadRoleForEdit = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/roles/${id}`);
      if (response.data.success) {
        const role = response.data.data;
        setEditingRole(role);
        
        // 设置表单值
        form.setFieldsValue({
          name: role.name,
          description: role.description,
          status: role.status
        });
        
        // 设置权限选择
        const permissions: Record<string, Record<string, string[]>> = {};
        role.permissions.forEach((perm: Permission) => {
          if (!permissions[perm.module]) {
            permissions[perm.module] = {};
          }
          permissions[perm.module][perm.pageCode] = perm.operations;
        });
        setSelectedPermissions(permissions);
      }
    } catch (error) {
      message.error(t('role.loadDetailFailed'));
      navigate('/roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 首次加载时获取账号列表
    loadAccounts();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      loadRoles();
    }
  }, [filters, isEditMode, loadRoles]);

  const loadAccounts = async () => {
    try {
      const response = await api.get('/accounts', {
        params: { page: 1, pageSize: 1000 }
      });
      if (response.data.success) {
        setAccounts(response.data.data.items || []);
      }
    } catch (error) {
      console.error('加载账号列表失败');
    }
  };

  // 创建账号ID到用户名的映射，提高查找效率
  const accountIdToUsernameMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach(acc => {
      map.set(acc.id, acc.username);
    });
    return map;
  }, [accounts]);

  const getUsernameByAccountId = (accountId: string | undefined): string => {
    if (!accountId) {
      return t('role.system');
    }
    const username = accountIdToUsernameMap.get(accountId);
    // 如果找不到账号，可能是账号列表还在加载中，返回accountId作为临时显示
    // 一旦账号列表加载完成，会自动更新显示
    return username || accountId;
  };

  const handleViewUsers = async (roleId: string) => {
    setSelectedRoleId(roleId);
    setUserListVisible(true);
    setLoadingUsers(true);
    
    try {
      // 获取所有账号
      const response = await api.get('/accounts', {
        params: { page: 1, pageSize: 1000 }
      });
      
      if (response.data.success) {
        // 过滤出使用该角色的账号
        const allAccounts = response.data.data.items || [];
        const users = allAccounts.filter((account: any) => 
          account.roles && account.roles.includes(roleId)
        );
        setUsersWithRole(users);
      }
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCloseUserList = () => {
    setUserListVisible(false);
    setSelectedRoleId(null);
    setUsersWithRole([]);
  };

  const handleCreate = () => {
    setIsEditMode(true);
    setEditingRole(null);
    form.resetFields();
    setSelectedPermissions({});
    navigate('/roles/create');
  };

  const handleEdit = (role: Role) => {
    setIsEditMode(true);
    setEditingRole(role);
    
    // 设置表单值
    form.setFieldsValue({
      name: role.name,
      description: role.description,
      status: role.status
    });
    
    // 设置权限选择
    const permissions: Record<string, Record<string, string[]>> = {};
    role.permissions.forEach(perm => {
      if (!permissions[perm.module]) {
        permissions[perm.module] = {};
      }
      permissions[perm.module][perm.pageCode] = perm.operations;
    });
    setSelectedPermissions(permissions);
    
    navigate(`/roles/${role.id}/edit`);
  };

  const handleDuplicate = async (role: Role) => {
    try {
      const response = await api.post('/roles', {
        name: `${role.name} (副本)`,
        description: role.description,
        status: 'ACTIVE',
        permissions: role.permissions
      });
      if (response.data.success) {
        message.success(t('role.copySuccess'));
        loadRoles();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || t('role.copyFailed'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      if (response.data.success) {
        message.success(t('role.deleteSuccess'));
        loadRoles();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || t('role.deleteFailed'));
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // 构建权限数组
      const permissions: Permission[] = [];
      Object.keys(selectedPermissions).forEach(module => {
        Object.keys(selectedPermissions[module]).forEach(pageCode => {
          const operations = selectedPermissions[module][pageCode];
          if (operations.length > 0) {
            const page = MODULE_PAGES[module]?.find(p => p.code === pageCode);
            permissions.push({
              module,
              page: page?.name || pageCode,
              pageCode,
              operations
            });
          }
        });
      });

      const payload = {
        ...values,
        permissions
      };

      if (editingRole) {
        const response = await api.put(`/roles/${editingRole.id}`, payload);
        if (response.data.success) {
          message.success(t('role.updateSuccess'));
          handleCancel();
        }
      } else {
        const response = await api.post('/roles', payload);
        if (response.data.success) {
          message.success(t('role.createSuccess'));
          handleCancel();
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || t('role.saveFailed'));
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditingRole(null);
    form.resetFields();
    setSelectedPermissions({});
    navigate('/roles');
  };

  const handlePermissionChange = (module: string, pageCode: string, operation: string, checked: boolean) => {
    setSelectedPermissions(prev => {
      const newPerms = { ...prev };
      if (!newPerms[module]) {
        newPerms[module] = {};
      }
      if (!newPerms[module][pageCode]) {
        newPerms[module][pageCode] = [];
      }
      
      if (checked) {
        newPerms[module][pageCode] = [...newPerms[module][pageCode], operation];
      } else {
        newPerms[module][pageCode] = newPerms[module][pageCode].filter(op => op !== operation);
      }
      
      return newPerms;
    });
  };

  const handleSelectAll = () => {
    const allPerms: Record<string, Record<string, string[]>> = {};
    MODULES.forEach(module => {
      const pages = MODULE_PAGES[module.value] || [];
      allPerms[module.value] = {};
      pages.forEach(page => {
        allPerms[module.value][page.code] = OPERATIONS.map(op => op.value);
      });
    });
    setSelectedPermissions(allPerms);
  };

  const handleClearAll = () => {
    setSelectedPermissions({});
  };

  // 全选某个模块的所有权限
  const handleSelectModule = (moduleValue: string) => {
    const pages = MODULE_PAGES[moduleValue] || [];
    const newPerms = { ...selectedPermissions };
    if (!newPerms[moduleValue]) {
      newPerms[moduleValue] = {};
    }
    pages.forEach(page => {
      newPerms[moduleValue][page.code] = OPERATIONS.map(op => op.value);
    });
    setSelectedPermissions(newPerms);
  };

  // 清空某个模块的所有权限
  const handleClearModule = (moduleValue: string) => {
    const newPerms = { ...selectedPermissions };
    if (newPerms[moduleValue]) {
      delete newPerms[moduleValue];
      setSelectedPermissions(newPerms);
    }
  };

  // 全选某个页面的所有操作
  const handleSelectPage = (moduleValue: string, pageCode: string) => {
    const newPerms = { ...selectedPermissions };
    if (!newPerms[moduleValue]) {
      newPerms[moduleValue] = {};
    }
    newPerms[moduleValue][pageCode] = OPERATIONS.map(op => op.value);
    setSelectedPermissions(newPerms);
  };

  // 清空某个页面的所有操作
  const handleClearPage = (moduleValue: string, pageCode: string) => {
    const newPerms = { ...selectedPermissions };
    if (newPerms[moduleValue] && newPerms[moduleValue][pageCode]) {
      delete newPerms[moduleValue][pageCode];
      // 如果模块下没有其他页面了，删除模块
      if (Object.keys(newPerms[moduleValue]).length === 0) {
        delete newPerms[moduleValue];
      }
      setSelectedPermissions(newPerms);
    }
  };

  const getModuleChips = (role: Role) => {
    const modules = new Set(role.permissions.map(p => p.module));
    if (modules.size === MODULES.length) {
      return <Tag>{t('common.all')}</Tag>;
    }
    return Array.from(modules).map(module => (
      <Tag key={module}>{MODULES.find(m => m.value === module)?.label || module}</Tag>
    ));
  };

  // 列表页
  if (!isEditMode) {
    const columns = [
      {
        title: t('role.name'),
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: Role) => (
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{record.id}</div>
          </div>
        )
      },
      {
        title: t('common.description'),
        dataIndex: 'description',
        key: 'description',
        ellipsis: true
      },
      {
        title: t('role.modules'),
        key: 'modules',
        render: (_: any, record: Role) => getModuleChips(record)
      },
      {
        title: t('role.users'),
        dataIndex: 'usageCount',
        key: 'usageCount',
        align: 'center' as const,
        render: (count: number, record: Role) => (
          <Button
            type="link"
            onClick={() => handleViewUsers(record.id)}
            disabled={count === 0}
            style={{ padding: 0 }}
          >
            {count}
          </Button>
        )
      },
      {
        title: t('common.status'),
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
          <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
            {status === 'ACTIVE' ? t('common.active') : t('common.deprecated')}
          </Tag>
        )
      },
      {
        title: t('role.lastModified'),
        key: 'lastModified',
        render: (_: any, record: Role) => (
          <div>
            <div>{new Date(record.updatedAt).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US')}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{t('role.modifiedBy')} {getUsernameByAccountId(record.modifiedBy)}</div>
          </div>
        )
      },
      {
        title: t('common.actions'),
        key: 'actions',
        render: (_: any, record: Role) => {
          return (
            <Space>
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                {t('common.edit')}
              </Button>
              <Button type="link" icon={<CopyOutlined />} onClick={() => handleDuplicate(record)}>
                {t('role.duplicate')}
              </Button>
              <Popconfirm
                title="确定要删除这个角色吗？"
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
                disabled={record.usageCount > 0}
              >
                <Tooltip 
                  title={record.usageCount > 0 ? `该角色正在被 ${record.usageCount} 个用户使用，无法删除` : ''}
                  placement="top"
                >
                  <Button 
                    type="link" 
                    danger 
                    icon={<DeleteOutlined />}
                    disabled={record.usageCount > 0}
                  >
                    {t('common.delete')}
                  </Button>
                </Tooltip>
              </Popconfirm>
            </Space>
          );
        }
      }
    ];

    return (
      <div>
        {/* 标题和操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>{t('role.title')}</h1>
          <Space>
            <Button icon={<UploadOutlined />}>{t('common.import')}</Button>
            <Button icon={<DownloadOutlined />}>{t('common.export')}</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              {t('role.create')}
            </Button>
          </Space>
        </div>

        {/* 过滤器和搜索 */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                value={filters.module}
                onChange={(value) => setFilters({ ...filters, module: value })}
                placeholder={t('role.module')}
              >
                <Option value="ALL">{t('filter.allModules')}</Option>
                {MODULES.map(m => (
                  <Option key={m.value} value={m.value}>{m.label}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                style={{ width: '100%' }}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                placeholder={t('common.status')}
              >
                <Option value="ACTIVE">{t('common.active')}</Option>
                <Option value="DEPRECATED">{t('common.deprecated')}</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Input
                placeholder={t('filter.searchPlaceholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={loadRoles}
              />
            </Col>
            <Col span={4}>
              <Space>
                <Button onClick={() => {
                  setFilters({ module: 'ALL', status: 'ACTIVE' });
                  setSearchText('');
                  loadRoles();
                }}>
                  {t('common.reset')}
                </Button>
                <Button type="primary" onClick={loadRoles}>{t('common.search')}</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={roles}
          loading={loading}
          rowKey="id"
          pagination={{
            showTotal: (total, range) => t('pagination.showing', { start: String(range[0]), end: String(range[1]), total: String(total) }),
            pageSize: 10,
            showSizeChanger: true
          }}
        />

        {/* 用户列表Modal */}
        <Modal
          title="使用该角色的用户列表"
          open={userListVisible}
          onCancel={handleCloseUserList}
          footer={[
            <Button key="close" onClick={handleCloseUserList}>
              关闭
            </Button>
          ]}
          width={800}
        >
          <Table
            dataSource={usersWithRole}
            loading={loadingUsers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: '用户名',
                dataIndex: 'username',
                key: 'username'
              },
              {
                title: '邮箱',
                dataIndex: 'email',
                key: 'email'
              },
              {
                title: '手机号',
                dataIndex: 'phone',
                key: 'phone',
                render: (phone: string) => phone || '-'
              },
              {
                title: '账号类型',
                dataIndex: 'accountType',
                key: 'accountType',
                render: (type: string) => {
                  const typeMap: Record<string, { text: string; color: string }> = {
                    MAIN: { text: '主账号', color: 'red' },
                    CUSTOMER: { text: '客户子账号', color: 'blue' },
                    PARTNER: { text: 'Partner账号', color: 'green' }
                  };
                  const info = typeMap[type] || { text: type, color: 'default' };
                  return <Tag color={info.color}>{info.text}</Tag>;
                }
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => {
                  const statusMap: Record<string, { text: string; color: string }> = {
                    ACTIVE: { text: '启用', color: 'green' },
                    INACTIVE: { text: '禁用', color: 'default' },
                    SUSPENDED: { text: '暂停', color: 'orange' }
                  };
                  const info = statusMap[status] || { text: status, color: 'default' };
                  return <Tag color={info.color}>{info.text}</Tag>;
                }
              }
            ]}
          />
        </Modal>
      </div>
    );
  }

  // 编辑/创建页
  return (
    <div>
      {/* 标题和操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>{editingRole ? t('role.editTitle') : t('role.createTitle')}</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>{t('role.subtitle')}</p>
        </div>
        <Space>
          <Button onClick={handleCancel}>{t('common.cancel')}</Button>
          <Button type="primary" onClick={handleSave}>
            {editingRole ? t('role.saveChanges') : t('role.create')}
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        {/* Role Details */}
        <Card title={t('role.roleDetails')} style={{ marginBottom: 24 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={
                  <>
                    {t('role.name')} <span style={{ color: 'red' }}>*</span>
                  </>
                }
                rules={[{ required: true, message: t('role.nameRequired') }]}
                tooltip={t('role.nameTooltip')}
              >
                <Input placeholder={t('role.namePlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <>
                    {t('role.id')} <span style={{ color: 'red' }}>*</span>
                  </>
                }
                tooltip={t('role.idTooltip')}
              >
                <Input value={editingRole?.id || t('role.idAuto')} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={t('common.description')}
          >
            <TextArea
              rows={4}
              placeholder={t('role.descriptionPlaceholder')}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={
              <>
                {t('common.status')} <span style={{ color: 'red' }}>*</span>
              </>
            }
            rules={[{ required: true, message: t('role.statusRequired') }]}
          >
            <Radio.Group>
              <Space>
                <Radio value="ACTIVE">
                  <div>
                    <div style={{ fontWeight: 500 }}>{t('role.statusActive')}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{t('role.statusActiveDesc')}</div>
                  </div>
                </Radio>
                <Radio value="DEPRECATED">
                  <div>
                    <div style={{ fontWeight: 500 }}>{t('role.statusDeprecated')}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{t('role.statusDeprecatedDesc')}</div>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Card>

        {/* Permission Configuration */}
        <Card
          title={t('role.permissions')}
          extra={
            <Space>
              <Button onClick={handleSelectAll}>{t('common.selectAll')}</Button>
              <Button onClick={handleClearAll}>{t('common.clearAll')}</Button>
            </Space>
          }
        >
          <Collapse defaultActiveKey={MODULES.map(m => m.value)}>
            {MODULES.map(module => {
              const pages = MODULE_PAGES[module.value] || [];
              return (
                <Panel 
                  header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{module.label}</span>
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectModule(module.value);
                        }}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        全选
                      </Button>
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearModule(module.value);
                        }}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        清空
                      </Button>
                    </div>
                  } 
                  key={module.value}
                >
                  <Table
                    dataSource={pages}
                    rowKey="code"
                    pagination={false}
                    columns={[
                      {
                        title: t('role.feature'),
                        dataIndex: 'name',
                        key: 'name',
                        render: (text: string, record: any) => (
                          <Space>
                            {text}
                            {record.tooltip && (
                              <Tooltip title={record.tooltip}>
                                <InfoCircleOutlined style={{ color: '#999' }} />
                              </Tooltip>
                            )}
                            <Button
                              type="link"
                              size="small"
                              onClick={() => handleSelectPage(module.value, record.code)}
                              style={{ padding: 0, height: 'auto', fontSize: 12 }}
                            >
                              全选
                            </Button>
                            <Button
                              type="link"
                              size="small"
                              onClick={() => handleClearPage(module.value, record.code)}
                              style={{ padding: 0, height: 'auto', fontSize: 12 }}
                            >
                              清空
                            </Button>
                          </Space>
                        )
                      },
                      ...OPERATIONS.map(op => ({
                        title: op.label,
                        key: op.value,
                        align: 'center' as const,
                        render: (_: any, record: any) => {
                          const checked = selectedPermissions[module.value]?.[record.code]?.includes(op.value) || false;
                          return (
                            <Checkbox
                              checked={checked}
                              onChange={(e) => handlePermissionChange(module.value, record.code, op.value, e.target.checked)}
                            />
                          );
                        }
                      }))
                    ]}
                  />
                </Panel>
              );
            })}
          </Collapse>
        </Card>
      </Form>
    </div>
  );
};

export default RoleManagement;
