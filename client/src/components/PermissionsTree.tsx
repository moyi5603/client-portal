import React, { useState, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  Ban,
  CreditCard,
  Printer,
  Lock,
  Unlock,
  FileText,
  Paperclip,
  FileDown,
  RefreshCw,
  Bell,
  Star,
  RotateCcw,
  KeyRound,
  Users,
  Copy,
  UserX,
  ListChecks,
  Layers,
  ToggleLeft,
  ToggleRight,
  UserMinus,
  Settings2,
  Sliders,
  UsersX,
  X,
  MinusCircle,
  ListX,
  Archive,
  PackageMinus,
  FolderMinus,
} from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useLocale } from '../contexts/LocaleContext';

// Operation icon mapping
const OPERATION_ICONS: Record<string, React.ReactNode> = {
  VIEW: <Eye size={16} />,
  CREATE: <Plus size={16} />,
  EDIT: <Pencil size={16} />,
  DELETE: <Trash2 size={16} />,
  EXPORT: <Download size={16} />,
  IMPORT: <Upload size={16} />,
  CANCEL: <Ban size={16} />,
  PAY: <CreditCard size={16} />,
  PRINT_PACKING_SLIP: <Printer size={16} />,
  HOLD_INVENTORY: <Lock size={16} />,
  RELEASE_INVENTORY: <Unlock size={16} />,
  DOWNLOAD_PDF: <FileText size={16} />,
  ADD_ATTACHMENT: <Paperclip size={16} />,
  IMPORT_RMA: <Upload size={16} />,
  DOWNLOAD_TEMPLATE: <FileDown size={16} />,
  DOWNLOAD: <Download size={16} />,
  BATCH_IMPORT: <Upload size={16} />,
  INVOICE_DETAIL: <FileText size={16} />,
  RELOAD: <RefreshCw size={16} />,
  SET_ALERT: <Bell size={16} />,
  SET_DEFAULT: <Star size={16} />,
  RESET_FIELDS: <RotateCcw size={16} />,
  RESET_PASSWORD: <KeyRound size={16} />,
  BULK_STATUS_CHANGE: <Settings2 size={16} />,
  BULK_DELETE: <ListX size={16} />,
  COPY: <Copy size={16} />,
};

interface ModulePage {
  code: string;
  name: string;
  operations: string[];
  tooltip?: string;
}

interface ModuleConfig {
  value: string;
  label: string;
}

interface PermissionsTreeProps {
  modules: ModuleConfig[];
  modulePages: Record<string, ModulePage[]>;
  selectedPermissions: Record<string, Record<string, string[]>>;
  onPermissionChange: (module: string, pageCode: string, operation: string, checked: boolean) => void;
  onSelectModule: (module: string) => void;
  onClearModule: (module: string) => void;
  disabled?: boolean;
}

