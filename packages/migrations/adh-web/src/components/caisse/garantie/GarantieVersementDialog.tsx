import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
} from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { garantieVersementSchema, garantieRetraitSchema } from './schemas';
import type { GarantieVersementDialogProps } from './types';

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function GarantieVersementDialog({
  open,
  garantie,
  onClose,
  onConfirm,
  isSubmitting = false,
  mode,
}: GarantieVersementDialogProps) {
  const [montant, setMontant] = useState<number>(0);
  const [motif, setMotif] = useState('');
  const [error, setError] = useState('');

  const isRetrait = mode === 'retrait';
  const title = isRetrait ? 'Retrait garantie' : 'Versement garantie';
  const schema = isRetrait ? garantieRetraitSchema : garantieVersementSchema;

  const handleConfirm = useCallback(() => {
    const result = schema.safeParse({ montant, motif });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError('');
    onConfirm(montant, motif);
    setMontant(0);
    setMotif('');
  }, [montant, motif, schema, onConfirm]);

  const handleClose = useCallback(() => {
    setMontant(0);
    setMotif('');
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={cn('flex items-center gap-2', isRetrait && 'text-warning')}>
            {isRetrait && <AlertTriangle className="h-5 w-5 text-warning" />}
            {title}
          </DialogTitle>
          <DialogDescription>
            {isRetrait
              ? 'Retirer un montant de la garantie. Cette action est tracee.'
              : 'Enregistrer un versement sur la garantie.'}
          </DialogDescription>
        </DialogHeader>

        {garantie && (
          <div className="rounded-md bg-surface-dim px-3 py-2 text-sm">
            <p>
              <span className="text-on-surface-muted">Adherent : </span>
              <span className="font-medium">{garantie.nomAdherent}</span>
            </p>
            <p>
              <span className="text-on-surface-muted">Montant actuel : </span>
              <span className="font-medium">{formatCurrency(garantie.montant, garantie.devise)}</span>
            </p>
          </div>
        )}

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Montant</label>
            <input
              type="number"
              min={0}
              step={0.01}
              max={garantie?.montant}
              value={montant || ''}
              onChange={(e) => setMontant(Number(e.target.value) || 0)}
              placeholder="0,00"
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Motif</label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Motif..."
              rows={3}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant={isRetrait ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isSubmitting || montant <= 0 || motif.length < 3}
          >
            {isSubmitting
              ? 'Traitement...'
              : isRetrait
                ? 'Confirmer le retrait'
                : 'Confirmer le versement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
