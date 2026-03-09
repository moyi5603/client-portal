# 菜单管理完整代码

## 文件位置
`client/src/pages/MenuManagement.tsx`

## 完整代码

由于文件系统问题，请手动创建此文件并复制以下代码：

```typescript
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Folder, FileText, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useToast } from '../components/ui/use-toast';
import api from '../utils/api';
import { useLocale } from '../contexts/LocaleContext';

interface Menu {
  id: string;
  name: string;
  code: string;
  path: string;
  parentId?: string;
  icon?: string;
  order: number;
  type?: 'DIRECTORY' | 'MENU' | 'BUTTON';
  isExternal?: boolean;
  visible?: boolean;
  status?: 'NORMAL' | 'DISABLED';
  componentPath?: string;
  routeParams?: string;
  children?: Menu[];
}

interface MenuFormData {
  name: string;
  code: string;
  path: string;
  parentId?: string;
  icon?: string;
  order: number;
  type: 'DIRECTORY' | 'MENU' | 'BUTTON';
  isExternal: boolean;
  visible: boolean;
  status: 'NORMAL' | 'DISABLED';
  componentPath?: string;
  routeParams?: string;
}

const MenuManagement: React.FC = () => {
  const { t } = useLocale();
  const { toast } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null);
  
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    code: '',
    path: '',
    parentId: undefined,
    icon: '',
    order: 0,
    type: 'MENU',
    isExternal: false,
    visible: true,
    status: 'NORMAL',
    componentPath: '',
    routeParams: ''
  });

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menus');
      if (response.data.success) {
        setMenus(response.data.data || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load menus',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setFormData({
        name: menu.name,
        code: menu.code,
        path: menu.path,
        parentId: menu.parentId,
        icon: menu.icon || '',
        order: menu.order,
        type: menu.type || 'MENU',
        isExternal: menu.isExternal || false,
        visible: menu.visible !== false,
        status: menu.status || 'NORMAL',
        componentPath: menu.componentPath || '',
        routeParams: menu.routeParams || ''
      });
    } else {
      setEditingMenu(null);
      setFormData({
        name: '',
        code: '',
        path: '',
        parentId: undefined,
        icon: '',
        order: 0,
        type: 'MENU',
        isExternal: false,
        visible: true,
        status: 'NORMAL',
        componentPath: '',
        routeParams: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMenu(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast({
        title: 'Error',
        description: 'Please fill in menu name and code',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingMenu) {
        await api.put(\`/menus/\${editingMenu.id}\`, formData);
        toast({
          title: 'Success',
          description: 'Menu updated successfully',
        });
      } else {
        await api.post('/menus', formData);
        toast({
          title: 'Success',
          description: 'Menu created successfully',
        });
      }
      handleCloseDialog();
      loadMenus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingMenu) return;

    try {
      await api.delete(\`/menus/\${deletingMenu.id}\`);
      toast({
        title: 'Success',
        description: 'Menu deleted successfully',
      });
      setDeleteDialogOpen(false);
      setDeletingMenu(null);
      loadMenus();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (menu: Menu) => {
    setDeletingMenu(menu);
    setDeleteDialogOpen(true);
  };

  const flattenMenus = (menuList: Menu[], level = 0): Array<Menu & { level: number }> => {
    let result: Array<Menu & { level: number }> = [];
    menuList.forEach(menu => {
      result.push({ ...menu, level });
      if (menu.children && menu.children.length > 0) {
        result = result.concat(flattenMenus(menu.children, level + 1));
      }
    });
    return result;
  };

  const flatMenus = flattenMenus(menus);

  const renderMenuTree = (menuList: Menu[], level = 0): React.ReactNode => {
    return menuList.map(menu => (
      <React.Fragment key={menu.id}>
        <tr className="border-b hover:bg-muted/50">
          <td className="p-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: \`\${level * 24}px\` }}>
              {menu.type === 'DIRECTORY' ? (
                <Folder className="w-4 h-4 text-primary" />
              ) : menu.type === 'BUTTON' ? (
                <FileText className="w-4 h-4 text-muted" />
              ) : (
                <FileText className="w-4 h-4 text-blue-500" />
              )}
              <span className="font-medium">{menu.name}</span>
              {menu.isExternal && <LinkIcon className="w-3 h-3 text-muted" />}
            </div>
          </td>
          <td className="p-3">
            <Badge variant="default" className="text-xs">
              {menu.code}
            </Badge>
          </td>
          <td className="p-3 text-sm text-muted">{menu.path}</td>
          <td className="p-3">
            <Badge variant={menu.type === 'DIRECTORY' ? 'default' : menu.type === 'MENU' ? 'success' : 'warning'}>
              {menu.type === 'DIRECTORY' ? 'Directory' : menu.type === 'MENU' ? 'Menu' : 'Button'}
            </Badge>
          </td>
          <td className="p-3 text-center">{menu.order}</td>
          <td className="p-3">
            <Badge variant={menu.visible !== false ? 'success' : 'default'}>
              {menu.visible !== false ? 'Visible' : 'Hidden'}
            </Badge>
          </td>
          <td className="p-3">
            <Badge variant={menu.status === 'NORMAL' ? 'success' : 'destructive'}>
              {menu.status === 'NORMAL' ? 'Normal' : 'Disabled'}
            </Badge>
          </td>
          <td className="p-3">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleOpenDialog(menu)}>
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => openDeleteDialog(menu)}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </td>
        </tr>
        {menu.children && menu.children.length > 0 && renderMenuTree(menu.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Menu Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMenus} disabled={loading}>
            <RefreshCw className={\`w-4 h-4 mr-2 \${loading ? 'animate-spin' : ''}\`} />
            Refresh
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu List</CardTitle>
   