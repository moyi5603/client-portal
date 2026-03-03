import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, Plus, Edit2, Trash2, Download, 
  RefreshCw, CheckCircle, Info, ArrowLeftRight, X, UserCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Pagination } from '../components/ui/pagination';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';

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

// Module configuration with brand-compliant colors using CSS variables
// Order matches the MODULES array in RoleManagement.tsx
const MODULE_ORDER = [
  'DASHBOARDS',
  'PURCHASE_MANAGEMENT', 
  'SALES_ORDER',
  'WORK_ORDER',
  'INBOUND',
  'INVENTORY',
  'OUTBOUND',
  'RETURNS',
  'YARD_MANAGEMENT',
  'SUPPLY_CHAIN',
  'FINANCE',
  'SYSTEM_MANAGEMENT',
  'PERMISSION_MANAGEMENT'
];

const MODULE_CONFIG: Record<string, { name: string; colorToken: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' }> = {
  'DASHBOARDS': { name: 'Dashboards', colorToken: 'primary' },
  'PURCHASE_MANAGEMENT': { name: 'Purchase Management', colorToken: 'accent' },
  'SALES_ORDER': { name: 'Sales Order', colorToken: 'success' },
  'WORK_ORDER': { name: 'Work Order', colorToken: 'primary' },
  'INBOUND': { name: 'Inbound', colorToken: 'danger' },
  'INVENTORY': { name: 'Inventory', colorToken: 'primary' },
  'OUTBOUND': { name: 'Outbound', colorToken: 'primary' },
  'RETURNS': { name: 'Returns', colorToken: 'warning' },
  'YARD_MANAGEMENT': { name: 'Yard Management', colorToken: 'success' },
  'SUPPLY_CHAIN': { name: 'Supply Chain Mgmt', colorToken: 'primary' },
  'FINANCE': { name: 'Finance', colorToken: 'accent' },
  'SYSTEM_MANAGEMENT': { name: 'System Management', colorToken: 'info' },
  'PERMISSION_MANAGEMENT': { name: 'Permission Management', colorToken: 'primary' }
};

// Operation icons with colorblind-friendly design
type OperationVariant = 'success' | 'warning' | 'destructive' | 'default';
const OPERATION_ICONS: Record<string, { icon: React.ReactNode; variant: OperationVariant; shape: string }> = {
  'VIEW': { icon: <Eye className="w-3 h-3" />, variant: 'success', shape: 'circle' },
  'CREATE': { icon: <Plus className="w-3 h-3" />, variant: 'success', shape: 'circle' },
  'EDIT': { icon: <Edit2 className="w-3 h-3" />, variant: 'default', shape: 'square' },
  'DELETE': { icon: <Trash2 className="w-3 h-3" />, variant: 'destructive', shape: 'diamond' },
  'EXPORT': { icon: <Download className="w-3 h-3" />, variant: 'default', shape: 'triangle' },
  'IMPORT': { icon: <RefreshCw className="w-3 h-3" />, variant: 'default', shape: 'triangle' },
  'CANCEL': { icon: <Trash2 className="w-3 h-3" />, variant: 'warning', shape: 'diamond' },
  'PRINT_PACKING_SLIP': { icon: <Download className="w-3 h-3" />, variant: 'default', shape: 'triangle' },
  'DOWNLOAD_PDF': { icon: <Download className="w-3 h-3" />, variant: 'default', shape: 'triangle' },
  'DOWNLOAD_TEMPLATE': { icon: <Download className="w-3 h-3" />, variant: 'default', shape: 'triangle' },
  'DOWNLOAD': { icon: <Download className="w-3 h-3" />, variant: 'default', shape: 'triangle' },
  'HOLD_INVENTORY': { icon: <Edit2 className="w-3 h-3" />, variant: 'default', shape: 'square' },
  'RELEASE_INVENTORY': { icon: <Edit2 className="w-3 h-3" />, variant: 'default', shape: 'square' },
  'ADD_ATTACHMENT': { icon: <Edit2 className="w-3 h-3" />, variant: 'default', shape: 'square' },
  'SET_ALERT': { icon: <Edit2 className="w-3 h-3" />, variant: 'default', shape: 'square' },
  'SET_DEFAULT': { icon: <Edit2 className="w-3 h-3" />, variant: 'default', shape: 'square' },
  'RELOAD': { icon: <Edit2 className="w-3 h-3" />, variant: 'default', shape: 'square' },
  'IMPORT_RMA': { icon: <RefreshCw className="w-3 h-3" />, variant: 'default', shape: 'triangle' },
  'BATCH_IMPORT': { icon: <RefreshCw className="w-3 h-3" />, variant: 'default', shape: 'triangle' },
  'RESET_FIELDS': { icon: <RefreshCw className="w-3 h-3" />, variant: 'warning', shape: 'diamond' },
  'PAY': { icon: <CheckCircle className="w-3 h-3" />, variant: 'success', shape: 'circle' },
  'INVOICE_DETAIL': { icon: <Eye className="w-3 h-3" />, variant: 'success', shape: 'circle' },
  'RESET_PASSWORD': { icon: <RefreshCw className="w-3 h-3" />, variant: 'warning', shape: 'diamond' },
  'BULK_STATUS_CHANGE': { icon: <Edit2 className="w-3 h-3" />, variant: 'default', shape: 'square' },
  'BULK_DELETE': { icon: <Trash2 className="w-3 h-3" />, variant: 'destructive', shape: 'diamond' },
  'COPY': { icon: <RefreshCw className="w-3 h-3" />, variant: 'default', shape: 'triangle' }
};

