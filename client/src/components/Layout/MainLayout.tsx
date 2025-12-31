import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  MenuOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
  GlobalOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(['account-management']);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLocale();

  // 根据当前路径自动展开对应的父菜单
  React.useEffect(() => {
    if (['/accounts', '/roles', '/menus', '/permissions', '/audit-logs'].includes(location.pathname)) {
      setOpenKeys(['account-management']);
    }
  }, [location.pathname]);

  const menuItems: MenuProps['items'] = [
    {
      key: 'account-management',
      icon: <TeamOutlined />,
      label: '账号管理',
      children: [
        {
          key: '/accounts',
          icon: <TeamOutlined />,
          label: t('nav.accountManagement')
        },
        {
          key: '/roles',
          icon: <SafetyOutlined />,
          label: t('nav.roleManagement')
        },
        {
          key: '/menus',
          icon: <MenuOutlined />,
          label: t('nav.menuManagement')
        },
        {
          key: '/permissions',
          icon: <UnorderedListOutlined />,
          label: t('nav.permissionView')
        },
        {
          key: '/audit-logs',
          icon: <FileTextOutlined />,
          label: t('nav.auditLog')
        }
      ]
    }
  ];

  const localeMenuItems: MenuProps['items'] = [
    {
      key: 'zh-CN',
      label: '中文',
      onClick: () => setLocale('zh-CN')
    },
    {
      key: 'en-US',
      label: 'English',
      onClick: () => setLocale('en-US')
    }
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: locale === 'zh-CN' ? '退出登录' : 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      }
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold'
        }}>
          {collapsed ? 'CP' : 'Client Portal'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
          onClick={({ key }) => {
            // 只处理子菜单的点击，父菜单点击不导航
            if (key !== 'account-management') {
              navigate(key);
            }
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <Space>
            <Dropdown menu={{ items: localeMenuItems }} placement="bottomRight">
              <Button type="text" icon={<GlobalOutlined />}>
                {locale === 'zh-CN' ? '中文' : 'English'}
              </Button>
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.username}</span>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

