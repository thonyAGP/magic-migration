import { useState, useCallback, useMemo } from 'react';
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
import type { BilateraleDialogProps } from './types';

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function BilateraleDialog({
  open,
  onOpenChange,
  totalRestant,
  devise,
  mopLibelle,
  onValidate,
}: BilateraleDialogProps) {
  const [partie1, setPartie1] = useState<number>(0);

  const partie2 = useMemo(
    () => Math.round((totalRestant - partie1) * 100) / 100,
    [totalRestant, partie1],
  );

  const isValid = partie1 > 0 && partie1 < totalRestant && partie2 > 0;

  const handleValidate = useCallback(() => {
    if (isValid) {
      onValidate(partie1, partie2);
      setPartie1(0);
    }
  }, [isValid, partie1, partie2, onValidate]);

  const handleClose = useCallback(() => {
    setPartie1(0);
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Paiement bilateral</DialogTitle>
          <DialogDescription>
            Repartir le montant de {formatCurrency(totalRestant, devise)} en deux parties pour {mopLibelle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label required>Partie 1</Label>
            <Input
              type="number"
              min={0.01}
              max={totalRestant - 0.01}
              step={0.01}
              value={partie1 || ''}
              onChange={(e) => setPartie1(Number(e.target.value) || 0)}
              className="text-right"
              placeholder="0,00"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Partie 2 (calculee)</Label>
            <div className="flex h-9 items-center justify-end rounded-md border border-border bg-surface-dim px-3 text-sm font-medium">
              {partie1 > 0 ? formatCurrency(partie2, devise) : '-'}
            </div>
          </div>

          {partie1 > 0 && partie1 >= totalRestant && (
            <div className="text-xs text-danger">
              La partie 1 doit etre inferieure au total ({formatCurrency(totalRestant, devise)})
            </div>
          )}

          {partie1 > 0 && isValid && (
            <div className="rounded-md bg-surface-dim p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Partie 1</span>
                <span className="font-medium">{formatCurrency(partie1, devise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Partie 2</span>
                <span className="font-medium">{formatCurrency(partie2, devise)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span className="font-medium">Total</span>
                <span className="font-bold">{formatCurrency(totalRestant, devise)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleValidate} disabled={!isValid}>
            Valider repartition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
