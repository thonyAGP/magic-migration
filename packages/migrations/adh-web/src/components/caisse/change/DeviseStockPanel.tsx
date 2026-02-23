import { cn } from '@/lib/utils';
import type { DeviseStockPanelProps } from './types';

const formatAmount = (value: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export function DeviseStockPanel({ stock, isLoading = false }: DeviseStockPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-border p-4 space-y-3">
        <div className="h-5 w-32 animate-pulse rounded bg-surface-dim" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-surface-dim" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Stock devises</h3>

      {stock.length === 0 ? (
        <div className="text-sm text-on-surface-muted py-4 text-center">
          Aucun stock
        </div>
      ) : (
        <div className="space-y-1">
          {stock.map((item) => (
            <div
              key={item.deviseCode}
              className={cn(
                'flex items-center justify-between rounded px-3 py-2 text-sm',
                item.montant > 0 ? 'bg-success/10' : 'bg-surface',
              )}
            >
              <div>
                <span className="font-medium">{item.deviseCode}</span>
                <span className="ml-2 text-on-surface-muted">{item.deviseLibelle}</span>
              </div>
              <div className="text-right">
                <span className="font-medium">{formatAmount(item.montant)}</span>
                <span className="ml-2 text-xs text-on-surface-muted">
                  ({item.nbOperations} op.)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
