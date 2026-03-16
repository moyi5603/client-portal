# Vercel Deployment Guide

## Current Status
The application has been configured for Vercel deployment with both frontend and backend support using complete mock data.

## 🎯 Mock Data Features
- **8 Complete Accounts**: 1 main account (admin) + 7 sub-accounts with different roles
- **4 Roles**: Super Administrator, System Administrator, Customer Administrator, Customer Service Representative
- **Complete Menu Structure**: Full hierarchical menu system with all modules
- **5 Audit Log Entries**: Realistic operation history with timestamps
- **4 User Pages**: Custom dashboard and list pages with full configuration
- **Customer & Facility Data**: 4 customers and 5 facilities with relationships
- **Permission Matrix**: Complete role-permission mapping system

## Configuration Files
- `vercel.json` - Deployment configuration
- `api/*.js` - Serverless functions for backend API (11 endpoints)
- `api/mock-data.js` - Complete mock data system
- `client/dist/` - Built frontend files

## Deployment Steps

1. **GitHub Repository**: https://github.com/moyi5603/client-portal
2. **Branch**: `stable-version` (contains the stable deployment-ready code)
3. **Vercel Dashboard**: Import project from GitHub
4. **Auto-Deploy**: Vercel will automatically detect configuration and deploy

## API Endpoints (All with Mock Data)
- `/api/auth` - Authentication (login: admin/admin123)
- `/api/accounts` - Account management (CRUD operations)
- `/api/roles` - Role management (CRUD operations)
- `/api/menus` - Menu management (CRUD operations)
- `/api/audit-logs` - Audit logs (query, filter, pagination)
- `/api/user-pages` - User pages (CRUD operations)
- `/api/customers` - Customer data (query)
- `/api/facilities` - Facility data (query)
- `/api/permission-matrix` - Permission matrix (query)
- `/api/test` - API health check

## Testing the Deployment
After deployment, you can test the APIs using:
- **Main Application**: `https://your-domain.vercel.app`
- **API Test Page**: `https://your-domain.vercel.app/api-test.html`
- **Direct API Test**: `https://your-domain.vercel.app/api/test`

## Vercel Configuration
The `vercel.json` file is configured to:
- Build the React frontend from `client/` directory using `@vercel/static-build`
- Serve API functions from `api/` directory using `@vercel/node`
- Route `/api/*` requests to serverless functions
- Route all other requests to the React SPA

## Local Development
```bash
# Install dependencies
npm install
cd client && npm install

# Run development server (with backend)
npm run dev

# Or run frontend only
cd client && npm run dev
```

## Build for Production
```bash
# Build frontend only
cd client && npm run build

# Build both (if needed)
npm run build
```

## Login Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Note**: All mock accounts use the same password

## Available Test Accounts
1. **admin** (MAIN) - Super Administrator
2. **john.smith** (SUB) - System Admin + Customer Admin
3. **jane.doe** (SUB) - Customer Service Representative
4. **mike.johnson** (SUB) - Customer Administrator
5. **sarah.wilson** (SUB) - Customer Service Representative
6. **david.brown** (SUB) - System Administrator
7. **lisa.garcia** (SUB) - Customer Admin + Customer Service Rep
8. **robert.davis** (SUB) - Customer Service Representative

## Features Available After Deployment
- ✅ Complete account management with 8 test accounts
- ✅ Role management with 4 roles and detailed permissions
- ✅ Menu management with full CRUD operations
- ✅ Permission viewing with matrix display
- ✅ Audit log with 5 sample entries and filtering
- ✅ Rich mock data matching local development environment
- ✅ All Portal Admin features fully functional

## Troubleshooting
If deployment fails:
1. Check Vercel build logs in the dashboard
2. Ensure `client/dist/index.html` exists after build
3. Verify API functions are in `api/` directory
4. Test API endpoints using the test page
5. Check that all dependencies are listed in package.json files

## Data Consistency
The mock data is designed to be identical to the local development backend:
- Same account structure and relationships
- Same role permissions and hierarchy  
- Same menu organization and status
- Same audit log format and content
- Same customer-facility mappings