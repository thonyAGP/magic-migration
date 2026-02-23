import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { regularisationSchema } from './schemas';
import type { RegularisationData } from '@/types/caisseOps';

interface RegularisationDialogProps {
  open: boolean;
  onClose: () => void;
  onValidate: (data: RegularisationData) => void;
  ecartMontant: number;
  deviseCode: string;
}

export function RegularisationDialog({
  open,
  onClose,
  onValidate,
  ecartMontant,
  deviseCode,
}: RegularisationDialogProps) {
  const [motif, setMotif] = useState('');
  const [typeReg, setTypeReg] = useState<'ajustement_positif' | 'ajustement_negatif'>(
    ecartMontant < 0 ? 'ajustement_positif' : 'ajustement_negatif',
  );
  const [error, setError] = useState('');

  const handleValidate = () => {
    setError('');
    const parsed = regularisationSchema.safeParse({
      montantEcart: ecartMontant,
      motif,
      typeRegularisation: typeReg,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Erreur de validation');
      return;
    }

    onValidate({ ...parsed.data, deviseCode });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regularisation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Ecart constate</Label>
            <div className={`text-lg font-bold ${ecartMontant < 0 ? 'text-danger' : 'text-green-600'}`}>
              {ecartMontant > 0 ? '+' : ''}{ecartMontant.toFixed(2)} {deviseCode}
            </div>
          </div>

          <div className="space-y-2">
            <Label required>Type de regularisation</Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="typeReg"
                  checked={typeReg === 'ajustement_positif'}
                  onChange={() => setTypeReg('ajustement_positif')}
                  className="accent-primary"
                />
                <span className="text-sm">Ajustement positif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="typeReg"
                  checked={typeReg === 'ajustement_negatif'}
                  onChange={() => setTypeReg('ajustement_negatif')}
                  className="accent-primary"
                />
                <span className="text-sm">Ajustement negatif</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-motif" required>Motif</Label>
            <textarea
              id="reg-motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Motif de la regularisation (min. 3 caracteres)"
              rows={3}
              className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleValidate}>Valider la regularisation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
