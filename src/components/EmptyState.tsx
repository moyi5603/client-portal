import React from 'react';
import { 
  Inbox, Search, FileSearch, User, Users, Shield, FileText, Menu as MenuIcon, Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { useLocale } from '../contexts/LocaleContext';

type EmptyStateVariant = 
  | 'default'
  | 'search'
  | 'accounts'
  | 'roles'
  | 'permissions'
  | 'audit'
  | 'menus'
  | 'filter';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

const VARIANT_CONFIG: Record<EmptyStateVariant, {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  color: string;
}> = {
  default: {
    icon: <Inbox className="w-12 h-12" />,
    titleKey: 'emptyState.default.title',
    descriptionKey: 'emptyState.default.description',
    color: 'var(--text-secondary)',
  },
  search: {
    icon: <Search className="w-12 h-12" />,
    titleKey: 'emptyState.search.title',
    descriptionKey: 'emptyState.search.description',
    color: 'var(--primary)',
  },
  accounts: {
    icon: <User className="w-12 h-12" />,
    titleKey: 'emptyState.accounts.title',
    descriptionKey: 'emptyState.accounts.description',
    color: 'var(--primary)',
  },
  roles: {
    icon: <Users className="w-12 h-12" />,
    titleKey: 'emptyState.roles.title',
    descriptionKey: 'emptyState.roles.description',
    color: 'var(--primary)',
  },
  permissions: {
    icon: <Shield className="w-12 h-12" />,
    titleKey: 'emptyState.permissions.title',
    descriptionKey: 'emptyState.permissions.description',
    color: 'var(--primary)',
  },
  audit: {
    icon: <FileText className="w-12 h-12" />,
    titleKey: 'emptyState.audit.title',
    descriptionKey: 'emptyState.audit.description',
    color: 'var(--primary)',
  },
  menus: {
    icon: <MenuIcon className="w-12 h-12" />,
    titleKey: 'emptyState.menus.title',
    descriptionKey: 'emptyState.menus.description',
    color: 'var(--primary)',
  },
  filter: {
    icon: <FileSearch className="w-12 h-12" />,
    titleKey: 'emptyState.filter.title',
    descriptionKey: 'emptyState.filter.description',
    color: 'var(--warning)',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  actionText,
  onAction,
  showAction = false,
}) => {
  const { t } = useLocale();
  const config = VARIANT_CONFIG[variant];

  return (
    <div className="py-16 text-center flex flex-col items-center gap-4">
      {/* Illustrated Icon */}
      <div 
        className="w-30 h-30 rounded-full flex items-center justify-center mb-2"
        style={{
          width: 120,
          height: 120,
          background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}05 100%)`,
        }}
      >
        <span style={{ color: config.color, opacity: 0.8 }}>
          {config.icon}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-lg font-medium text-foreground m-0">
        {title || t(config.titleKey) || 'No Data'}
      </h4>

      {/* Description */}
      <p className="text-sm text-muted max-w-[300px] leading-relaxed m-0">
        {description || t(config.descriptionKey) || 'There is no data to display.'}
      </p>

      {/* Action Button */}
      {showAction && onAction && (
        <Button 
          onClick={onAction}
          className="mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          {actionText || t('common.create')}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
