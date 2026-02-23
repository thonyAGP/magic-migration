import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import type { ConcurrentSessionInfo } from '@/types';

export interface ConcurrentSessionWarningProps {
  open: boolean;
  onClose: () => void;
  onForceOpen: () => void;
  concurrentSession: ConcurrentSessionInfo;
}

export function ConcurrentSessionWarning({
  open,
  onClose,
  onForceOpen,
  concurrentSession,
}: ConcurrentSessionWarningProps) {
  const dateFormatted = new Date(concurrentSession.dateOuverture).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Session concurrente detectee</DialogTitle>
          </div>
          <DialogDescription>
            Une session est deja ouverte par{' '}
            <span className="font-semibold">{concurrentSession.userName}</span>{' '}
            depuis {dateFormatted} sur la caisse {concurrentSession.caisseId}.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
          Forcer l'ouverture fermera la session existante. Les operations en
          cours de l'autre utilisateur seront perdues.
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
          >
            Annuler
          </button>
          <button
            onClick={onForceOpen}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Forcer l'ouverture
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
