import * as React from 'react';
import { cn } from '../../lib/utils';
import { FileX, Search, Users, Shield, FileText, Menu } from 'lucide-react';
import { Button } from './button';
import './empty.css';

type EmptyVariant = 'default' | 'search' | 'accounts' | 'roles' | 'permissions' | 'audit' | 'menus' | 'filter';

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

const VARIANT_CONFIG: Record<EmptyVariant, { icon: React.ReactNode; titleKey: string; descKey: string }> = {
  default: {
    icon: <FileX size={48} strokeWidth={1.5} />,
    titleKey: 'emptyState.default.title',
    descKey: 'emptyState.default.description',
  },
  search: {
    icon: <Search size={48} strokeWidth={1.5} />,
    titleKey: 'emptyState.search.title',
    descKey: 'emptyState.search.description',
  },
  accounts: {
    icon: <Users size={48} strokeWidth={1.5} />,
    titleKey: 'emptyState.accounts.title',
    descKey: 'emptyState.accounts.description',
  },
  roles: {
    icon: <Shield size={48} strokeWidth={1.5} />,
    titleKey: 'emptyState.roles.title',
    descKey: 'emptyState.roles.description',
  },
  permissions: {
    icon: <Shield size={48} strokeWidth={1.5} />,
    titleKey: 'emptyState.permissions.title',
    descKey: 'emptyState.permissions.description',
  },
  audit: {
    icon: <FileText size={48} strokeWidth={1.5} />,
    titleKey: 'emptyState.audit.title',
    descKey: 'emptyState.audit.description',
  },
  menus: {
    icon: <Menu size={48} strokeWidth={1.5} />,
    titleKey: 'emptyState.menus.title',
    descKey: 'emptyState.menus.description',
  },
  filter: {
    icon: <Search size={48} strokeWidth={1.5} />,
    titleKey: 'emptyState.filter.title',
    descKey: 'emptyState.filter.description',
  },
};

function Empty({
  variant = 'default',
  title,
  description,
  action,
  icon,
  className,
  ...props
}: EmptyProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <div className={cn('ui-empty', className)} {...props}>
      <div className="ui-empty-icon">
        {icon || config.icon}
      </div>
      <h3 className="ui-empty-title">{title || config.titleKey}</h3>
      {description && (
        <p className="ui-empty-description">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="ui-empty-action">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { Empty, type EmptyVariant };

