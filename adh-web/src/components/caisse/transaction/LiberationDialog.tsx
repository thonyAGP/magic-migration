import { useState, useCallback } from 'react';
import { z } from 'zod';
import { Unlock } from 'lucide-react';
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

export interface LiberationData {
  compte: string;
  montant: number;
  referenceOrigine: string;
}

interface LiberationDialogProps {
  open: boolean;
  onClose: () => void;
  onValidate: (data: LiberationData) => void;
  maxAmount: number;
  accountNumber: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function LiberationDialog({
  open,
  onClose,
  onValidate,
  maxAmount,
  accountNumber,
}: LiberationDialogProps) {
  const [montant, setMontant] = useState<number | ''>('');
  const [referenceOrigine, setReferenceOrigine] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const liberationSchema = z.object({
    compte: z.string().min(1),
    montant: z
      .number()
      .positive('Le montant doit etre superieur a 0')
      .max(maxAmount, `Le montant ne peut pas depasser ${formatCurrency(maxAmount)}`),
    referenceOrigine: z.string().min(1, 'La reference d\'origine est obligatoire'),
  });

  const handleValidate = useCallback(() => {
    const result = liberationSchema.safeParse({
      compte: accountNumber,
      montant: typeof montant === 'number' ? montant : 0,
      referenceOrigine: referenceOrigine.trim(),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field) fieldErrors[String(field)] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onValidate(result.data);
  }, [accountNumber, montant, referenceOrigine, onValidate, liberationSchema]);

  const handleClose = useCallback(() => {
    setMontant('');
    setReferenceOrigine('');
    setErrors({});
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) handleClose();
    },
    [handleClose],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" />
            Liberation de fonds
          </DialogTitle>
          <DialogDescription>
            Liberer un montant bloque sur le compte
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label>Compte</Label>
            <div className="flex h-9 items-center rounded-md bg-surface-dim px-3 text-sm">
              {accountNumber}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Montant disponible</Label>
            <div className="flex h-9 items-center rounded-md bg-surface-dim px-3 text-sm font-medium">
              {formatCurrency(maxAmount)}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Montant a liberer</Label>
            <Input
              type="number"
              min={0.01}
              max={maxAmount}
              step={0.01}
              value={montant}
              onChange={(e) => {
                setMontant(e.target.value ? Number(e.target.value) : '');
                setErrors((prev) => ({ ...prev, montant: '' }));
              }}
              placeholder="0.00"
              data-testid="montant-liberation"
            />
            {errors.montant && (
              <span className="text-xs text-danger">{errors.montant}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Reference operation originale</Label>
            <Input
              value={referenceOrigine}
              onChange={(e) => {
                setReferenceOrigine(e.target.value);
                setErrors((prev) => ({ ...prev, referenceOrigine: '' }));
              }}
              placeholder="Reference de l'operation d'origine"
              data-testid="reference-origine"
            />
            {errors.referenceOrigine && (
              <span className="text-xs text-danger">{errors.referenceOrigine}</span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleValidate}>
            Liberer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
