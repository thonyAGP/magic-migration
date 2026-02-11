import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw, CheckCircle, SkipForward } from 'lucide-react';
import type { FusionRetryDialogProps } from './types';

export function FusionRetryDialog({
  open,
  onClose,
  operationName,
  errorMessage,
  onRetry,
  onMarkDone,
  onSkip,
}: FusionRetryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Erreur lors de {operationName}
          </DialogTitle>
          <DialogDescription>
            Une erreur est survenue pendant l'operation. Choisissez comment continuer.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onRetry} className="w-full justify-start gap-2">
            <RefreshCw className="h-4 w-4" />
            Reessayer
          </Button>
          <Button variant="outline" onClick={onMarkDone} className="w-full justify-start gap-2">
            <CheckCircle className="h-4 w-4" />
            Marquer terminee
          </Button>
          <Button variant="outline" onClick={onSkip} className="w-full justify-start gap-2">
            <SkipForward className="h-4 w-4" />
            Passer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
