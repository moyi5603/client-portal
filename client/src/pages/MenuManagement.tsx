import React, { useState, useEffect } from 'react';
import { Tree, Select, Button, message, Card, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';

const { Option } = Select;

interface Menu {
  id: string;
  name: string;
  code: string;
  path: string;
  children?: Menu[];
}

const MenuManagement: React.FC = () => {
  const { t } = useLocale();
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
      message.error(t('menu.loadMenusFailed'));
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
      console.error(t('menu.loadAccountsFailed'));
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
      message.error(t('menu.loadAccountMenusFailed'));
    }
  };

  const handleMenuCheck = async (checkedKeys: any) => {
    if (!selectedAccountId) {
      message.warning(t('menu.selectAccountFirst'));
      return;
    }

    try {
      // 获取所有角色，这里简化处理，实际应该通过角色来分配菜单
      const rolesResponse = await api.get('/roles');
      if (rolesResponse.data.success) {
        // 这里需要根据选中的菜单找到对应的角色，或者创建新的角色
        // 简化处理：直接更新账号的角色（实际应该通过角色管理）
        message.info(t('menu.menuPermissionThroughRoles'));
      }
    } catch (error) {
      message.error(t('menu.updateMenuPermissionsFailed'));
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
        <h2>{t('menu.title')}</h2>
        <Button icon={<ReloadOutlined />} onClick={loadMenus}>
          {t('menu.refresh')}
        </Button>
      </div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <span style={{ marginRight: 8 }}>{t('menu.selectAccount')}</span>
            <Select
              style={{ width: 300 }}
              placeholder={t('menu.selectAccountPlaceholder')}
              value={selectedAccountId}
              onChange={setSelectedAccountId}
            >
              {accounts.map(account => (
                <Option key={account.id} value={account.id}>
                  {account.username} ({account.accountType === 'CUSTOMER' ? t('account.typeCustomer') : account.accountType === 'PARTNER' ? t('account.typePartner') : t('account.typeMain')})
                </Option>
              ))}
            </Select>
          </div>
          {selectedAccountId && (
            <div>
              <h3>{t('menu.accountVisibleMenus')}</h3>
              <Tree
                checkable
                checkedKeys={accountMenus}
                onCheck={handleMenuCheck}
                treeData={treeData}
                defaultExpandAll
              />
              <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
                <p>{t('menu.menuPermissionTip')}</p>
              </div>
            </div>
          )}
          {!selectedAccountId && (
            <div>
              <h3>{t('menu.systemMenuList')}</h3>
              <Tree
                treeData={treeData}
                defaultExpandAll
              />
              <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
                <p>{t('menu.systemMenuTip')}</p>
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default MenuManagement;

