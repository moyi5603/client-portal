import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Info,
  Zap,
  MoreHorizontal,
  AlertTriangle,
  Search,
} from 'lucide-react';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';
import { useKeyboardShortcut } from '../hooks/useDebounce';
import {
  Button,
  Input,
  Textarea,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Empty,
  Skeleton,
  Pagination,
  Separator,
} from '../components/ui';
import PermissionsTree from '../components/PermissionsTree';

interface Role {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'DEPRECATED';
  permissions: Permission[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  modifiedBy?: string;
}

interface Permission {
  module: string;
  page: string;
  pageCode: string;
  operations: string[];
  dataScope?: {
    customers?: string[];
    warehouses?: string[];
    regions?: string[];
  };
}

const RoleManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { locale, t } = useLocale();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'DEPRECATED',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Filters
  const [filters, setFilters] = useState({ module: 'ALL', status: 'ACTIVE' });
  const [searchText, setSearchText] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Permission state
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, Record<string, string[]>>>({});
  
  // User list modal
  const [userListVisible, setUserListVisible] = useState(false);
  const [usersWithRole, setUsersWithRole] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Delete dialog
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  
  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const initialPermissionsRef = useRef<string>('');

  // Module definitions
  const MODULES = [
    { value: 'DASHBOARDS', label: 'Dashboards' },
    { value: 'PURCHASE_MANAGEMENT', label: 'Purchase Management' },
    { value: 'SALES_ORDER', label: 'Sales Order' },
    { value: 'WORK_ORDER', label: 'Work Order' },
    { value: 'INBOUND', label: 'Inbound' },
    { value: 'INVENTORY', label: 'Inventory' },
    { value: 'OUTBOUND', label: 'Outbound' },
    { value: 'RETURNS', label: 'Returns' },
    { value: 'YARD_MANAGEMENT', label: 'Yard Management' },
    { value: 'SUPPLY_CHAIN', label: 'Supply Chain Mgmt' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'SYSTEM_MANAGEMENT', label: 'System Management' },
    { value: 'PERMISSION_MANAGEMENT', label: 'Permission Management' }
  ];

  const ALL_OPERATIONS = [
    { value: 'VIEW', label: t('operation.VIEW') },
    { value: 'CREATE', label: t('operation.CREATE') },
    { value: 'EDIT', label: t('operation.EDIT') },
    { value: 'DELETE', label: t('operation.DELETE') },
    { value: 'EXPORT', label: t('operation.EXPORT') },
    { value: 'CANCEL', label: t('operation.CANCEL') },
    { value: 'PRINT_PACKING_SLIP', label: t('operation.PRINT_PACKING_SLIP') },
    { value: 'HOLD_INVENTORY', label: t('operation.HOLD_INVENTORY') },
    { value: 'RELEASE_INVENTORY', label: t('operation.RELEASE_INVENTORY') },
    { value: 'DOWNLOAD_PDF', label: t('operation.DOWNLOAD_PDF') },
    { value: 'ADD_ATTACHMENT', label: t('operation.ADD_ATTACHMENT') },
    { value: 'IMPORT_RMA', label: t('operation.IMPORT_RMA') },
    { value: 'DOWNLOAD_TEMPLATE', label: t('operation.DOWNLOAD_TEMPLATE') },
    { value: 'DOWNLOAD', label: t('operation.DOWNLOAD') },
    { value: 'BATCH_IMPORT', label: t('operation.BATCH_IMPORT') },
    { value: 'PAY', label: t('operation.PAY') },
    { value: 'INVOICE_DETAIL', label: t('operation.INVOICE_DETAIL') },
    { value: 'RELOAD', label: t('operation.RELOAD') },
    { value: 'SET_ALERT', label: t('operation.SET_ALERT') },
    { value: 'SET_DEFAULT', label: t('operation.SET_DEFAULT') },
    { value: 'IMPORT', label: t('operation.IMPORT') },
    { value: 'RESET_FIELDS', label: t('operation.RESET_FIELDS') }
  ];

