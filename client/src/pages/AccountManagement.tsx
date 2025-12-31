import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const { Option } = Select;

interface Account {
  id: string;
  username: string;
  email: string;
  phone?: string;  // 手机号（可选）
  accountType: string;
  status: string;
  customerIds?: string[];
  accessibleCustomerIds?: string[];
  roles: string[];
}

const AccountManagement: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  // 筛选状态
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    phone: '',
    customerIds: undefined as string[] | undefined,
    accountType: undefined as string | undefined,
    status: undefined as string | undefined
  });

  useEffect(() => {
    loadAccounts();
    loadCustomers();
    loadRoles();
  }, []);

  const loadAccounts = async () => {
    loadAccountsWithFilters(filters);
  };
  
  const handleResetFilters = () => {
    const resetFilters = {
      username: '',
      email: '',
      phone: '',
      customerIds: undefined as string[] | undefined,
      accountType: undefined as string | undefined,
      status: undefined as string | undefined
    };
    setFilters(resetFilters);
    // 使用重置后的筛选条件加载数据
    loadAccountsWithFilters(resetFilters);
  };
  
  const loadAccountsWithFilters = async (filterParams: typeof filters) => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        pageSize: 1000 // 获取所有数据，前端分页
      };
      
      // 添加筛选参数
      if (filterParams.username) {
        params.username = filterParams.username;
      }
      if (filterParams.email) {
        params.email = filterParams.email;
      }
      if (filterParams.phone) {
        params.phone = filterParams.phone;
      }
      if (filterParams.customerIds && filterParams.customerIds.length > 0) {
        params.customerIds = filterParams.customerIds;
      }
      if (filterParams.accountType) {
        params.accountType = filterParams.accountType;
      }
      if (filterParams.status) {
        params.status = filterParams.status;
      }
      
      const response = await api.get('/accounts', { params });
      if (response.data.success) {
        setAccounts(response.data.data.items || []);
      }
    } catch (error) {
      message.error('加载账号列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/permissions/customers');
      if (response.data.success) {
        setCustomers(response.data.data || []);
      }
    } catch (error) {
      console.error('加载Customer列表失败');
    }
  };

  const loadRoles = async () => {
    try {
      // 只加载ACTIVE状态的角色
      const response = await api.get('/roles', {
        params: { status: 'ACTIVE', page: 1, pageSize: 1000 }
      });
      if (response.data.success) {
        setRoles(response.data.data.items || []);
      }
    } catch (error) {
      console.error('加载角色列表失败');
    }
  };

  const handleCreate = () => {
    setEditingAccount(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    // 统一使用accessibleCustomerIds字段，兼容customerIds
    const customerIds = account.customerIds || account.accessibleCustomerIds || [];
    form.setFieldsValue({
      ...account,
      accountType: account.accountType,
      accessibleCustomerIds: customerIds,
      customerIds: undefined // 清除customerIds，统一使用accessibleCustomerIds
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/accounts/${id}`);
      if (response.data.success) {
        message.success('删除成功');
        loadAccounts();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // 账号类型只起到标签作用，统一使用accessibleCustomerIds字段
      // 处理"全部customer"选项：将"ALL"转换为所有customer的ID列表
      const customerFieldValue = values.customerIds || values.accessibleCustomerIds;
      if (customerFieldValue && customerFieldValue.includes('ALL')) {
        const allCustomerIds = customers.map(c => c.id);
        // 统一使用accessibleCustomerIds字段
        values.accessibleCustomerIds = allCustomerIds;
        delete values.customerIds;
      } else if (customerFieldValue) {
        // 统一使用accessibleCustomerIds字段
        values.accessibleCustomerIds = customerFieldValue.filter((v: string) => v !== 'ALL');
        delete values.customerIds;
      }

      if (editingAccount) {
        // 更新：统一使用accessibleCustomerIds字段
        const updatePayload = {
          ...values,
          accessibleCustomerIds: values.accessibleCustomerIds || [],
          customerIds: undefined // 清除customerIds，统一使用accessibleCustomerIds
        };
        const response = await api.put(`/accounts/${editingAccount.id}`, updatePayload);
        if (response.data.success) {
          message.success('更新成功');
          setModalVisible(false);
          loadAccounts();
        }
      } else {
        // 创建：根据账号类型选择不同的端点（保持向后兼容），但统一字段处理
        const endpoint = values.accountType === 'CUSTOMER' ? '/accounts/customer' : '/accounts/partner';
        const payload: any = {
          ...values,
          // 统一使用accessibleCustomerIds，但根据端点设置对应字段以保持API兼容
          accessibleCustomerIds: values.accountType === 'PARTNER' ? values.accessibleCustomerIds : undefined,
          customerIds: values.accountType === 'CUSTOMER' ? values.accessibleCustomerIds : undefined
        };
        const response = await api.post(endpoint, payload);
        if (response.data.success) {
          message.success('创建成功');
          setModalVisible(false);
          form.resetFields();
          loadAccounts();
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  // 获取Customer名称
  // 账号类型只起到标签作用，客户子账号和Partner子账号逻辑相同
  const getCustomerNames = (account: Account) => {
    // 主账号固定显示"全部customer"
    if (account.accountType === 'MAIN') {
      return <Tag color="blue">全部customer</Tag>;
    }
    
    // 统一使用customerIds或accessibleCustomerIds
    const customerIds = account.customerIds || account.accessibleCustomerIds || [];
    
    if (customerIds.length === 0) {
      return <span style={{ color: '#999' }}>无</span>;
    }
    
    // 检查是否选择了所有customer（数量相等且所有ID都在列表中）
    const allCustomerIds = customers.map(c => c.id);
    const hasAllCustomers = customerIds.length === allCustomerIds.length && 
      allCustomerIds.every(id => customerIds.includes(id));
    
    if (hasAllCustomers) {
      return <Tag color="blue">全部customer</Tag>;
    }
    
    return (
      <Space wrap>
        {customerIds.map((id: string) => {
          const customer = customers.find(c => c.id === id);
          return (
            <Tag key={id} color="blue">
              {customer ? `${customer.name}(${customer.code})` : id}
            </Tag>
          );
        })}
      </Space>
    );
  };

  // 获取角色名称
  const getRoleNames = (account: Account) => {
    // 主账号固定显示"全部权限"
    if (account.accountType === 'MAIN') {
      return <Tag color="purple">全部权限</Tag>;
    }
    
    if (!account.roles || account.roles.length === 0) {
      return <span style={{ color: '#999' }}>无</span>;
    }
    
    return (
      <Space wrap>
        {account.roles.map((roleId: string) => {
          const role = roles.find(r => r.id === roleId);
          return (
            <Tag key={roleId} color="purple">
              {role ? role.name : roleId}
            </Tag>
          );
        })}
      </Space>
    );
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '账号类型',
      dataIndex: 'accountType',
      key: 'accountType',
      width: 120,
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
      title: '可访问Customer',
      key: 'customers',
      width: 300,
      render: (_: any, record: Account) => getCustomerNames(record)
    },
    {
      title: '角色信息',
      key: 'roles',
      width: 350,
      render: (_: any, record: Account) => getRoleNames(record)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          ACTIVE: { text: '启用', color: 'green' },
          INACTIVE: { text: '禁用', color: 'default' },
          SUSPENDED: { text: '暂停', color: 'orange' }
        };
        const info = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Account) => {
        // admin账号可以管理其他账号，但不能管理自己
        const isAdmin = user?.username === 'admin';
        const isCurrentUser = user?.id === record.id;
        
        // 如果是admin账号自己，不支持任何操作
        if (isAdmin && isCurrentUser) {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        // 主账号不支持任何操作（包括admin账号也不能操作其他主账号）
        if (record.accountType === 'MAIN') {
          return <span style={{ color: '#999' }}>-</span>;
        }
        
        // 其他账号类型正常显示操作按钮
        return (
          <Space>
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个账号吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>账号管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建账号
        </Button>
      </div>
      
      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="用户名"
              value={filters.username}
              onChange={(e) => setFilters({ ...filters, username: e.target.value })}
              onPressEnter={loadAccounts}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="邮箱"
              value={filters.email}
              onChange={(e) => setFilters({ ...filters, email: e.target.value })}
              onPressEnter={loadAccounts}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="手机号"
              value={filters.phone}
              onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
              onPressEnter={loadAccounts}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="账号类型"
              value={filters.accountType}
              onChange={(value) => setFilters({ ...filters, accountType: value })}
              allowClear
            >
              <Option value="MAIN">主账号</Option>
              <Option value="CUSTOMER">客户子账号</Option>
              <Option value="PARTNER">Partner账号</Option>
            </Select>
          </Col>
        </Row>
        <Row gutter={16} align="middle" style={{ marginTop: 16 }}>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              mode="multiple"
              placeholder="可访问Customer"
              value={filters.customerIds}
              onChange={(value) => setFilters({ ...filters, customerIds: value })}
              allowClear
            >
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.code})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="状态"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="ACTIVE">启用</Option>
              <Option value="INACTIVE">禁用</Option>
              <Option value="SUSPENDED">暂停</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Space>
              <Button onClick={handleResetFilters}>重置</Button>
              <Button type="primary" onClick={loadAccounts}>搜索</Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Table
        columns={columns}
        dataSource={accounts}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingAccount ? '编辑账号' : '创建账号'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'ACTIVE' }}
        >
          {!editingAccount && (
            <Form.Item
              name="accountType"
              label="账号类型"
              rules={[{ required: true, message: '请选择账号类型' }]}
            >
              <Select>
                <Option value="CUSTOMER">客户子账号</Option>
                <Option value="PARTNER">Partner账号</Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email', message: '请输入有效的邮箱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input placeholder="选填" />
          </Form.Item>
          {!editingAccount && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="ACTIVE">启用</Option>
              <Option value="INACTIVE">禁用</Option>
              <Option value="SUSPENDED">暂停</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="accessibleCustomerIds"
            label="可访问Customer"
          >
            <Select 
              mode="multiple" 
              placeholder="请选择Customer"
              onChange={(value: string[]) => {
                // 如果选择了"全部customer"，清空其他选择
                if (value.includes('ALL')) {
                  form.setFieldsValue({
                    accessibleCustomerIds: ['ALL']
                  });
                } else {
                  // 如果选择了其他customer，移除"ALL"选项
                  const filteredValue = value.filter(v => v !== 'ALL');
                  form.setFieldsValue({
                    accessibleCustomerIds: filteredValue
                  });
                }
              }}
            >
              <Option key="ALL" value="ALL">全部customer</Option>
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="roleIds"
            label="角色"
          >
            <Select mode="multiple" placeholder="请选择角色">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountManagement;

