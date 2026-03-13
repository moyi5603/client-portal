import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreHorizontal, ChevronRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import api from '../utils/api';

interface Menu {
  id: string;
  name: string;
  code: string;
  path: string;
  order: number;
  type?: string;
  visible?: boolean;
  status?: string;
  parentId?: string;
  children?: Menu[];
}

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null);
  const [parentMenuForAdd, setParentMenuForAdd] = useState<string>('');
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [expandedParentMenus, setExpandedParentMenus] = useState<Set<string>>(new Set());
  const [isParentMenuOpen, setIsParentMenuOpen] = useState(false);
  
  // Form fields
  const [menuType, setMenuType] = useState<string>('MENU');
  const [parentId, setParentId] = useState<string>('');
  const [menuName, setMenuName] = useState<string>('');
  const [menuCode, setMenuCode] = useState<string>('');
  const [menuPath, setMenuPath] = useState<string>('');
  const [menuOrder, setMenuOrder] = useState<number>(0);
  const [menuStatus, setMenuStatus] = useState<string>('NORMAL');

  // 中英文翻译映射
  const translateMenuName = (name: string): string => {
    const translations: Record<string, string> = {
      '工作台': 'Dashboard',
      '采购管理': 'Purchase Management',
      '销售订单': 'Sales Order',
      '订单管理': 'Order Management',
      '工单管理': 'Work Order',
      '入库管理': 'Inbound',
      '库存管理': 'Inventory',
      '出库管理': 'Outbound',
      '退货管理': 'Returns',
      '场地管理': 'Yard Management',
      '运输管理': 'Transportation Management',
      '供应链': 'Supply Chain',
      '财务管理': 'Finance',
      '系统管理': 'System Management',
      '权限管理': 'Permission Management',
      '账号管理': 'Account Management',
      '角色管理': 'Role Management',
      '权限查看': 'Permission View',
      '操作记录': 'Audit Log',
      '菜单管理': 'Menu Management',
      '用户页面管理': 'User Page Management',
      '页面设计器': 'Page Designer',
    };
    return translations[name] || name;
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menus');
      if (response.data.success) {
        setMenus(response.data.data || []);
        // 默认收起所有菜单（不设置任何展开状态）
        setExpandedMenus(new Set());
      }
    } catch (error) {
      toast.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const toggleParentMenuExpand = (menuId: string) => {
    setExpandedParentMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const getParentMenuName = (id: string) => {
    if (!id || id === '__none__') return 'None (Root Level)';
    const findMenu = (items: Menu[]): string | null => {
      for (const item of items) {
        if (item.id === id) return item.name;
        if (item.children) {
          const found = findMenu(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findMenu(menus) || id;
  };

  const openDialog = () => {
    // Reset form
    setEditingMenu(null);
    setMenuType('MENU');
    setParentId(parentMenuForAdd);
    setMenuName('');
    setMenuCode('');
    setMenuPath('');
    setMenuOrder(0);
    setIsDialogOpen(true);
  };

  const openAddDialog = (parentMenuId: string = '') => {
    setParentMenuForAdd(parentMenuId);
    setEditingMenu(null);
    setMenuType('MENU');
    setParentId(parentMenuId);
    setMenuName('');
    setMenuCode('');
    setMenuPath('');
    setMenuOrder(0);
    setMenuStatus('NORMAL');
    setIsDialogOpen(true);
  };

  const openEditDialog = (menu: Menu) => {
    setEditingMenu(menu);
    setMenuType(menu.type || 'MENU');
    setParentId(menu.parentId || '');
    setMenuName(menu.name);
    setMenuCode(menu.code || '');
    setMenuPath(menu.path || '');
    setMenuOrder(menu.order);
    // 处理状态值：兼容多种格式
    let status = menu.status || 'NORMAL';
    // 如果是旧格式，转换为新格式
    if (status === 'ACTIVE') status = 'NORMAL';
    if (status === 'INACTIVE') status = 'DISABLED';
    setMenuStatus(status);
    // 默认展开所有父菜单选项
    const allIds = new Set<string>();
    const collectIds = (items: Menu[]) => {
      items.forEach(item => {
        if (item.children && item.children.some(c => c.type !== 'BUTTON')) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(menus);
    setExpandedParentMenus(allIds);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (menu: Menu) => {
    setDeletingMenu(menu);
    setIsDeleteDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingMenu(null);
    setParentMenuForAdd('');
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingMenu(null);
  };

  const handleSubmit = async () => {
    if (!menuName) {
      toast.error('Please fill in menu name');
      return;
    }
    
    if (menuType !== 'DIRECTORY' && !menuCode) {
      toast.error('Please fill in menu code');
      return;
    }

    try {
      const payload = {
        name: menuName,
        code: menuType === 'DIRECTORY' ? undefined : menuCode,
        path: menuPath,
        type: menuType,
        parentId: (parentId && parentId !== '__none__') ? parentId : undefined,
        order: menuOrder,
        status: menuStatus
      };
      
      if (editingMenu) {
        await api.put(`/menus/${editingMenu.id}`, payload);
        toast.success('Menu updated successfully');
      } else {
        await api.post('/menus', payload);
        toast.success('Menu created successfully');
      }
      
      closeDialog();
      loadMenus();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${editingMenu ? 'update' : 'create'} menu`);
    }
  };

  const handleDelete = async () => {
    if (!deletingMenu) return;

    try {
      await api.delete(`/menus/${deletingMenu.id}`);
      toast.success('Menu deleted successfully');
      closeDeleteDialog();
      loadMenus();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete menu');
    }
  };

  const flattenMenus = (menuList: Menu[], level = 0): Array<Menu & { level: number }> => {
    let result: Array<Menu & { level: number }> = [];
    menuList.forEach(menu => {
      result.push({ ...menu, level });
      if (menu.children && menu.children.length > 0 && expandedMenus.has(menu.id)) {
        result = result.concat(flattenMenus(menu.children, level + 1));
      }
    });
    return result;
  };

  // 用于父菜单选择的扁平化函数（根据展开状态）
  const flattenParentMenus = (menuList: Menu[], level = 0): Array<Menu & { level: number }> => {
    let result: Array<Menu & { level: number }> = [];
    menuList.forEach(menu => {
      // 只包含非 BUTTON 类型的菜单
      if (menu.type !== 'BUTTON') {
        result.push({ ...menu, level });
        if (menu.children && menu.children.length > 0 && expandedParentMenus.has(menu.id)) {
          result = result.concat(flattenParentMenus(menu.children, level + 1));
        }
      }
    });
    return result;
  };

  const flatMenus = flattenMenus(menus);
  const parentMenuOptions = flattenParentMenus(menus);

  const hasChildren = (menu: Menu) => {
    return menu.children && menu.children.length > 0;
  };

  const hasNonButtonChildren = (menu: Menu) => {
    return menu.children && menu.children.some(child => child.type !== 'BUTTON');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Menu Management</h2>
        <Button type="button" onClick={openDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Menu List ({flatMenus.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : flatMenus.length === 0 ? (
            <div className="text-center py-8 text-muted">No menus found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-center">Order</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flatMenus.map(menu => (
                  <tr key={menu.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center" style={{ paddingLeft: `${menu.level * 20}px` }}>
                        {hasChildren(menu) ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(menu.id)}
                            className="mr-2 p-0 border-0 bg-transparent cursor-pointer"
                          >
                            {expandedMenus.has(menu.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <span className="w-4 h-4 mr-2 inline-block" />
                        )}
                        <span>{translateMenuName(menu.name)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted">{menu.code || '-'}</td>
                    <td className="p-3">
                      <Badge variant={
                        menu.type === 'DIRECTORY' ? 'default' : 
                        menu.type === 'MENU' ? 'success' : 
                        menu.type === 'BUTTON' ? 'warning' : 
                        'secondary'
                      }>
                        {menu.type || 'MENU'}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">{menu.order}</td>
                    <td className="p-3 text-center">
                      <Badge variant={
                        (menu.status === 'ACTIVE' || menu.status === 'NORMAL' || !menu.status) ? 'success' : 'secondary'
                      }>
                        {(menu.status === 'ACTIVE' || menu.status === 'NORMAL' || !menu.status) ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {menu.type !== 'BUTTON' && (
                              <DropdownMenuItem onClick={() => openAddDialog(menu.id)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => openEditDialog(menu)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(menu)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Edit Menu' : 'Add New Menu'}</DialogTitle>
            <DialogDescription>
              {editingMenu ? 'Update menu information' : 'Create a new menu item, directory, or button'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuType"
                    value="DIRECTORY"
                    checked={menuType === 'DIRECTORY'}
                    onChange={(e) => setMenuType(e.target.value)}
                    disabled={!!editingMenu}
                    className="w-4 h-4"
                  />
                  <span className={editingMenu ? 'text-gray-400' : ''}>Directory</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuType"
                    value="MENU"
                    checked={menuType === 'MENU'}
                    onChange={(e) => setMenuType(e.target.value)}
                    disabled={!!editingMenu}
                    className="w-4 h-4"
                  />
                  <span className={editingMenu ? 'text-gray-400' : ''}>Menu</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuType"
                    value="BUTTON"
                    checked={menuType === 'BUTTON'}
                    onChange={(e) => setMenuType(e.target.value)}
                    disabled={!!editingMenu}
                    className="w-4 h-4"
                  />
                  <span className={editingMenu ? 'text-gray-400' : ''}>Button</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Parent Menu</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => !editingMenu && setIsParentMenuOpen(!isParentMenuOpen)}
                  disabled={!!editingMenu}
                  className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md ${
                    editingMenu 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <span className="text-sm">{getParentMenuName(parentId)}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isParentMenuOpen && !editingMenu && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setParentId('');
                        setIsParentMenuOpen(false);
                      }}
                    >
                      None (Root Level)
                    </div>
                    {parentMenuOptions.map(menu => (
                      <div
                        key={menu.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        style={{ paddingLeft: `${12 + menu.level * 20}px` }}
                      >
                        {hasNonButtonChildren(menu) ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleParentMenuExpand(menu.id);
                            }}
                            className="mr-2 p-0 border-0 bg-transparent"
                          >
                            {expandedParentMenus.has(menu.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <span className="w-4 h-4 mr-2 inline-block" />
                        )}
                        <span
                          onClick={() => {
                            setParentId(menu.id);
                            setIsParentMenuOpen(false);
                          }}
                          className="flex-1"
                        >
                          {translateMenuName(menu.name)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Menu Name *</Label>
              <Input
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Enter menu name"
              />
            </div>
            
            {menuType !== 'DIRECTORY' && (
              <div className="space-y-2">
                <Label>Menu Code *</Label>
                <Input
                  value={menuCode}
                  onChange={(e) => setMenuCode(e.target.value)}
                  placeholder="Enter menu code (e.g., menu-1)"
                  disabled={!!editingMenu}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={menuOrder}
                onChange={(e) => setMenuOrder(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuStatus"
                    value="NORMAL"
                    checked={menuStatus === 'NORMAL'}
                    onChange={(e) => setMenuStatus(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="menuStatus"
                    value="DISABLED"
                    checked={menuStatus === 'DISABLED'}
                    onChange={(e) => setMenuStatus(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Disabled</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editingMenu ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Menu</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingMenu ? translateMenuName(deletingMenu.name) : ''}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteDialog}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;
