import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Shield, Menu, FileText, Activity, UserCheck } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

interface Stats {
  accountCount: number;
  roleCount: number;
  menuCount: number;
  auditCount: number;
  activeAccountCount: number;
  activeRoleCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    accountCount: 0,
    roleCount: 0,
    menuCount: 0,
    auditCount: 0,
    activeAccountCount: 0,
    activeRoleCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '用户账号',
      value: stats.accountCount,
      icon: Users,
      description: `${stats.activeAccountCount} 个激活账号`,
      color: 'text-blue-600'
    },
    {
      title: '系统角色',
      value: stats.roleCount,
      icon: Shield,
      description: `${stats.activeRoleCount} 个激活角色`,
      color: 'text-green-600'
    },
    {
      title: '菜单项目',
      value: stats.menuCount,
      icon: Menu,
      description: '系统菜单总数',
      color: 'text-purple-600'
    },
    {
      title: '审计记录',
      value: stats.auditCount,
      icon: FileText,
      description: '操作日志总数',
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系统仪表盘</h1>
        <p className="text-muted-foreground">
          权限管理系统概览和统计信息
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 功能概览 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              系统功能
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">账号管理 - 用户账号的增删改查操作</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">角色管理 - 系统角色和权限配置管理</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">菜单管理 - 系统菜单结构层级管理</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">审计日志 - 系统操作记录和追踪功能</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              技术特点
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">完整Mock数据 - 无需后端服务器</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">完整CRUD功能 - 支持数据的增删改查</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">响应式设计 - 支持桌面端和移动端</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">企业级UI - 专业美观的界面设计</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;