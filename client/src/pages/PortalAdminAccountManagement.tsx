import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Users, Building2, Pencil, Trash2, MoreHorizontal, ChevronDown, X, AlertCircle, UserPlus } from 'lucide-react';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Empty,
  Skeleton,
  Pagination,
  Switch,
} from '../components/ui';

interface Account {
  id: string;
  username: string;
  email: string;
  phone?: string;
  accountType: 'MAIN' | 'SUB'; // 主账号 or 子账号
  status: string;
  tenantId: string;
  tenantIds?: string[]; // Support multiple tenants
  roles: string[];
  customerIds?: string[];
  facilityIds?: string[];
  customerFacilityMappings?: Array<{
    customerId: string;
    facilityIds: string[];
  }>;
  subAccounts?: Account[]; // Sub-accounts under this main account
  lastLoginAt?: string;
  createdAt?: string;
}

interface Tenant {
  id: string;
  name: string;
  code: string;
}

const PortalAdminAccountManagement: React.FC = () => {
  const { t } = useLocale();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    status: 'ACTIVE',
    customerFacilityMappings: [] as Array<{ customerId: string; facilityIds: string[] }>,
    roleIds: [] as string[]
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [facilitySearchTerms, setFacilitySearchTerms] = useState<Record<string, string>>({});
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [showCreateSubAccountDialog, setShowCreateSubAccountDialog] = useState(false);
  const [parentAccount, setParentAccount] = useState<Account | null>(null);
  const [subAccountForm, setSubAccountForm] = useState({
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    status: 'ACTIVE'
  });
  const [subAccountFormErrors, setSubAccountFormErrors] = useState<Record<string, string>>({});
  const [showSubAccountsDialog, setShowSubAccountsDialog] = useState(false);
  const [selectedMainAccount, setSelectedMainAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadData();
    loadCustomers();
    loadFacilities();
    loadRoles();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load all accounts across tenants
      const accountsRes = await api.get('/portal-admin/accounts');
      const accountsData = accountsRes.data;
      
      // 获取所有facility IDs（从API或预设数据）
      let allFacilityIds: string[] = [];
      try {
        const facilityRes = await api.get('/permissions/facilities');
        if (facilityRes.data.success) {
          allFacilityIds = facilityRes.data.data.map((f: any) => f.id);
        }
      } catch (error) {
        // 如果API失败，使用预设的facility IDs
        allFacilityIds = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005', 'FAC-006', 'FAC-007'];
      }
      
      // 如果没有从API获取到，使用预设的
      if (allFacilityIds.length === 0) {
        allFacilityIds = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005', 'FAC-006', 'FAC-007'];
      }
      
      // 补全映射关系：如果账号没有customerFacilityMappings，则根据customerIds和facilityIds生成
      const processedAccounts = accountsData.map((account: Account) => {
        if (!account.customerFacilityMappings || account.customerFacilityMappings.length === 0) {
          const customerIds = account.customerIds || [];
          
          if (customerIds.length > 0) {
            // 主账号：为每个customer分配所有facility
            account.customerFacilityMappings = customerIds.map(customerId => ({
              customerId,
              facilityIds: allFacilityIds
            }));
            console.log(`补全账号 ${account.username} 的映射关系:`, account.customerFacilityMappings);
          }
        } else {
          console.log(`账号 ${account.username} 已有映射关系:`, account.customerFacilityMappings);
        }
        return account;
      });
      
      console.log('处理后的账号数据:', processedAccounts);
      setAccounts(processedAccounts);

      // Load tenants list
      const tenantsRes = await api.get('/portal-admin/tenants');
      setTenants(tenantsRes.data);
    } catch (error: any) {
      toast.error('Failed to load data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/permissions/customers');
      if (response.data.success) {
        const apiCustomers = response.data.data || [];
        // 添加预设的 customer 选项
        const presetCustomers = [
          { id: 'CUST-001', name: 'Customer 1', code: 'CUST-001' },
          { id: 'CUST-002', name: 'Customer 2', code: 'CUST-002' },
          { id: 'CUST-003', name: 'Customer 3', code: 'CUST-003' },
          { id: 'CUST-004', name: 'Customer 4', code: 'CUST-004' },
          { id: 'CUST-005', name: 'Customer 5', code: 'CUST-005' }
        ];
        // 合并预设选项和 API 数据，避免重复
        const existingIds = apiCustomers.map((c: any) => c.id);
        const uniquePresets = presetCustomers.filter(preset => !existingIds.includes(preset.id));
        setCustomers([...uniquePresets, ...apiCustomers]);
      }
    } catch (error) {
      console.error('Failed to load customer list');
      // 如果 API 失败，至少提供预设选项
      const presetCustomers = [
        { id: 'CUST-001', name: 'Customer 1', code: 'CUST-001' },
        { id: 'CUST-002', name: 'Customer 2', code: 'CUST-002' },
        { id: 'CUST-003', name: 'Customer 3', code: 'CUST-003' },
        { id: 'CUST-004', name: 'Customer 4', code: 'CUST-004' },
        { id: 'CUST-005', name: 'Customer 5', code: 'CUST-005' }
      ];
      setCustomers(presetCustomers);
    }
  };

  const loadFacilities = async () => {
    try {
      const response = await api.get('/permissions/facilities');
      if (response.data.success) {
        const apiFacilities = response.data.data || [];
        // 添加预设的 facility 选项
        const presetFacilities = [
          { id: 'FAC-001', name: 'Facility 1', code: 'FAC-001' },
          { id: 'FAC-002', name: 'Facility 2', code: 'FAC-002' },
          { id: 'FAC-003', name: 'Facility 3', code: 'FAC-003' },
          { id: 'FAC-004', name: 'Facility 4', code: 'FAC-004' },
          { id: 'FAC-005', name: 'Facility 5', code: 'FAC-005' },
          { id: 'FAC-006', name: 'Facility 6', code: 'FAC-006' },
          { id: 'FAC-007', name: 'Facility 7', code: 'FAC-007' }
        ];
        // 合并预设选项和 API 数据，避免重复
        const existingIds = apiFacilities.map((f: any) => f.id);
        const uniquePresets = presetFacilities.filter(preset => !existingIds.includes(preset.id));
        setFacilities([...uniquePresets, ...apiFacilities]);
      }
    } catch (error) {
      console.error('Failed to load facility list');
      // 如果 API 失败，至少提供预设选项
      const presetFacilities = [
        { id: 'FAC-001', name: 'Facility 1', code: 'FAC-001' },
        { id: 'FAC-002', name: 'Facility 2', code: 'FAC-002' },
        { id: 'FAC-003', name: 'Facility 3', code: 'FAC-003' },
        { id: 'FAC-004', name: 'Facility 4', code: 'FAC-004' },
        { id: 'FAC-005', name: 'Facility 5', code: 'FAC-005' },
        { id: 'FAC-006', name: 'Facility 6', code: 'FAC-006' },
        { id: 'FAC-007', name: 'Facility 7', code: 'FAC-007' }
      ];
      setFacilities(presetFacilities);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles', {
        params: { status: 'ACTIVE', page: 1, pageSize: 1000 }
      });
      if (response.data.success) {
        const apiRoles = response.data.data.items || [];
        // 添加预设的 role 选项
        const presetRoles = [
          { id: 'ROLE-001', name: 'System Administrator' },
          { id: 'ROLE-002', name: 'Customer Administrator' },
          { id: 'ROLE-003', name: 'Customer Service Representative' },
          { id: 'ROLE-004', name: 'Data Analyst' }
        ];
        // 合并预设选项和 API 数据，避免重复
        const existingIds = apiRoles.map((r: any) => r.id);
        const uniquePresets = presetRoles.filter(preset => !existingIds.includes(preset.id));
        setRoles([...uniquePresets, ...apiRoles]);
      }
    } catch (error) {
      console.error('Failed to load role list');
      // 如果 API 失败，至少提供预设选项
      const presetRoles = [
        { id: 'ROLE-001', name: 'System Administrator' },
        { id: 'ROLE-002', name: 'Customer Administrator' },
        { id: 'ROLE-003', name: 'Customer Service Representative' },
        { id: 'ROLE-004', name: 'Data Analyst' }
      ];
      setRoles(presetRoles);
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check if account has the selected tenant
    const tenantIds = account.tenantIds || (account.tenantId ? [account.tenantId] : []);
    const matchesTenant = selectedTenant === 'all' || tenantIds.includes(selectedTenant);
    
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus.toUpperCase();

    return matchesSearch && matchesTenant && matchesStatus;
  });

  // Expand accounts with multiple tenants into separate rows
  const expandedAccounts: Array<Account & { displayTenantId: string }> = [];
  filteredAccounts.forEach(account => {
    const tenantIds = account.tenantIds || (account.tenantId ? [account.tenantId] : []);
    
    if (tenantIds.length === 0) {
      // No tenant, add as-is
      expandedAccounts.push({ ...account, displayTenantId: '' });
    } else {
      // Create a row for each tenant
      tenantIds.forEach(tenantId => {
        // If a specific tenant is selected, only show that tenant's row
        if (selectedTenant === 'all' || tenantId === selectedTenant) {
          expandedAccounts.push({ ...account, displayTenantId: tenantId });
        }
      });
    }
  });

  // Pagination
  const totalPages = Math.ceil(expandedAccounts.length / pageSize);
  const paginatedAccounts = expandedAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    const statusText = status.toLowerCase();
    const variant = status === 'ACTIVE' ? 'default' : 'secondary';
    return <Badge variant={variant}>{statusText}</Badge>;
  };

  const getTenantName = (tenantId: string) => {
    // Create a mapping from tenantId to tenant-N format
    const tenantIndex = tenants.findIndex(t => t.id === tenantId);
    if (tenantIndex !== -1) {
      return `tenant-${tenantIndex + 1}`;
    }
    // Fallback: if tenant not in list, try to extract number or use default format
    return tenantId.startsWith('tenant-') ? tenantId : `tenant-${tenantId}`;
  };



  const handleReset = () => {
    setSearchTerm('');
    setSelectedTenant('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    
    console.log('Editing account:', account);
    console.log('Available facilities:', facilities);
    
    let mappings: Array<{ customerId: string; facilityIds: string[] }> = [];
    
    // 如果已有映射关系，直接使用
    if (account.customerFacilityMappings && account.customerFacilityMappings.length > 0) {
      mappings = account.customerFacilityMappings;
      console.log('Using existing mappings:', mappings);
    } else {
      // 如果没有映射关系，根据customerIds和facilityIds生成
      const customerIds = account.customerIds || [];
      
      if (customerIds.length > 0) {
        // 主账号：每个customer分配所有facility
        const allFacilityIds = facilities.map(f => f.id);
        console.log('All facility IDs:', allFacilityIds);
        mappings = customerIds.map(customerId => ({
          customerId,
          facilityIds: allFacilityIds
        }));
        console.log('Generated mappings:', mappings);
      }
    }
    
    console.log('Final mappings for edit form:', mappings);
    
    setEditForm({
      username: account.username,
      email: account.email,
      phone: account.phone || '',
      firstName: '',
      lastName: '',
      status: account.status,
      customerFacilityMappings: mappings,
      roleIds: account.roles || []
    });
    setCustomerSelectOpen(false);
    setCustomerSearchTerm('');
    setFacilitySearchTerms({});
    setShowEditDialog(true);
  };

  // 判断是否为子账号
  const isSubAccount = (account: Account | null): boolean => {
    if (!account) return false;
    // 检查是否在任何主账号的subAccounts中
    return accounts.some(mainAccount => 
      mainAccount.subAccounts?.some(sub => sub.id === account.id)
    );
  };

  const handleCreateSubAccount = (account: Account) => {
    setParentAccount(account);
    setSubAccountForm({
      username: '',
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      status: 'ACTIVE'
    });
    setSubAccountFormErrors({});
    setShowCreateSubAccountDialog(true);
  };

  const validateSubAccountForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!subAccountForm.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!subAccountForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subAccountForm.email)) {
      errors.email = 'Invalid email format';
    }
    if (!subAccountForm.firstName.trim()) {
      errors.firstName = 'First Name is required';
    }
    if (!subAccountForm.lastName.trim()) {
      errors.lastName = 'Last Name is required';
    }
    if (!subAccountForm.password) {
      errors.password = 'Password is required';
    } else if (subAccountForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!subAccountForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm password';
    } else if (subAccountForm.password !== subAccountForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setSubAccountFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSubAccount = async () => {
    if (!parentAccount || !validateSubAccountForm()) return;

    try {
      await api.post(`/portal-admin/accounts/${parentAccount.id}/sub-accounts`, {
        username: subAccountForm.username,
        email: subAccountForm.email,
        phone: subAccountForm.phone || undefined,
        firstName: subAccountForm.firstName,
        lastName: subAccountForm.lastName,
        password: subAccountForm.password,
        status: subAccountForm.status,
        accountType: 'SUB' // 默认为子账号
      });
      toast.success('Sub-account created successfully');
      setShowCreateSubAccountDialog(false);
      loadData();
    } catch (error: any) {
      toast.error('Failed to create sub-account: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAccount) return;

    try {
      // 从 customerFacilityMappings 提取 customerIds 和 facilityIds
      const customerIds = editForm.customerFacilityMappings.map(m => m.customerId);
      const allFacilityIds = new Set<string>();
      editForm.customerFacilityMappings.forEach(m => {
        m.facilityIds.forEach(id => allFacilityIds.add(id));
      });
      const facilityIds = Array.from(allFacilityIds);

      await api.put(`/portal-admin/accounts/${editingAccount.id}`, {
        email: editForm.email,
        status: editForm.status,
        customerIds,
        facilityIds,
        roles: editForm.roleIds
      });
      toast.success('Account updated successfully');
      setShowEditDialog(false);
      loadData();
    } catch (error: any) {
      toast.error('Failed to update account: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;
    
    try {
      const response = await api.delete(`/portal-admin/accounts/${accountToDelete.id}`);
      if (response.data.success) {
        toast.success('Account deleted successfully');
        loadData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleteDialogVisible(false);
      setAccountToDelete(null);
    }
  };

  const handleViewPermissions = (account: Account) => {
    setSelectedAccount(account);
    setShowPermissionsDialog(true);
  };

  const getPermissionsCount = (account: Account) => {
    // 只显示Customer数量
    if (account.customerFacilityMappings && account.customerFacilityMappings.length > 0) {
      // 如果有映射关系，返回customer数量
      return account.customerFacilityMappings.length;
    }
    
    // 兼容旧数据：如果没有映射关系，使用customerIds
    return account.customerIds?.length || 0;
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage accounts across all tenants
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label>{t('common.search')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Tenant Filter */}
            <div>
              <Label>Tenant</Label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {tenants.map((tenant, index) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      tenant-{index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Label>{t('account.status')}</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleReset} variant="outline">
              {t('common.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <Skeleton className="h-96" />
          ) : paginatedAccounts.length === 0 ? (
            <Empty
              icon={<Users className="w-12 h-12" />}
              title="No accounts found"
              description="No accounts match your filter criteria"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>{t('account.username')}</TableHead>
                      <TableHead>{t('account.email')}</TableHead>
                      <TableHead>{t('account.status')}</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Sub-accounts</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAccounts.map((account) => {
                      const permissionsCount = getPermissionsCount(account);
                      const displayTenant = account.displayTenantId || account.tenantId;
                      const rowKey = `${account.id}-${displayTenant}`;
                      const hasSubAccounts = account.subAccounts && account.subAccounts.length > 0;
                      
                      return (
                        <TableRow key={rowKey}>
                          <TableCell>
                            <span className="font-medium">{getTenantName(displayTenant)}</span>
                          </TableCell>
                            <TableCell className="font-medium">{account.username}</TableCell>
                            <TableCell>{account.email}</TableCell>
                            <TableCell>{getStatusBadge(account.status)}</TableCell>
                            <TableCell>
                              {account.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {account.roles.slice(0, 2).map((role, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {role}
                                    </Badge>
                                  ))}
                                  {account.roles.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{account.roles.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {hasSubAccounts ? (
                                <button
                                  onClick={() => {
                                    setSelectedMainAccount(account);
                                    setShowSubAccountsDialog(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  <span className="font-medium text-sm">{account.subAccounts!.length}</span>
                                </button>
                              ) : (
                                <span className="text-muted-foreground text-sm">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {permissionsCount > 0 ? (
                                <button
                                  onClick={() => handleViewPermissions(account)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 transition-colors cursor-pointer border border-green-200 dark:border-green-800"
                                >
                                  <Building2 className="w-3.5 h-3.5" />
                                  <span className="font-medium text-sm">{permissionsCount}</span>
                                </button>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {account.lastLoginAt ? (
                                <span className="text-sm text-muted-foreground">
                                  {new Date(account.lastLoginAt).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Never</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleCreateSubAccount(account)}>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Create Sub-account
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(account)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  {isSubAccount(account) && (
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        setAccountToDelete(account);
                                        setDeleteDialogVisible(true);
                                      }}
                                      className="text-danger"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  totalItems={expandedAccounts.length}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Permissions - {selectedAccount?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Customer-Facility Mappings */}
            {selectedAccount?.customerFacilityMappings && selectedAccount.customerFacilityMappings.length > 0 ? (
              <div className="space-y-3">
                {selectedAccount.customerFacilityMappings.map((mapping, idx) => {
                  const customer = customers.find(c => c.id === mapping.customerId);
                  const customerName = customer ? customer.name : mapping.customerId;
                  
                  return (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 bg-muted/30"
                    >
                      {/* Customer Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-600">
                          Customer: {customerName}
                        </span>
                      </div>

                      {/* Facilities List */}
                      {mapping.facilityIds && mapping.facilityIds.length > 0 ? (
                        <div className="ml-7 space-y-2">
                          <div className="text-sm text-muted-foreground mb-2">
                            Facilities ({mapping.facilityIds.length}):
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {mapping.facilityIds.map((facilityId, fIdx) => {
                              const facility = facilities.find(f => f.id === facilityId);
                              const facilityName = facility ? facility.name : facilityId;
                              return (
                                <div
                                  key={fIdx}
                                  className="px-3 py-2 bg-green-50 dark:bg-green-950 rounded-md text-sm flex items-center gap-2"
                                >
                                  <div className="w-1 h-1 rounded-full bg-green-600"></div>
                                  {facilityName}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="ml-7 text-sm text-muted-foreground italic">
                          No facilities assigned to this customer
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback: Show separate lists if no mappings */
              <div className="space-y-4">
                {/* Customers Section */}
                {selectedAccount?.customerIds && selectedAccount.customerIds.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Customers ({selectedAccount.customerIds.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedAccount.customerIds.map((customerId, idx) => {
                        const customer = customers.find(c => c.id === customerId);
                        const customerName = customer ? customer.name : customerId;
                        return (
                          <div
                            key={idx}
                            className="px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-md text-sm"
                          >
                            {customerName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Facilities Section */}
                {selectedAccount?.facilityIds && selectedAccount.facilityIds.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-green-600" />
                      Facilities ({selectedAccount.facilityIds.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedAccount.facilityIds.map((facilityId, idx) => {
                        const facility = facilities.find(f => f.id === facilityId);
                        const facilityName = facility ? facility.name : facilityId;
                        return (
                          <div
                            key={idx}
                            className="px-3 py-2 bg-green-50 dark:bg-green-950 rounded-md text-sm"
                          >
                            {facilityName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!selectedAccount?.customerIds || selectedAccount.customerIds.length === 0) &&
                 (!selectedAccount?.facilityIds || selectedAccount.facilityIds.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No data permissions assigned
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                value={editForm.username}
                disabled
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                disabled
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 只有非子账号才显示Customer & Facility和Roles */}
            {!isSubAccount(editingAccount) && (
              <>
                <div>
                  <Label>Customer & Facility</Label>
                  <div className="border rounded-lg p-4">
                    {/* Customer选择 */}
                    <div className="mb-4">
                      <Label className="text-sm mb-2 block">Select Customers</Label>
                      <DropdownMenu open={customerSelectOpen} onOpenChange={(open) => {
                        setCustomerSelectOpen(open);
                        if (!open) setCustomerSearchTerm('');
                      }}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            {editForm.customerFacilityMappings.length === 0 
                              ? 'Select customers'
                              : `${editForm.customerFacilityMappings.length} customer(s) selected`
                            }
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[300px]">
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Search customers..."
                              value={customerSearchTerm}
                              onChange={(e) => setCustomerSearchTerm(e.target.value)}
                              className="h-8"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {customers
                              .filter(customer => 
                                customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                                customer.code?.toLowerCase().includes(customerSearchTerm.toLowerCase())
                              )
                              .map(customer => {
                                const isSelected = editForm.customerFacilityMappings.some(m => m.customerId === customer.id);
                                return (
                                  <DropdownMenuItem 
                                    key={customer.id}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      if (isSelected) {
                                        setEditForm({ 
                                          ...editForm, 
                                          customerFacilityMappings: editForm.customerFacilityMappings.filter(m => m.customerId !== customer.id)
                                        });
                                      } else {
                                        // 主账号：自动分配所有facility
                                        const allFacilityIds = facilities.map(f => f.id);
                                        setEditForm({ 
                                          ...editForm, 
                                          customerFacilityMappings: [
                                            ...editForm.customerFacilityMappings,
                                            { customerId: customer.id, facilityIds: allFacilityIds }
                                          ]
                                        });
                                      }
                                    }}
                                    className={isSelected ? 'text-primary font-semibold' : ''}
                                  >
                                    {customer.name}
                                  </DropdownMenuItem>
                                );
                              })}
                            {customers.filter(customer => 
                              customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                              customer.code?.toLowerCase().includes(customerSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                No customers found
                              </div>
                            )}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* 为每个选中的Customer分配Facility */}
                    {editForm.customerFacilityMappings.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {editForm.customerFacilityMappings.map((mapping, index) => {
                          const customer = customers.find(c => c.id === mapping.customerId);
                          const customerName = customer ? customer.name : mapping.customerId;
                          
                          return (
                            <div key={mapping.customerId} className="p-3 bg-muted/30 rounded-lg border">
                              <div className="flex justify-between items-center mb-2">
                                <Badge variant="secondary">{customerName}</Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setEditForm({ 
                                      ...editForm, 
                                      customerFacilityMappings: editForm.customerFacilityMappings.filter(m => m.customerId !== mapping.customerId)
                                    });
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <Label className="text-xs text-muted-foreground mb-2 block">
                                Facilities for {customerName} (All facilities assigned)
                              </Label>
                              
                              {/* 主账号：只显示已分配的facility，不允许修改 */}
                              <div className="p-2 bg-muted/50 rounded border text-xs text-muted-foreground">
                                All facilities are automatically assigned to main accounts
                              </div>
                              
                              {/* 显示所有facility标签（只读） */}
                              {mapping.facilityIds && mapping.facilityIds.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {mapping.facilityIds.map(facilityId => {
                                    const facility = facilities.find(f => f.id === facilityId);
                                    const facilityName = facility ? facility.name : facilityId;
                                    return (
                                      <Badge key={facilityId} variant="outline" className="text-xs px-2 py-0.5">
                                        {facilityName}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="mt-2 text-xs text-muted-foreground italic">
                                  No facilities assigned
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Roles</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        Select roles
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[300px] max-h-[200px] overflow-y-auto">
                      {roles.map(role => (
                        <DropdownMenuItem 
                          key={role.id}
                          onSelect={(e) => {
                            e.preventDefault();
                            if (editForm.roleIds.includes(role.id)) {
                              setEditForm({ ...editForm, roleIds: editForm.roleIds.filter(id => id !== role.id) });
                            } else {
                              setEditForm({ ...editForm, roleIds: [...editForm.roleIds, role.id] });
                            }
                          }}
                          className={editForm.roleIds.includes(role.id) ? 'text-primary font-semibold' : ''}
                        >
                          {role.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* 显示选中的角色标签 */}
                  {editForm.roleIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {editForm.roleIds.map(id => {
                        const role = roles.find(r => r.id === id);
                        return role ? (
                          <Badge key={id} variant="default" className="text-xs px-2 py-0.5 flex items-center gap-1">
                            {role.name}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 p-0"
                              onClick={() => {
                                setEditForm({ 
                                  ...editForm, 
                                  roleIds: editForm.roleIds.filter(rId => rId !== id) 
                                });
                              }}
                            >
                              <X className="w-2 h-2" />
                            </Button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogVisible} onOpenChange={setDeleteDialogVisible}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              <DialogTitle>Confirm Delete</DialogTitle>
            </div>
            <DialogDescription>
              {accountToDelete && `Are you sure you want to delete account "${accountToDelete.username}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Sub-account Dialog */}
      <Dialog open={showCreateSubAccountDialog} onOpenChange={setShowCreateSubAccountDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Sub-account for {parentAccount?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Username *</Label>
              <Input
                value={subAccountForm.username}
                onChange={(e) => setSubAccountForm({ ...subAccountForm, username: e.target.value })}
                placeholder="Enter username"
              />
              {subAccountFormErrors.username && (
                <span className="text-sm text-danger">{subAccountFormErrors.username}</span>
              )}
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={subAccountForm.email}
                onChange={(e) => setSubAccountForm({ ...subAccountForm, email: e.target.value })}
                placeholder="Enter email"
              />
              {subAccountFormErrors.email && (
                <span className="text-sm text-danger">{subAccountFormErrors.email}</span>
              )}
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                value={subAccountForm.phone}
                onChange={(e) => setSubAccountForm({ ...subAccountForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>First Name *</Label>
              <Input
                value={subAccountForm.firstName}
                onChange={(e) => setSubAccountForm({ ...subAccountForm, firstName: e.target.value })}
              />
              {subAccountFormErrors.firstName && (
                <span className="text-sm text-danger">{subAccountFormErrors.firstName}</span>
              )}
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={subAccountForm.lastName}
                onChange={(e) => setSubAccountForm({ ...subAccountForm, lastName: e.target.value })}
              />
              {subAccountFormErrors.lastName && (
                <span className="text-sm text-danger">{subAccountFormErrors.lastName}</span>
              )}
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={subAccountForm.password}
                onChange={(e) => setSubAccountForm({ ...subAccountForm, password: e.target.value })}
                placeholder="Enter password"
              />
              <div className="mt-1">
                <span className="text-xs text-muted-foreground">
                  Password must contain: lowercase • uppercase • number • special char • 8+ chars
                </span>
              </div>
              {subAccountFormErrors.password && (
                <span className="text-sm text-danger">{subAccountFormErrors.password}</span>
              )}
            </div>
            <div>
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={subAccountForm.confirmPassword}
                onChange={(e) => setSubAccountForm({ ...subAccountForm, confirmPassword: e.target.value })}
                placeholder="Confirm password"
              />
              {subAccountFormErrors.confirmPassword && (
                <span className="text-sm text-danger">{subAccountFormErrors.confirmPassword}</span>
              )}
            </div>
            <div>
              <Label>Status</Label>
              <Select value={subAccountForm.status} onValueChange={(value) => setSubAccountForm({ ...subAccountForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowCreateSubAccountDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSubAccount}>
                Create Sub-account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-accounts List Dialog */}
      <Dialog open={showSubAccountsDialog} onOpenChange={setShowSubAccountsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sub-accounts of {selectedMainAccount?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMainAccount?.subAccounts && selectedMainAccount.subAccounts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMainAccount.subAccounts.map((subAccount) => (
                    <TableRow key={subAccount.id}>
                      <TableCell className="font-medium">{subAccount.username}</TableCell>
                      <TableCell>{subAccount.email}</TableCell>
                      <TableCell>
                        <Switch
                          checked={subAccount.status === 'ACTIVE'}
                          onCheckedChange={(checked) => {
                            const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
                            
                            // 更新本地状态
                            if (selectedMainAccount) {
                              const updatedSubAccounts = selectedMainAccount.subAccounts?.map(sa => 
                                sa.id === subAccount.id ? { ...sa, status: newStatus } : sa
                              );
                              
                              const updatedMainAccount = {
                                ...selectedMainAccount,
                                subAccounts: updatedSubAccounts
                              };
                              
                              setSelectedMainAccount(updatedMainAccount);
                              
                              // 同时更新accounts列表中的数据
                              setAccounts(accounts.map(acc => 
                                acc.id === selectedMainAccount.id ? updatedMainAccount : acc
                              ));
                              
                              toast.success('Status updated successfully');
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {subAccount.lastLoginAt ? (
                          <span className="text-sm text-muted-foreground">
                            {new Date(subAccount.lastLoginAt).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sub-accounts found
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortalAdminAccountManagement;
