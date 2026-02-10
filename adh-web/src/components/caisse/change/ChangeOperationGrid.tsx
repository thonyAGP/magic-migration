import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { ChangeOperationGridProps } from './types';

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function ChangeOperationGrid({
  operations,
  summary,
  onCancel,
  isLoading = false,
}: ChangeOperationGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-surface-dim" />
        ))}
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-border p-8 text-sm text-on-surface-muted">
        Aucune operation de change
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-dim">
              <th className="px-3 py-2 text-left font-medium">Date</th>
              <th className="px-3 py-2 text-left font-medium">Heure</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-left font-medium">Devise</th>
              <th className="px-3 py-2 text-right font-medium">Montant</th>
              <th className="px-3 py-2 text-right font-medium">Taux</th>
              <th className="px-3 py-2 text-right font-medium">Contre-valeur</th>
              <th className="px-3 py-2 text-left font-medium">Operateur</th>
              <th className="px-3 py-2 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr
                key={op.id}
                className={cn(
                  'border-b border-border last:border-b-0',
                  op.annule && 'opacity-60',
                )}
              >
                <td className={cn('px-3 py-2', op.annule && 'line-through')}>{op.date}</td>
                <td className={cn('px-3 py-2', op.annule && 'line-through')}>{op.heure}</td>
                <td className="px-3 py-2">
                  {op.annule ? (
                    <Badge variant="destructive">Annule</Badge>
                  ) : op.type === 'achat' ? (
                    <Badge variant="success">Achat</Badge>
                  ) : (
                    <Badge variant="default">Vente</Badge>
                  )}
                </td>
                <td className={cn('px-3 py-2', op.annule && 'line-through')}>
                  {op.deviseCode} - {op.deviseLibelle}
                </td>
                <td className={cn('px-3 py-2 text-right', op.annule && 'line-through')}>
                  {op.montant.toFixed(2)}
                </td>
                <td className={cn('px-3 py-2 text-right', op.annule && 'line-through')}>
                  {op.taux.toFixed(4)}
                </td>
                <td className={cn('px-3 py-2 text-right font-medium', op.annule && 'line-through')}>
                  {formatCurrency(op.contreValeur)}
                </td>
                <td className={cn('px-3 py-2', op.annule && 'line-through')}>{op.operateur}</td>
                <td className="px-3 py-2 text-center">
                  {!op.annule && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCancel(op.id)}
                      aria-label={`Annuler operation ${op.id}`}
                    >
                      <X className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summary && (
        <div className="flex items-center gap-6 rounded-md bg-surface-dim px-4 py-2 text-sm">
          <span className="text-on-surface-muted">
            Operations : <span className="font-medium text-on-surface">{summary.nbOperations}</span>
          </span>
          <span className="text-on-surface-muted">
            Total achats : <span className="font-medium text-success">{formatCurrency(summary.totalAchats)}</span>
          </span>
          <span className="text-on-surface-muted">
            Total ventes : <span className="font-medium text-primary">{formatCurrency(summary.totalVentes)}</span>
          </span>
        </div>
      )}
    </div>
  );
}
