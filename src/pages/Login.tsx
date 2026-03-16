import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Building2, Sun, Moon, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';

const Login: React.FC = () => {
  const { t } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: 'admin',
    username: 'admin',
    password: 'admin123'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const isDark = theme === 'dark';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.tenantId) newErrors.tenantId = t('login.tenantIdRequired');
    if (!formData.username) newErrors.username = t('login.usernameRequired');
    if (!formData.password) newErrors.password = t('login.passwordRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const success = await login(formData.username, formData.password, formData.tenantId);
    setLoading(false);
    if (success) {
      navigate('/accounts');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div 
      style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '16px',
        position: 'relative',
        background: isDark 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #753BBD 0%, #5B2D94 50%, #9561D0 100%)',
      }}
    >
      {/* Decorative background pattern */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle at 25% 25%, ${isDark ? 'rgba(117, 59, 189, 0.1)' : 'rgba(255, 255, 255, 0.1)'} 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, ${isDark ? 'rgba(249, 115, 22, 0.1)' : 'rgba(255, 255, 255, 0.05)'} 0%, transparent 50%)`,
        }}
      />
      
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontSize: 20,
          border: 'none',
          cursor: 'pointer',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          transition: 'background 0.2s',
        }}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        {isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}
      </button>

      {/* Login Card */}
      <div 
        style={{ 
          width: '100%',
          maxWidth: 420,
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: isDark ? 'var(--bg-secondary)' : 'var(--bg-primary)',
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div 
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #5B2D94 100%)',
              boxShadow: '0 8px 24px rgba(117, 59, 189, 0.3)',
            }}
          >
            <span style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 700 }}>CP</span>
          </div>
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 700,
            color: 'var(--primary)',
            margin: '0 0 8px 0',
          }}>
            {t('login.title')}
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: 16,
            margin: 0,
          }}>
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {/* Tenant ID Field */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <Building2 
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  width: 16, 
                  height: 16, 
                  color: 'var(--text-placeholder)',
                  zIndex: 1,
                }} 
              />
              <Input
                id="tenantId"
                placeholder={t('login.tenantId')}
                value={formData.tenantId}
                onChange={(e) => handleChange('tenantId', e.target.value)}
                style={{ paddingLeft: 40, height: 48 }}
              />
            </div>
            {errors.tenantId && <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: 4 }}>{errors.tenantId}</p>}
          </div>

          {/* Username Field */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <User 
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  width: 16, 
                  height: 16, 
                  color: 'var(--text-placeholder)',
                  zIndex: 1,
                }} 
              />
              <Input
                id="username"
                placeholder={t('login.username')}
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                style={{ paddingLeft: 40, height: 48 }}
              />
            </div>
            {errors.username && <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: 4 }}>{errors.username}</p>}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ position: 'relative' }}>
              <Lock 
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  width: 16, 
                  height: 16, 
                  color: 'var(--text-placeholder)',
                  zIndex: 1,
                }} 
              />
              <Input
                id="password"
                type="password"
                placeholder={t('login.password')}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                style={{ paddingLeft: 40, height: 48 }}
              />
            </div>
            {errors.password && <p style={{ color: 'var(--danger)', fontSize: 14, marginTop: 4 }}>{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              height: 48,
              fontSize: 16,
              fontWeight: 500,
              background: 'linear-gradient(135deg, var(--primary) 0%, #5B2D94 100%)',
              boxShadow: '0 4px 12px rgba(117, 59, 189, 0.3)',
              border: 'none',
              borderRadius: 6,
              color: '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading && <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />}
            {t('login.loginButton')}
          </Button>
        </form>

        {/* Demo Info */}
        <div 
          style={{
            marginTop: 24,
            textAlign: 'center',
            fontSize: 12,
            padding: 16,
            borderRadius: 8,
            color: 'var(--text-secondary)',
            background: isDark ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
          }}
        >
          <p style={{ margin: 0 }}>{t('login.testAccount')}</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
      }}>
        © 2025 Client Portal. Based on Item Design System.
      </div>

      {/* Keyframes for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
