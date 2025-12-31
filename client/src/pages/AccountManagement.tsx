import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;

interface Account {
  id: string;
  username: string;
  email: string;
  phone: string;
  accountType: string;
  status: string;
  customerIds?: string[];
  accessibleCustomerIds?: string[];
  roles: string[];
}

const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    loadAccounts();
    loadCustomers();
    loadRoles();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounts');
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
      const response = await api.get('/roles');
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
    form.setFieldsValue({
      ...account,
      accountType: account.accountType
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
      if (editingAccount) {
        // 更新
        const response = await api.put(`/accounts/${editingAccount.id}`, values);
        if (response.data.success) {
          message.success('更新成功');
          setModalVisible(false);
          loadAccounts();
        }
      } else {
        // 创建
        const endpoint = values.accountType === 'CUSTOMER' ? '/accounts/customer' : '/accounts/partner';
        const payload = {
          ...values,
          customerIds: values.accountType === 'CUSTOMER' ? values.customerIds : undefined,
          accessibleCustomerIds: values.accountType === 'PARTNER' ? values.accessibleCustomerIds : undefined
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

  const columns = [
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
      key: 'phone'
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
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Account) => (
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
      )
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
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input />
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
            name={form.getFieldValue('accountType') === 'CUSTOMER' ? 'customerIds' : 'accessibleCustomerIds'}
            label={form.getFieldValue('accountType') === 'CUSTOMER' ? '所属Customer' : '可访问Customer'}
          >
            <Select mode="multiple" placeholder="请选择Customer">
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

