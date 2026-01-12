import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import AccountManagement from './pages/AccountManagement';
import RoleManagement from './pages/RoleManagement';
import MenuManagement from './pages/MenuManagement';
import PermissionView from './pages/PermissionView';
import AuditLog from './pages/AuditLog';
import SimpleEditor from './pages/SimpleEditor';
import SimpleCodeEditor from './pages/SimpleCodeEditor';
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
                <Route path="/menus" element={<MenuManagement />} />
                <Route path="/permissions" element={<PermissionView />} />
                <Route path="/audit-logs" element={<AuditLog />} />
                <Route path="/editor" element={<SimpleEditor />} />
                <Route path="/code-editor" element={<SimpleCodeEditor />} />
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