const PermissionsTree: React.FC<PermissionsTreeProps> = ({
  modules,
  modulePages,
  selectedPermissions,
  onPermissionChange,
  onSelectModule,
  onClearModule,
  disabled = false,
}) => {
  const { t } = useLocale();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.value)));

  const toggleModule = useCallback((moduleValue: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleValue)) {
        next.delete(moduleValue);
      } else {
        next.add(moduleValue);
      }
      return next;
    });
  }, []);

  // Calculate module check state
  const getModuleCheckState = useCallback((moduleValue: string): 'checked' | 'unchecked' | 'indeterminate' => {
    const pages = modulePages[moduleValue] || [];
    if (pages.length === 0) return 'unchecked';

    let totalOps = 0;
    let selectedOps = 0;

    pages.forEach(page => {
      totalOps += page.operations.length;
      selectedOps += (selectedPermissions[moduleValue]?.[page.code]?.length || 0);
    });

    if (selectedOps === 0) return 'unchecked';
    if (selectedOps === totalOps) return 'checked';
    return 'indeterminate';
  }, [modulePages, selectedPermissions]);

  // Calculate page check state
  const getPageCheckState = useCallback((moduleValue: string, pageCode: string, availableOps: string[]): 'checked' | 'unchecked' | 'indeterminate' => {
    const selected = selectedPermissions[moduleValue]?.[pageCode] || [];
    if (selected.length === 0) return 'unchecked';
    if (selected.length === availableOps.length) return 'checked';
    return 'indeterminate';
  }, [selectedPermissions]);

  // Handle module checkbox click
  const handleModuleCheck = useCallback((moduleValue: string, currentState: 'checked' | 'unchecked' | 'indeterminate') => {
    if (disabled) return;
    if (currentState === 'checked') {
      onClearModule(moduleValue);
    } else {
      onSelectModule(moduleValue);
    }
  }, [disabled, onSelectModule, onClearModule]);

  // Handle page checkbox click - select/deselect all operations
  const handlePageCheck = useCallback((moduleValue: string, page: ModulePage, currentState: 'checked' | 'unchecked' | 'indeterminate') => {
    if (disabled) return;
    if (currentState === 'checked') {
      page.operations.forEach(op => {
        if (selectedPermissions[moduleValue]?.[page.code]?.includes(op)) {
          onPermissionChange(moduleValue, page.code, op, false);
        }
      });
    } else {
      page.operations.forEach(op => {
        if (!selectedPermissions[moduleValue]?.[page.code]?.includes(op)) {
          onPermissionChange(moduleValue, page.code, op, true);
        }
      });
    }
  }, [disabled, selectedPermissions, onPermissionChange]);

  // Get selected count for module
  const getModuleSelectedCount = useCallback((moduleValue: string): { selected: number; total: number } => {
    const pages = modulePages[moduleValue] || [];
    let total = 0;
    let selected = 0;
    pages.forEach(page => {
      total += page.operations.length;
      selected += (selectedPermissions[moduleValue]?.[page.code]?.length || 0);
    });
    return { selected, total };
  }, [modulePages, selectedPermissions]);

  return (
    <div className="permissions-tree" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {modules.map(module => {
        const pages = modulePages[module.value] || [];
        const isExpanded = expandedModules.has(module.value);
        const moduleState = getModuleCheckState(module.value);
        const { selected, total } = getModuleSelectedCount(module.value);

        return (
          <div 
            key={module.value} 
            className="tree-module"
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Module Header */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-sm) var(--space-md)',
                backgroundColor: moduleState !== 'unchecked' ? 'rgba(117, 59, 189, 0.05)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                userSelect: 'none',
                borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
              }}
              onClick={() => toggleModule(module.value)}
            >
              <span style={{ color: 'var(--text-secondary)', marginRight: 'var(--space-xs)' }}>
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleModuleCheck(module.value, moduleState);
                }}
                style={{ display: 'flex', alignItems: 'center', marginRight: 'var(--space-sm)' }}
              >
                <Checkbox
                  checked={moduleState === 'checked'}
                  indeterminate={moduleState === 'indeterminate'}
                  disabled={disabled}
                />
              </div>
              <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)', flex: 1 }}>
                {t(`module.${module.value}`) || module.label}
              </span>
              <span style={{ 
                fontSize: 'var(--text-xs)', 
                color: selected > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: selected > 0 ? 'rgba(117, 59, 189, 0.1)' : 'var(--bg-tertiary)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 'var(--font-medium)',
              }}>
                {selected}/{total}
              </span>
            </div>

            {/* Features with Inline Operations */}
            {isExpanded && (
              <div style={{ backgroundColor: 'var(--bg-primary)' }}>
                {pages.map((page, index) => {
                  const pageState = getPageCheckState(module.value, page.code, page.operations);
                  const selectedOps = selectedPermissions[module.value]?.[page.code] || [];

                  return (
                    <div
                      key={page.code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'var(--space-sm) var(--space-md)',
                        borderBottom: index < pages.length - 1 ? '1px solid var(--border-color-light)' : 'none',
                        gap: 'var(--space-md)',
                      }}
                    >
                      {/* Feature Name with Checkbox */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', minWidth: 160 }}>
                        <div
                          onClick={() => handlePageCheck(module.value, page, pageState)}
                          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        >
                          <Checkbox
                            checked={pageState === 'checked'}
                            indeterminate={pageState === 'indeterminate'}
                            disabled={disabled}
                          />
                        </div>
                        <span style={{ 
                          color: pageState !== 'unchecked' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: pageState !== 'unchecked' ? 'var(--font-medium)' : 'normal',
                          fontSize: 'var(--text-sm)',
                          whiteSpace: 'nowrap',
                        }}>
                          {page.name}
                        </span>
                      </div>

                      {/* Inline Operation Toggle Icons - Horizontal Row */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '6px', 
                        alignItems: 'center',
                        flex: 1,
                        justifyContent: 'flex-end',
                      }}>
                        {page.operations.map(op => {
                          const isChecked = selectedOps.includes(op);
                          const icon = OPERATION_ICONS[op];

                          return (
                            <Tooltip key={op}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => onPermissionChange(module.value, page.code, op, !isChecked)}
                                  disabled={disabled}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 28,
                                    height: 28,
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    backgroundColor: isChecked ? 'var(--primary)' : 'var(--bg-tertiary)',
                                    color: isChecked ? 'white' : 'var(--text-secondary)',
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s ease',
                                    opacity: disabled ? 0.5 : 1,
                                    flexShrink: 0,
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!disabled && !isChecked) {
                                      e.currentTarget.style.backgroundColor = 'rgba(117, 59, 189, 0.15)';
                                      e.currentTarget.style.color = 'var(--primary)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!disabled && !isChecked) {
                                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                                      e.currentTarget.style.color = 'var(--text-secondary)';
                                    }
                                  }}
                                >
                                  {icon}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <span>{t(`operation.${op}`)}</span>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PermissionsTree;
