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
import type { PassLimitDialogProps } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function PassLimitDialog({
  open,
  validationResult,
  onClose,
  onForce,
}: PassLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Limite depassee
          </DialogTitle>
          <DialogDescription>
            La transaction ne peut pas etre traitee en raison d'un depassement de limite.
          </DialogDescription>
        </DialogHeader>

        {validationResult && (
          <div className="space-y-3 py-4 text-sm">
            {validationResult.raison && (
              <div className="rounded-md bg-danger/10 px-3 py-2 text-danger">
                {validationResult.raison}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-on-surface-muted">Limite journaliere restante</p>
                <p className="font-medium">{formatCurrency(validationResult.limitJournaliereRestante)}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-muted">Limite hebdomadaire restante</p>
                <p className="font-medium">{formatCurrency(validationResult.limitHebdomadaireRestante)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-on-surface-muted">Solde disponible</p>
                <p className="font-medium">{formatCurrency(validationResult.soldeDisponible)}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          {onForce && (
            <Button variant="destructive" onClick={onForce}>
              Forcer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
