import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCw, ChevronRight, Folder, FileText, CheckCircle, XCircle, 
  User, Users, Search, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tree, TreeNode as TreeNodeType } from '../components/ui/tree';
import { Empty } from '../components/ui/empty';
import { useToast } from '../components/ui/use-toast';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';
import { useDebounce } from '../hooks/useDebounce';

interface Menu {
  id: string;
  name: string;
  code: string;
  path: string;
  children?: Menu[];
}

interface Role {
  id: string;
  name: string;
  status: 'ACTIVE' | 'DEPRECATED';
  permissions: Array<{
    module: string;
    pageCode: string;
  }>;
}

interface Account {
  id: string;
  username: string;
  accountType: string;
  roles: string[];
}

const MenuManagement: React.FC = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [accountMenus, setAccountMenus] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Role-based view state
  const [viewMode, setViewMode] = useState<'account' | 'role'>('account');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleMenus, setRoleMenus] = useState<string[]>([]);
  
  // Search and expand state
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    loadMenus();
    loadAccounts();
    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      const account = accounts.find(a => a.id === selectedAccountId);
      setSelectedAccount(account || null);
      loadAccountMenus(selectedAccountId);
    } else {
      setSelectedAccount(null);
      setAccountMenus([]);
    }
  }, [selectedAccountId, accounts]);

  useEffect(() => {
    if (selectedRoleId) {
      const role = roles.find(r => r.id === selectedRoleId);
      setSelectedRole(role || null);
      if (role) {
        const menuIds = role.permissions.map(p => p.pageCode);
        setRoleMenus(menuIds);
      }
    } else {
      setSelectedRole(null);
      setRoleMenus([]);
    }
  }, [selectedRoleId, roles]);

  // Get accounts that have a specific role
  const getAccountsWithRole = (roleId: string): Account[] => {
    return accounts.filter(account => account.roles.includes(roleId));
  };

  const loadMenus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menus');
      if (response.data.success) {
        setMenus(response.data.data || []);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('menu.loadMenusFailed'),
        variant: 'destructive',
      });
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

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles', { params: { page: 1, pageSize: 1000 } });
      if (response.data.success) {
        setRoles(response.data.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load roles');
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
      toast({
        title: t('common.error'),
        description: t('menu.loadAccountMenusFailed'),
        variant: 'destructive',
      });
    }
  };

  // Get role names for an account
  const getAccountRoleNames = (account: Account): string[] => {
    if (account.accountType === 'MAIN') {
      return [t('account.allPermissions')];
    }
    return account.roles
      .map(roleId => roles.find(r => r.id === roleId)?.name)
      .filter(Boolean) as string[];
  };

  // Get all menu keys for expand/collapse
  const getAllMenuKeys = (menuList: Menu[]): string[] => {
    let keys: string[] = [];
    menuList.forEach(menu => {
      keys.push(menu.id);
      if (menu.children) {
        keys = keys.concat(getAllMenuKeys(menu.children));
      }
    });
    return keys;
  };

  // Expand all menus
  const handleExpandAll = () => {
    setExpandedKeys(getAllMenuKeys(menus));
  };

  // Collapse all menus
  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };

  // Find parent keys for search matching
  const getParentKey = (key: string, tree: Menu[]): string | undefined => {
    let parentKey: string | undefined;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(child => child.id === key)) {
          parentKey = node.id;
        } else {
          const result = getParentKey(key, node.children);
          if (result) {
            parentKey = result;
          }
        }
      }
    }
    return parentKey;
  };

  // Flatten menu tree for searching
  const flattenMenus = (menuList: Menu[]): Menu[] => {
    let result: Menu[] = [];
    menuList.forEach(menu => {
      result.push(menu);
      if (menu.children) {
        result = result.concat(flattenMenus(menu.children));
      }
    });
    return result;
  };

  // Auto-expand when searching
  useEffect(() => {
    if (debouncedSearch) {
      const flatMenus = flattenMenus(menus);
      const matchedKeys = flatMenus
        .filter(menu => 
          menu.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          menu.code.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
        .map(menu => menu.id);
      
      const expandKeys: string[] = [];
      matchedKeys.forEach(key => {
        let parentKey = getParentKey(key, menus);
        while (parentKey) {
          if (!expandKeys.includes(parentKey)) {
            expandKeys.push(parentKey);
          }
          parentKey = getParentKey(parentKey, menus);
        }
      });
      
      setExpandedKeys([...expandKeys, ...matchedKeys]);
    } else {
      setExpandedKeys(getAllMenuKeys(menus));
    }
  }, [debouncedSearch, menus]);

  // Initialize expanded keys when menus load
  useEffect(() => {
    if (menus.length > 0) {
      setExpandedKeys(getAllMenuKeys(menus));
    }
  }, [menus]);

  // Highlight search text in menu name
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const index = text.toLowerCase().indexOf(search.toLowerCase());
    if (index === -1) return text;
    
    const before = text.slice(0, index);
    const match = text.slice(index, index + search.length);
    const after = text.slice(index + search.length);
    
    return (
      <>
        {before}
        <span className="bg-warning/30 text-foreground px-0.5 rounded-sm">
          {match}
        </span>
        {after}
      </>
    );
  };

  // Build tree data with access indicators
  const buildTreeData = (menuList: Menu[], showAccess: boolean): TreeNodeType[] => {
    return menuList.map(menu => {
      let hasAccess = false;
      if (showAccess) {
        if (viewMode === 'account') {
          hasAccess = selectedAccount?.accountType === 'MAIN' || accountMenus.includes(menu.id);
        } else {
          hasAccess = roleMenus.includes(menu.code) || 
            (selectedRole?.permissions.some(p => p.pageCode === menu.code) ?? false);
        }
      }

      const isMatch = debouncedSearch && (
        menu.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        menu.code.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      
      return {
        id: menu.id,
        label: (
          <div className={`flex items-center gap-2 py-1 ${isMatch ? 'bg-primary/10 rounded px-1' : ''}`}>
            {menu.children && menu.children.length > 0 ? (
              <Folder className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-muted" />
            )}
            <span className={`${showAccess ? (hasAccess ? 'text-foreground' : 'text-muted') : 'text-foreground'} ${menu.children ? 'font-medium' : ''}`}>
              {highlightText(menu.name, debouncedSearch)}
            </span>
            <Badge variant="default" className="text-xs">
              {highlightText(menu.code, debouncedSearch)}
            </Badge>
            {showAccess && (
              hasAccess ? (
                <CheckCircle className="w-4 h-4 text-success ml-auto" />
              ) : (
                <XCircle className="w-4 h-4 text-muted ml-auto" />
              )
            )}
          </div>
        ),
        children: menu.children ? buildTreeData(menu.children, showAccess) : undefined,
      };
    });
  };

  const matchCount = flattenMenus(menus).filter(m => 
    m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    m.code.toLowerCase().includes(debouncedSearch.toLowerCase())
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">
          {t('menu.title')}
        </h2>
        <Button variant="outline" onClick={loadMenus} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t('menu.refresh')}
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertTitle>{t('menu.menuPermissionThroughRoles')}</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{t('menu.menuPermissionTip')}</p>
          <Button 
            size="sm" 
            onClick={() => navigate('/roles')}
          >
            <ChevronRight className="w-4 h-4 mr-1" />
            {t('menu.gotoRoleManagement')}
          </Button>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Menu Structure */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="font-medium">{t('menu.systemMenuList')}</CardTitle>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'account' | 'role')}>
                <TabsList className="h-8">
                  <TabsTrigger value="account" className="text-xs px-2">
                    <User className="w-3 h-3 mr-1" />
                    {t('account.title')}
                  </TabsTrigger>
                  <TabsTrigger value="role" className="text-xs px-2">
                    <Users className="w-3 h-3 mr-1" />
                    {t('menu.viewByRole')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Expand/Collapse Controls */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                  placeholder={t('menu.searchMenuPlaceholder') || 'Search menus by name or code...'}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExpandAll}
                >
                  <ChevronDown className="w-3 h-3 mr-1" />
                  {t('menu.expandAll') || 'Expand All'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCollapseAll}
                >
                  <ChevronUp className="w-3 h-3 mr-1" />
                  {t('menu.collapseAll') || 'Collapse All'}
                </Button>
                {debouncedSearch && (
                  <span className="text-xs text-muted">
                    {matchCount} {t('common.results') || 'results'}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted">{t('menu.systemMenuTip')}</p>
            
            {menus.length > 0 ? (
              <Tree
                data={buildTreeData(menus, false)}
                expandedIds={expandedKeys}
                onExpandedChange={setExpandedKeys}
              />
            ) : (
              <Empty description={t('common.noData')} />
            )}
          </CardContent>
        </Card>

        {/* Account/Role Menu Access */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium">
              {viewMode === 'account' ? t('menu.accountVisibleMenus') : t('menu.roleVisibleMenus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {viewMode === 'account' ? (
              <>
                {/* Account Selector */}
                <div className="space-y-2">
                  <Label className="font-medium">{t('menu.selectAccount')}</Label>
                  <Select
                    value={selectedAccountId}
                    onValueChange={setSelectedAccountId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('menu.selectAccountPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            {account.username}
                            <Badge 
                              variant={account.accountType === 'MAIN' ? 'danger' : account.accountType === 'CUSTOMER' ? 'default' : 'success'}
                              className="text-xs"
                            >
                              {account.accountType === 'MAIN' ? t('account.typeMain') : 
                               account.accountType === 'CUSTOMER' ? t('account.typeCustomer') : 
                               t('account.typePartner')}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Account Info */}
                {selectedAccount && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{selectedAccount.username}</span>
                      <Badge 
                        variant={selectedAccount.accountType === 'MAIN' ? 'danger' : selectedAccount.accountType === 'CUSTOMER' ? 'default' : 'success'}
                      >
                        {selectedAccount.accountType === 'MAIN' ? t('account.typeMain') : 
                         selectedAccount.accountType === 'CUSTOMER' ? t('account.typeCustomer') : 
                         t('account.typePartner')}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-muted">{t('account.roles')}: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getAccountRoleNames(selectedAccount).map((name, idx) => (
                          <Badge key={idx} variant="default" className="bg-primary/20 text-primary">
                            {name}
                          </Badge>
                        ))}
                        {selectedAccount.accountType !== 'MAIN' && selectedAccount.roles.length === 0 && (
                          <span className="text-sm text-muted">{t('account.noRoles')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Tree with Access Indicators */}
                {selectedAccountId ? (
                  menus.length > 0 ? (
                    <Tree
                      data={buildTreeData(menus, true)}
                      expandedIds={expandedKeys}
                      onExpandedChange={setExpandedKeys}
                    />
                  ) : (
                    <Empty description={t('common.noData')} />
                  )
                ) : (
                  <Empty 
                    description={t('menu.selectAccountFirst')}
                  />
                )}
              </>
            ) : (
              <>
                {/* Role Selector */}
                <div className="space-y-2">
                  <Label className="font-medium">{t('menu.selectRole')}</Label>
                  <Select
                    value={selectedRoleId}
                    onValueChange={setSelectedRoleId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('menu.selectRolePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(r => r.status === 'ACTIVE').map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Role Info */}
                {selectedRole && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{selectedRole.name}</span>
                      <Badge variant="default" className="bg-primary/20 text-primary">
                        {t('role.title')}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-muted">{t('menu.usersWithThisRole')}: </span>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {getAccountsWithRole(selectedRole.id).slice(0, 5).map((account) => (
                          <TooltipProvider key={account.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                      <User className="w-3 h-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{account.username}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                        {getAccountsWithRole(selectedRole.id).length > 5 && (
                          <Badge variant="default">+{getAccountsWithRole(selectedRole.id).length - 5}</Badge>
                        )}
                        {getAccountsWithRole(selectedRole.id).length === 0 && (
                          <span className="text-sm text-muted">{t('role.noUsersWithRole')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Menu Tree for Role */}
                {selectedRoleId ? (
                  menus.length > 0 ? (
                    <Tree
                      data={buildTreeData(menus, true)}
                      expandedIds={expandedKeys}
                      onExpandedChange={setExpandedKeys}
                    />
                  ) : (
                    <Empty description={t('common.noData')} />
                  )
                ) : (
                  <Empty 
                    description={t('menu.selectRoleFirst')}
                  />
                )}
              </>
            )}

            {/* Legend */}
            {(selectedAccountId || selectedRoleId) && (
              <div className="p-3 bg-muted/50 rounded-lg flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-muted">{t('common.active')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-muted" />
                  <span className="text-sm text-muted">{t('menu.noAccess')}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenuManagement;
