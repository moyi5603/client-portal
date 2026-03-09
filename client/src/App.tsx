import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { Toaster } from './components/ui/sonner';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import AccountManagement from './pages/AccountManagement';
import RoleManagement from './pages/RoleManagement';
import RoleManagement2 from './pages/RoleManagement2';
import RoleManagement3 from './pages/RoleManagement3';
import MenuManagement from './pages/MenuManagement';
import PermissionView from './pages/PermissionView';
import PermissionView2 from './pages/PermissionView2';
import AuditLog from './pages/AuditLog';
import PortalAdminAccountManagement from './pages/PortalAdminAccountManagement';
import UserPageManagement from './pages/UserPageManagement';
import PageDesigner from './pages/PageDesigner';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/accounts" replace />} />
                <Route path="accounts" element={<AccountManagement />} />
                <Route path="roles" element={<RoleManagement />} />
                <Route path="roles-2" element={<RoleManagement2 />} />
                <Route path="roles-2/create" element={<RoleManagement2 />} />
                <Route path="roles-2/:id/edit" element={<RoleManagement2 />} />
                <Route path="roles-3" element={<RoleManagement3 />} />
                <Route path="roles-3/create" element={<RoleManagement3 />} />
                <Route path="roles-3/:id/edit" element={<RoleManagement3 />} />
                <Route path="permissions" element={<PermissionView />} />
                <Route path="permissions-2" element={<PermissionView2 />} />
                <Route path="audit-logs" element={<AuditLog />} />
                <Route path="portal-admin/accounts" element={<PortalAdminAccountManagement />} />
                <Route path="portal-admin/roles" element={<RoleManagement />} />
                <Route path="portal-admin/menus" element={<MenuManagement />} />
                <Route path="portal-admin/permissions" element={<PermissionView />} />
                <Route path="portal-admin/audit-logs" element={<AuditLog />} />
                <Route path="user-pages" element={<UserPageManagement />} />
                <Route path="page-designer" element={<PageDesigner />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
};

export default App;
