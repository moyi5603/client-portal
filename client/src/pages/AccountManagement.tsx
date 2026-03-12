import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Download,
  MoreHorizontal,
  Search,
  AlertCircle,
  X,
  Building2,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
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
  firstName?: string;
  lastName?: string;
  accountType: string;
  status: string;
  customerIds?: string[];
  accessibleCustomerIds?: string[];
  facilityIds?: string[];
  accessibleFacilityIds?: string[];
  customerFacilityMappings?: CustomerFacilityMapping[];
  roles: string[];
  lastLoginAt?: string;
  createdAt?: string;
}


interface CustomerFacilityMapping {
  customerId: string;
  facilityIds: string[];
}

interface FormData {
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  accountType: string;
  status: string;
  accessibleCustomerIds: string[];
  accessibleFacilityIds: string[];
  customerFacilityMappings: CustomerFacilityMapping[];
  roleIds: string[];
}


const initialFormData: FormData = {
  username: '',
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  accountType: 'SUB', // 默认为子账号
  status: 'ACTIVE',
  accessibleCustomerIds: [],
  accessibleFacilityIds: [],
  customerFacilityMappings: [],
  roleIds: [],
}

const AccountManagement: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [customers, setCustomers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
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
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [facilitySearchTerms, setFacilitySearchTerms] = useState<Record<string, string>>({});
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
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
      if (filterParams.status) params.status = filterParams.status;
      
      const response = await api.get('/accounts', { params });
      if (response.data.success) {
        const accountsData = response.data.data.items || [];
        
        // 补全映射关系：如果账号没有customerFacilityMappings，则根据customerIds和facilityIds生成
        const processedAccounts = accountsData.map((account: Account) => {
          if (!account.customerFacilityMappings || account.customerFacilityMappings.length === 0) {
            const customerIds = account.customerIds || account.accessibleCustomerIds || [];
            const facilityIds = account.facilityIds || account.accessibleFacilityIds || [];
            
            if (customerIds.length > 0) {
              // 为每个customer创建映射，所有customer共享相同的facilities
              account.customerFacilityMappings = customerIds.map(customerId => ({
                customerId,
                facilityIds: facilityIds
              }));
            }
          }
          return account;
        });
        
        setAccounts(processedAccounts);
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
          { id: 'facility-2', name: 'facility-2', code: 'facility-2' },
          { id: 'facility-3', name: 'facility-3', code: 'facility-3' },
          { id: 'facility-4', name: 'facility-4', code: 'facility-4' },
          { id: 'facility-5', name: 'facility-5', code: 'facility-5' }
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
        { id: 'facility-2', name: 'facility-2', code: 'facility-2' },
        { id: 'facility-3', name: 'facility-3', code: 'facility-3' },
        { id: 'facility-4', name: 'facility-4', code: 'facility-4' },
        { id: 'facility-5', name: 'facility-5', code: 'facility-5' }
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
    setCustomerSearchTerm('');
    setFacilitySearchTerms({});
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
        t('account.firstName'),
        t('account.lastName'),
        t('account.phone'),
        t('account.accountType'),
        'Customer',
        t('account.roles'),
        t('common.status'),
        t('account.lastLogin'),
        t('account.createdAt'),
      ];

      const rows = accounts.map(account => {
        // 获取Customer和Facility信息（合并显示）
        const customerIds = account.customerIds || account.accessibleCustomerIds || [];
        const facilityIds = account.facilityIds || account.accessibleFacilityIds || [];
        
        let customerFacilityText = '-';
        if (customerIds.length > 0) {
          const customerFacilityPairs = customerIds.map(customerId => {
            const customer = customers.find(c => c.id === customerId);
            const customerName = customer ? `${customer.name}(${customer.code})` : customerId;
            
            // 简化：显示所有facilities（实际应用中可以根据映射关系调整）
            const facilityNames = facilityIds.map(facilityId => {
              const facility = facilities.find(f => f.id === facilityId);
              return facility ? facility.name : facilityId;
            }).join(', ');
            
            return `${customerName} → [${facilityNames || 'No facilities'}]`;
          });
          customerFacilityText = customerFacilityPairs.join('; ');
        }

        // 获取角色信息
        const roleNames = account.roles && account.roles.length > 0
          ? account.roles.map(roleId => {
              const role = roles.find(r => r.id === roleId);
              return role ? role.name : roleId;
            }).join('; ')
          : '-';

        return [
          account.username,
          account.email,
          account.firstName || '-',
          account.lastName || '-',
          account.phone || '-',
          account.accountType,
          customerFacilityText,
          roleNames,
          account.status,
          account.lastLoginAt ? dayjs(account.lastLoginAt).format('MM/DD/YYYY HH:mm:ss') : t('account.neverLoggedIn'),
          account.createdAt ? dayjs(account.createdAt).format('MM/DD/YYYY HH:mm:ss') : '-',
        ];
      });

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

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    const customerIds = account.customerIds || account.accessibleCustomerIds || [];
    const facilityIds = account.facilityIds || account.accessibleFacilityIds || [];
    
    // 构建 customerFacilityMappings
    // 优先使用account中已有的customerFacilityMappings
    let mappings: CustomerFacilityMapping[];
    if (account.customerFacilityMappings && account.customerFacilityMappings.length > 0) {
      // 使用已有的映射关系
      mappings = account.customerFacilityMappings;
    } else {
      // 如果没有映射关系，则所有customer共享相同的facilities
      mappings = customerIds.map(customerId => ({
        customerId,
        facilityIds: facilityIds
      }));
    }
    
    setFormData({
      username: account.username,
      email: account.email,
      phone: account.phone || '',
      firstName: account.firstName || '',
      lastName: account.lastName || '',
      password: '',
      confirmPassword: '',
      accountType: account.accountType,
      status: account.status,
      accessibleCustomerIds: customerIds,
      accessibleFacilityIds: facilityIds,
      customerFacilityMappings: mappings,
      roleIds: account.roles || [],
    });
    setFormErrors({});
    setCustomerSelectOpen(false);
    setFacilitySelectOpen(false);
    setRoleSelectOpen(false);
    setCustomerSearchTerm('');
    setFacilitySearchTerms({});
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
    if (!editingAccount && !formData.firstName.trim()) {
      errors.firstName = 'First Name is required';
    }
    if (!editingAccount && !formData.lastName.trim()) {
      errors.lastName = 'Last Name is required';
    }
    if (!editingAccount && !formData.password) {
      errors.password = t('account.passwordRequired');
    } else if (!editingAccount && formData.password.length < 8) {
      errors.password = t('account.passwordRequirements');
    } else if (!editingAccount && !/[a-z]/.test(formData.password)) {
      errors.password = t('account.passwordRequirements');
    } else if (!editingAccount && !/[A-Z]/.test(formData.password)) {
      errors.password = t('account.passwordRequirements');
    } else if (!editingAccount && !/[0-9]/.test(formData.password)) {
      errors.password = t('account.passwordRequirements');
    } else if (!editingAccount && !/[^a-zA-Z0-9]/.test(formData.password)) {
      errors.password = t('account.passwordRequirements');
    }
    if (!editingAccount && !formData.confirmPassword) {
      errors.confirmPassword = t('account.confirmPasswordRequired');
    } else if (!editingAccount && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('account.passwordMismatch');
    }
    // Account Type字段已移除，不再需要验证
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // 从 customerFacilityMappings 提取 customerIds 和 facilityIds
      const accessibleCustomerIds = formData.customerFacilityMappings.map(m => m.customerId);
      const allFacilityIds = new Set<string>();
      formData.customerFacilityMappings.forEach(m => {
        m.facilityIds.forEach(id => allFacilityIds.add(id));
      });
      const accessibleFacilityIds = Array.from(allFacilityIds);

      if (editingAccount) {
        const updatePayload = {
          email: formData.email,
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
        // 创建账号时，统一使用SUB类型
        const endpoint = '/accounts/sub';
        const payload: any = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
          phone: formData.phone || undefined,
          password: formData.password,
          status: formData.status,
          customerIds: accessibleCustomerIds,
          facilityIds: accessibleFacilityIds,
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

  const getPermissionsCount = (account: Account) => {
    // 只显示Customer数量
    if (account.customerFacilityMappings && account.customerFacilityMappings.length > 0) {
      // 如果有映射关系，返回customer数量
      return account.customerFacilityMappings.length;
    }
    
    // 兼容旧数据：如果没有映射关系，使用customerIds
    const customerIds = account.customerIds || account.accessibleCustomerIds || [];
    return customerIds.length;
  };

  const handleViewPermissions = (account: Account) => {
    setSelectedAccount(account);
    setShowPermissionsDialog(true);
  };

  const getRoleBadges = (account: Account) => {
    // 主账号显示"Admin"
    if (account.accountType === 'MAIN') {
      return (
        <Badge variant="default">
          Admin
        </Badge>
      );
    }
    
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

  // Pagination
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = accounts.slice(startIndex, startIndex + pageSize);
    
    // 动态补全主账号的Customer & Facility数据
    return paginatedData.map(account => {
      if (account.accountType === 'MAIN') {
        // 如果主账号没有customerFacilityMappings，为其分配所有customers和facilities
        if ((!account.customerFacilityMappings || account.customerFacilityMappings.length === 0) &&
            (!account.customerIds || account.customerIds.length === 0) &&
            (!account.accessibleCustomerIds || account.accessibleCustomerIds.length === 0)) {
          const allCustomerIds = customers.map(c => c.id);
          const allFacilityIds = facilities.map(f => f.id);
          
          if (allCustomerIds.length > 0) {
            return {
              ...account,
              accessibleCustomerIds: allCustomerIds,
              accessibleFacilityIds: allFacilityIds,
              customerFacilityMappings: allCustomerIds.map(customerId => ({
                customerId,
                facilityIds: allFacilityIds
              }))
            };
          }
        }
      }
      return account;
    });
  }, [accounts, currentPage, pageSize, customers, facilities]);

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
    const statusMap: Record<string, { text: string; variant: 'success' | 'secondary' }> = {
      ACTIVE: { text: t('account.statusActive'), variant: 'success' },
      INACTIVE: { text: t('account.statusInactive'), variant: 'secondary' }
    };
    const info = statusMap[status] || { text: status, variant: 'secondary' as any };
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
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
                value={filters.status || undefined}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('account.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t('account.statusActive')}</SelectItem>
                  <SelectItem value="INACTIVE">{t('account.statusInactive')}</SelectItem>
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
                  <TableHead>{t('account.username')}</TableHead>
                  <TableHead>{t('account.email')}</TableHead>
                  <TableHead>{t('account.accountType')}</TableHead>
                  <TableHead style={{ minWidth: 200 }}>Customer</TableHead>
                  <TableHead>{t('account.roles')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('account.lastLogin')}</TableHead>
                  <TableHead style={{ width: 80, textAlign: 'center' }}>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAccounts.map((account) => {
                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                          {account.username}
                        </span>
                      </TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                      <TableCell>
                        {(() => {
                          const permissionsCount = getPermissionsCount(account);
                          return permissionsCount > 0 ? (
                            <button
                              onClick={() => handleViewPermissions(account)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 transition-colors cursor-pointer border border-green-200 dark:border-green-800"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span className="font-medium text-sm">{permissionsCount}</span>
                            </button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{getRoleBadges(account)}</TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell>
                        {!account.lastLoginAt ? (
                          <span className="text-secondary text-xs">{t('account.neverLoggedIn')}</span>
                        ) : (
                          <span className="text-sm">
                            {dayjs(account.lastLoginAt).format('YYYY-MM-DD HH:mm:ss')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
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
              {/* Account Type字段已移除，默认创建为子账号 */}
              
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
                  disabled={!!editingAccount}
                  error={!!formErrors.email}
                />
                {formErrors.email && (
                  <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                    {formErrors.email}
                  </span>
                )}
              </div>
              
              {!editingAccount && (
                <>
                  <div>
                    <Label required>{t('account.firstName')}</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={!!formErrors.firstName}
                    />
                    {formErrors.firstName && (
                      <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                        {formErrors.firstName}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <Label required>{t('account.lastName')}</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={!!formErrors.lastName}
                    />
                    {formErrors.lastName && (
                      <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                        {formErrors.lastName}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <Label>{t('account.phone')}</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </>
              )}
              
              {!editingAccount && (
                <>
                  <div>
                    <Label required>{t('account.password')}</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      error={!!formErrors.password}
                    />
                    <div className="mt-1">
                      <span className="text-xs text-muted">
                        Password must contain: lowercase • uppercase • number • special char • 8+ chars
                      </span>
                    </div>
                    {formErrors.password && (
                      <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                        {formErrors.password}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <Label required>{t('account.confirmPassword')}</Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      error={!!formErrors.confirmPassword}
                    />
                    {formErrors.confirmPassword && (
                      <span className="text-sm" style={{ color: 'var(--danger)', marginTop: 4 }}>
                        {formErrors.confirmPassword}
                      </span>
                    )}
                  </div>
                </>
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
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Customer & Facility</Label>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 'var(--space-md)' }}>
                  {/* Customer选择 */}
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <Label style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>Select Customers</Label>
                    <DropdownMenu open={customerSelectOpen} onOpenChange={(open) => {
                      setCustomerSelectOpen(open);
                      if (!open) setCustomerSearchTerm('');
                    }}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" style={{ width: '100%', justifyContent: 'space-between' }}>
                          {formData.customerFacilityMappings.length === 0 
                            ? t('account.selectCustomersPlaceholder')
                            : `${formData.customerFacilityMappings.length} customer(s) selected`
                          }
                          <ChevronDown size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent style={{ width: '300px', backgroundColor: 'white' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                          <Input
                            placeholder="Search customers..."
                            value={customerSearchTerm}
                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                            style={{ height: '32px' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {customers
                            .filter(customer => 
                              customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                              customer.code?.toLowerCase().includes(customerSearchTerm.toLowerCase())
                            )
                            .map(customer => {
                              const isSelected = formData.customerFacilityMappings.some(m => m.customerId === customer.id);
                              return (
                                <DropdownMenuItem 
                                  key={customer.id}
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    if (isSelected) {
                                      // 取消选择：移除该customer的mapping
                                      setFormData({ 
                                        ...formData, 
                                        customerFacilityMappings: formData.customerFacilityMappings.filter(m => m.customerId !== customer.id)
                                      });
                                    } else {
                                      // 添加选择：添加新的mapping
                                      setFormData({ 
                                        ...formData, 
                                        customerFacilityMappings: [
                                          ...formData.customerFacilityMappings,
                                          { customerId: customer.id, facilityIds: [] }
                                        ]
                                      });
                                    }
                                  }}
                                  style={{
                                    color: isSelected ? 'var(--primary)' : 'inherit',
                                    fontWeight: isSelected ? 'var(--font-bold)' : 'normal'
                                  }}
                                >
                                  {customer.name}
                                </DropdownMenuItem>
                              );
                            })}
                          {customers.filter(customer => 
                            customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                            customer.code?.toLowerCase().includes(customerSearchTerm.toLowerCase())
                          ).length === 0 && (
                            <div style={{ padding: '8px', fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                              No customers found
                            </div>
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* 为每个选中的Customer分配Facility */}
                  {formData.customerFacilityMappings.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                      {formData.customerFacilityMappings.map((mapping, index) => {
                        const customer = customers.find(c => c.id === mapping.customerId);
                        if (!customer) return null;
                        
                        return (
                          <div key={mapping.customerId} style={{ 
                            padding: 'var(--space-sm)', 
                            backgroundColor: 'var(--background-secondary)', 
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--border)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <Badge variant="info" style={{ fontSize: '13px' }}>{customer.name}</Badge>
                              <button
                                type="button"
                                style={{ 
                                  background: 'none', 
                                  border: 'none', 
                                  cursor: 'pointer', 
                                  padding: '4px',
                                  color: 'var(--text-secondary)',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                onClick={() => {
                                  setFormData({ 
                                    ...formData, 
                                    customerFacilityMappings: formData.customerFacilityMappings.filter(m => m.customerId !== mapping.customerId)
                                  });
                                }}
                                title="Remove customer"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            
                            <Label style={{ fontSize: '13px', marginBottom: '6px', display: 'block', color: 'var(--text-secondary)' }}>
                              Facilities for {customer.name}
                            </Label>
                            <DropdownMenu onOpenChange={(open) => {
                              if (!open) {
                                setFacilitySearchTerms(prev => ({ ...prev, [mapping.customerId]: '' }));
                              }
                            }}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" style={{ width: '100%', justifyContent: 'space-between', fontSize: '13px' }}>
                                  {mapping.facilityIds.length === 0 
                                    ? 'Select facilities'
                                    : `${mapping.facilityIds.length} facility(ies) selected`
                                  }
                                  <ChevronDown size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent style={{ width: '280px', backgroundColor: 'white' }}>
                                <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                                  <Input
                                    placeholder="Search facilities..."
                                    value={facilitySearchTerms[mapping.customerId] || ''}
                                    onChange={(e) => setFacilitySearchTerms(prev => ({
                                      ...prev,
                                      [mapping.customerId]: e.target.value
                                    }))}
                                    style={{ height: '28px', fontSize: '13px' }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                  {facilities
                                    .filter(facility => 
                                      facility.name.toLowerCase().includes((facilitySearchTerms[mapping.customerId] || '').toLowerCase()) ||
                                      facility.code?.toLowerCase().includes((facilitySearchTerms[mapping.customerId] || '').toLowerCase())
                                    )
                                    .map(facility => {
                                      const isFacilitySelected = mapping.facilityIds.includes(facility.id);
                                      return (
                                        <DropdownMenuItem 
                                          key={facility.id}
                                          onSelect={(e) => {
                                            e.preventDefault();
                                            const newMappings = [...formData.customerFacilityMappings];
                                            const currentMapping = newMappings[index];
                                            
                                            if (isFacilitySelected) {
                                              // 取消选择facility
                                              currentMapping.facilityIds = currentMapping.facilityIds.filter(id => id !== facility.id);
                                            } else {
                                              // 添加facility
                                              currentMapping.facilityIds = [...currentMapping.facilityIds, facility.id];
                                            }
                                            
                                            setFormData({ ...formData, customerFacilityMappings: newMappings });
                                          }}
                                          style={{
                                            color: isFacilitySelected ? 'var(--primary)' : 'inherit',
                                            fontWeight: isFacilitySelected ? 'var(--font-bold)' : 'normal',
                                            fontSize: '13px'
                                          }}
                                        >
                                          {facility.name}
                                        </DropdownMenuItem>
                                      );
                                    })}
                                  {facilities.filter(facility => 
                                    facility.name.toLowerCase().includes((facilitySearchTerms[mapping.customerId] || '').toLowerCase()) ||
                                    facility.code?.toLowerCase().includes((facilitySearchTerms[mapping.customerId] || '').toLowerCase())
                                  ).length === 0 && (
                                    <div style={{ padding: '8px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                      No facilities found
                                    </div>
                                  )}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            {/* 显示选中的facility标签 */}
                            {mapping.facilityIds.length > 0 && (
                              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {mapping.facilityIds.map(facilityId => {
                                  const facility = facilities.find(f => f.id === facilityId);
                                  return facility ? (
                                    <Badge key={facilityId} variant="success" style={{ fontSize: '11px', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                                          const newMappings = [...formData.customerFacilityMappings];
                                          newMappings[index].facilityIds = newMappings[index].facilityIds.filter(id => id !== facilityId);
                                          setFormData({ ...formData, customerFacilityMappings: newMappings });
                                        }}
                                      >
                                        <X size={10} />
                                      </button>
                                    </Badge>
                                  ) : null;
                                })}
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
                  {(() => {
                    const customerIds = selectedAccount?.customerIds || selectedAccount?.accessibleCustomerIds || [];
                    if (customerIds.length === 0) return null;
                    return (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Customers ({customerIds.length})
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {customerIds.map((customerId, idx) => {
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
                    );
                  })()}

                  {/* Facilities Section */}
                  {(() => {
                    const facilityIds = selectedAccount?.facilityIds || selectedAccount?.accessibleFacilityIds || [];
                    if (facilityIds.length === 0) return null;
                    return (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-green-600" />
                          Facilities ({facilityIds.length})
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {facilityIds.map((facilityId, idx) => {
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
                    );
                  })()}

                  {/* Empty State */}
                  {(() => {
                    const customerIds = selectedAccount?.customerIds || selectedAccount?.accessibleCustomerIds || [];
                    const facilityIds = selectedAccount?.facilityIds || selectedAccount?.accessibleFacilityIds || [];
                    if (customerIds.length > 0 || facilityIds.length > 0) return null;
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        No data permissions assigned
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
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

      </div>
    </TooltipProvider>
  );
};

export default AccountManagement;
