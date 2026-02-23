import { useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Label } from '@/components/ui';
import type { CommentaireDialogProps } from '../transaction/types';

const MAX_LENGTH = 500;

export function CommentaireDialog({
  open,
  onOpenChange,
  value,
  onSave,
}: CommentaireDialogProps) {
  const [text, setText] = useState(value);

  const remaining = MAX_LENGTH - text.length;

  const handleSave = useCallback(() => {
    onSave(text.trim());
  }, [text, onSave]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Commentaire</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="commentaire">Commentaire de la transaction</Label>
          <textarea
            id="commentaire"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
            rows={5}
            maxLength={MAX_LENGTH}
            className="mt-1.5 flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-on-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="Ajouter un commentaire..."
          />
          <div className="mt-1 text-right text-xs text-on-surface-muted">
            {remaining} caractere{remaining !== 1 ? 's' : ''} restant
            {remaining !== 1 ? 's' : ''}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
