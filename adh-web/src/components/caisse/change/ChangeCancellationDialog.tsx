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
import { cancellationSchema } from './schemas';
import type { ChangeCancellationDialogProps } from './types';

export function ChangeCancellationDialog({
  open,
  operationId,
  onClose,
  onConfirm,
  isCancelling = false,
}: ChangeCancellationDialogProps) {
  const [motif, setMotif] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = useCallback(() => {
    const result = cancellationSchema.safeParse({ motif });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError('');
    onConfirm(motif);
    setMotif('');
  }, [motif, onConfirm]);

  const handleClose = useCallback(() => {
    setMotif('');
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Annuler l'operation #{operationId} ?
          </DialogTitle>
          <DialogDescription>
            Cette action est irreversible. Veuillez indiquer le motif d'annulation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Motif d'annulation..."
            rows={3}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCancelling}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isCancelling || motif.length < 3}
          >
            {isCancelling ? 'Annulation...' : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
