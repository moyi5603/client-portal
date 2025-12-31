import React, { useState, useEffect } from 'react';
import { Tree, Select, Button, message, Card, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;

interface Menu {
  id: string;
  name: string;
  code: string;
  path: string;
  children?: Menu[];
}

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [accountMenus, setAccountMenus] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMenus();
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      loadAccountMenus(selectedAccountId);
    }
  }, [selectedAccountId]);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menus');
      if (response.data.success) {
        setMenus(response.data.data || []);
      }
    } catch (error) {
      message.error('加载菜单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      if (response.data.success) {
        setAccounts(response.data.data.items || []);
      }
    } catch (error) {
      console.error('加载账号列表失败');
    }
  };

  const loadAccountMenus = async (accountId: string) => {
    try {
      const response = await api.get(`/menus/account/${accountId}`);
      if (response.data.success) {
        const menuIds = response.data.data.map((menu: Menu) => menu.id);
        setAccountMenus(menuIds);
      }
    } catch (error) {
      message.error('加载账号菜单失败');
    }
  };

  const handleMenuCheck = async (checkedKeys: any) => {
    if (!selectedAccountId) {
      message.warning('请先选择账号');
      return;
    }

    try {
      // 获取所有角色，这里简化处理，实际应该通过角色来分配菜单
      const rolesResponse = await api.get('/roles');
      if (rolesResponse.data.success) {
        // 这里需要根据选中的菜单找到对应的角色，或者创建新的角色
        // 简化处理：直接更新账号的角色（实际应该通过角色管理）
        message.info('菜单权限通过角色进行管理，请到角色管理页面配置');
      }
    } catch (error) {
      message.error('更新菜单权限失败');
    }
  };

  const treeData = menus.map(menu => ({
    title: `${menu.name} (${menu.code})`,
    key: menu.id,
    children: menu.children?.map(child => ({
      title: `${child.name} (${child.code})`,
      key: child.id
    }))
  }));

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>菜单管理</h2>
        <Button icon={<ReloadOutlined />} onClick={loadMenus}>
          刷新
        </Button>
      </div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <span style={{ marginRight: 8 }}>选择账号：</span>
            <Select
              style={{ width: 300 }}
              placeholder="请选择账号"
              value={selectedAccountId}
              onChange={setSelectedAccountId}
            >
              {accounts.map(account => (
                <Option key={account.id} value={account.id}>
                  {account.username} ({account.accountType === 'CUSTOMER' ? '客户子账号' : account.accountType === 'PARTNER' ? 'Partner账号' : '主账号'})
                </Option>
              ))}
            </Select>
          </div>
          {selectedAccountId && (
            <div>
              <h3>账号可见菜单（通过角色配置）</h3>
              <Tree
                checkable
                checkedKeys={accountMenus}
                onCheck={handleMenuCheck}
                treeData={treeData}
                defaultExpandAll
              />
              <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
                <p>提示：菜单权限通过角色进行管理。请到角色管理页面为角色分配菜单权限，然后为账号分配相应的角色。</p>
              </div>
            </div>
          )}
          {!selectedAccountId && (
            <div>
              <h3>系统菜单列表</h3>
              <Tree
                treeData={treeData}
                defaultExpandAll
              />
              <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
                <p>提示：菜单由系统预定义，不能创建或删除。请选择账号查看其可见菜单。</p>
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default MenuManagement;

