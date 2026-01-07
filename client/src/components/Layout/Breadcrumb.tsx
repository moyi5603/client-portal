import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';

interface BreadcrumbItem {
  path: string;
  titleKey: string;
}

const routeMap: Record<string, BreadcrumbItem> = {
  '/accounts': { path: '/accounts', titleKey: 'breadcrumb.accounts' },
  '/roles': { path: '/roles', titleKey: 'breadcrumb.roles' },
  '/roles/create': { path: '/roles/create', titleKey: 'breadcrumb.roleCreate' },
  '/permissions': { path: '/permissions', titleKey: 'breadcrumb.permissions' },
  '/audit-logs': { path: '/audit-logs', titleKey: 'breadcrumb.auditLogs' },
  '/menus': { path: '/menus', titleKey: 'breadcrumb.menus' },
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const { t } = useLocale();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  // Build breadcrumb items
  const breadcrumbItems: { key: string; title: React.ReactNode; isLink: boolean; path?: string }[] = [
    {
      key: 'home',
      title: (
        <span className="flex items-center gap-1">
          <Home className="w-4 h-4" />
          <span>{t('breadcrumb.home')}</span>
        </span>
      ),
      isLink: true,
      path: '/accounts',
    },
  ];

  // Handle dynamic routes like /roles/:id/edit
  let currentPath = '';
  pathSnippets.forEach((snippet, index) => {
    currentPath += `/${snippet}`;
    
    // Check if this is an ID (UUID format or numeric)
    const isId = /^[0-9a-f-]{36}$/.test(snippet) || /^\d+$/.test(snippet);
    
    if (isId) {
      // Skip ID in breadcrumb display, but handle edit route
      if (pathSnippets[index + 1] === 'edit') {
        breadcrumbItems.push({
          key: 'edit',
          title: <span>{t('breadcrumb.roleEdit')}</span>,
          isLink: false,
        });
      }
      return;
    }
    
    if (snippet === 'edit') {
      // Already handled above
      return;
    }

    const routeInfo = routeMap[currentPath];
    if (routeInfo) {
      const isLast = index === pathSnippets.length - 1;
      breadcrumbItems.push({
        key: currentPath,
        title: t(routeInfo.titleKey),
        isLink: !isLast,
        path: routeInfo.path,
      });
    }
  });

  // Don't show breadcrumb if only home
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav 
      className="flex items-center gap-1 text-sm mb-4"
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
          )}
          {item.isLink && item.path ? (
            <Link 
              to={item.path}
              className="text-muted hover:text-primary transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {item.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
