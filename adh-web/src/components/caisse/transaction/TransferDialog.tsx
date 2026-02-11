import { useState, useCallback } from 'react';
import { z } from 'zod';
import { ArrowRightLeft } from 'lucide-react';
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

export interface TransferData {
  compteSource: string;
  compteDestination: string;
  montant: number;
  motif: string;
}

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  onValidate: (data: TransferData) => void;
  sourceAccount: string;
  sourceAccountName: string;
}

const MOCK_COMPTES_DESTINATION = [
  { value: '10001', label: '10001 - DUPONT Jean' },
  { value: '10002', label: '10002 - MARTIN Sophie' },
  { value: '10003', label: '10003 - GARCIA Pedro' },
  { value: '10004', label: '10004 - SMITH John' },
];

export function TransferDialog({
  open,
  onClose,
  onValidate,
  sourceAccount,
  sourceAccountName,
}: TransferDialogProps) {
  const [compteDestination, setCompteDestination] = useState('');
  const [montant, setMontant] = useState<number | ''>('');
  const [motif, setMotif] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const transferSchema = z.object({
    compteSource: z.string().min(1),
    compteDestination: z.string().min(1, 'Compte destination requis'),
    montant: z.number().positive('Le montant doit etre superieur a 0'),
    motif: z.string().min(1, 'Le motif est obligatoire'),
  }).refine(
    (data) => data.compteDestination !== data.compteSource,
    {
      message: 'Le compte destination doit etre different du compte source',
      path: ['compteDestination'],
    },
  );

  const handleValidate = useCallback(() => {
    const result = transferSchema.safeParse({
      compteSource: sourceAccount,
      compteDestination,
      montant: typeof montant === 'number' ? montant : 0,
      motif: motif.trim(),
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
  }, [sourceAccount, compteDestination, montant, motif, onValidate, transferSchema]);

  const handleClose = useCallback(() => {
    setCompteDestination('');
    setMontant('');
    setMotif('');
    setErrors({});
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) handleClose();
    },
    [handleClose],
  );

  const filteredComptes = MOCK_COMPTES_DESTINATION.filter(
    (c) => c.value !== sourceAccount,
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfert entre comptes
          </DialogTitle>
          <DialogDescription>
            Transferer un montant du compte source vers un autre compte
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label>Compte source</Label>
            <div className="flex h-9 items-center rounded-md bg-surface-dim px-3 text-sm">
              {sourceAccount} - {sourceAccountName}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Compte destination</Label>
            <select
              value={compteDestination}
              onChange={(e) => {
                setCompteDestination(e.target.value);
                setErrors((prev) => ({ ...prev, compteDestination: '' }));
              }}
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm"
              data-testid="compte-destination"
            >
              <option value="">Choisir un compte...</option>
              {filteredComptes.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.compteDestination && (
              <span className="text-xs text-danger">{errors.compteDestination}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Montant</Label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={montant}
              onChange={(e) => {
                setMontant(e.target.value ? Number(e.target.value) : '');
                setErrors((prev) => ({ ...prev, montant: '' }));
              }}
              placeholder="0.00"
              data-testid="montant"
            />
            {errors.montant && (
              <span className="text-xs text-danger">{errors.montant}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Motif du transfert</Label>
            <textarea
              value={motif}
              onChange={(e) => {
                setMotif(e.target.value);
                setErrors((prev) => ({ ...prev, motif: '' }));
              }}
              placeholder="Indiquer le motif du transfert..."
              rows={3}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm resize-none"
              data-testid="motif"
            />
            {errors.motif && (
              <span className="text-xs text-danger">{errors.motif}</span>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleValidate}>
            Transferer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
