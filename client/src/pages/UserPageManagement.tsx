import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm,
  Tooltip,
  Badge,
  Drawer,
  Timeline,
  Descriptions,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  CopyOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  HistoryOutlined,
  SettingOutlined,
  MenuOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useLocale } from '../contexts/LocaleContext';
import api from '../utils/api';
import './UserPageManagement.css';

interface UserPage {
  id: string;
  name: string;
  description?: string;
  pageType: 'list' | 'form' | 'detail' | 'dashboard' | 'custom';
  status: 'draft' | 'published' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface PageVersion {
  id: string;
  versionNumber: number;
  changeDescription?: string;
  createdAt: string;
}

interface PersonalMenuItem {
  id: string;
  pageId: string;
  menuName: string;
  menuIcon?: string;
  menuOrder: number;
  isVisible: boolean;
}

const UserPageManagement: React.FC = () => {
  const { t } = useLocale();
  const [pages, setPages] = useState<UserPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState<UserPage | null>(null);
  
  // 模态框状态
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [versionDrawerVisible, setVersionDrawerVisible] = useState(false);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
  
  // 数据状态
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [menuItems, setMenuItems] = useState<PersonalMenuItem[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  
  // 表单
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  // 筛选状态
  const [filters, setFilters] = useState({
    status: 'all',
    pageType: 'all',
    search: ''
  });

  useEffect(() => {
    loadPages();
    loadStatistics();
    loadPersonalMenu();
  }, []);

  // 加载页面列表
  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user-pages', {
        params: {
          page: 1,
          pageSize: 100,
          ...filters
        }
      });
      
