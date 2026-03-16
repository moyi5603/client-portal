// 菜单管理 API
const mockMenus = [
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
      }
    ]
  }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: mockMenus
    });
  } else if (req.method === 'POST') {
    const newMenu = {
      id: Date.now().toString(),
      ...req.body,
      children: []
    };
    mockMenus.push(newMenu);
    res.status(201).json({
      success: true,
      data: newMenu
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}