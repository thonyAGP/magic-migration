import { useCallback, useMemo } from 'react';
import { Minus, Plus, Banknote, Coins } from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DenominationRowProps } from './types';

const formatCurrency = (value: number, devise: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function DenominationRow({
  denomination,
  count,
  onChange,
  readOnly = false,
}: DenominationRowProps) {
  const total = useMemo(
    () => count * denomination.valeur,
    [count, denomination.valeur],
  );

  const handleIncrement = useCallback(() => {
    onChange(count + 1);
  }, [count, onChange]);

  const handleDecrement = useCallback(() => {
    if (count > 0) {
      onChange(count - 1);
    }
  }, [count, onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(0, Math.floor(Number(e.target.value) || 0));
      onChange(value);
    },
    [onChange],
  );

  const Icon = denomination.type === 'billet' ? Banknote : Coins;

  return (
    <div
      className={cn(
        'grid items-center gap-3 rounded-md border border-border px-4 py-2 transition-colors',
        count > 0
          ? 'bg-primary/5 border-primary/30'
          : 'bg-surface hover:bg-surface-dim',
      )}
      style={{ gridTemplateColumns: '28px 1fr 140px 100px' }}
    >
      {/* Type icon + label */}
      <Icon
        className={cn(
          'h-4 w-4',
          denomination.type === 'billet'
            ? 'text-success'
            : 'text-warning',
        )}
        aria-hidden="true"
      />

      {/* Denomination label + unit value */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-on-surface">
          {denomination.libelle}
        </span>
        <span className="text-xs text-on-surface-muted">
          ({formatCurrency(denomination.valeur, denomination.deviseCode)})
        </span>
      </div>

      {/* Quantity input with +/- buttons */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handleDecrement}
          disabled={readOnly || count <= 0}
          aria-label={`Retirer un ${denomination.libelle}`}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          min={0}
          step={1}
          value={count}
          onChange={handleInputChange}
          disabled={readOnly}
          className="h-7 w-16 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={`Quantite ${denomination.libelle}`}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={handleIncrement}
          disabled={readOnly}
          aria-label={`Ajouter un ${denomination.libelle}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Calculated total */}
      <div className="text-right">
        <span
          className={cn(
            'text-sm font-semibold',
            count > 0 ? 'text-primary' : 'text-on-surface-muted',
          )}
        >
          {formatCurrency(total, denomination.deviseCode)}
        </span>
      </div>
    </div>
  );
}
