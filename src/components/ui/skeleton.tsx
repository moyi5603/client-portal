import * as React from 'react';
import { cn } from '../../lib/utils';
import './skeleton.css';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ui-skeleton', className)} {...props} />;
}

// Pre-built skeleton components for common use cases
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('ui-skeleton-text', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="ui-skeleton-line"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('ui-skeleton-card', className)}>
      <Skeleton className="ui-skeleton-card-header" />
      <div className="ui-skeleton-card-body">
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('ui-skeleton-table', className)}>
      <div className="ui-skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="ui-skeleton-table-cell" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="ui-skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="ui-skeleton-table-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <Skeleton className={cn('ui-skeleton-avatar', `ui-skeleton-avatar--${size}`, className)} />;
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar };

