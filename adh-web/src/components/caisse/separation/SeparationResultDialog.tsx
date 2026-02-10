import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  Button,
} from '@/components/ui';
import { CheckCircle, XCircle } from 'lucide-react';
import type { SeparationResultDialogProps } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function SeparationResultDialog({
  open,
  result,
  onClose,
}: SeparationResultDialogProps) {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success ? (
              <>
                <CheckCircle className="h-5 w-5 text-success" />
                Separation terminee
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-danger" />
                Echec de la separation
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {result.success ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">De</span>
                <span className="font-medium">
                  {result.compteSource.nom} {result.compteSource.prenom}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">Vers</span>
                <span className="font-medium">
                  {result.compteDestination.nom} {result.compteDestination.prenom}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">Operations deplacees</span>
                <span className="font-semibold text-primary">
                  {result.nbOperationsDeplacees}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">Montant deplace</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(result.montantDeplace)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">Date</span>
                <span className="text-on-surface">{result.dateExecution}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-danger">{result.message}</p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