  const MODULE_PAGES: Record<string, Array<{ code: string; name: string; operations: string[]; tooltip?: string }>> = {
    DASHBOARDS: [{ code: 'kpi', name: 'KPI', operations: ['VIEW'] }],
    PURCHASE_MANAGEMENT: [
      { code: 'projects', name: 'Projects', operations: ['VIEW', 'CREATE', 'EXPORT'] },
      { code: 'purchase-request', name: 'Purchase Request', operations: ['VIEW', 'CREATE', 'EXPORT'] },
      { code: 'purchase-order', name: 'Purchase Order', operations: ['VIEW'] }
    ],
    SALES_ORDER: [
      { code: 'wholesale-orders', name: 'Wholesale Orders', operations: ['VIEW'] },
      { code: 'retail-orders', name: 'Retail Orders', operations: ['VIEW'] }
    ],
    WORK_ORDER: [{ code: 'work-orders', name: 'Work Orders', operations: ['VIEW'] }],
    INBOUND: [
      { code: 'inquiry', name: 'Inquiry', operations: ['VIEW', 'EDIT', 'EXPORT', 'CANCEL', 'PRINT_PACKING_SLIP'] },
      { code: 'schedule-summary', name: 'Schedule Summary', operations: ['VIEW'] },
      { code: 'received-summary', name: 'Received Summary', operations: ['VIEW'] },
      { code: 'receipt-entry', name: 'Receipt Entry', operations: ['CREATE'] },
      { code: 'put-away-report', name: 'Put Away Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'make-appointment', name: 'Make Appointment', operations: ['CREATE'] },
      { code: 'appointment-list', name: 'Appointment List', operations: ['VIEW', 'CREATE', 'EDIT', 'CANCEL'] }
    ],
    INVENTORY: [
      { code: 'sn-look-up', name: 'SN Look Up', operations: ['VIEW', 'EXPORT'] },
      { code: 'inventory-activity', name: 'Inventory Activity', operations: ['VIEW', 'EXPORT'] },
      { code: 'inventory-adjustment', name: 'Inventory Adjustment', operations: ['VIEW', 'EXPORT'] },
      { code: 'inventory-status', name: 'Inventory Status', operations: ['VIEW', 'EXPORT', 'HOLD_INVENTORY', 'RELEASE_INVENTORY'] },
      { code: 'item-master', name: 'Item Master', operations: ['VIEW', 'EXPORT'] },
      { code: 'current-onhand', name: 'Current Onhand Inventory Aging Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'historical-inventory-aging', name: 'Historical Inventory Aging Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'warehouse-projects', name: 'Warehouse Projects', operations: ['VIEW', 'EXPORT'] }
    ],
    OUTBOUND: [
      { code: 'inquiry', name: 'Inquiry', operations: ['VIEW', 'EXPORT', 'DOWNLOAD_PDF', 'ADD_ATTACHMENT'] },
      { code: 'schedule-summary', name: 'Schedule Summary', operations: ['VIEW'] },
      { code: 'shipped-summary', name: 'Shipped Summary', operations: ['VIEW'] },
      { code: 'order-carrier-update', name: 'Order Carrier Update', operations: ['VIEW'] },
      { code: 'order-entry', name: 'Order Entry', operations: ['CREATE'] },
      { code: 'small-parcel-tracking', name: 'Small Parcel Tracking Status', operations: ['VIEW'] },
      { code: 'freight-quote', name: 'Freight Quote', operations: ['VIEW', 'CREATE'] }
    ],
    RETURNS: [
      { code: 'rma', name: 'RMA', operations: ['VIEW', 'EXPORT', 'IMPORT_RMA', 'DOWNLOAD_TEMPLATE'] },
      { code: 'traveler-id', name: 'Traveler ID', operations: ['VIEW'] },
      { code: 'return-report', name: 'Return Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'restock-report', name: 'Restock Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'adjustment-report', name: 'Adjustment Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'scrap-report', name: 'Scrap Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'service-claim-report', name: 'Service Claim Report', operations: ['VIEW', 'EXPORT'] }
    ],
    YARD_MANAGEMENT: [
      { code: 'equipment-history-report', name: 'Equipment History Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'equipment-report', name: 'Equipment Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'yard-status-report', name: 'Yard Status Report', operations: ['VIEW', 'EXPORT'] },
      { code: 'yard-check-report', name: 'Yard Check Report', operations: ['VIEW', 'EXPORT'] }
    ],
    SUPPLY_CHAIN: [
      { code: 'damaged-box-detection', name: 'Damaged Box Detection', operations: ['VIEW', 'EDIT'] },
      { code: 'routing-report', name: 'Routing Report', operations: ['VIEW'] },
      { code: 'walmart-shipments', name: 'Walmart Shipments', operations: ['VIEW'] },
      { code: 'target-shipments', name: 'Target Shipments', operations: ['VIEW'] },
      { code: 'shipments', name: 'Shipments', operations: ['VIEW', 'CREATE'] },
      { code: 'tracking', name: 'Tracking', operations: ['VIEW', 'EXPORT', 'DOWNLOAD', 'BATCH_IMPORT'] },
      { code: 'automated-order-entry', name: 'Automated Order Entry', operations: ['CREATE'] }
    ],
    FINANCE: [
      { code: 'invoice', name: 'Invoice', operations: ['VIEW', 'EXPORT', 'PAY', 'INVOICE_DETAIL'] },
      { code: 'card-and-balance', name: 'Card and Balance', operations: ['VIEW', 'CREATE', 'RELOAD', 'SET_ALERT'] },
      { code: 'history', name: 'History', operations: ['VIEW', 'EXPORT'] },
      { code: 'cost-calculator', name: 'Cost Calculator', operations: ['VIEW'] },
      { code: 'claim', name: 'Claim', operations: ['VIEW', 'CREATE', 'EDIT', 'EXPORT'] }
    ],
    SYSTEM_MANAGEMENT: [
      { code: 'address-book', name: 'Address Book', operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'SET_DEFAULT', 'IMPORT'] },
      { code: 'settings', name: 'Settings', operations: ['VIEW', 'CREATE', 'EDIT'] }
    ],
    PERMISSION_MANAGEMENT: [
      { code: 'account-management', name: 'Account Management', operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
      { code: 'role-management', name: 'Role Management', operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
      { code: 'permission-view', name: 'Permission View', operations: ['VIEW'] },
      { code: 'audit-log', name: 'Audit Log', operations: ['VIEW', 'EXPORT'] }
    ]
  };

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/roles', {
        params: {
          status: filters.status,
          module: filters.module !== 'ALL' ? filters.module : undefined
        }
      });
      if (response.data.success) {
        let data = response.data.data.items || [];
        if (searchText) {
          data = data.filter((role: Role) =>
            role.name.toLowerCase().includes(searchText.toLowerCase())
          );
        }
        setRoles(data);
        setCurrentPage(1);
      }
    } catch (error) {
      toast.error(t('role.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [filters, searchText, t]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/roles' || path === '/roles/') {
      setIsEditMode(false);
      setHasUnsavedChanges(false);
      loadRoles();
    } else if (path === '/roles/create') {
      setIsEditMode(true);
      setEditingRole(null);
      setFormData({ name: '', description: '', status: 'ACTIVE' });
      setSelectedPermissions({});
      initialPermissionsRef.current = JSON.stringify({});
      setHasUnsavedChanges(false);
    } else if (params.id && path.includes('/edit')) {
      setIsEditMode(true);
      loadRoleForEdit(params.id);
    }
  }, [location.pathname, params.id, loadRoles]);

  useEffect(() => {
    if (isEditMode) {
      const currentPermissions = JSON.stringify(selectedPermissions);
      if (initialPermissionsRef.current && currentPermissions !== initialPermissionsRef.current) {
        setHasUnsavedChanges(true);
      }
    }
  }, [selectedPermissions, isEditMode]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isEditMode) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isEditMode]);

  const loadRoleForEdit = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/roles/${id}`);
      if (response.data.success) {
        const role = response.data.data;
        setEditingRole(role);
        setFormData({
          name: role.name,
          description: role.description || '',
          status: role.status,
        });
        
        const permissions: Record<string, Record<string, string[]>> = {};
        role.permissions.forEach((perm: Permission) => {
          if (!permissions[perm.module]) {
            permissions[perm.module] = {};
          }
          permissions[perm.module][perm.pageCode] = perm.operations;
        });
        setSelectedPermissions(permissions);
        initialPermissionsRef.current = JSON.stringify(permissions);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      toast.error(t('role.loadDetailFailed'));
      navigate('/roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      loadRoles();
    }
  }, [filters, isEditMode, loadRoles]);

  const loadAccounts = async () => {
    try {
      const response = await api.get('/accounts', { params: { page: 1, pageSize: 1000 } });
      if (response.data.success) {
        setAccounts(response.data.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load accounts');
    }
  };

  const accountIdToUsernameMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach(acc => map.set(acc.id, acc.username));
    return map;
  }, [accounts]);

  const getUsernameByAccountId = (accountId: string | undefined): string => {
    if (!accountId) return t('role.system');
    return accountIdToUsernameMap.get(accountId) || accountId;
  };

  const handleViewUsers = async (roleId: string) => {
    setUserListVisible(true);
    setLoadingUsers(true);
    
    try {
      const response = await api.get('/accounts', { params: { page: 1, pageSize: 1000 } });
      if (response.data.success) {
        const allAccounts = response.data.data.items || [];
        const users = allAccounts.filter((account: any) => 
          account.roles && account.roles.includes(roleId)
        );
        setUsersWithRole(users);
      }
    } catch (error) {
      toast.error(t('account.loadFailed'));
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreate = () => {
    setIsEditMode(true);
    setEditingRole(null);
    setFormData({ name: '', description: '', status: 'ACTIVE' });
    setSelectedPermissions({});
    navigate('/roles/create');
  };

  const handleEdit = (role: Role) => {
    setIsEditMode(true);
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      status: role.status,
    });
    
    const permissions: Record<string, Record<string, string[]>> = {};
    role.permissions.forEach(perm => {
      if (!permissions[perm.module]) permissions[perm.module] = {};
      permissions[perm.module][perm.pageCode] = perm.operations;
    });
    setSelectedPermissions(permissions);
    navigate(`/roles/${role.id}/edit`);
  };

  const handleDuplicate = async (role: Role) => {
    try {
      const response = await api.post('/roles', {
        name: `${role.name} (Copy)`,
        description: role.description,
        status: 'ACTIVE',
        permissions: role.permissions
      });
      if (response.data.success) {
        toast.success(t('role.copySuccess'));
        loadRoles();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('role.copyFailed'));
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    try {
      const response = await api.delete(`/roles/${roleToDelete.id}`);
      if (response.data.success) {
        toast.success(t('role.deleteSuccess'));
        loadRoles();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('role.deleteFailed'));
    } finally {
      setDeleteDialogVisible(false);
      setRoleToDelete(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t('role.nameRequired');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const permissions: Permission[] = [];
      Object.keys(selectedPermissions).forEach(module => {
        Object.keys(selectedPermissions[module]).forEach(pageCode => {
          const operations = selectedPermissions[module][pageCode];
          if (operations.length > 0) {
            const page = MODULE_PAGES[module]?.find(p => p.code === pageCode);
            permissions.push({
              module,
              page: page?.name || pageCode,
              pageCode,
              operations
            });
          }
        });
      });

      const payload = { ...formData, permissions };

      if (editingRole) {
        const response = await api.put(`/roles/${editingRole.id}`, payload);
        if (response.data.success) {
          toast.success(t('role.updateSuccess'));
          performCancel();
        }
      } else {
        const response = await api.post('/roles', payload);
        if (response.data.success) {
          toast.success(t('role.createSuccess'));
          performCancel();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('role.saveFailed'));
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
      setPendingNavigation('/roles');
    } else {
      performCancel();
    }
  };

  const performCancel = () => {
    setIsEditMode(false);
    setEditingRole(null);
    setFormData({ name: '', description: '', status: 'ACTIVE' });
    setSelectedPermissions({});
    setHasUnsavedChanges(false);
    setShowUnsavedModal(false);
    navigate('/roles');
  };

  const handleConfirmLeave = () => {
    setHasUnsavedChanges(false);
    setShowUnsavedModal(false);
    if (pendingNavigation) navigate(pendingNavigation);
  };

  useKeyboardShortcut('s', handleSave, { ctrlKey: true, enabled: isEditMode });
  useKeyboardShortcut('Escape', handleCancel, { enabled: isEditMode });

  const handlePermissionChange = (module: string, pageCode: string, operation: string, checked: boolean) => {
    setSelectedPermissions(prev => {
      const newPerms = { ...prev };
      if (!newPerms[module]) newPerms[module] = {};
      if (!newPerms[module][pageCode]) newPerms[module][pageCode] = [];
      
      if (checked) {
        newPerms[module][pageCode] = [...newPerms[module][pageCode], operation];
      } else {
        newPerms[module][pageCode] = newPerms[module][pageCode].filter(op => op !== operation);
      }
      return newPerms;
    });
  };

  const handleSelectAll = () => {
    const allPerms: Record<string, Record<string, string[]>> = {};
    MODULES.forEach(module => {
      const pages = MODULE_PAGES[module.value] || [];
      allPerms[module.value] = {};
      pages.forEach(page => {
        allPerms[module.value][page.code] = [...page.operations];
      });
    });
    setSelectedPermissions(allPerms);
  };

  const handleClearAll = () => setSelectedPermissions({});

  const handleSelectModule = (moduleValue: string) => {
    const pages = MODULE_PAGES[moduleValue] || [];
    const newPerms = { ...selectedPermissions };
    if (!newPerms[moduleValue]) newPerms[moduleValue] = {};
    pages.forEach(page => {
      newPerms[moduleValue][page.code] = [...page.operations];
    });
    setSelectedPermissions(newPerms);
  };

  const handleClearModule = (moduleValue: string) => {
    const newPerms = { ...selectedPermissions };
    delete newPerms[moduleValue];
    setSelectedPermissions(newPerms);
  };

  const applyTemplate = (templateKey: string) => {
    const templates: Record<string, { operations: string[]; modules?: string[] }> = {
      fullAccess: { operations: [] },
      readOnly: { operations: ['VIEW'] },
      dataEditor: { operations: ['VIEW', 'CREATE', 'EDIT'] },
      manager: { operations: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'] },
      exporter: { operations: ['VIEW', 'EXPORT'] },
    };

    if (templateKey === 'fullAccess') {
      handleSelectAll();
      return;
    }

    const template = templates[templateKey];
    if (!template) return;

    const newPerms: Record<string, Record<string, string[]>> = {};
    MODULES.forEach(moduleValue => {
      const pages = MODULE_PAGES[moduleValue.value] || [];
      newPerms[moduleValue.value] = {};
      pages.forEach(page => {
        const allowedOps = page.operations.filter(op => template.operations.includes(op));
        if (allowedOps.length > 0) newPerms[moduleValue.value][page.code] = allowedOps;
      });
    });
    setSelectedPermissions(newPerms);
    toast.success(t('role.templateApplied', { name: templateKey }));
  };

  const getModuleBadges = (role: Role) => {
    const modules = new Set(role.permissions.map(p => p.module));
    if (modules.size === MODULES.length) {
      return <Badge variant="default">{t('common.all')}</Badge>;
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        {Array.from(modules).slice(0, 3).map(module => (
          <Badge key={module} variant="secondary">
            {MODULES.find(m => m.value === module)?.label || module}
          </Badge>
        ))}
        {modules.size > 3 && <Badge variant="outline">+{modules.size - 3}</Badge>}
      </div>
    );
  };

  // Pagination
  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return roles.slice(startIndex, startIndex + pageSize);
  }, [roles, currentPage, pageSize]);

  const totalPages = Math.ceil(roles.length / pageSize);

  // List view
  if (!isEditMode) {
    return (
      <TooltipProvider>
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
            <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              {t('role.title')}
            </h1>
            <Button onClick={handleCreate}>
              <Plus size={16} /> {t('role.create')}
            </Button>
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: 'var(--space-md)' }}>
            <CardContent style={{ padding: 'var(--space-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Select value={filters.module} onValueChange={(value) => setFilters({ ...filters, module: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('role.module')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t('filter.allModules')}</SelectItem>
                    {MODULES.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t('common.active')}</SelectItem>
                    <SelectItem value="DEPRECATED">{t('common.deprecated')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder={t('filter.searchPlaceholder')}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <Button variant="outline" onClick={() => { setFilters({ module: 'ALL', status: 'ACTIVE' }); setSearchText(''); }}>
                    {t('common.reset')}
                  </Button>
                  <Button onClick={loadRoles}>
                    <Search size={16} /> {t('common.search')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          {loading ? (
            <Card><CardContent><div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>{[...Array(5)].map((_, i) => <Skeleton key={i} style={{ height: 48 }} />)}</div></CardContent></Card>
          ) : roles.length === 0 ? (
            <Card><CardContent><Empty variant="roles" title={t('common.noData')} action={{ label: t('role.create'), onClick: handleCreate }} /></CardContent></Card>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('role.name')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead>{t('role.modules')}</TableHead>
                    <TableHead style={{ textAlign: 'center' }}>{t('role.users')}</TableHead>
                    <TableHead style={{ textAlign: 'center' }}>{t('common.status')}</TableHead>
                    <TableHead>{t('role.lastModified')}</TableHead>
                    <TableHead style={{ width: 80, textAlign: 'center' }}>{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRoles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>{role.name}</div>
                        <div className="text-xs text-secondary">{role.id}</div>
                      </TableCell>
                      <TableCell style={{ maxWidth: 200 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {role.description || '-'}
                        </span>
                      </TableCell>
                      <TableCell>{getModuleBadges(role)}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <Button variant="link" size="sm" onClick={() => handleViewUsers(role.id)} disabled={role.usageCount === 0}>
                          {role.usageCount}
                        </Button>
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <Badge variant={role.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {role.status === 'ACTIVE' ? t('common.active') : t('common.deprecated')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div style={{ color: 'var(--text-primary)' }}>{new Date(role.updatedAt).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US')}</div>
                        <div className="text-xs text-secondary">{t('role.modifiedBy')} {getUsernameByAccountId(role.modifiedBy)}</div>
                      </TableCell>
                      <TableCell style={{ textAlign: 'center' }}>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal size={18} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(role)}>
                              <Pencil size={14} style={{ marginRight: 8 }} />{t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(role)}>
                              <Copy size={14} style={{ marginRight: 8 }} />{t('role.duplicate')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem danger disabled={role.usageCount > 0} onClick={() => { setRoleToDelete(role); setDeleteDialogVisible(true); }}>
                              <Trash2 size={14} style={{ marginRight: 8 }} />{t('common.delete')}
                              {role.usageCount > 0 && <span className="text-xs" style={{ marginLeft: 4 }}>({t('role.inUseWarning', { count: role.usageCount.toString() })})</span>}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={roles.length} pageSize={pageSize} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}

          {/* User List Dialog */}
          <Dialog open={userListVisible} onOpenChange={setUserListVisible}>
            <DialogContent className="ui-dialog-content--lg">
              <DialogHeader><DialogTitle>{t('role.usersWithRole')}</DialogTitle></DialogHeader>
              {loadingUsers ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>{[...Array(3)].map((_, i) => <Skeleton key={i} style={{ height: 40 }} />)}</div>
              ) : usersWithRole.length === 0 ? (
                <Empty variant="accounts" title={t('role.noUsersWithRole')} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('account.username')}</TableHead>
                      <TableHead>{t('account.email')}</TableHead>
                      <TableHead>{t('account.accountType')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersWithRole.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.accountType === 'MAIN' ? 'destructive' : user.accountType === 'CUSTOMER' ? 'info' : 'success'}>
                            {t(`account.type${user.accountType.charAt(0) + user.accountType.slice(1).toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {t(`account.status${user.status.charAt(0) + user.status.slice(1).toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setUserListVisible(false)}>{t('common.close')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={deleteDialogVisible} onOpenChange={setDeleteDialogVisible}>
            <DialogContent className="ui-dialog-content--sm">
              <DialogHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
                  <DialogTitle>{t('common.confirm')}</DialogTitle>
                </div>
                <DialogDescription>
                  {roleToDelete && t('role.deleteConfirm', { name: roleToDelete.name })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogVisible(false)}>{t('common.cancel')}</Button>
                <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    );
  }

  // Edit/Create view - Two column layout
  return (
    <TooltipProvider>
      <div style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              {editingRole ? t('role.editTitle') : t('role.createTitle')}
            </h1>
            <p className="text-secondary" style={{ margin: 'var(--space-sm) 0 0' }}>{t('role.subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Button variant="outline" onClick={handleCancel}>{t('common.cancel')}</Button>
            <Button onClick={handleSave}>{editingRole ? t('role.saveChanges') : t('role.create')}</Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Column: Basic Role Information */}
            <div style={{ 
              width: 320, 
              borderRight: '1px solid var(--border-color)', 
              padding: 'var(--space-lg)', 
              overflowY: 'auto',
              flexShrink: 0,
              backgroundColor: 'var(--bg-primary)',
            }}>
              <h3 style={{ 
                margin: '0 0 var(--space-lg) 0', 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-primary)',
              }}>
                {t('role.roleDetails')}
              </h3>

              {/* Role Name */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <Label required>{t('role.name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('role.namePlaceholder')}
                  error={!!formErrors.name}
                />
                {formErrors.name && <span className="text-sm" style={{ color: 'var(--danger)' }}>{formErrors.name}</span>}
              </div>

              {/* Role ID */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <Label>{t('role.id')}</Label>
                <Input value={editingRole?.id || t('role.idAuto')} disabled />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <Label>{t('common.description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('role.descriptionPlaceholder')}
                  style={{ minHeight: 100 }}
                />
              </div>

              {/* Status */}
              <div>
                <Label required>{t('common.status')}</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as 'ACTIVE' | 'DEPRECATED' })}
                  style={{ marginTop: 'var(--space-sm)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                    <RadioGroupItem value="ACTIVE" id="status-active" />
                    <label htmlFor="status-active" style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>
                      {t('role.statusActive')}
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <RadioGroupItem value="DEPRECATED" id="status-deprecated" />
                    <label htmlFor="status-deprecated" style={{ cursor: 'pointer', color: 'var(--text-primary)' }}>
                      {t('role.statusDeprecated')}
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Right Column: Permissions Tree */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Permissions Header */}
              <div style={{ 
                padding: 'var(--space-md) var(--space-lg)', 
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-primary)',
                flexShrink: 0,
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--text-primary)',
                }}>
                  {t('role.permissions')}
                </h3>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm"><Zap size={14} /> {t('role.templates')}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('role.templates')}</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => applyTemplate('fullAccess')}>🔓 {t('role.templateFullAccess')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => applyTemplate('readOnly')}>👁️ {t('role.templateReadOnly')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => applyTemplate('dataEditor')}>✏️ {t('role.templateDataEditor')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => applyTemplate('manager')}>👔 {t('role.templateManager')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => applyTemplate('exporter')}>📊 {t('role.templateExporter')}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem danger onClick={handleClearAll}>
                        <Trash2 size={14} style={{ marginRight: 8 }} />{t('common.clearAll')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>{t('common.selectAll')}</Button>
                  <Button variant="outline" size="sm" onClick={handleClearAll}>{t('common.clearAll')}</Button>
                </div>
              </div>

              {/* Permissions Tree Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)' }}>
                <PermissionsTree
                  modules={MODULES}
                  modulePages={MODULE_PAGES}
                  selectedPermissions={selectedPermissions}
                  onPermissionChange={handlePermissionChange}
                  onSelectModule={handleSelectModule}
                  onClearModule={handleClearModule}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Unsaved Changes Dialog */}
        <Dialog open={showUnsavedModal} onOpenChange={setShowUnsavedModal}>
          <DialogContent className="ui-dialog-content--sm">
            <DialogHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
                <DialogTitle>{t('role.unsavedChanges')}</DialogTitle>
              </div>
              <DialogDescription>{t('role.unsavedChangesMessage')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUnsavedModal(false)}>{t('role.stayOnPage')}</Button>
              <Button variant="destructive" onClick={handleConfirmLeave}>{t('role.leavePage')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RoleManagement;
