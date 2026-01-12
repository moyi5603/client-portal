import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User, Users, Shield, Menu, LogOut, List, Globe, FileText, Sun, Moon, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import { useTheme } from '../../contexts/ThemeContext';
import Breadcrumb from './Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: NavItem[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['account-management']);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const { theme, toggleTheme } = useTheme();

  // Auto-expand parent menu based on current path
  React.useEffect(() => {
    if (['/accounts', '/roles', '/permissions', '/audit-logs'].includes(location.pathname)) {
      if (!expandedMenus.includes('account-management')) {
        setExpandedMenus([...expandedMenus, 'account-management']);
      }
    }
    // 编辑器路径已移除
    // else if (['/editor', '/code-editor', '/page-designer'].includes(location.pathname)) {
    //   if (!expandedMenus.includes('editor')) {
    //     setExpandedMenus([...expandedMenus, 'editor']);
    //   }
    // }
  }, [location.pathname]);

  const navItems: NavItem[] = [
    {
      key: 'account-management',
      icon: <Users className="w-4 h-4" />,
      label: t('nav.accessControl'),
      children: [
        {
          key: '/accounts',
          icon: <Users className="w-4 h-4" />,
          label: t('nav.accountManagement'),
          path: '/accounts'
        },
        {
          key: '/roles',
          icon: <Shield className="w-4 h-4" />,
          label: t('nav.roleManagement'),
          path: '/roles'
        },
        {
          key: '/permissions',
          icon: <List className="w-4 h-4" />,
          label: t('nav.permissionView'),
          path: '/permissions'
        },
        {
          key: '/audit-logs',
          icon: <FileText className="w-4 h-4" />,
          label: t('nav.auditLog'),
          path: '/audit-logs'
        }
      ]
    }
    // 编辑器菜单已隐藏
    // {
    //   key: 'editor',
    //   icon: <Edit className="w-4 h-4" />,
    //   label: '编辑器',
    //   children: [
    //     {
    //       key: '/editor',
    //       icon: <FileText className="w-4 h-4" />,
    //       label: '文本编辑器',
    //       path: '/editor'
    //     },
    //     {
    //       key: '/code-editor',
    //       icon: <Code className="w-4 h-4" />,
    //       label: '代码编辑器',
    //       path: '/code-editor'
    //     },
    //     {
    //       key: '/page-designer',
    //       icon: <Edit className="w-4 h-4" />,
    //       label: '页面设计器',
    //       path: '/page-designer'
    //     }
    //   ]
    // }
  ];

  const toggleMenu = (key: string) => {
    setExpandedMenus(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isExpanded = expandedMenus.includes(item.key);
    const isActive = item.path ? location.pathname === item.path : false;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.key}>
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
              ${collapsed ? 'justify-center' : 'justify-between'}
              hover:bg-white/10 text-white/80 hover:text-white`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </div>
            {!collapsed && (
              isExpanded 
                ? <ChevronDown className="w-4 h-4" /> 
                : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && !collapsed && (
            <div className="ml-4 border-l border-white/20">
              {item.children!.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <TooltipProvider key={item.key}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => item.path && navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                ${collapsed ? 'justify-center' : ''}
                ${isActive 
                  ? 'bg-white/20 text-white font-medium' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside 
        className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 transition-all duration-300 flex flex-col`}
        style={{ 
          background: isDark ? 'var(--bg-tertiary)' : 'var(--primary)',
        }}
      >
        {/* Logo */}
        <div 
          className={`h-16 flex items-center justify-center font-bold text-lg ${collapsed ? 'px-2' : 'px-4'}`}
          style={{ color: '#FFFFFF' }}
        >
          {collapsed ? 'CP' : 'Client Portal'}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-2">
          {navItems.map(item => renderNavItem(item))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className="h-16 flex items-center justify-between px-4 border-b"
          style={{ 
            background: 'var(--bg-primary)',
            borderColor: 'var(--border-color)',
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-foreground"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground gap-2">
                  <Globe className="w-4 h-4" />
                  {locale === 'zh-CN' ? '中文' : 'English'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale('zh-CN')}>
                  中文
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('en-US')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{user?.username}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="text-danger">
                  <LogOut className="w-4 h-4 mr-2" />
                  {locale === 'zh-CN' ? '退出登录' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page Content */}
        <main 
          className="flex-1 p-4 md:p-6 overflow-auto"
          style={{ background: 'var(--bg-secondary)' }}
        >
          <div 
            className="rounded-xl p-6 min-h-full"
            style={{ 
              background: 'var(--bg-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
