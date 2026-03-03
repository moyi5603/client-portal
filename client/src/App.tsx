import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import AccountManagement from './pages/AccountManagement';
import RoleManagement from './pages/RoleManagement';
import RoleManagement2 from './pages/RoleManagement2';
import MenuManagement from './pages/MenuManagement';
import PermissionView from './pages/PermissionView';
import PermissionView2 from './pages/PermissionView2';
import AuditLog from './pages/AuditLog';
import SimpleEditor from './pages/SimpleEditor';
import SimpleCodeEditor from './pages/SimpleCodeEditor';
import PageDesigner from './pages/PageDesigner';
import UserPageManagement from './pages/UserPageManagement';
import PortalAdminAccountManagement from './pages/PortalAdminAccountManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/accounts" />} />
                <Route path="/accounts" element={<AccountManagement />} />
                <Route path="/roles" element={<RoleManagement />} />
                <Route path="/roles/create" element={<RoleManagement />} />
                <Route path="/roles/:id/edit" element={<RoleManagement />} />
                <Route path="/roles-2" element={<RoleManagement2 />} />
                <Route path="/roles-2/create" element={<RoleManagement2 />} />
                <Route path="/roles-2/:id/edit" element={<RoleManagement2 />} />
                <Route path="/menus" element={<MenuManagement />} />
                <Route path="/permissions" element={<PermissionView />} />
                <Route path="/permissions-2" element={<PermissionView2 />} />
                <Route path="/audit-logs" element={<AuditLog />} />
                <Route path="/portal-admin/accounts" element={<PortalAdminAccountManagement />} />
                <Route path="/portal-admin/roles" element={<RoleManagement2 />} />
                <Route path="/portal-admin/roles/create" element={<RoleManagement2 />} />
                <Route path="/portal-admin/roles/:id/edit" element={<RoleManagement2 />} />
                <Route path="/portal-admin/permissions" element={<PermissionView2 />} />
                <Route path="/portal-admin/audit-logs" element={<AuditLog />} />
                <Route path="/editor" element={<SimpleEditor />} />
                <Route path="/code-editor" element={<SimpleCodeEditor />} />
                <Route path="/page-designer" element={<PageDesigner />} />
                <Route path="/user-pages" element={<UserPageManagement />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AppContent />
      </LocaleProvider>
    </ThemeProvider>
  );
};

export default App;
