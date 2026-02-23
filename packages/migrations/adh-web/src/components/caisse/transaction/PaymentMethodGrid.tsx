import { useCallback, useState } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { MoyenPaiementCatalog, SelectedMOP } from '@/types/transaction-lot2';
import type { PaymentSide } from '@/types/transaction';
import { BilateraleDialog } from './BilateraleDialog';

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
  const [bilateraleOpen, setBilateraleOpen] = useState(false);
  const [bilateraleMop, setBilateraleMop] = useState<MoyenPaiementCatalog | null>(null);

  const totalRegle = selectedMOP.reduce((sum, m) => sum + m.montant, 0);
  const reste = totalTransaction - totalRegle;

  const handleAutoFill = useCallback(
    (code: string) => {
      if (paymentSide === 'bilateral') {
        const mop = catalog.find((m) => m.code === code);
        if (mop) {
          setBilateraleMop(mop);
          setBilateraleOpen(true);
        }
        return;
      }
      const othersTotal = selectedMOP
        .filter((m) => m.code !== code)
        .reduce((sum, m) => sum + m.montant, 0);
      const remaining = Math.max(0, totalTransaction - othersTotal);
      onAddMOP(code, Math.round(remaining * 100) / 100);
    },
    [selectedMOP, totalTransaction, onAddMOP, paymentSide, catalog],
  );

  const handleMontantChange = useCallback(
    (code: string, value: number) => {
      if (paymentSide === 'bilateral') {
        const mop = catalog.find((m) => m.code === code);
        if (mop && value > 0) {
          setBilateraleMop(mop);
          setBilateraleOpen(true);
          return;
        }
      }
      if (value <= 0) {
        onRemoveMOP(code);
      } else {
        onAddMOP(code, value);
      }
    },
    [onAddMOP, onRemoveMOP, paymentSide, catalog],
  );

  const handleBilateraleValidate = useCallback(
    (partie1: number, partie2: number) => {
      if (!bilateraleMop) return;
      onAddMOP(bilateraleMop.code, partie1);
      onAddMOP(`${bilateraleMop.code}_P2`, partie2);
      setBilateraleOpen(false);
      setBilateraleMop(null);
    },
    [bilateraleMop, onAddMOP],
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
          const selectedP2 = selectedMOP.find((m) => m.code === `${mop.code}_P2`);
          return (
            <div key={mop.code}>
              <div className="flex items-center gap-3">
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
              {selectedP2 && (
                <div className="flex items-center gap-3 ml-4 mt-1">
                  <Label className="w-32 text-right text-xs text-on-surface-muted">
                    Partie 2
                  </Label>
                  <div className="flex h-7 items-center justify-end rounded-md bg-surface-dim px-3 text-xs font-medium w-32">
                    {formatCurrency(selectedP2.montant, devise)}
                  </div>
                </div>
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

      {/* Bilaterale Dialog */}
      <BilateraleDialog
        open={bilateraleOpen}
        onOpenChange={setBilateraleOpen}
        totalRestant={Math.max(0, reste)}
        devise={devise}
        mopLibelle={bilateraleMop?.libelle ?? ''}
        onValidate={handleBilateraleValidate}
      />
    </div>
  );
}
