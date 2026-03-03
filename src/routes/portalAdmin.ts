import express from 'express';
import { db } from '../database/models';

const router = express.Router();

// Get all accounts across all tenants (Portal Admin only)
router.get('/accounts', async (req, res) => {
  try {
    // TODO: Add permission check - only Portal Admin users can access this
    
    // Get all accounts without tenant filter
    const accounts = db.getAllAccounts();

    // Filter out specific accounts
    const excludeUsernames = ['mike.johnson', 'sarah.wilson', 'david.brown', 'lisa.garcia'];
    const filteredAccounts = accounts.filter(account => !excludeUsernames.includes(account.username));

    // Build customerFacilityMappings for each account
    const accountsWithMappings = filteredAccounts.map(account => {
      const customerIds = account.customerIds || account.accessibleCustomerIds || [];
      const facilityIds = account.facilityIds || account.accessibleFacilityIds || [];
      
      // Build mappings: each customer gets all facilities
      const customerFacilityMappings = customerIds.map(customerId => ({
        customerId,
        facilityIds: facilityIds
      }));

      return {
        ...account,
        customerFacilityMappings
      };
    });

    // Add mock accounts for different tenants to demonstrate multi-tenant support
    const mockAccounts = [
      {
        id: 'ACC-MOCK-001',
        username: 'multi-tenant-user',
        email: 'multi@example.com',
        phone: '13900000001',
        accountType: 'MAIN', // 主账号
        status: 'ACTIVE',
        tenantId: 'tenant-1',
        tenantIds: ['tenant-1', 'tenant-2', 'tenant-3'],
        roles: ['System Administrator', 'Customer Service Representative'],
        customerIds: ['CUST-001', 'CUST-003', 'CUST-004'],
        facilityIds: ['FAC-001', 'FAC-002', 'FAC-004', 'FAC-006'],
        customerFacilityMappings: [
          { customerId: 'CUST-001', facilityIds: ['FAC-001', 'FAC-002'] },
          { customerId: 'CUST-003', facilityIds: ['FAC-004'] },
          { customerId: 'CUST-004', facilityIds: ['FAC-006'] }
        ],
        subAccounts: [
          {
            id: 'ACC-SUB-001',
            username: 'sub-user-1',
            email: 'sub1@example.com',
            phone: '13900000011',
            accountType: 'SUB', // 子账号
            status: 'ACTIVE',
            tenantId: 'tenant-1',
            roles: ['Customer Service Representative'],
            customerIds: ['CUST-001'],
            facilityIds: ['FAC-001'],
            customerFacilityMappings: [
              { customerId: 'CUST-001', facilityIds: ['FAC-001'] }
            ],
            lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'ACC-SUB-002',
            username: 'sub-user-2',
            email: 'sub2@example.com',
            accountType: 'SUB', // 子账号
            status: 'ACTIVE',
            tenantId: 'tenant-1',
            roles: ['Customer Administrator'],
            customerIds: ['CUST-003'],
            facilityIds: ['FAC-004'],
            customerFacilityMappings: [
              { customerId: 'CUST-003', facilityIds: ['FAC-004'] }
            ],
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ACC-MOCK-002',
        username: 'tenant2-user',
        email: 'user@tenant2.com',
        phone: '13900000002',
        accountType: 'MAIN', // 主账号
        status: 'ACTIVE',
        tenantId: 'tenant-2',
        tenantIds: ['tenant-2'],
        roles: ['Customer Administrator'],
        customerIds: ['CUST-003'],
        facilityIds: ['FAC-004', 'FAC-005'],
        customerFacilityMappings: [
          { customerId: 'CUST-003', facilityIds: ['FAC-004', 'FAC-005'] }
        ],
        lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'ACC-MOCK-003',
        username: 'tenant3-inactive',
        email: 'user@tenant3.com',
        accountType: 'MAIN', // 主账号
        status: 'INACTIVE',
        tenantId: 'tenant-3',
        tenantIds: ['tenant-3'],
        roles: ['Customer Service Representative'],
        customerIds: ['CUST-005'],
        facilityIds: ['FAC-007'],
        customerFacilityMappings: [
          { customerId: 'CUST-005', facilityIds: ['FAC-007'] }
        ],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Combine real accounts with mock accounts
    const allAccounts = [...accountsWithMappings, ...mockAccounts];

    res.json(allAccounts);
  } catch (error: any) {
    console.error('Error fetching portal admin accounts:', error);
    res.status(500).json({ message: 'Failed to fetch accounts', error: error.message });
  }
});

// Get all tenants
router.get('/tenants', async (req, res) => {
  try {
    // Get all accounts and extract unique tenants
    const accounts = db.getAllAccounts();
    const tenantMap = new Map<string, { id: string; code: string; name: string }>();
    
    accounts.forEach(account => {
      if (account.tenantId && !tenantMap.has(account.tenantId)) {
        tenantMap.set(account.tenantId, {
          id: account.tenantId,
          code: account.tenantId,
          name: account.tenantId,
        });
      }
    });

    // Add mock tenants
    const mockTenants = [
      { id: 'tenant-1', code: 'tenant-1', name: 'tenant-1' },
      { id: 'tenant-2', code: 'tenant-2', name: 'tenant-2' },
      { id: 'tenant-3', code: 'tenant-3', name: 'tenant-3' }
    ];

    mockTenants.forEach(tenant => {
      if (!tenantMap.has(tenant.id)) {
        tenantMap.set(tenant.id, tenant);
      }
    });

    const tenants = Array.from(tenantMap.values());
    res.json(tenants);
  } catch (error: any) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ message: 'Failed to fetch tenants', error: error.message });
  }
});

// Get account by ID (cross-tenant)
router.get('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const account = db.getAccount(id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json(account);
  } catch (error: any) {
    console.error('Error fetching account:', error);
    res.status(500).json({ message: 'Failed to fetch account', error: error.message });
  }
});

// Delete account (cross-tenant)
router.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const account = db.getAccount(id);

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const success = db.deleteAccount(id);
    
    if (success) {
      res.json({ message: 'Account deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete account' });
    }
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});

// Update account (cross-tenant)
router.put('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const account = db.getAccount(id);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Update account
    const updatedAccount = db.updateAccount(id, updates);
    
    if (updatedAccount) {
      res.json(updatedAccount);
    } else {
      res.status(500).json({ message: 'Failed to update account' });
    }
  } catch (error: any) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'Failed to update account', error: error.message });
  }
});

// Create sub-account for a main account
router.post('/accounts/:id/sub-accounts', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, password, status, accountType } = req.body;

    const parentAccount = db.getAccount(id);
    if (!parentAccount) {
      return res.status(404).json({ message: 'Parent account not found' });
    }

    // Create sub-account (mock implementation)
    // 默认为子账号类型
    const subAccount = {
      id: `SUB-${Date.now()}`,
      username,
      email,
      phone: phone || undefined,
      accountType: accountType || 'SUB', // 默认为子账号
      status: status || 'ACTIVE',
      tenantId: parentAccount.tenantId,
      roles: [],
      customerIds: [],
      facilityIds: [],
      createdAt: new Date().toISOString()
    };

    // In a real implementation, you would save this to the database
    // For now, we'll just return success
    res.json({ success: true, data: subAccount });
  } catch (error: any) {
    console.error('Error creating sub-account:', error);
    res.status(500).json({ message: 'Failed to create sub-account', error: error.message });
  }
});

export default router;
