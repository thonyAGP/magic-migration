import { Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import type { SeparationPreviewCardProps } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function SeparationPreviewCard({
  preview,
  isLoading = false,
  onConfirm,
  onCancel,
  isExecuting = false,
}: SeparationPreviewCardProps) {
  if (!preview || isLoading) {
    return (
      <div className="rounded-md border border-border p-6">
        <div className="space-y-3 animate-pulse">
          <div className="h-5 w-48 rounded bg-surface-dim" />
          <div className="h-4 w-full rounded bg-surface-dim" />
          <div className="h-4 w-3/4 rounded bg-surface-dim" />
        </div>
        <p className="text-center text-sm text-on-surface-muted mt-4">
          Validation en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border p-6 space-y-4">
      <h3 className="text-lg font-semibold text-on-surface">
        Apercu de la separation
      </h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded bg-surface-dim px-3 py-2 text-sm">
          <span className="text-on-surface-muted">Source</span>
          <span className="font-medium">
            {preview.compteSource.nom} {preview.compteSource.prenom}
            <span className="text-on-surface-muted ml-1">
              ({formatCurrency(preview.compteSource.solde)})
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between rounded bg-surface-dim px-3 py-2 text-sm">
          <span className="text-on-surface-muted">Destination</span>
          <span className="font-medium">
            {preview.compteDestination.nom} {preview.compteDestination.prenom}
            <span className="text-on-surface-muted ml-1">
              ({formatCurrency(preview.compteDestination.solde)})
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-on-surface-muted">Operations a deplacer</p>
          <p className="mt-1 text-lg font-semibold text-primary">
            {preview.nbOperationsADeplacer}
          </p>
        </div>
        <div className="rounded-md border border-border p-3">
          <p className="text-xs text-on-surface-muted">Montant a deplacer</p>
          <p className="mt-1 text-lg font-semibold text-primary">
            {formatCurrency(preview.montantADeplacer)}
          </p>
        </div>
        <div className="rounded-md border border-border p-3 col-span-2">
          <p className="text-xs text-on-surface-muted">Garanties impactees</p>
          <p className="mt-1 text-lg font-semibold text-warning">
            {preview.garantiesImpactees}
          </p>
        </div>
      </div>

      {preview.avertissements.length > 0 && (
        <div className="space-y-2">
          {preview.avertissements.map((warning, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded bg-warning/10 px-3 py-2 text-sm text-warning"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isExecuting}>
          Annuler
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isExecuting}
        >
          {isExecuting ? 'Execution...' : 'Executer la separation'}
        </Button>
      </div>
    </div>
  );
}
