import express from 'express';
import { db } from '../database/models';
import { Menu } from '../types';

const router = express.Router();

// Get all menus (tree structure)
router.get('/', async (req, res) => {
  try {
    const menus = db.getAllMenus();
    
    // Build tree structure
    const menuMap = new Map<string, Menu>();
    const rootMenus: Menu[] = [];
    
    // First pass: create map
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });
    
    // Second pass: build tree
    menus.forEach(menu => {
      const menuNode = menuMap.get(menu.id)!;
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(menuNode);
        }
      } else {
        rootMenus.push(menuNode);
      }
    });
    
    // Sort by order
    const sortMenus = (menus: Menu[]) => {
      menus.sort((a, b) => a.order - b.order);
      menus.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
          sortMenus(menu.children);
        }
      });
    };
    
    sortMenus(rootMenus);
    
    res.json({ success: true, data: rootMenus });
  } catch (error: any) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menus', error: error.message });
  }
});

// Get menu by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menu = db.getMenu(id);
    
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    
    res.json({ success: true, data: menu });
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch menu', error: error.message });
  }
});

// Create menu
router.post('/', async (req, res) => {
  try {
    const { name, code, path, parentId, icon, order, type, isExternal, visible, status, componentPath, routeParams } = req.body;
    
    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }
    
    // Check if code already exists
    const existingMenus = db.getAllMenus();
    if (existingMenus.some(m => m.code === code)) {
      return res.status(400).json({ success: false, message: 'Menu code already exists' });
    }
    
    const newMenu: Menu = {
      id: `menu-${Date.now()}`,
      name,
      code,
      path: path || `/${code}`,
      parentId,
      icon,
      order: order || 0,
      type: type || 'MENU',
      isExternal: isExternal || false,
      visible: visible !== false,
      status: status || 'NORMAL',
      componentPath,
      routeParams
    };
    
    db.createMenu(newMenu);
    
    res.json({ success: true, data: newMenu, message: 'Menu created successfully' });
  } catch (error: any) {
    console.error('Error creating menu:', error);
    res.status(500).json({ success: false, message: 'Failed to create menu', error: error.message });
  }
});

// Update menu
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const menu = db.getMenu(id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    
    // Check if code is being changed and if it conflicts
    if (updates.code && updates.code !== menu.code) {
      const existingMenus = db.getAllMenus();
      if (existingMenus.some(m => m.code === updates.code && m.id !== id)) {
        return res.status(400).json({ success: false, message: 'Menu code already exists' });
      }
    }
    
    const success = db.updateMenu(id, updates);
    
    if (success) {
      const updatedMenu = db.getMenu(id);
      res.json({ success: true, data: updatedMenu, message: 'Menu updated successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update menu' });
    }
  } catch (error: any) {
    console.error('Error updating menu:', error);
    res.status(500).json({ success: false, message: 'Failed to update menu', error: error.message });
  }
});

// Delete menu
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const menu = db.getMenu(id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    
    // Check if menu has children
    const allMenus = db.getAllMenus();
    const hasChildren = allMenus.some(m => m.parentId === id);
    if (hasChildren) {
      return res.status(400).json({ success: false, message: 'Cannot delete menu with children' });
    }
    
    const success = db.deleteMenu(id);
    
    if (success) {
      res.json({ success: true, message: 'Menu deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete menu' });
    }
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ success: false, message: 'Failed to delete menu', error: error.message });
  }
});

// Get menus for account
router.get('/account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = db.getAccount(accountId);
    
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    
    // If MAIN account, return all menus
    if (account.accountType === 'MAIN') {
      const allMenus = db.getAllMenus();
      return res.json({ success: true, data: allMenus });
    }
    
    // Get menus from roles
    const accountMenuCodes = new Set<string>();
    account.roles.forEach(roleId => {
      const role = db.getRole(roleId);
      if (role && role.status === 'ACTIVE') {
        role.permissions.forEach(permission => {
          accountMenuCodes.add(permission.pageCode);
        });
      }
    });
    
    const allMenus = db.getAllMenus();
    const accessibleMenus = allMenus.filter(menu => accountMenuCodes.has(menu.code));
    
    res.json({ success: true, data: accessibleMenus });
  } catch (error: any) {
    console.error('Error fetching account menus:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch account menus', error: error.message });
  }
});

export default router;
