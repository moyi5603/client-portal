// 合并的数据API - 处理所有数据请求
import mockData from './mock-data';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 从查询参数获取路径
    const { path } = req.query;

    // 路由处理
    switch (path) {
      case 'accounts':
        return handleAccounts(req, res);
      case 'roles':
        return handleRoles(req, res);
      case 'menus':
        return handleMenus(req, res);
      case 'audit-logs':
        return handleAuditLogs(req, res);
      case 'customers':
        return handleCustomers(req, res);
      case 'facilities':
        return handleFacilities(req, res);
      case 'permission-matrix':
        return handlePermissionMatrix(req, res);
      case 'user-pages':
        return handleUserPages(req, res);
      default:
        res.status(404).json({
          success: false,
          error: 'Endpoint not found'
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// 账号管理处理函数
function handleAccounts(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: {
        items: mockData.accounts,
        total: mockData.getAccountsCount()
      }
    });
  } else if (req.method === 'POST') {
    const newAccount = req.body;
    const id = `ACC-${String(mockData.getAccountsCount() + 1).padStart(3, '0')}`;
    const account = { 
      ...newAccount, 
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockData.accounts.push(account);
    
    res.status(201).json({
      success: true,
      data: account
    });
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}

// 角色管理处理函数
function handleRoles(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: {
        items: mockData.roles,
        total: mockData.getRolesCount()
      }
    });
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}

// 菜单管理处理函数
function handleMenus(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: mockData.menus
    });
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}

// 审计日志处理函数
function handleAuditLogs(req, res) {
  if (req.method === 'GET') {
    const { startTime, endTime, actionType, targetType, page = 1, pageSize = 20 } = req.query;
    
    let logs = mockData.auditLogs;
    
    // 时间范围过滤
    if (startTime && endTime) {
      logs = mockData.getAuditLogsByTimeRange(startTime, endTime);
    }
    
    // 操作类型过滤
    if (actionType) {
      logs = logs.filter(log => log.actionType === actionType);
    }
    
    // 目标类型过滤
    if (targetType) {
      logs = logs.filter(log => log.targetType === targetType);
    }
    
    // 分页
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
    const endIndex = startIndex + parseInt(pageSize);
    const paginatedLogs = logs.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      data: {
        items: paginatedLogs,
        total: logs.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}

// 客户数据处理函数
function handleCustomers(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (id) {
      const customer = mockData.getCustomerById(id);
      if (customer) {
        res.status(200).json({
          success: true,
          data: customer
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }
    } else {
      res.status(200).json({
        success: true,
        data: {
          items: mockData.customers,
          total: mockData.getCustomersCount()
        }
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}

// 设施数据处理函数
function handleFacilities(req, res) {
  if (req.method === 'GET') {
    const { id, status } = req.query;
    
    if (id) {
      const facility = mockData.getFacilityById(id);
      if (facility) {
        res.status(200).json({
          success: true,
          data: facility
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Facility not found'
        });
      }
    } else {
      let facilities = mockData.facilities;
      
      if (status) {
        facilities = mockData.getFacilitiesByStatus(status);
      }
      
      res.status(200).json({
        success: true,
        data: {
          items: facilities,
          total: facilities.length
        }
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}

// 权限矩阵处理函数
function handlePermissionMatrix(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: mockData.permissionMatrix
    });
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}

// 用户页面处理函数
function handleUserPages(req, res) {
  if (req.method === 'GET') {
    const { userId, status, pageType } = req.query;
    
    let pages = mockData.userPages;
    
    if (userId) {
      pages = mockData.getUserPagesByUserId(userId);
    }
    
    if (status) {
      pages = pages.filter(page => page.status === status);
    }
    
    if (pageType) {
      pages = pages.filter(page => page.pageType === pageType);
    }
    
    res.status(200).json({
      success: true,
      data: {
        items: pages,
        total: pages.length
      }
    });
  } else {
    res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}