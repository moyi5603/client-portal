import * as React from 'react';
import { cn } from '../../lib/utils';
import './badge.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div className={cn('ui-badge', `ui-badge--${variant}`, className)} {...props} />
  );
}

export { Badge };

