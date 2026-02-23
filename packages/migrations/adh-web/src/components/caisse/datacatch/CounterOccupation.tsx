import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

interface CounterOccupationProps {
  currentCount: number;
  maxCapacity: number;
  waitingCount?: number;
}

export function CounterOccupation({
  currentCount,
  maxCapacity,
  waitingCount = 0,
}: CounterOccupationProps) {
  const ratio = maxCapacity > 0 ? currentCount / maxCapacity : 0;
  const percentage = Math.min(Math.round(ratio * 100), 100);

  const barColor =
    ratio > 0.9
      ? 'bg-danger'
      : ratio > 0.7
        ? 'bg-warning'
        : 'bg-success';

  const textColor =
    ratio > 0.9
      ? 'text-danger'
      : ratio > 0.7
        ? 'text-warning'
        : 'text-success';

  return (
    <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2">
      <Users className={cn('h-4 w-4', textColor)} />
      <div className="flex flex-1 items-center gap-2">
        <span className={cn('text-sm font-medium', textColor)}>
          {currentCount} / {maxCapacity}
        </span>
        <div className="h-2 flex-1 rounded-full bg-surface-dim">
          <div
            className={cn('h-2 rounded-full transition-all', barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {waitingCount > 0 && (
        <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
          {waitingCount} en attente
        </span>
      )}
    </div>
  );
}
