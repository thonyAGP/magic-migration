import { useCallback, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ReglementDialogProps, ReglementLine } from '../transaction/types';

const MOYENS_PAIEMENT = [
  { code: 'ESP', libelle: 'Especes', type: 'especes' as const },
  { code: 'CB', libelle: 'Carte bancaire', type: 'carte' as const },
  { code: 'CHQ', libelle: 'Cheque', type: 'cheque' as const },
  { code: 'VIR', libelle: 'Virement', type: 'virement' as const },
  { code: 'AUT', libelle: 'Autre', type: 'autre' as const },
];

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(
    value,
  );

export function ReglementDialog({
  open,
  onOpenChange,
  totalTransaction,
  devise,
  onValidate,
}: ReglementDialogProps) {
  const [reglements, setReglements] = useState<ReglementLine[]>(
    MOYENS_PAIEMENT.map((m) => ({
      moyenCode: m.code,
      moyenLibelle: m.libelle,
      montant: 0,
    })),
  );

  const totalRegle = useMemo(
    () => reglements.reduce((sum, r) => sum + r.montant, 0),
    [reglements],
  );

  const reste = totalTransaction - totalRegle;

  const renduMonnaie = useMemo(() => {
    const especes = reglements.find((r) => r.moyenCode === 'ESP');
    if (!especes || especes.montant <= 0) return 0;
    const autresTotal = reglements
      .filter((r) => r.moyenCode !== 'ESP')
      .reduce((sum, r) => sum + r.montant, 0);
    const resteApresAutres = totalTransaction - autresTotal;
    return Math.max(0, especes.montant - resteApresAutres);
  }, [reglements, totalTransaction]);

  const isValid = Math.abs(reste) < 0.01 || totalRegle >= totalTransaction;

  const handleMontantChange = useCallback(
    (code: string, value: number) => {
      setReglements((prev) =>
        prev.map((r) => (r.moyenCode === code ? { ...r, montant: value } : r)),
      );
    },
    [],
  );

  const handleValidate = useCallback(() => {
    const used = reglements.filter((r) => r.montant > 0);
    onValidate(used);
  }, [reglements, onValidate]);

  const handleAutoFill = useCallback(
    (code: string) => {
      const othersTotal = reglements
        .filter((r) => r.moyenCode !== code)
        .reduce((sum, r) => sum + r.montant, 0);
      const remaining = Math.max(0, totalTransaction - othersTotal);
      handleMontantChange(code, Math.round(remaining * 100) / 100);
    },
    [reglements, totalTransaction, handleMontantChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reglement</DialogTitle>
          <DialogDescription>
            Total a regler : {formatCurrency(totalTransaction, devise)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {MOYENS_PAIEMENT.map((moyen) => {
            const reglement = reglements.find(
              (r) => r.moyenCode === moyen.code,
            );
            return (
              <div key={moyen.code} className="flex items-center gap-3">
                <Label className="w-32 text-right">{moyen.libelle}</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={reglement?.montant || ''}
                  onChange={(e) =>
                    handleMontantChange(
                      moyen.code,
                      Number(e.target.value) || 0,
                    )
                  }
                  className="w-32 text-right"
                  placeholder="0,00"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAutoFill(moyen.code)}
                  className="text-xs"
                >
                  Solde
                </Button>
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
                isValid ? 'text-success' : 'text-danger',
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
          {renduMonnaie > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-muted">Rendu monnaie</span>
              <span className="font-bold text-warning">
                {formatCurrency(renduMonnaie, devise)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleValidate} disabled={!isValid}>
            Valider reglement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
