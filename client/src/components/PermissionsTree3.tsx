import React, { useState, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useLocale } from '../contexts/LocaleContext';

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

interface PermissionsTree3Props {
  modules: ModuleConfig[];
  modulePages: Record<string, ModulePage[]>;
  selectedPermissions: Record<string, Record<string, string[]>>;
  onPermissionChange: (module: string, pageCode: string, operation: string, checked: boolean) => void;
  onSelectModule: (module: string) => void;
  onClearModule: (module: string) => void;
  disabled?: boolean;
  autoSelectAllOperations?: boolean;
}

const PermissionsTree3: React.FC<PermissionsTree3Props> = ({
  modules,
  modulePages,
  selectedPermissions,
  onPermissionChange,
  onSelectModule,
  onClearModule,
  autoSelectAllOperations = false,
  disabled = false,
}) => {
  const { t } = useLocale();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map(m => m.value)));
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

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

  const togglePage = useCallback((pageKey: string) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageKey)) {
        next.delete(pageKey);
      } else {
        next.add(pageKey);
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
                  checked={moduleState === 'checked' ? true : moduleState === 'indeterminate' ? 'indeterminate' : false}
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

            {/* Pages (二级菜单) */}
            {isExpanded && (
              <div style={{ backgroundColor: 'var(--bg-primary)' }}>
                {pages.map((page, index) => {
                  const pageKey = `${module.value}-${page.code}`;
                  const isPageExpanded = expandedPages.has(pageKey);
                  const pageState = getPageCheckState(module.value, page.code, page.operations);
                  const selectedOps = selectedPermissions[module.value]?.[page.code] || [];

                  return (
                    <div
                      key={page.code}
                      style={{
                        borderBottom: index < pages.length - 1 ? '1px solid var(--border-color-light)' : 'none',
                      }}
                    >
                      {/* Page Header (二级菜单) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: 'var(--space-sm) var(--space-md)',
                          paddingLeft: 'var(--space-xl)',
                          gap: 'var(--space-sm)',
                          cursor: 'pointer',
                          backgroundColor: pageState !== 'unchecked' ? 'rgba(117, 59, 189, 0.03)' : 'transparent',
                        }}
                        onClick={() => togglePage(pageKey)}
                      >
                        <span style={{ color: 'var(--text-secondary)', marginRight: 'var(--space-xs)' }}>
                          {isPageExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePageCheck(module.value, page, pageState);
                          }}
                          style={{ display: 'flex', alignItems: 'center' }}
                        >
                          <Checkbox
                            checked={pageState === 'checked' ? true : pageState === 'indeterminate' ? 'indeterminate' : false}
                            disabled={disabled}
                          />
                        </div>
                        <span style={{ 
                          color: pageState !== 'unchecked' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: pageState !== 'unchecked' ? 'var(--font-medium)' : 'normal',
                          fontSize: 'var(--text-sm)',
                          flex: 1,
                        }}>
                          {page.name}
                        </span>
                        <span style={{ 
                          fontSize: 'var(--text-xs)', 
                          color: selectedOps.length > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                          backgroundColor: selectedOps.length > 0 ? 'rgba(117, 59, 189, 0.1)' : 'var(--bg-tertiary)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                        }}>
                          {selectedOps.length}/{page.operations.length}
                        </span>
                      </div>

                      {/* Operations (功能按钮 - 下一级显示) */}
                      {isPageExpanded && (
                        <div style={{ 
                          padding: 'var(--space-xs) var(--space-md)',
                          paddingLeft: 'calc(var(--space-xl) * 2 + 20px)',
                          backgroundColor: 'var(--bg-secondary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--space-xs)',
                        }}>
                          {page.operations.map(op => {
                            const isChecked = selectedOps.includes(op);
                            const isPageSelected = pageState !== 'unchecked';
                            const isOperationDisabled = disabled || (autoSelectAllOperations && isPageSelected);

                            return (
                              <div
                                key={op}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'var(--space-sm)',
                                  padding: 'var(--space-xs)',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: isOperationDisabled ? 'not-allowed' : 'pointer',
                                  opacity: isOperationDisabled ? 0.5 : 1,
                                }}
                                onClick={() => !isOperationDisabled && onPermissionChange(module.value, page.code, op, !isChecked)}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  disabled={isOperationDisabled}
                                />
                                <span style={{
                                  fontSize: 'var(--text-sm)',
                                  color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  fontWeight: isChecked ? 'var(--font-medium)' : 'normal',
                                }}>
                                  {t(`operation.${op}`)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
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

export default PermissionsTree3;
