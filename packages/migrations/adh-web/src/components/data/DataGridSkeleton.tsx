import { cn } from '@/lib/utils';

interface DataGridSkeletonProps {
  rows?: number;
  columns?: number;
  compact?: boolean;
}

export function DataGridSkeleton({
  rows = 5,
  columns = 4,
  compact = false,
}: DataGridSkeletonProps) {
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="w-full animate-pulse">
      {/* Header skeleton */}
      <div className="flex border-b border-border-strong bg-surface-dim">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className={cn(cellPadding, 'flex-1')}>
            <div className="h-4 w-20 rounded bg-border" />
          </div>
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex border-b border-border">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div key={colIdx} className={cn(cellPadding, 'flex-1')}>
              <div
                className="h-4 rounded bg-border/60"
                style={{ width: `${50 + Math.random() * 40}%` }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
