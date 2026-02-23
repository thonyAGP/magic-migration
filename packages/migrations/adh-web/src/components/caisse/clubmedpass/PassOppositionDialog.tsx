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
import { ShieldOff } from 'lucide-react';
import type { PassOppositionData } from '@/types/clubmedpass';

interface PassOppositionDialogProps {
  open: boolean;
  onClose: () => void;
  passId: string;
  passHolder: string;
  onConfirm: (data: PassOppositionData) => void;
}

const MOTIFS = [
  { value: 'perte', label: 'Perte' },
  { value: 'vol', label: 'Vol' },
  { value: 'autre', label: 'Autre' },
] as const;

export function PassOppositionDialog({
  open,
  onClose,
  passId,
  passHolder,
  onConfirm,
}: PassOppositionDialogProps) {
  const [motif, setMotif] = useState('perte');
  const [commentaire, setCommentaire] = useState('');

  const isCommentaireRequired = motif === 'autre';
  const canSubmit = motif && (!isCommentaireRequired || commentaire.trim().length > 0);

  const handleConfirm = useCallback(() => {
    if (!canSubmit) return;
    onConfirm({
      passId,
      motif,
      commentaire: commentaire.trim() || undefined,
    });
  }, [canSubmit, passId, motif, commentaire, onConfirm]);

  const handleClose = useCallback(() => {
    setMotif('perte');
    setCommentaire('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-danger" />
            Opposer la carte
          </DialogTitle>
          <DialogDescription>
            Mise en opposition de la carte de {passHolder}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            Cette action est irreversible. La carte ne pourra plus etre utilisee.
          </div>

          {/* Motif */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Motif</label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            >
              {MOTIFS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Commentaire */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Commentaire{isCommentaireRequired && ' *'}
            </label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={isCommentaireRequired ? 'Precisez le motif...' : 'Commentaire optionnel'}
              rows={3}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm resize-none"
            />
            {isCommentaireRequired && commentaire.trim().length === 0 && (
              <p className="text-xs text-danger">Commentaire requis pour le motif "Autre"</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!canSubmit}>
            <ShieldOff className="mr-2 h-4 w-4" />
            Confirmer opposition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { PassOppositionDialogProps };
