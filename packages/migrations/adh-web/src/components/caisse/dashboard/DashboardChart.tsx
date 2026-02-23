import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/stores/dashboardStore';
import type { DailyActivity } from '@/types/notification';
import type { DashboardChartProps } from './types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

function Bar({
  item,
  maxTransactions,
}: {
  item: DailyActivity;
  maxTransactions: number;
}) {
  const [hovering, setHovering] = useState(false);
  const heightPercent = maxTransactions > 0 ? (item.transactions / maxTransactions) * 100 : 0;

  return (
    <div
      className="flex flex-col items-center gap-1 flex-1 min-w-0 relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="w-full h-40 flex items-end justify-center">
        <div
          className={cn(
            'w-full max-w-[28px] rounded-t transition-all',
            item.transactions > 0 ? 'bg-primary hover:bg-primary-dark' : 'bg-gray-200',
          )}
          style={{ height: `${Math.max(heightPercent, 2)}%` }}
        />
      </div>
      <span className="text-[10px] text-on-surface/50 truncate">
        {item.heure.slice(0, 5)}
      </span>

      {hovering && item.transactions > 0 && (
        <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded-md px-3 py-2 whitespace-nowrap z-10 shadow-lg">
          <p className="font-medium">{item.heure}</p>
          <p>{item.transactions} transaction{item.transactions > 1 ? 's' : ''}</p>
          <p>{formatCurrency(item.montant)}</p>
        </div>
      )}
    </div>
  );
}

export function DashboardChart({ className }: DashboardChartProps) {
  const dailyActivity = useDashboardStore((s) => s.dailyActivity);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const loadDailyActivity = useDashboardStore((s) => s.loadDailyActivity);

  useEffect(() => {
    loadDailyActivity();
  }, [loadDailyActivity]);

  if (isLoading && dailyActivity.length === 0) {
    return (
      <div className={cn('bg-surface border border-border rounded-lg p-4', className)}>
        <div className="h-4 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const maxTransactions = Math.max(...dailyActivity.map((a) => a.transactions), 1);

  return (
    <div className={cn('bg-surface border border-border rounded-lg p-4', className)}>
      <h3 className="text-sm font-medium text-on-surface/60 mb-4">
        Activite du jour
      </h3>
      {dailyActivity.length === 0 ? (
        <p className="text-sm text-on-surface/40 text-center py-8">
          Aucune activite enregistree
        </p>
      ) : (
        <div className="flex items-end gap-1">
          {dailyActivity.map((item) => (
            <Bar
              key={item.heure}
              item={item}
              maxTransactions={maxTransactions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
