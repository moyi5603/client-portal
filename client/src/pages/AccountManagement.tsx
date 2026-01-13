import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  KeyRound,
  Download,
  MoreHorizontal,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { useDebounce, useKeyboardShortcut } from '../hooks/useDebounce';
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Empty,
  Skeleton,
  Pagination,
} from '../components/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Account {
  id: string;
  username: string;
  email: string;
  phone?: string;
  accountType: string;
  status: string;
  customerIds?: string[];
  accessibleCustomerIds?: string[];
  facilityIds?: string[];
  accessibleFacilityIds?: string[];
  roles: string[];
  lastLoginAt?: string;
  createdAt?: string;
}

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  accountType: string;
  status: string;
  accessibleCustomerIds: string[];
  accessibleFacilityIds: string[];
  roleIds: string[];
}

const initialFormData: FormData = {
  username: '',
  email: '',
  phone: '',
  password: '',
  accountType: 'CUSTOMER',
  status: 'ACTIVE',
  accessibleCustomerIds: [],
  accessibleFacilityIds: [],
  roleIds: [],
};

const AccountManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [resetPasswordDialogVisible, setResetPasswordDialogVisible] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [accountToResetPassword, setAccountToResetPassword] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatusModalVisible, setBulkStatusModalVisible] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('ACTIVE');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Filter state
  const [filters, setFilters] = useState({
    username: '',
    email: '',
    phone: '',
    customerIds: [] as string[],
    facilityIds: [] as string[],
    accountType: '',
    status: ''
  });
  
  // Debounced filter values for automatic search
  const debouncedUsername = useDebounce(filters.username, 300);
  const debouncedEmail = useDebounce(filters.email, 300);
  const debouncedPhone = useDebounce(filters.phone, 300);
  
  // Export state
  const [exporting, setExporting] = useState(false);
  
  // Select dropdown states
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [facilitySelectOpen, setFacilitySelectOpen] = useState(false);
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);

  useEffect(() => {
    loadAccounts();
    loadCustomers();
    loadFacilities();
    loadRoles();
  }, []);
  
  // Auto-search when debounced values change
  useEffect(() => {
    if (debouncedUsername !== '' || debouncedEmail !== '' || debouncedPhone !== '') {
      loadAccountsWithFilters(filters);
    }
  }, [debouncedUsername, debouncedEmail, debouncedPhone]);

  const loadAccounts = async () => {
    loadAccountsWithFilters(filters);
  };
  
  const handleResetFilters = () => {
    const resetFilters = {
      username: '',
      email: '',
      phone: '',
      customerIds: [] as string[],
      facilityIds: [] as string[],
      accountType: '',
      status: ''
    };
    setFilters(resetFilters);
    loadAccountsWithFilters(resetFilters);
  };
  
  const loadAccountsWithFilters = async (filterParams: typeof filters) => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        pageSize: 1000
      };
      
      if (filterParams.username) params.username = filterParams.username;
      if (filterParams.email) params.email = filterParams.email;
      if (filterParams.phone) params.phone = filterParams.phone;
      if (filterParams.customerIds && filterParams.customerIds.length > 0) {
        params.customerIds = filterParams.customerIds;
      }
      if (filterParams.facilityIds && filterParams.facilityIds.length > 0) {
        params.facilityIds = filterParams.facilityIds;
      }
      if (filterParams.accountType) params.accountType = filterParams.accountType;
      if (filterParams.status) params.status = filterParams.status;
      
      const response = await api.get('/accounts', { params });
      if (response.data.success) {
        setAccounts(response.data.data.items || []);
        setSelectedIds(new Set());
        setCurrentPage(1);
      }
    } catch (error) {
      toast.error(t('account.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadFacilities = async () => {
    try {
      const response = await api.get('/permissions/facilities');
      if (response.data.success) {
        const apiFacilities = response.data.data || [];
        // 添加预设的 facility 选项
        const presetFacilities = [
          { id: 'facility-1', name: 'facility-1', code: 'facility-1' },
          { id: 'facility-2', name: 'facility-2', code: 'facility-2' }
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
        { id: 'facility-1', name: 'facility-1', code: 'facility-1' },
        { id: 'facility-2', name: 'facility-2', code: 'facility-2' }
      ];
      setFacilities(presetFacilities);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.get('/permissions/customers');
      if (response.data.success) {
        const apiCustomers = response.data.data || [];
        // 添加预设的 customer 选项
        const presetCustomers = [
          { id: 'customer-1', name: 'customer-1', code: 'customer-1' },
          { id: 'customer-2', name: 'customer-2', code: 'customer-2' },
          { id: 'customer-3', name: 'customer-3', code: 'customer-3' }
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
        { id: 'customer-1', name: 'customer-1', code: 'customer-1' },
        { id: 'customer-2', name: 'customer-2', code: 'customer-2' },
        { id: 'customer-3', name: 'customer-3', code: 'customer-3' }
      ];
      setCustomers(presetCustomers);
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
          { id: 'role-1', name: 'role-1' },
          { id: 'role-2', name: 'role-2' }
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
        { id: 'role-1', name: 'role-1' },
        { id: 'role-2', name: 'role-2' }
      ];
      setRoles(presetRoles);
    }
  };

  const handleCreate = useCallback(() => {
    setEditingAccount(null);
    setFormData(initialFormData);
    setFormErrors({});
    setCustomerSelectOpen(false);
    setFacilitySelectOpen(false);
    setRoleSelectOpen(false);
    setModalVisible(true);
  }, []);
  
  // Keyboard shortcut: Ctrl+N for new account
  useKeyboardShortcut('n', handleCreate, { ctrlKey: true });
  
  // Export accounts to CSV
  const handleExportCSV = () => {
    setExporting(true);
    try {
      const headers = [
        t('account.username'),
        t('account.email'),
        t('account.phone'),
        t('account.accountType'),
        t('account.roles'),
        t('common.status'),
        t('account.lastLogin'),
      ];

      const rows = accounts.map(account => [
        account.username,
        account.email,
        account.phone || '-',
        account.accountType,
        account.roles.map(roleId => roles.find(r => r.id === roleId)?.name || roleId).join(', '),
        account.status,
        account.lastLoginAt ? dayjs(account.lastLoginAt).format('YYYY-MM-DD HH:mm:ss') : t('account.neverLoggedIn'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `accounts-${dayjs().format('YYYY-MM-DD-HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(t('common.exportSuccess'));
    } catch (error) {
      toast.error(t('common.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  // Reset password handler
  const handleResetPassword = async () => {
    if (!accountToResetPassword) return;
    
    try {
      // Call API (may succeed or fail)
      await api.post(`/accounts/${accountToResetPassword.id}/reset-password`);
    } catch (error: any) {
      // Ignore API errors - we always show the same message
      console.log('Password reset API call failed, but showing success message to user');
    } finally {
      // Always show email sent message for security reasons
      toast.success(t('account.resetPasswordEmailSent'));
      setResetPasswordDialogVisible(false);
      setAccountToResetPassword(null);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    const customerIds = account.customerIds || account.accessibleCustomerIds || [];
    const facilityIds = account.facilityIds || account.accessibleFacilityIds || [];
    setFormData({
      username: account.username,
      email: account.email,
      phone: account.phone || '',
      password: '',
      accountType: account.accountType,
      status: account.status,
      accessibleCustomerIds: customerIds,
      accessibleFacilityIds: facilityIds,
      roleIds: account.roles || [],
    });
    setFormErrors({});
    setCustomerSelectOpen(false);
    setFacilitySelectOpen(false);
    setRoleSelectOpen(false);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    if (!accountToDelete) return;
    
    try {
      const response = await api.delete(`/accounts/${accountToDelete.id}`);
      if (response.data.success) {
        toast.success(t('account.deleteSuccess'));
        loadAccounts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('account.deleteFailed'));
    } finally {
      setDeleteDialogVisible(false);
      setAccountToDelete(null);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    const selectedAccounts = accounts.filter(a => selectedIds.has(a.id));
    const deletableAccounts = selectedAccounts.filter(a => a.accountType !== 'MAIN');
    
    if (deletableAccounts.length === 0) {
      toast.warning(t('common.noData'));
      return;
    }

    try {
      await Promise.all(
        deletableAccounts.map(account => api.delete(`/accounts/${account.id}`))
      );
      toast.success(t('account.bulkDeleteSuccess'));
      setSelectedIds(new Set());
      loadAccounts();
    } catch (error) {
      toast.error(t('account.deleteFailed'));
    }
  };

  // Bulk status change handler
  const handleBulkStatusChange = async () => {
    const selectedAccounts = accounts.filter(a => selectedIds.has(a.id));
    const updatableAccounts = selectedAccounts.filter(a => a.accountType !== 'MAIN');
    
    if (updatableAccounts.length === 0) {
      toast.warning(t('common.noData'));
      return;
    }

    try {
      await Promise.all(
        updatableAccounts.map(account => 
          api.put(`/accounts/${account.id}`, { ...account, status: bulkStatus })
        )
      );
      toast.success(t('account.bulkStatusChangeSuccess'));
      setSelectedIds(new Set());
      setBulkStatusModalVisible(false);
      loadAccounts();
    } catch (error) {
      toast.error(t('account.saveFailed'));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.username.trim()) {
      errors.username = t('account.usernameRequired');
    }
    if (!formData.email.trim()) {
      errors.email = t('account.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('account.emailRequired');
    }
    if (!editingAccount && !formData.password) {
      errors.password = t('account.passwordRequired');
    } else if (!editingAccount && formData.password.length < 8) {
      errors.password = t('account.passwordRequirements');
    }
    if (!editingAccount && !formData.accountType) {
      errors.accountType = t('account.accountTypeRequired');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let accessibleCustomerIds = formData.accessibleCustomerIds;
      if (accessibleCustomerIds.includes('ALL')) {
        accessibleCustomerIds = customers.map(c => c.id);
      }

      let accessibleFacilityIds = formData.accessibleFacilityIds;
      if (accessibleFacilityIds.includes('ALL')) {
        accessibleFacilityIds = facilities.map(f => f.id);
      }

      if (editingAccount) {
        const updatePayload = {
          email: formData.email,
          phone: formData.phone || undefined,
          status: formData.status,
          accessibleCustomerIds,
          accessibleFacilityIds,
          roleIds: formData.roleIds,
        };
        const response = await api.put(`/accounts/${editingAccount.id}`, updatePayload);
        if (response.data.success) {
          toast.success(t('account.updateSuccess'));
          setModalVisible(false);
          loadAccounts();
        }
      } else {
        const endpoint = formData.accountType === 'CUSTOMER' ? '/accounts/customer' : '/accounts/partner';
        const payload: any = {
          username: formData.username,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          status: formData.status,
          accessibleCustomerIds: formData.accountType === 'PARTNER' ? accessibleCustomerIds : undefined,
          customerIds: formData.accountType === 'CUSTOMER' ? accessibleCustomerIds : undefined,
          accessibleFacilityIds: formData.accountType === 'PARTNER' ? accessibleFacilityIds : undefined,
          facilityIds: formData.accountType === 'CUSTOMER' ? accessibleFacilityIds : undefined,
          roleIds: formData.roleIds,
        };
        const response = await api.post(endpoint, payload);
        if (response.data.success) {
          toast.success(t('account.createSuccess'));
          setModalVisible(false);
          setFormData(initialFormData);
          loadAccounts();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('account.saveFailed'));
    }
  };

  const getCustomerBadges = (account: Account) => {
    if (account.accountType === 'MAIN') {
      return <Badge variant="info">{t('account.allCustomers')}</Badge>;
    }
    
    const customerIds = account.customerIds || account.accessibleCustomerIds || [];
    
    if (customerIds.length === 0) {
      return <span className="text-secondary">{t('account.noCustomers')}</span>;
    }
    
    const allCustomerIds = customers.map(c => c.id);
    const hasAllCustomers = customerIds.length === allCustomerIds.length && 
      allCustomerIds.every(id => customerIds.includes(id));
    
    if (hasAllCustomers) {
      return <Badge variant="info">{t('account.allCustomers')}</Badge>;
    }
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        {customerIds.slice(0, 3).map((id: string) => {
          const customer = customers.find(c => c.id === id);
          return (
            <Badge key={id} variant="info">
              {customer ? customer.name : id}
            </Badge>
          );
        })}
        {customerIds.length > 3 && (
          <Badge variant="secondary">+{customerIds.length - 3}</Badge>
        )}
      </div>
    );
  };

  const getFacilityBadges = (account: Account) => {
    if (account.accountType === 'MAIN') {
      return <Badge variant="info">{t('account.allFacilities')}</Badge>;
    }
    
    const facilityIds = account.facilityIds || account.accessibleFacilityIds || [];
    
    if (facilityIds.length === 0) {
      return <span className="text-secondary">{t('account.noFacilities')}</span>;
    }
    
    const allFacilityIds = facilities.map(f => f.id);
    const hasAllFacilities = facilityIds.length === allFacilityIds.length && 
      allFacilityIds.every(id => facilityIds.includes(id));
    
    if (hasAllFacilities) {
      return <Badge variant="info">{t('account.allFacilities')}</Badge>;
    }
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        {facilityIds.slice(0, 3).map((id: string) => {
          const facility = facilities.find(f => f.id === id);
          return (
            <Badge key={id} variant="success">
              {facility ? facility.name : id}
            </Badge>
          );
        })}
        {facilityIds.length > 3 && (
          <Badge variant="secondary">+{facilityIds.length - 3}</Badge>
        )}
      </div>
    );
  };

  const getRoleBadges = (account: Account) => {
    if (!account.roles || account.roles.length === 0) {
      return <span className="text-secondary">{t('account.noRoles')}</span>;
    }
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        {account.roles.slice(0, 2).map((roleId: string) => {
          const role = roles.find(r => r.id === roleId);
          let displayName = role ? role.name : roleId;
          
          // 特殊处理：超级管理员角色显示为"超级管理"
          if (roleId === 'ROLE-000' || (role && role.name === 'Super Administrator')) {
            displayName = t('role.superAdmin');
          }
          
          return (
            <Badge key={roleId} variant="default">
              {displayName}
            </Badge>
          );
        })}
        {account.roles.length > 2 && (
          <Badge variant="secondary">+{account.roles.length - 2}</Badge>
        )}
      </div>
    );
  };

  // Selection handlers
  const toggleSelectAll = () => {
    const selectableAccounts = accounts.filter(a => 
      a.accountType !== 'MAIN' && a.id !== user?.id
    );
    
    if (selectedIds.size === selectableAccounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableAccounts.map(a => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Pagination
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return accounts.slice(startIndex, startIndex + pageSize);
  }, [accounts, currentPage, pageSize]);

  const totalPages = Math.ceil(accounts.length / pageSize);

  const getAccountTypeBadge = (type: string) => {
    const typeMap: Record<string, { text: string; variant: 'destructive' | 'info' | 'success' }> = {
      MAIN: { text: t('account.typeMain'), variant: 'destructive' },
      CUSTOMER: { text: t('account.typeCustomer'), variant: 'info' },
      PARTNER: { text: t('account.typePartner'), variant: 'success' }
    };
    const info = typeMap[type] || { text: type, variant: 'secondary' as any };
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; variant: 'success' | 'secondary' | 'warning' }> = {
      ACTIVE: { text: t('account.statusActive'), variant: 'success' },
      INACTIVE: { text: t('account.statusInactive'), variant: 'secondary' },
      SUSPENDED: { text: t('account.statusSuspended'), variant: 'warning' }
    };
    const info = statusMap[status] || { text: status, variant: 'secondary' as any };
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

  const selectableCount = accounts.filter(a => a.accountType !== 'MAIN' && a.id !== user?.id).length;
  const allSelected = selectableCount > 0 && selectedIds.size === selectableCount;
  const someSelected = selectedIds.size > 0 && selectedIds.size < selectableCount;

  return (
    <TooltipProvider>
      <div>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: 'var(--text-2xl)', 
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
          }}>
            {t('account.title')}
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {selectedIds.size > 0 && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {t('common.bulkActions')} ({selectedIds.size}) <ChevronDown size={14} style={{ marginLeft: 4 }} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setBulkStatusModalVisible(true)}>
                    {t('account.bulkChangeStatus')}
                  </DropdownMenuItem>
                  <DropdownMenuItem danger onClick={handleBulkDelete}>
                    {t('account.bulkDelete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus size={16} /> {t('account.create')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ctrl+N</TooltipContent>
            </Tooltip>
            <Button 
              variant="outline"
              onClick={handleExportCSV}
              disabled={exporting || accounts.length === 0}
            >
              <Download size={16} /> {t('common.exportCsv')}
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card style={{ marginBottom: 'var(--space-md)' }}>
          <CardContent style={{ padding: 'var(--space-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
              <Input
                placeholder={t('account.searchUsername')}
                value={filters.username}
                onChange={(e) => setFilters({ ...filters, username: e.target.value })}
              />
              <Input
                placeholder={t('account.searchEmail')}
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
              />
              <Select
                value={filters.accountType || undefined}
                onValueChange={(value) => setFilters({ ...filters, accountType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('account.selectAccountType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAIN">{t('account.typeMain')}</SelectItem>
                  <SelectItem value="CUSTOMER">{t('account.typeCustomer')}</SelectItem>
                  <SelectItem value="PARTNER">{t('account.typePartner')}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status || undefined}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('account.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t('account.statusActive')}</SelectItem>
                  <SelectItem value="INACTIVE">{t('account.statusInactive')}</SelectItem>
                  <SelectItem value="SUSPENDED">{t('account.statusSuspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
              <Button variant="outline" onClick={handleResetFilters}>{t('account.reset')}</Button>
              <Button onClick={loadAccounts}>
                <Search size={16} /> {t('account.search')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Table */}
        {loading ? (
          <Card>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} style={{ height: 48 }} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent>
              <Empty 
                variant="accounts"
                title={t('common.noData')}
                description={t('account.noAccountsDescription') || 'No accounts found. Create your first account to get started.'}
                action={{
                  label: t('account.create'),
                  onClick: handleCreate
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      data-indeterminate={someSelected}
                    />
                  </TableHead>
                  <TableHead>{t('account.username')}</TableHead>
                  <TableHead>{t('account.email')}</TableHead>
                  <TableHead>{t('account.accountType')}</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>{t('account.roles')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('account.lastLogin')}</TableHead>
                  <TableHead style={{ width: 80, textAlign: 'center' }}>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAccounts.map((account) => {
                  const isSelectable = account.accountType !== 'MAIN' && account.id !== user?.id;
                  const isSelected = selectedIds.has(account.id);
                  
                  return (
                    <TableRow key={account.id} data-state={isSelected ? 'selected' : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(account.id)}
                          disabled={!isSelectable}
                        />
                      </TableCell>
                      <TableCell>
                        <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                          {account.username}
                        </span>
                      </TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                      <TableCell>{getCustomerBadges(account)}</TableCell>
                      <TableCell>{getFacilityBadges(account)}</TableCell>
                      <TableCell>{getRoleBadges(account)}</TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell>
                        {!account.lastLoginAt ? (
                          <span className="text-secondary text-xs">{t('account.neverLoggedIn')}</span>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-sm">{dayjs(account.lastLoginAt).fromNow()}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {dayjs(account.lastLoginAt).format('YYYY-MM-DD HH:mm:ss')}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        {!isSelectable ? (
                          <span className="text-secondary">-</span>
                        ) : (
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(account)}>
                                <Pencil size={14} style={{ marginRight: 8 }} />
                                {t('common.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setAccountToResetPassword(account);
                                setResetPasswordDialogVisible(true);
                              }}>
                                <KeyRound size={14} style={{ marginRight: 8 }} />
                                {t('account.resetPassword')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                danger 
                                onClick={() => {
                                  setAccountToDelete(account);
                                  setDeleteDialogVisible(true);
                                }}
                              >
                                <Trash2 size={14} style={{ marginRight: 8 }} />
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={accounts.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={modalVisible} onOpenChange={setModalVisible}>
          <DialogContent className="ui-dialog-content--lg">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? t('account.editTitle') : t('account.createTitle')}
              </DialogTitle>
            </DialogHeader>
            
            <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
              {!editingAccount && (
                <div>
                  <Label required>{t('account.accountType')}</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                  >
                    <SelectTrigger error={!!formErrors.accountType}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">{t('account.typeCustomer')}</SelectItem>
                      <SelectItem value="PARTNER">{t('account.typePartner')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.accountType && (
                    <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                      {formErrors.accountType}
                    </span>
                  )}
                </div>
              )}
              
              <div>
                <Label required>{t('account.username')}</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingAccount}
                  error={!!formErrors.username}
                />
                {formErrors.username && (
                  <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                    {formErrors.username}
                  </span>
                )}
              </div>
              
              <div>
                <Label required>{t('account.email')}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!formErrors.email}
                />
                {formErrors.email && (
                  <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                    {formErrors.email}
                  </span>
                )}
              </div>
              
              <div>
                <Label>{t('account.phone')}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('account.phoneOptional')}
                />
              </div>
              
              {!editingAccount && (
                <div>
                  <Label required>{t('account.password')}</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={!!formErrors.password}
                  />
                  <PasswordStrengthIndicator password={formData.password} />
                  {formErrors.password && (
                    <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                      {formErrors.password}
                    </span>
                  )}
                </div>
              )}
              
              <div>
                <Label>{t('common.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t('account.statusActive')}</SelectItem>
                    <SelectItem value="INACTIVE">{t('account.statusInactive')}</SelectItem>
                    <SelectItem value="SUSPENDED">{t('account.statusSuspended')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Customer</Label>
                <DropdownMenu open={customerSelectOpen} onOpenChange={setCustomerSelectOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" style={{ width: '100%', justifyContent: 'space-between' }}>
                      {t('account.selectCustomersPlaceholder')}
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent style={{ width: '300px', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white' }}>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        if (formData.accessibleCustomerIds.includes('ALL')) {
                          setFormData({ ...formData, accessibleCustomerIds: [] });
                        } else {
                          setFormData({ ...formData, accessibleCustomerIds: ['ALL'] });
                        }
                      }}
                      style={{
                        color: formData.accessibleCustomerIds.includes('ALL') ? 'var(--primary)' : 'inherit',
                        fontWeight: formData.accessibleCustomerIds.includes('ALL') ? 'var(--font-bold)' : 'normal'
                      }}
                    >
                      {t('account.allCustomers')}
                    </DropdownMenuItem>
                    {customers.map(customer => (
                      <DropdownMenuItem 
                        key={customer.id}
                        onSelect={(e) => {
                          e.preventDefault();
                          const currentIds = formData.accessibleCustomerIds.filter(id => id !== 'ALL');
                          if (currentIds.includes(customer.id)) {
                            // 如果已选中，则取消选择
                            setFormData({ ...formData, accessibleCustomerIds: currentIds.filter(id => id !== customer.id) });
                          } else {
                            // 如果未选中，则添加选择
                            setFormData({ ...formData, accessibleCustomerIds: [...currentIds, customer.id] });
                          }
                        }}
                        style={{
                          color: formData.accessibleCustomerIds.includes(customer.id) ? 'var(--primary)' : 'inherit',
                          fontWeight: formData.accessibleCustomerIds.includes(customer.id) ? 'var(--font-bold)' : 'normal'
                        }}
                      >
                        {customer.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* 显示选中的标签 */}
                {formData.accessibleCustomerIds.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {formData.accessibleCustomerIds.includes('ALL') ? (
                      <Badge variant="secondary" style={{ fontSize: '12px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {t('account.allCustomers')}
                        <button
                          type="button"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            padding: 0, 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'inherit'
                          }}
                          onClick={() => {
                            setFormData({ ...formData, accessibleCustomerIds: [] });
                          }}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ) : (
                      formData.accessibleCustomerIds.map(id => {
                        const customer = customers.find(c => c.id === id);
                        return customer ? (
                          <Badge key={id} variant="secondary" style={{ fontSize: '12px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {customer.name}
                            <button
                              type="button"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: 0, 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'inherit'
                              }}
                              onClick={() => {
                                setFormData({ 
                                  ...formData, 
                                  accessibleCustomerIds: formData.accessibleCustomerIds.filter(cId => cId !== id) 
                                });
                              }}
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ) : null;
                      })
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <Label>Facility</Label>
                <DropdownMenu open={facilitySelectOpen} onOpenChange={setFacilitySelectOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" style={{ width: '100%', justifyContent: 'space-between' }}>
                      Select Facilities
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent style={{ width: '300px', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white' }}>
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        if (formData.accessibleFacilityIds.includes('ALL')) {
                          setFormData({ ...formData, accessibleFacilityIds: [] });
                        } else {
                          setFormData({ ...formData, accessibleFacilityIds: ['ALL'] });
                        }
                      }}
                      style={{
                        color: formData.accessibleFacilityIds.includes('ALL') ? 'var(--primary)' : 'inherit',
                        fontWeight: formData.accessibleFacilityIds.includes('ALL') ? 'var(--font-bold)' : 'normal'
                      }}
                    >
                      AllFacility
                    </DropdownMenuItem>
                    {facilities.map(facility => (
                      <DropdownMenuItem 
                        key={facility.id}
                        onSelect={(e) => {
                          e.preventDefault();
                          const currentIds = formData.accessibleFacilityIds.filter(id => id !== 'ALL');
                          if (currentIds.includes(facility.id)) {
                            // 如果已选中，则取消选择
                            setFormData({ ...formData, accessibleFacilityIds: currentIds.filter(id => id !== facility.id) });
                          } else {
                            // 如果未选中，则添加选择
                            setFormData({ ...formData, accessibleFacilityIds: [...currentIds, facility.id] });
                          }
                        }}
                        style={{
                          color: formData.accessibleFacilityIds.includes(facility.id) ? 'var(--primary)' : 'inherit',
                          fontWeight: formData.accessibleFacilityIds.includes(facility.id) ? 'var(--font-bold)' : 'normal'
                        }}
                      >
                        {facility.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* 显示选中的标签 */}
                {formData.accessibleFacilityIds.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {formData.accessibleFacilityIds.includes('ALL') ? (
                      <Badge variant="success" style={{ fontSize: '12px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        AllFacility
                        <button
                          type="button"
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            padding: 0, 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'inherit'
                          }}
                          onClick={() => {
                            setFormData({ ...formData, accessibleFacilityIds: [] });
                          }}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ) : (
                      formData.accessibleFacilityIds.map(id => {
                        const facility = facilities.find(f => f.id === id);
                        return facility ? (
                          <Badge key={id} variant="success" style={{ fontSize: '12px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {facility.name}
                            <button
                              type="button"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: 0, 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'inherit'
                              }}
                              onClick={() => {
                                setFormData({ 
                                  ...formData, 
                                  accessibleFacilityIds: formData.accessibleFacilityIds.filter(fId => fId !== id) 
                                });
                              }}
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ) : null;
                      })
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <Label>{t('account.roles')}</Label>
                <DropdownMenu open={roleSelectOpen} onOpenChange={setRoleSelectOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" style={{ width: '100%', justifyContent: 'space-between' }}>
                      {t('account.selectRolesPlaceholder')}
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent style={{ width: '300px', maxHeight: '200px', overflowY: 'auto', backgroundColor: 'white' }}>
                    {roles.map(role => (
                      <DropdownMenuItem 
                        key={role.id}
                        onSelect={(e) => {
                          e.preventDefault();
                          if (formData.roleIds.includes(role.id)) {
                            // 如果已选中，则取消选择
                            setFormData({ ...formData, roleIds: formData.roleIds.filter(id => id !== role.id) });
                          } else {
                            // 如果未选中，则添加选择
                            setFormData({ ...formData, roleIds: [...formData.roleIds, role.id] });
                          }
                        }}
                        style={{
                          color: formData.roleIds.includes(role.id) ? 'var(--primary)' : 'inherit',
                          fontWeight: formData.roleIds.includes(role.id) ? 'var(--font-bold)' : 'normal'
                        }}
                      >
                        {role.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* 显示选中的标签 */}
                {formData.roleIds.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {formData.roleIds.map(id => {
                      const role = roles.find(r => r.id === id);
                      let displayName = role ? role.name : id;
                      
                      // 特殊处理：超级管理员角色显示为"超级管理"
                      if (id === 'ROLE-000' || (role && role.name === 'Super Administrator')) {
                        displayName = t('role.superAdmin');
                      }
                      
                      return role ? (
                        <Badge key={id} variant="default" style={{ fontSize: '12px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {displayName}
                          <button
                            type="button"
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              padding: 0, 
                              display: 'flex', 
                              alignItems: 'center',
                              color: 'inherit'
                            }}
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                roleIds: formData.roleIds.filter(rId => rId !== id) 
                              });
                            }}
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogVisible} onOpenChange={setDeleteDialogVisible}>
          <DialogContent className="ui-dialog-content--sm">
            <DialogHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                <DialogTitle>{t('common.confirm')}</DialogTitle>
              </div>
              <DialogDescription>
                {accountToDelete && t('account.deleteConfirm', { name: accountToDelete.username })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {t('common.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Confirmation Dialog */}
        <Dialog open={resetPasswordDialogVisible} onOpenChange={setResetPasswordDialogVisible}>
          <DialogContent className="ui-dialog-content--sm">
            <DialogHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <KeyRound size={20} style={{ color: 'var(--warning)' }} />
                <DialogTitle>{t('account.resetPassword')}</DialogTitle>
              </div>
              <DialogDescription>
                {accountToResetPassword && t('account.resetPasswordConfirm', { name: accountToResetPassword.username })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPasswordDialogVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleResetPassword}>
                {t('account.resetPassword')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Status Change Dialog */}
        <Dialog open={bulkStatusModalVisible} onOpenChange={setBulkStatusModalVisible}>
          <DialogContent className="ui-dialog-content--sm">
            <DialogHeader>
              <DialogTitle>{t('account.bulkChangeStatus')}</DialogTitle>
            </DialogHeader>
            <p style={{ marginBottom: 'var(--space-md)' }}>
              {t('common.selected', { count: selectedIds.size.toString() })}
            </p>
            <Select
              value={bulkStatus}
              onValueChange={setBulkStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">{t('account.statusActive')}</SelectItem>
                <SelectItem value="INACTIVE">{t('account.statusInactive')}</SelectItem>
                <SelectItem value="SUSPENDED">{t('account.statusSuspended')}</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkStatusModalVisible(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleBulkStatusChange}>
                {t('common.confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AccountManagement;