      if (response.data.success) {
        setPages(response.data.data.items || []);
      }
    } catch (error) {
      message.error('加载页面列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计信息
  const loadStatistics = async () => {
    try {
      const response = await api.get('/user-pages/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('加载统计信息失败', error);
    }
  };

  // 加载个人菜单
  const loadPersonalMenu = async () => {
    try {
      const response = await api.get('/personal-menu');
      if (response.data.success) {
        setMenuItems(response.data.data || []);
      }
    } catch (error) {
      console.error('加载个人菜单失败', error);
    }
  };

  // 创建页面
  const handleCreatePage = () => {
    createForm.validateFields().then(async (values) => {
      try {
        const response = await api.post('/user-pages', values);
        if (response.data.success) {
          message.success('页面创建成功');
          setCreateModalVisible(false);
          createForm.resetFields();
          loadPages();
          loadStatistics();
        }
      } catch (error) {
        message.error('创建页面失败');
      }
    });
  };

  // 编辑页面
  const handleEditPage = (page: UserPage) => {
    setSelectedPage(page);
    editForm.setFieldsValue(page);
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!selectedPage) return;
    
    editForm.validateFields().then(async (values) => {
      try {
        const response = await api.put(`/user-pages/${selectedPage.id}`, values);
        if (response.data.success) {
          message.success('页面更新成功');
          setEditModalVisible(false);
          setSelectedPage(null);
          editForm.resetFields();
          loadPages();
        }
      } catch (error) {
        message.error('更新页面失败');
      }
    });
  };

  // 发布页面
  const handlePublishPage = async (pageId: string) => {
    try {
      const response = await api.post(`/user-pages/${pageId}/publish`);
      if (response.data.success) {
        message.success('页面发布成功');
        loadPages();
        loadStatistics();
        loadPersonalMenu();
      }
    } catch (error) {
      message.error('发布页面失败');
    }
  };

  // 取消发布
  const handleUnpublishPage = async (pageId: string) => {
    try {
      const response = await api.post(`/user-pages/${pageId}/unpublish`);
      if (response.data.success) {
        message.success('已取消发布');
        loadPages();
        loadStatistics();
        loadPersonalMenu();
      }
    } catch (error) {
      message.error('取消发布失败');
    }
  };

  // 删除页面
  const handleDeletePage = async (pageId: string) => {
    try {
      const response = await api.delete(`/user-pages/${pageId}`);
      if (response.data.success) {
        message.success('页面删除成功');
        loadPages();
        loadStatistics();
        loadPersonalMenu();
      }
    } catch (error) {
      message.error('删除页面失败');
    }
  };

  // 复制页面
  const handleDuplicatePage = async (page: UserPage) => {
    try {
      const response = await api.post('/user-pages', {
        ...page,
        name: `${page.name} (副本)`,
        id: undefined,
        status: 'draft'
      });
      
      if (response.data.success) {
        message.success('页面复制成功');
        loadPages();
        loadStatistics();
      }
    } catch (error) {
      message.error('复制页面失败');
    }
  };

  // 查看版本历史
  const handleViewVersions = async (page: UserPage) => {
    setSelectedPage(page);
    try {
      const response = await api.get(`/user-pages/${page.id}/versions`);
      if (response.data.success) {
        setVersions(response.data.data || []);
        setVersionDrawerVisible(true);
      }
    } catch (error) {
      message.error('加载版本历史失败');
    }
  };

  // 回滚版本
  const handleRollbackVersion = async (versionId: string) => {
    if (!selectedPage) return;
    
    try {
      const response = await api.post(`/user-pages/${selectedPage.id}/rollback/${versionId}`);
      if (response.data.success) {
        message.success('版本回滚成功');
        setVersionDrawerVisible(false);
        loadPages();
      }
    } catch (error) {
      message.error('版本回滚失败');
    }
  };

  // 管理个人菜单
  const handleManageMenu = (page: UserPage) => {
    setSelectedPage(page);
    setMenuDrawerVisible(true);
  };

  // 更新菜单项
  const handleUpdateMenuItem = async (pageId: string, updates: Partial<PersonalMenuItem>) => {
    try {
      const response = await api.put(`/personal-menu/${pageId}`, updates);
      if (response.data.success) {
        message.success('菜单更新成功');
        loadPersonalMenu();
      }
    } catch (error) {
      message.error('菜单更新失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '页面名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: UserPage) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'pageType',
      key: 'pageType',
      render: (type: string) => {
        const typeMap: { [key: string]: { color: string; text: string } } = {
          'list': { color: 'blue', text: '列表页' },
          'form': { color: 'green', text: '表单页' },
          'detail': { color: 'orange', text: '详情页' },
          'dashboard': { color: 'purple', text: '仪表板' },
          'custom': { color: 'default', text: '自定义' }
        };
        const config = typeMap[type] || typeMap['custom'];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: { [key: string]: { color: string; text: string } } = {
          'draft': { color: 'default', text: '草稿' },
          'published': { color: 'success', text: '已发布' },
          'archived': { color: 'warning', text: '已归档' }
        };
        const config = statusMap[status] || statusMap['draft'];
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: (version: number) => `v${version}`,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: UserPage) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => window.open(`/preview/${record.id}`, '_blank')}
            />
          </Tooltip>
          
          <Tooltip title="编辑">
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => handleEditPage(record)}
            />
          </Tooltip>
          
          <Tooltip title="版本历史">
            <Button 
              size="small" 
              icon={<HistoryOutlined />} 
              onClick={() => handleViewVersions(record)}
            />
          </Tooltip>
          
          <Tooltip title="复制">
            <Button 
              size="small" 
              icon={<CopyOutlined />} 
              onClick={() => handleDuplicatePage(record)}
            />
          </Tooltip>
          
          {record.status === 'published' && (
            <Tooltip title="菜单设置">
              <Button 
                size="small" 
                icon={<MenuOutlined />} 
                onClick={() => handleManageMenu(record)}
              />
            </Tooltip>
          )}
          
          {record.status === 'draft' ? (
            <Tooltip title="发布">
              <Button 
                size="small" 
                type="primary"
                icon={<CloudUploadOutlined />} 
                onClick={() => handlePublishPage(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="取消发布">
              <Button 
                size="small" 
                icon={<CloudDownloadOutlined />} 
                onClick={() => handleUnpublishPage(record.id)}
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title="确定要删除这个页面吗？"
            onConfirm={() => handleDeletePage(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 筛选后的页面数据
  const filteredPages = pages.filter(page => {
    if (filters.status !== 'all' && page.status !== filters.status) return false;
    if (filters.pageType !== 'all' && page.pageType !== filters.pageType) return false;
    if (filters.search && !page.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="user-page-management">
      {/* 页面标题和统计 */}
      <div className="page-header">
        <div>
          <h2>我的页面</h2>
          <p>管理您创建的个性化页面</p>
        </div>
        
        <div className="statistics">
          <Card size="small">
            <div className="stat-item">
              <div className="stat-value">{statistics.totalPages || 0}</div>
              <div className="stat-label">总页面数</div>
            </div>
          </Card>
          <Card size="small">
            <div className="stat-item">
              <div className="stat-value">{statistics.publishedPages || 0}</div>
              <div className="stat-label">已发布</div>
            </div>
          </Card>
          <Card size="small">
            <div className="stat-item">
              <div className="stat-value">{statistics.draftPages || 0}</div>
              <div className="stat-label">草稿</div>
            </div>
          </Card>
        </div>
      </div>

      {/* 操作栏 */}
      <Card className="toolbar">
        <div className="toolbar-left">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建页面
          </Button>
          
          <Button 
            icon={<CodeOutlined />}
            onClick={() => window.open('/page-designer', '_blank')}
          >
            页面设计器
          </Button>
        </div>
        
        <div className="toolbar-right">
          <Input.Search
            placeholder="搜索页面名称"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ width: 200, marginRight: 8 }}
          />
          
          <Select
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 120, marginRight: 8 }}
          >
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="published">已发布</Select.Option>
            <Select.Option value="archived">已归档</Select.Option>
          </Select>
          
          <Select
            value={filters.pageType}
            onChange={(value) => setFilters({ ...filters, pageType: value })}
            style={{ width: 120 }}
          >
            <Select.Option value="all">全部类型</Select.Option>
            <Select.Option value="list">列表页</Select.Option>
            <Select.Option value="form">表单页</Select.Option>
            <Select.Option value="detail">详情页</Select.Option>
            <Select.Option value="dashboard">仪表板</Select.Option>
            <Select.Option value="custom">自定义</Select.Option>
          </Select>
        </div>
      </Card>

      {/* 页面列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPages}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredPages.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个页面`,
          }}
        />
      </Card>

      {/* 创建页面模态框 */}
      <Modal
        title="创建新页面"
        open={createModalVisible}
        onOk={handleCreatePage}
        onCancel={() => setCreateModalVisible(false)}
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="页面名称"
            name="name"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input placeholder="输入页面名称" />
          </Form.Item>
          
          <Form.Item label="页面描述" name="description">
            <Input.TextArea placeholder="输入页面描述（可选）" rows={3} />
          </Form.Item>
          
          <Form.Item
            label="页面类型"
            name="pageType"
            rules={[{ required: true, message: '请选择页面类型' }]}
          >
            <Select placeholder="选择页面类型">
              <Select.Option value="list">列表页</Select.Option>
              <Select.Option value="form">表单页</Select.Option>
              <Select.Option value="detail">详情页</Select.Option>
              <Select.Option value="dashboard">仪表板</Select.Option>
              <Select.Option value="custom">自定义</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑页面模态框 */}
      <Modal
        title="编辑页面"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="页面名称"
            name="name"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input placeholder="输入页面名称" />
          </Form.Item>
          
          <Form.Item label="页面描述" name="description">
            <Input.TextArea placeholder="输入页面描述（可选）" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 版本历史抽屉 */}
      <Drawer
        title="版本历史"
        placement="right"
        width={500}
        open={versionDrawerVisible}
        onClose={() => setVersionDrawerVisible(false)}
      >
        {selectedPage && (
          <div>
            <Descriptions title={selectedPage.name} column={1} size="small">
              <Descriptions.Item label="当前版本">v{selectedPage.version}</Descriptions.Item>
              <Descriptions.Item label="状态">{selectedPage.status}</Descriptions.Item>
            </Descriptions>
            
            <Timeline style={{ marginTop: 24 }}>
              {versions.map(version => (
                <Timeline.Item key={version.id}>
                  <div className="version-item">
                    <div className="version-header">
                      <span className="version-number">v{version.versionNumber}</span>
                      <span className="version-date">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {version.changeDescription && (
                      <div className="version-description">
                        {version.changeDescription}
                      </div>
                    )}
                    <div className="version-actions">
                      <Button 
                        size="small" 
                        onClick={() => handleRollbackVersion(version.id)}
                      >
                        回滚到此版本
                      </Button>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Drawer>

      {/* 菜单管理抽屉 */}
      <Drawer
        title="菜单设置"
        placement="right"
        width={400}
        open={menuDrawerVisible}
        onClose={() => setMenuDrawerVisible(false)}
      >
        {selectedPage && (
          <div>
            <Descriptions title={selectedPage.name} column={1} size="small">
              <Descriptions.Item label="页面类型">{selectedPage.pageType}</Descriptions.Item>
              <Descriptions.Item label="发布状态">{selectedPage.status}</Descriptions.Item>
            </Descriptions>
            
            {menuItems.find(item => item.pageId === selectedPage.id) ? (
              <div style={{ marginTop: 24 }}>
                <h4>菜单配置</h4>
                <Form layout="vertical">
                  <Form.Item label="菜单名称">
                    <Input 
                      defaultValue={menuItems.find(item => item.pageId === selectedPage.id)?.menuName}
                      onBlur={(e) => handleUpdateMenuItem(selectedPage.id, { menuName: e.target.value })}
                    />
                  </Form.Item>
                  
                  <Form.Item label="菜单图标">
                    <Input 
                      defaultValue={menuItems.find(item => item.pageId === selectedPage.id)?.menuIcon}
                      onBlur={(e) => handleUpdateMenuItem(selectedPage.id, { menuIcon: e.target.value })}
                    />
                  </Form.Item>
                  
                  <Form.Item label="显示状态">
                    <Switch 
                      defaultChecked={menuItems.find(item => item.pageId === selectedPage.id)?.isVisible}
                      onChange={(checked) => handleUpdateMenuItem(selectedPage.id, { isVisible: checked })}
                    />
                  </Form.Item>
                </Form>
              </div>
            ) : (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <p>此页面尚未添加到个人菜单</p>
                <Button type="primary" onClick={() => handlePublishPage(selectedPage.id)}>
                  重新发布以添加到菜单
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserPageManagement;