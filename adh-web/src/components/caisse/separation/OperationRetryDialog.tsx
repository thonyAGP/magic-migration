import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  Button,
} from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import type { OperationRetryDialogProps } from './types';

export function OperationRetryDialog({
  open,
  onClose,
  operationName,
  errorMessage,
  onRetry,
  onMarkDone,
  onSkip,
}: OperationRetryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Echec de l'operation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="text-sm">
            <span className="text-on-surface-muted">Operation : </span>
            <span className="font-medium">{operationName}</span>
          </div>
          {errorMessage && (
            <div className="flex items-start gap-2 rounded bg-danger/10 px-3 py-2 text-sm text-danger">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onSkip}>
            Passer
          </Button>
          <Button variant="secondary" onClick={onMarkDone}>
            Marquer terminee
          </Button>
          <Button onClick={onRetry}>
            Reessayer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
