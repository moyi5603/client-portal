# Vercel Deployment Guide

## Current Status
The application has been configured for Vercel deployment with both frontend and backend support.

## Configuration Files
- `vercel.json` - Deployment configuration
- `api/*.js` - Serverless functions for backend API
- `client/dist/` - Built frontend files

## Deployment Steps

1. **GitHub Repository**: https://github.com/moyi5603/client-portal
2. **Branch**: `stable-version` (contains the stable deployment-ready code)

## Vercel Configuration
The `vercel.json` file is configured to:
- Build the React frontend from `client/` directory
- Serve API functions from `api/` directory
- Route `/api/*` requests to serverless functions
- Route all other requests to the React SPA

## API Endpoints
- `/api/auth` - Authentication (login: admin/admin123)
- `/api/menus` - Menu management
- `/api/roles` - Role management  
- `/api/accounts` - Account management
- `/api/test` - API health check

## Local Development
```bash
# Install dependencies
npm install
cd client && npm install

# Run development server
npm run dev
```

## Build for Production
```bash
# Build both frontend and backend
npm run build
```

## Troubleshooting
If deployment fails:
1. Check Vercel build logs
2. Ensure `client/dist/index.html` exists after build
3. Verify API functions are in `api/` directory
4. Check that all dependencies are listed in package.json files

## Login Credentials
- Username: `admin`
- Password: `admin123`