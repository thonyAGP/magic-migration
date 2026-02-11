import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const NETWORK_CLOSURE_STATUS = {
  pending: 'pending',
  completed: 'completed',
  error: 'error',
} as const;

type NetworkClosureStatus = (typeof NETWORK_CLOSURE_STATUS)[keyof typeof NETWORK_CLOSURE_STATUS];

interface NetworkClosureAlertProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  lastClosureDate?: string;
  closureStatus: NetworkClosureStatus;
}

export function NetworkClosureAlert({
  open,
  onClose,
  onProceed,
  lastClosureDate,
  closureStatus,
}: NetworkClosureAlertProps) {
  if (closureStatus === 'completed') return null;

  const isPending = closureStatus === 'pending';
  const isError = closureStatus === 'error';

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPending && <Clock className="h-5 w-5 text-orange-500" />}
            {isError && <XCircle className="h-5 w-5 text-red-500" />}
            Cloture reseau
          </DialogTitle>
          <DialogDescription>
            {isPending && 'La cloture reseau de la session precedente est en cours.'}
            {isError && 'Une erreur est survenue lors de la cloture reseau.'}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'rounded-md border p-4 space-y-2',
            isPending && 'border-orange-200 bg-orange-50',
            isError && 'border-red-200 bg-red-50',
          )}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={cn(
                'h-5 w-5 mt-0.5 shrink-0',
                isPending ? 'text-orange-500' : 'text-red-500',
              )}
            />
            <div className="text-sm">
              {isPending && (
                <p className="text-orange-800">
                  Cloture reseau en cours, veuillez patienter. L&apos;ouverture de caisse est
                  deconseill&eacute;e tant que la cloture n&apos;est pas terminee.
                </p>
              )}
              {isError && (
                <p className="text-red-800">
                  Erreur lors de la cloture reseau. Contactez le superviseur avant de continuer.
                </p>
              )}
              {lastClosureDate && (
                <p className="text-on-surface-muted mt-2">
                  Derniere cloture : {new Date(lastClosureDate).toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Patienter
          </Button>
          <Button
            variant="destructive"
            onClick={onProceed}
          >
            Ouvrir quand meme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { NetworkClosureAlertProps, NetworkClosureStatus };
