// 菜单管理API
const menus = [
  {
    id: '1',
    name: '工作台',
    code: 'dashboard',
    path: '/dashboard',
    order: 1,
    type: 'MENU',
    status: 'NORMAL',
    parentId: null,
    children: []
  },
  {
    id: '2',
    name: '系统管理',
    code: 'system',
    path: '/system',
    order: 2,
    type: 'DIRECTORY',
    status: 'NORMAL',
    parentId: null,
    children: [
      {
        id: '3',
        name: '菜单管理',
        code: 'menu-management',
        path: '/system/menus',
        order: 1,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '2'
      },
      {
        id: '4',
        name: '角色管理',
        code: 'role-management',
        path: '/system/roles',
        order: 2,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '2'
      },
      {
        id: '5',
        name: '账号管理',
        code: 'account-management',
        path: '/system/accounts',
        order: 3,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '2'
      }
    ]
  },
  {
    id: '6',
    name: '采购管理',
    code: 'purchase',
    path: '/purchase',
    order: 3,
    type: 'DIRECTORY',
    status: 'NORMAL',
    parentId: null,
    children: [
      {
        id: '7',
        name: '采购订单',
        code: 'purchase-orders',
        path: '/purchase/orders',
        order: 1,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '6'
      },
      {
        id: '8',
        name: '供应商管理',
        code: 'suppliers',
        path: '/purchase/suppliers',
        order: 2,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '6'
      }
    ]
  },
  {
    id: '9',
    name: '订单管理',
    code: 'orders',
    path: '/orders',
    order: 4,
    type: 'DIRECTORY',
    status: 'NORMAL',
    parentId: null,
    children: [
      {
        id: '10',
        name: '订单列表',
        code: 'order-list',
        path: '/orders/list',
        order: 1,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '9'
      },
      {
        id: '11',
        name: '订单统计',
        code: 'order-stats',
        path: '/orders/stats',
        order: 2,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '9'
      }
    ]
  },
  {
    id: '12',
    name: '运输管理',
    code: 'transport',
    path: '/transport',
    order: 5,
    type: 'DIRECTORY',
    status: 'NORMAL',
    parentId: null,
    children: [
      {
        id: '13',
        name: '运输计划',
        code: 'transport-plan',
        path: '/transport/plan',
        order: 1,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '12'
      },
      {
        id: '14',
        name: '车辆管理',
        code: 'vehicles',
        path: '/transport/vehicles',
        order: 2,
        type: 'MENU',
        status: 'NORMAL',
        parentId: '12'
      }
    ]
  }
];

export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: menus
    });
  } else if (req.method === 'POST') {
    const newMenu = req.body;
    const id = String(menus.length + 1);
    const menu = { ...newMenu, id };
    menus.push(menu);
    
    res.status(201).json({
      success: true,
      data: menu
    });
  } else if (req.method === 'PUT') {
    // 处理更新菜单
    const { id } = req.query;
    const updatedMenu = req.body;
    const index = menus.findIndex(m => m.id === id);
    
    if (index !== -1) {
      menus[index] = { ...menus[index], ...updatedMenu };
      res.status(200).json({
        success: true,
        data: menus[index]
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Menu not found'
      });
    }
  } else if (req.method === 'DELETE') {
    // 处理删除菜单
    const { id } = req.query;
    const index = menus.findIndex(m => m.id === id);
    
    if (index !== -1) {
      menus.splice(index, 1);
      res.status(200).json({
        success: true
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Menu not found'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}