import { useCallback } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { MoyenPaiementCatalog, SelectedMOP } from '@/types/transaction-lot2';
import type { PaymentSide } from '@/types/transaction';

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

interface PaymentMethodGridProps {
  catalog: MoyenPaiementCatalog[];
  selectedMOP: SelectedMOP[];
  paymentSide: PaymentSide;
  totalTransaction: number;
  devise: string;
  onAddMOP: (code: string, montant: number) => void;
  onRemoveMOP: (code: string) => void;
  onTogglePaymentSide: () => void;
  disabled?: boolean;
}

export function PaymentMethodGrid({
  catalog,
  selectedMOP,
  paymentSide,
  totalTransaction,
  devise,
  onAddMOP,
  onRemoveMOP,
  onTogglePaymentSide,
  disabled = false,
}: PaymentMethodGridProps) {
  const totalRegle = selectedMOP.reduce((sum, m) => sum + m.montant, 0);
  const reste = totalTransaction - totalRegle;

  const handleAutoFill = useCallback(
    (code: string) => {
      const othersTotal = selectedMOP
        .filter((m) => m.code !== code)
        .reduce((sum, m) => sum + m.montant, 0);
      const remaining = Math.max(0, totalTransaction - othersTotal);
      onAddMOP(code, Math.round(remaining * 100) / 100);
    },
    [selectedMOP, totalTransaction, onAddMOP],
  );

  const handleMontantChange = useCallback(
    (code: string, value: number) => {
      if (value <= 0) {
        onRemoveMOP(code);
      } else {
        onAddMOP(code, value);
      }
    },
    [onAddMOP, onRemoveMOP],
  );

  return (
    <div className="space-y-4">
      {/* Toggle BI/UNI */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium">Mode paiement :</Label>
        <div className="flex rounded-md border border-border">
          <button
            type="button"
            onClick={() => paymentSide === 'bilateral' && onTogglePaymentSide()}
            disabled={disabled}
            className={cn(
              'px-3 py-1 text-sm rounded-l-md transition-colors',
              paymentSide === 'unilateral'
                ? 'bg-primary text-white'
                : 'bg-surface text-on-surface hover:bg-surface-dim',
            )}
          >
            Unilateral
          </button>
          <button
            type="button"
            onClick={() => paymentSide === 'unilateral' && onTogglePaymentSide()}
            disabled={disabled}
            className={cn(
              'px-3 py-1 text-sm rounded-r-md transition-colors',
              paymentSide === 'bilateral'
                ? 'bg-primary text-white'
                : 'bg-surface text-on-surface hover:bg-surface-dim',
            )}
          >
            Bilateral
          </button>
        </div>
      </div>

      {/* MOP Grid */}
      <div className="space-y-2">
        {catalog.map((mop) => {
          const selected = selectedMOP.find((m) => m.code === mop.code);
          return (
            <div key={mop.code} className="flex items-center gap-3">
              <Label className="w-36 text-right text-sm">{mop.libelle}</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={selected?.montant ?? ''}
                onChange={(e) =>
                  handleMontantChange(mop.code, Number(e.target.value) || 0)
                }
                disabled={disabled}
                className="w-32 text-right"
                placeholder="0,00"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleAutoFill(mop.code)}
                disabled={disabled}
                className="text-xs"
              >
                Solde
              </Button>
              {mop.estTPE && (
                <span className="text-xs text-on-surface-muted">TPE</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="space-y-1 border-t border-border pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-muted">Total regle</span>
          <span
            className={cn(
              'font-medium',
              Math.abs(reste) < 0.01 ? 'text-success' : 'text-danger',
            )}
          >
            {formatCurrency(totalRegle, devise)}
          </span>
        </div>
        {reste > 0.01 && (
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-muted">Reste a regler</span>
            <span className="font-medium text-danger">
              {formatCurrency(reste, devise)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
