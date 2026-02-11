import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';

export interface ApportSupplementaireDialogProps {
  open: boolean;
  onClose: () => void;
  onValidate: (type: 'coffre' | 'produits', montant: number, motif: string) => void;
  deviseCode: string;
}

type ApportType = 'coffre' | 'produits';

export function ApportSupplementaireDialog({
  open,
  onClose,
  onValidate,
  deviseCode,
}: ApportSupplementaireDialogProps) {
  const [type, setType] = useState<ApportType>('coffre');
  const [montant, setMontant] = useState('');
  const [motif, setMotif] = useState('');
  const [errors, setErrors] = useState<{ montant?: string; motif?: string }>({});

  const handleValidate = () => {
    const newErrors: { montant?: string; motif?: string } = {};
    const parsedMontant = parseFloat(montant);

    if (!montant || isNaN(parsedMontant) || parsedMontant <= 0) {
      newErrors.montant = 'Le montant doit etre superieur a 0';
    }
    if (!motif.trim()) {
      newErrors.motif = 'Le motif est obligatoire';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onValidate(type, parsedMontant, motif.trim());
    resetForm();
  };

  const resetForm = () => {
    setType('coffre');
    setMontant('');
    setMotif('');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apport supplementaire</DialogTitle>
          <DialogDescription>
            Ajouter un apport avant la fermeture de caisse ({deviseCode})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selection */}
          <fieldset>
            <legend className="text-sm font-medium text-on-surface mb-2">
              Type d&apos;apport
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="apport-type"
                  value="coffre"
                  checked={type === 'coffre'}
                  onChange={() => setType('coffre')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="text-sm">Coffre</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="apport-type"
                  value="produits"
                  checked={type === 'produits'}
                  onChange={() => setType('produits')}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="text-sm">Produits</span>
              </label>
            </div>
          </fieldset>

          {/* Montant */}
          <div className="space-y-1.5">
            <label htmlFor="apport-montant" className="text-sm font-medium text-on-surface">
              Montant ({deviseCode}) <span className="text-red-500">*</span>
            </label>
            <input
              id="apport-montant"
              type="number"
              min="0.01"
              step="0.01"
              value={montant}
              onChange={(e) => {
                setMontant(e.target.value);
                setErrors((prev) => ({ ...prev, montant: undefined }));
              }}
              placeholder="0.00"
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm bg-surface',
                'placeholder:text-on-surface-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                errors.montant ? 'border-red-500' : 'border-border',
              )}
            />
            {errors.montant && (
              <p className="text-xs text-red-500">{errors.montant}</p>
            )}
          </div>

          {/* Motif */}
          <div className="space-y-1.5">
            <label htmlFor="apport-motif" className="text-sm font-medium text-on-surface">
              Motif <span className="text-red-500">*</span>
            </label>
            <textarea
              id="apport-motif"
              value={motif}
              onChange={(e) => {
                setMotif(e.target.value);
                setErrors((prev) => ({ ...prev, motif: undefined }));
              }}
              placeholder="Raison de l'apport supplementaire..."
              rows={3}
              className={cn(
                'w-full rounded-md border px-3 py-2 text-sm bg-surface resize-none',
                'placeholder:text-on-surface-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                errors.motif ? 'border-red-500' : 'border-border',
              )}
            />
            {errors.motif && (
              <p className="text-xs text-red-500">{errors.motif}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleValidate}>
            Valider l&apos;apport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
