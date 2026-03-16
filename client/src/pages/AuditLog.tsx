import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Download, Calendar, Search } from 'lucide-react';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';
import {
  Button,
  Input,
  Card,
  CardContent,
  Badge,
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
} from '../components/ui';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  target: string;
  description: string;
  ipAddress: string;
}

const AuditLogPage: React.FC = () => {
  const { t, locale } = useLocale();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/audit-logs', {
        params: {
          page: currentPage,
          pageSize: pageSize
        }
      });
      
      if (response.data.success) {
        setLogs(response.data.data.items);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case '创建账号':
      case '创建角色':
      case '创建菜单':
        return 'success' as const;
      case '更新账号':
      case '更新角色':
      case '更新菜单':
        return 'info' as const;
      case '删除账号':
      case '删除角色':
      case '删除菜单':
        return 'destructive' as const;
      case '登录':
        return 'secondary' as const;
      default:
        return 'default' as const;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">审计日志</h1>
          <p className="text-muted-foreground">查看系统操作记录和追踪信息</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">审计日志</h1>
        <p className="text-muted-foreground">查看系统操作记录和追踪信息</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {logs.length === 0 ? (
            <Empty description="暂无审计日志记录" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>操作人</TableHead>
                    <TableHead>操作类型</TableHead>
                    <TableHead>目标对象</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>IP地址</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.operator}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {log.description}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {total > pageSize && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(total / pageSize)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogPage;
      console.warn('Failed to load saved filters');
    }
    return {
      dateRange: undefined as { from?: Date; to?: Date } | undefined,
      actionType: 'ALL',
      targetType: 'ALL',
      actorName: '',
      targetName: ''
    };
  };

  // Filter state with persistence
  const [filters, setFilters] = useState(loadSavedFilters);

  // Save filters to localStorage when they change
  useEffect(() => {
    try {
      const toSave = {
        dateRange: filters.dateRange 
          ? { from: filters.dateRange.from?.toISOString(), to: filters.dateRange.to?.toISOString() }
          : null,
        actionType: filters.actionType,
        targetType: filters.targetType,
        actorName: filters.actorName,
        targetName: filters.targetName
      };
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save filters');
    }
  }, [filters]);

  // Date preset handlers
  const handleDatePreset = (preset: 'today' | 'last7Days' | 'last30Days' | 'thisMonth') => {
    const presetDates = {
      today: { from: dayjs().startOf('day').toDate(), to: dayjs().endOf('day').toDate() },
      last7Days: { from: dayjs().subtract(7, 'day').startOf('day').toDate(), to: dayjs().endOf('day').toDate() },
      last30Days: { from: dayjs().subtract(30, 'day').startOf('day').toDate(), to: dayjs().endOf('day').toDate() },
      thisMonth: { from: dayjs().startOf('month').toDate(), to: dayjs().endOf('day').toDate() },
    };
    setFilters({ ...filters, dateRange: presetDates[preset] });
  };

  useEffect(() => {
    dayjs.locale(locale === 'zh-CN' ? 'zh-cn' : 'en');
  }, [locale]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        pageSize: 1000
      };

      if (filters.dateRange?.from && filters.dateRange?.to) {
        params.startDate = dayjs(filters.dateRange.from).startOf('day').toISOString();
        params.endDate = dayjs(filters.dateRange.to).endOf('day').toISOString();
      }

      if (filters.actionType !== 'ALL') {
        params.actionType = filters.actionType;
      }

      if (filters.targetType !== 'ALL') {
        params.targetType = filters.targetType;
      }

      if (filters.actorName) {
        params.actorName = filters.actorName;
      }

      if (filters.targetName) {
        params.targetName = filters.targetName;
      }

      const response = await api.get('/audit-logs', { params });
      if (response.data.success) {
        setLogs(response.data.data.items || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error(t('auditLog.loadFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const headers = [
        t('auditLog.timestamp'),
        t('auditLog.actor'),
        t('auditLog.actionType'),
        t('auditLog.targetType'),
        t('auditLog.targetId'),
        t('common.description')
      ];

      const rows = logs.map(log => [
        dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
        log.actor.username,
        ACTION_TYPE_MAP[log.actionType]?.label || log.actionType,
        TARGET_TYPE_MAP[log.targetType]?.label || log.targetType,
        log.targetName,
        log.description.replace(/"/g, '""')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-log-${dayjs().format('YYYY-MM-DD-HHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(t('auditLog.exportSuccess'));
    } catch (error) {
      toast.error(t('auditLog.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    const defaultFilters = {
      dateRange: undefined as { from?: Date; to?: Date } | undefined,
      actionType: 'ALL',
      targetType: 'ALL',
      actorName: '',
      targetName: ''
    };
    setFilters(defaultFilters);
    localStorage.removeItem(FILTER_STORAGE_KEY);
  };

  // Pagination
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return logs.slice(startIndex, startIndex + pageSize);
  }, [logs, currentPage, pageSize]);

  const totalPages = Math.ceil(logs.length / pageSize);

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 'var(--space-lg)' 
      }}>
        <div>
          <h2 style={{ 
            margin: 0,
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--text-primary)',
          }}>
            {t('auditLog.title')}
          </h2>
          <p style={{ 
            margin: 'var(--space-xs) 0 0', 
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)'
          }}>
            {t('auditLog.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            disabled={exporting || logs.length === 0}
          >
            <Download size={16} /> {t('auditLog.export')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 'var(--space-md)' }}>
        <CardContent style={{ padding: 'var(--space-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.5fr) 1fr 1fr 1fr 1fr', gap: 'var(--space-md)' }}>
            <div>
              <Label>{t('auditLog.dateRange')}</Label>
              <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
                <DateRangePicker
                  dateRange={filters.dateRange}
                  onDateRangeChange={(range) => setFilters({ ...filters, dateRange: range })}
                  placeholder={t('auditLog.selectDateRange')}
                />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Calendar size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDatePreset('today')}>
                      {t('auditLog.today')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDatePreset('last7Days')}>
                      {t('auditLog.last7Days')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDatePreset('last30Days')}>
                      {t('auditLog.last30Days')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDatePreset('thisMonth')}>
                      {t('auditLog.thisMonth')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <Label>{t('auditLog.actionType')}</Label>
              <Select
                value={filters.actionType}
                onValueChange={(value) => setFilters({ ...filters, actionType: value })}
              >
                <SelectTrigger style={{ marginTop: 'var(--space-xs)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  {Object.keys(ACTION_TYPE_MAP).map(action => (
                    <SelectItem key={action} value={action}>
                      {ACTION_TYPE_MAP[action].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('auditLog.targetType')}</Label>
              <Select
                value={filters.targetType}
                onValueChange={(value) => setFilters({ ...filters, targetType: value })}
              >
                <SelectTrigger style={{ marginTop: 'var(--space-xs)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  {Object.keys(TARGET_TYPE_MAP).map(target => (
                    <SelectItem key={target} value={target}>
                      {TARGET_TYPE_MAP[target].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('auditLog.actor')}</Label>
              <Input
                style={{ marginTop: 'var(--space-xs)' }}
                placeholder={t('auditLog.searchActorId')}
                value={filters.actorName}
                onChange={(e) => setFilters({ ...filters, actorName: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('auditLog.targetId')}</Label>
              <Input
                style={{ marginTop: 'var(--space-xs)' }}
                placeholder={t('auditLog.searchTargetId')}
                value={filters.targetName}
                onChange={(e) => setFilters({ ...filters, targetName: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
            <Button variant="outline" onClick={handleReset}>{t('auditLog.reset')}</Button>
            <Button onClick={loadLogs}>
              <Search size={16} /> {t('auditLog.applyFilters')}
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
      ) : logs.length === 0 ? (
        <Card>
          <CardContent>
            <Empty 
              variant="audit"
              title={t('common.noData')}
              description={t('auditLog.noLogsDescription') || 'No audit logs found for the selected filters.'}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 170 }}>{t('auditLog.timestamp')}</TableHead>
                <TableHead style={{ width: 130 }}>{t('auditLog.actor')}</TableHead>
                <TableHead style={{ width: 150 }}>{t('auditLog.actionType')}</TableHead>
                <TableHead style={{ width: 200 }}>{t('auditLog.targetType')}</TableHead>
                <TableHead>{t('common.description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => {
                const actionConfig = ACTION_TYPE_MAP[log.actionType] || { label: log.actionType, variant: 'secondary' as const };
                const targetConfig = TARGET_TYPE_MAP[log.targetType] || { label: log.targetType, variant: 'secondary' as const };
                
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                        {log.actor.username}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionConfig.variant}>{actionConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                          {log.targetName}
                        </div>
                        <Badge variant={targetConfig.variant} style={{ marginTop: 'var(--space-xs)' }}>
                          {targetConfig.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ 
                        wordBreak: 'break-all', 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.4',
                        color: 'var(--text-regular)',
                      }}>
                        {log.description}
                      </div>
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
                totalItems={logs.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogPage;
