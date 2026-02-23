import { useState, useCallback } from 'react';
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
import type { MoyenPaiementCatalog, SelectedMOP } from '@/types/transaction-lot2';

interface TPERecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: string;
  montant: number;
  devise: string;
  mopCatalog: MoyenPaiementCatalog[];
  onRetry: (newMOP: SelectedMOP[]) => void;
  onCancel: () => void;
}

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function TPERecoveryDialog({
  open,
  onOpenChange,
  error,
  montant,
  devise,
  mopCatalog,
  onRetry,
  onCancel,
}: TPERecoveryDialogProps) {
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedMontant, setSelectedMontant] = useState(montant);

  const nonTPEMethods = mopCatalog.filter((m) => !m.estTPE);

  const handleRetry = useCallback(() => {
    if (!selectedCode || selectedMontant <= 0) return;
    onRetry([{ code: selectedCode, montant: selectedMontant }]);
  }, [selectedCode, selectedMontant, onRetry]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Refus TPE</DialogTitle>
          <DialogDescription>
            Le paiement par carte a ete refuse. Veuillez choisir un autre moyen de paiement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>

          <div className="text-sm">
            Montant a regler : <span className="font-bold">{formatCurrency(montant, devise)}</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <Label>Moyen de paiement alternatif</Label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="h-9 rounded-md border border-border bg-surface px-3 text-sm"
              >
                <option value="">Choisir...</option>
                {nonTPEMethods.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Montant</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={selectedMontant}
                onChange={(e) => setSelectedMontant(Number(e.target.value) || 0)}
                className="text-right"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler transaction
          </Button>
          <Button
            onClick={handleRetry}
            disabled={!selectedCode || selectedMontant <= 0}
          >
            Valider nouveau reglement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
