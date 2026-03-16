import React from 'react';
import { Skeleton } from './ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showPagination?: boolean;
}

/**
 * Loading skeleton for table components
 * Uses design system spacing tokens
 */
const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 5,
  showPagination = true,
}) => {
  return (
    <div className="p-4">
      {/* Table Header */}
      <div 
        className="gap-4 py-4 border-b mb-2"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          borderColor: 'var(--border-color)',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton 
            key={`header-${i}`} 
            className="h-4 w-4/5"
          />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div 
          key={`row-${rowIdx}`}
          className="gap-4 py-4 border-b"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            borderColor: 'var(--border-color)',
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton 
              key={`cell-${rowIdx}-${colIdx}`} 
              className="h-4"
              style={{ 
                width: colIdx === 0 ? '60%' : colIdx === columns - 1 ? '40%' : '80%' 
              }} 
            />
          ))}
        </div>
      ))}

      {/* Pagination */}
      {showPagination && (
        <div className="flex justify-between items-center mt-6 py-2">
          <Skeleton className="h-4 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Card skeleton for loading states
 */
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 4 }) => {
  return (
    <div className="p-4">
      <Skeleton className="h-6 w-2/5 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 mb-2 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

/**
 * Filter section skeleton
 */
export const FilterSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div 
      className="gap-4 p-4"
      style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${fields}, 1fr)`,
      }}
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-1/3 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
