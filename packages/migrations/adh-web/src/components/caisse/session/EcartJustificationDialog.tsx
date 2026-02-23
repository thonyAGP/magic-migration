import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import type { EcartJustificationDialogProps } from './types';

const ECART_SEUIL_JUSTIFICATION = 0;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function EcartJustificationDialog({
  ecart,
  open,
  onClose,
  onSubmit,
}: EcartJustificationDialogProps) {
  const [justification, setJustification] = useState('');
  const requiresJustification = Math.abs(ecart.ecart) > ECART_SEUIL_JUSTIFICATION;
  const canSubmit = !requiresJustification || justification.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(justification.trim());
    setJustification('');
  };

  const handleClose = () => {
    setJustification('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Justification de l&apos;ecart</DialogTitle>
          <DialogDescription>
            Un ecart a ete detecte lors du comptage. Veuillez fournir une justification.
          </DialogDescription>
        </DialogHeader>

        {/* Ecart summary */}
        <div className="rounded-md border border-border bg-surface-dim p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-muted">Attendu</span>
            <span className="font-medium">{formatCurrency(ecart.attendu)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-muted">Compte</span>
            <span className="font-medium">{formatCurrency(ecart.compte)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="font-medium">Ecart</span>
            <span
              className={cn(
                'font-bold',
                ecart.statut === 'alerte'
                  ? 'text-red-600'
                  : ecart.statut === 'negatif'
                    ? 'text-orange-600'
                    : ecart.statut === 'positif'
                      ? 'text-blue-600'
                      : 'text-green-600',
              )}
            >
              {formatCurrency(ecart.ecart)}
            </span>
          </div>
        </div>

        {/* Per-devise detail */}
        {ecart.ecartsDevises.length > 1 && (
          <div className="space-y-1">
            {ecart.ecartsDevises.map((ed) => (
              <div key={ed.deviseCode} className="flex justify-between text-xs text-on-surface-muted">
                <span>{ed.deviseCode}</span>
                <span>{formatCurrency(ed.ecart)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Justification field */}
        <div className="space-y-1.5">
          <label htmlFor="ecart-justification" className="text-sm font-medium text-on-surface">
            Justification {requiresJustification && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id="ecart-justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Saisissez la raison de cet ecart..."
            rows={3}
            className={cn(
              'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm',
              'placeholder:text-on-surface-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'resize-none',
            )}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
