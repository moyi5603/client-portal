import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import AccountManagement from './pages/AccountManagement';
import RoleManagement from './pages/RoleManagement';
import MenuManagement from './pages/MenuManagement';
import PermissionView from './pages/PermissionView';
import AuditLog from './pages/AuditLog';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider, useLocale } from './contexts/LocaleContext';

const { Content } = Layout;

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
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const AppContent: React.FC = () => {
  const { locale } = useLocale();
  
  return (
    <ConfigProvider locale={locale === 'zh-CN' ? zhCN : enUS}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <LocaleProvider>
      <AppContent />
    </LocaleProvider>
  );
};

export default App;