const PermissionView: React.FC = () => {
  const { t } = useLocale();
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [roles, setRoles] = useState<Role[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    module: 'ALL',
    permissionType: 'ALL_MENUS',
    operation: 'ALL'
  });
  const [roleNameFilter, setRoleNameFilter] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Available operations for filter - Only show basic operations
  const AVAILABLE_OPERATIONS = [
    'VIEW', 'CREATE', 'EDIT', 'DELETE'
  ];
  
  // Role comparison state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedRolesForComparison, setSelectedRolesForComparison] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const rolesResponse = await api.get('/roles', {
        params: { page: 1, pageSize: 1000 }
      });
      if (rolesResponse.data.success) {
        setRoles(rolesResponse.data.data.items || []);
      }

      const accountsResponse = await api.get('/accounts', {
        params: { page: 1, pageSize: 1000 }
      });
      if (accountsResponse.data.success) {
        setAccounts(accountsResponse.data.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountsWithRole = (roleId: string): Account[] => {
    return accounts.filter(acc => acc.roles.includes(roleId));
  };

  const getModulePermissions = (role: Role, module: string): string[] => {
    const permissions = role.permissions.filter(p => p.module === module);
    const operations = new Set<string>();
    permissions.forEach(p => {
      p.operations.forEach(op => operations.add(op));
    });
    return Array.from(operations);
  };

  const filteredRoles = useMemo(() => {
    let result = roles;
    result = result.filter(r => r.status === 'ACTIVE');

    if (roleNameFilter) {
      const lowerRoleFilter = roleNameFilter.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(lowerRoleFilter)
      );
    }

    if (filters.module !== 'ALL') {
      result = result.filter(r => 
        r.permissions.some(p => p.module === filters.module)
      );
    }

    if (filters.operation !== 'ALL') {
      result = result.filter(r =>
        r.permissions.some(p => p.operations.includes(filters.operation))
      );
    }

    result = result.filter(r => r.permissions.length > 0);
    return result;
  }, [roles, filters, roleNameFilter]);

  const allModules = useMemo(() => {
    const moduleSet = new Set<string>();
    filteredRoles.forEach(role => {
      role.permissions.forEach(p => moduleSet.add(p.module));
    });
    // Sort by MODULE_ORDER instead of alphabetically
    return MODULE_ORDER.filter(module => moduleSet.has(module));
  }, [filteredRoles]);

  // Consolidate operations helper - Only show VIEW, CREATE, EDIT, DELETE
  const consolidateOperations = (permissions: string[]): string[] => {
    // Filter to only include the four basic operations
    const allowedOperations = ['VIEW', 'CREATE', 'EDIT', 'DELETE'];
    return permissions.filter(op => allowedOperations.includes(op));
  };

  // Matrix data
  const matrixData = useMemo(() => {
    return filteredRoles.map(role => {
      const row: Record<string, any> = {
        key: role.id,
        roleName: role.name,
        users: getAccountsWithRole(role.id)
      };

      allModules.forEach(module => {
        row[`module-${module}`] = getModulePermissions(role, module);
      });

      return row;
    });
  }, [filteredRoles, allModules, accounts]);

  // Paginated matrix data
  const paginatedMatrixData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return matrixData.slice(start, end);
  }, [matrixData, currentPage, pageSize]);

  // List data
  const listData = useMemo(() => {
    const data: any[] = [];
    const activeRoles = roles.filter(r => r.status === 'ACTIVE' && r.permissions.length > 0);
    
    activeRoles.forEach(role => {
      let shouldIncludeRole = true;
      if (roleNameFilter) {
        const lowerRoleFilter = roleNameFilter.toLowerCase();
        shouldIncludeRole = role.name.toLowerCase().includes(lowerRoleFilter);
      }
      
      if (shouldIncludeRole) {
        role.permissions.forEach(perm => {
          if (filters.module === 'ALL' || perm.module === filters.module) {
            const moduleConfig = MODULE_CONFIG[perm.module] || { name: perm.module, colorToken: 'info' as const };
            data.push({
              key: `${role.id}-${perm.module}-${perm.pageCode}`,
              roleName: role.name,
              module: perm.module,
              parentMenuName: moduleConfig.name,
              menuName: perm.page,
              permissions: perm.operations,
              users: getAccountsWithRole(role.id)
            });
          }
        });
      }
    });

    return data;
  }, [roles, filters.module, roleNameFilter, accounts]);

  // Paginated list data
  const paginatedListData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return listData.slice(start, end);
  }, [listData, currentPage, pageSize]);

  const handleReset = () => {
    setFilters({
      module: 'ALL',
      permissionType: 'ALL_MENUS',
      operation: 'ALL'
    });
    setRoleNameFilter('');
    setViewMode('matrix');
    setComparisonMode(false);
    setSelectedRolesForComparison([]);
    setCurrentPage(1);
  };

  // Get permissions for a role as a Set of strings
  const getRolePermissionSet = (roleId: string): Set<string> => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return new Set();
    
    const permSet = new Set<string>();
    role.permissions.forEach(perm => {
      perm.operations.forEach(op => {
        permSet.add(`${perm.module}:${perm.pageCode}:${op}`);
      });
    });
    return permSet;
  };

  // Comparison data for the comparison view
  const comparisonData = useMemo(() => {
    if (selectedRolesForComparison.length < 2) return [];
    
    const roleSets = selectedRolesForComparison.map(id => ({
      id,
      role: roles.find(r => r.id === id),
      permissions: getRolePermissionSet(id)
    }));

    const allComparisonModules = new Set<string>();
    const modulePages: Record<string, Set<string>> = {};
    
    roleSets.forEach(({ role }) => {
      if (role) {
        role.permissions.forEach(perm => {
          allComparisonModules.add(perm.module);
          if (!modulePages[perm.module]) {
            modulePages[perm.module] = new Set();
          }
          modulePages[perm.module].add(perm.pageCode);
        });
      }
    });

    const data: any[] = [];
    MODULE_ORDER.filter(module => allComparisonModules.has(module)).forEach(module => {
      const pages = Array.from(modulePages[module] || []);
      pages.forEach(pageCode => {
        const row: any = {
          key: `${module}-${pageCode}`,
          module,
          moduleName: MODULE_CONFIG[module]?.name || module,
          pageCode,
        };

        const allOps = new Set<string>();
        roleSets.forEach(({ role }) => {
          const perm = role?.permissions.find(p => p.module === module && p.pageCode === pageCode);
          perm?.operations.forEach(op => allOps.add(op));
        });

        row.operations = Array.from(allOps);
        
        roleSets.forEach(({ id, role }) => {
          const perm = role?.permissions.find(p => p.module === module && p.pageCode === pageCode);
          row[`role_${id}`] = perm?.operations || [];
        });

        data.push(row);
      });
    });

    return data;
  }, [selectedRolesForComparison, roles]);

  // Render operation badge
  const renderOperationBadge = (op: string, isUnique?: boolean) => {
    const opConfig = OPERATION_ICONS[op];
    if (!opConfig) return <Badge key={op} variant="default">{op}</Badge>;
    
    return (
      <TooltipProvider key={op}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Badge 
                variant={isUnique ? 'warning' : opConfig.variant}
                className={`inline-flex items-center gap-1 ${isUnique ? 'border-dashed' : ''}`}
              >
                {opConfig.icon}
                <span className="text-xs">{t(`operation.${op}`) || op}</span>
              </Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent>{t(`operation.${op}`) || op}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render operation icon only (for matrix view)
  const renderOperationIcon = (op: string) => {
    const opConfig = OPERATION_ICONS[op];
    if (!opConfig) return null;
    
    const colorClass = {
      'success': 'text-emerald-500',
      'warning': 'text-amber-500',
      'destructive': 'text-red-500',
      'default': 'text-primary'
    }[opConfig.variant];
    
    return (
      <TooltipProvider key={op}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`${colorClass} text-base`}>
              {opConfig.icon}
            </span>
          </TooltipTrigger>
          <TooltipContent>{t(`operation.${op}`) || op}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render users cell
  const renderUsersCell = (users: Account[]) => {
    if (!users || users.length === 0) {
      return <span className="text-muted">-</span>;
    }
    const userNames = users.map(u => u.username).join(', ');
    return (
      <div>
        <div className="flex items-center gap-1 mb-1">
          {users.slice(0, 3).map((user) => (
            <TooltipProvider key={user.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs border border-blue-200">
                        <UserCircle className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{user.username}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {users.length > 3 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Badge variant="default">+{users.length - 3}</Badge>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{users.slice(3).map(u => u.username).join(', ')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="text-xs text-muted">
          <span className="font-medium">{users.length}</span> {t('role.users')}: {userNames}
        </div>
      </div>
    );
  };

  const currentData = viewMode === 'matrix' ? matrixData : listData;
  const totalPages = Math.ceil(currentData.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold text-primary">
          {t('permission.title')}
        </h2>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>{t('role.module')}</Label>
              <Select
                value={filters.module}
                onValueChange={(value) => {
                  setFilters({ ...filters, module: value });
                  setCurrentPage(1);
                }}
                disabled={comparisonMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('filter.allModules')}</SelectItem>
                  {MODULE_ORDER.map(module => (
                    <SelectItem key={module} value={module}>
                      {MODULE_CONFIG[module].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('permission.operation') || 'Operation'}</Label>
              <Select
                value={filters.operation}
                onValueChange={(value) => {
                  setFilters({ ...filters, operation: value });
                  setCurrentPage(1);
                }}
                disabled={comparisonMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  {AVAILABLE_OPERATIONS.map(op => (
                    <SelectItem key={op} value={op}>
                      {t(`operation.${op}`) || op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('permission.roleName')}</Label>
              <Input
                placeholder={t('permission.searchRoleName')}
                value={roleNameFilter}
                onChange={(e) => {
                  setRoleNameFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={comparisonMode}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                {t('common.reset')}
              </Button>
              <Button disabled={comparisonMode}>
                {t('common.search')}
              </Button>
            </div>
          </div>

          {/* Role Comparison Mode */}
          <Separator className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-3 flex items-center gap-3">
              <ArrowLeftRight className="w-4 h-4" />
              <span className="font-medium">{t('permission.compareRoles')}</span>
              <Switch 
                checked={comparisonMode} 
                onCheckedChange={(checked) => {
                  setComparisonMode(checked);
                  if (!checked) {
                    setSelectedRolesForComparison([]);
                  }
                }} 
              />
            </div>
            {comparisonMode && (
              <>
                <div className="md:col-span-7">
                  <Select
                    value={selectedRolesForComparison.join(',')}
                    onValueChange={(value) => {
                      const currentValues = selectedRolesForComparison;
                      if (currentValues.includes(value)) {
                        setSelectedRolesForComparison(currentValues.filter(v => v !== value));
                      } else if (currentValues.length < 3) {
                        setSelectedRolesForComparison([...currentValues, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('permission.selectRolesToCompare')}>
                        {selectedRolesForComparison.length > 0 
                          ? selectedRolesForComparison.map(id => roles.find(r => r.id === id)?.name).join(', ')
                          : t('permission.selectRolesToCompare')
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(r => r.status === 'ACTIVE' && r.permissions.length > 0).map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            {selectedRolesForComparison.includes(role.id) && (
                              <CheckCircle className="w-3 h-3 text-success" />
                            )}
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedRolesForComparison.length > 0 && (
                  <div className="md:col-span-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRolesForComparison([])}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t('permission.clearComparison')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permission Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3 text-primary font-medium">
            <Info className="w-4 h-4" />
            {t('permission.permissionLegend')}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'VIEW', icon: <Eye className="w-3 h-3" />, variant: 'success' as const, label: t('operation.VIEW') },
              { key: 'CREATE', icon: <Plus className="w-3 h-3" />, variant: 'success' as const, label: t('operation.CREATE') },
              { key: 'EDIT', icon: <Edit2 className="w-3 h-3" />, variant: 'default' as const, label: t('operation.EDIT') },
              { key: 'DELETE', icon: <Trash2 className="w-3 h-3" />, variant: 'destructive' as const, label: t('operation.DELETE') }
            ].map(config => (
              <Badge 
                key={config.key}
                variant={config.variant}
                className="inline-flex items-center gap-1"
              >
                {config.icon}
                {config.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {comparisonMode && selectedRolesForComparison.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('permission.comparisonView')}</CardTitle>
            <p className="text-sm text-muted">
              {selectedRolesForComparison.map(id => roles.find(r => r.id === id)?.name).join(' vs ')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 p-3 bg-muted rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="border-dashed">Example</Badge>
                <span className="text-sm text-muted">{t('permission.onlyInRole')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Example</Badge>
                <span className="text-sm text-muted">{t('permission.inBothRoles')}</span>
              </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">{t('role.module')}</TableHead>
                    <TableHead>{t('role.feature')}</TableHead>
                    {selectedRolesForComparison.map(roleId => {
                      const role = roles.find(r => r.id === roleId);
                      return <TableHead key={roleId}>{role?.name || roleId}</TableHead>;
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2 + selectedRolesForComparison.length} className="text-center py-8">
                        {t('common.loading')}
                      </TableCell>
                    </TableRow>
                  ) : comparisonData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2 + selectedRolesForComparison.length} className="text-center py-8 text-muted">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    comparisonData.map(row => (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium sticky left-0 bg-background">{row.moduleName}</TableCell>
                        <TableCell>{row.pageCode}</TableCell>
                        {selectedRolesForComparison.map(roleId => {
                          const roleOps = row[`role_${roleId}`] || [];
                          if (roleOps.length === 0) {
                            return <TableCell key={roleId}><span className="text-muted">-</span></TableCell>;
                          }
                          return (
                            <TableCell key={roleId}>
                              <div className="flex flex-wrap gap-1">
                                {roleOps.map((op: string) => {
                                  const otherRolesHaveOp = selectedRolesForComparison
                                    .filter(id => id !== roleId)
                                    .some(id => (row[`role_${id}`] || []).includes(op));
                                  const isUnique = !otherRolesHaveOp;
                                  return renderOperationBadge(op, isUnique);
                                })}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Toggle and Table */}
      <Card className={comparisonMode && selectedRolesForComparison.length >= 2 ? 'hidden' : ''}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {viewMode === 'matrix' ? t('permission.matrixView') : t('permission.listView')}
            </CardTitle>
            <div className="flex border rounded-lg overflow-hidden">
              <Button 
                variant={viewMode === 'matrix' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => {
                  setViewMode('matrix');
                  setFilters({ ...filters, permissionType: 'ALL_MENUS' });
                  setCurrentPage(1);
                }}
              >
                {t('permission.matrixView')}
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => {
                  setViewMode('list');
                  setFilters({ ...filters, permissionType: 'ALL_RULES' });
                  setCurrentPage(1);
                }}
              >
                {t('permission.listView')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'matrix' ? (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background min-w-[200px]">{t('role.name')}</TableHead>
                      {allModules.map(module => {
                        const config = MODULE_CONFIG[module] || { name: module };
                        return (
                          <TableHead key={module} className="text-center min-w-[120px]">
                            {config.name}
                          </TableHead>
                        );
                      })}
                      <TableHead className="min-w-[200px]">{t('role.users')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={allModules.length + 2} className="text-center py-8">
                          {t('common.loading')}
                        </TableCell>
                      </TableRow>
                    ) : paginatedMatrixData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={allModules.length + 2} className="text-center py-8 text-muted">
                          {t('common.noData')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedMatrixData.map(row => (
                        <TableRow key={row.key}>
                          <TableCell className="font-medium sticky left-0 bg-background">
                            {row.roleName}
                          </TableCell>
                          {allModules.map(module => {
                            const permissions = row[`module-${module}`] || [];
                            if (permissions.length === 0) {
                              return <TableCell key={module} className="text-center"><span className="text-muted">-</span></TableCell>;
                            }
                            const displayOperations = consolidateOperations(permissions);
                            return (
                              <TableCell key={module} className="text-center">
                                <div className="flex justify-center gap-1 flex-wrap">
                                  {displayOperations.map(op => renderOperationIcon(op))}
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell>{renderUsersCell(row.users)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted">
                  {t('permission.showingRoles', { 
                    start: ((currentPage - 1) * pageSize + 1).toString(), 
                    end: Math.min(currentPage * pageSize, matrixData.length).toString(), 
                    total: matrixData.length.toString() 
                  })}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background">{t('role.name')}</TableHead>
                      <TableHead>{t('role.module')}</TableHead>
                      <TableHead>{t('role.feature')}</TableHead>
                      <TableHead>{t('role.permissions')}</TableHead>
                      <TableHead>{t('nav.users')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {t('common.loading')}
                        </TableCell>
                      </TableRow>
                    ) : paginatedListData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted">
                          {t('common.noData')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedListData.map(row => (
                        <TableRow key={row.key}>
                          <TableCell className="font-medium sticky left-0 bg-background">
                            {row.roleName}
                          </TableCell>
                          <TableCell>{row.parentMenuName}</TableCell>
                          <TableCell>{row.menuName}</TableCell>
                          <TableCell>
                            {(!row.permissions || row.permissions.length === 0) ? (
                              <Badge variant="default">-</Badge>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {consolidateOperations(row.permissions).map(op => renderOperationBadge(op))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{renderUsersCell(row.users)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted">
                  {t('permission.showingPermissions', { 
                    start: ((currentPage - 1) * pageSize + 1).toString(), 
                    end: Math.min(currentPage * pageSize, listData.length).toString(), 
                    total: listData.length.toString() 
                  })}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(listData.length / pageSize)}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionView;
