import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from '@/components/ui';
import { Trash2 } from 'lucide-react';

interface PassDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  passId: string;
  passHolder: string;
  onConfirm: () => void;
}

const CONFIRMATION_WORD = 'SUPPRIMER';

export function PassDeleteDialog({
  open,
  onClose,
  passId: _passId,
  passHolder,
  onConfirm,
}: PassDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  const canSubmit = confirmText === CONFIRMATION_WORD;

  const handleClose = useCallback(() => {
    setConfirmText('');
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (!canSubmit) return;
    onConfirm();
  }, [canSubmit, onConfirm]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-danger" />
            Supprimer la carte
          </DialogTitle>
          <DialogDescription>
            Supprimer definitivement la carte de {passHolder} ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            Cette action est irreversible et supprimera toutes les donnees associees.
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Tapez <span className="font-mono font-bold">{CONFIRMATION_WORD}</span> pour confirmer
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRMATION_WORD}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!canSubmit}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { PassDeleteDialogProps };
