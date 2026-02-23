import { useMemo, useCallback } from 'react';
import { Banknote, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DenominationRow } from './DenominationRow';
import type { DenominationGridProps } from './types';

const formatCurrency = (value: number, devise: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function DenominationGrid({
  deviseCode,
  denominations,
  counting,
  onCountChange,
  readOnly = false,
}: DenominationGridProps) {
  const { billets, pieces } = useMemo(() => {
    const sorted = [...denominations]
      .filter((d) => d.deviseCode === deviseCode)
      .sort((a, b) => b.valeur - a.valeur);

    return {
      billets: sorted.filter((d) => d.type === 'billet'),
      pieces: sorted.filter((d) => d.type === 'piece'),
    };
  }, [denominations, deviseCode]);

  const totalDevise = useMemo(() => {
    let total = 0;
    for (const denom of denominations) {
      if (denom.deviseCode === deviseCode) {
        const qty = counting.get(denom.id) ?? 0;
        total += qty * denom.valeur;
      }
    }
    return total;
  }, [denominations, deviseCode, counting]);

  const handleCountChange = useCallback(
    (denominationId: number, quantite: number) => {
      onCountChange(denominationId, quantite);
    },
    [onCountChange],
  );

  return (
    <div className="space-y-4">
      {/* Billets section */}
      {billets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="h-4 w-4 text-success" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-on-surface">Billets</h4>
          </div>
          <div className="space-y-1">
            {billets.map((denom) => (
              <DenominationRow
                key={denom.id}
                denomination={denom}
                count={counting.get(denom.id) ?? 0}
                onChange={(qty) => handleCountChange(denom.id, qty)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pieces section */}
      {pieces.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-warning" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-on-surface">Pieces</h4>
          </div>
          <div className="space-y-1">
            {pieces.map((denom) => (
              <DenominationRow
                key={denom.id}
                denomination={denom}
                count={counting.get(denom.id) ?? 0}
                onChange={(qty) => handleCountChange(denom.id, qty)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer total */}
      <div
        className={cn(
          'flex items-center justify-between rounded-md border border-border px-4 py-3',
          'bg-surface-dim',
        )}
      >
        <span className="text-sm font-semibold text-on-surface">
          Total {deviseCode}
        </span>
        <span className="text-lg font-bold text-primary">
          {formatCurrency(totalDevise, deviseCode)}
        </span>
      </div>
    </div>
  );
}
