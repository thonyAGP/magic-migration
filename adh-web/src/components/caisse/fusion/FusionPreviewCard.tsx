import { cn } from '@/lib/utils';
import { Button, Badge } from '@/components/ui';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { FusionPreviewCardProps } from './types';

export function FusionPreviewCard({ preview, onConfirm, onCancel, className }: FusionPreviewCardProps) {
  const hasErrors = preview.conflits.some((c) => c.resolution === 'manuel');
  const hasWarnings = preview.conflits.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-on-surface">Previsualisation de la fusion</h3>

      {/* Resume */}
      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-on-surface-muted">Compte principal: </span>
            <span className="font-mono font-medium">
              {preview.comptePrincipal.codeAdherent} - {preview.comptePrincipal.nom}
            </span>
          </div>
          <div>
            <span className="text-on-surface-muted">Compte secondaire: </span>
            <span className="font-mono font-medium">
              {preview.compteSecondaire.codeAdherent} - {preview.compteSecondaire.nom}
            </span>
          </div>
          <div>
            <span className="text-on-surface-muted">Operations a fusionner: </span>
            <span className="font-medium">{preview.nbOperationsAFusionner}</span>
          </div>
          <div>
            <span className="text-on-surface-muted">Montant total: </span>
            <span className="font-medium">{preview.montantTotal.toFixed(2)} EUR</span>
          </div>
          <div>
            <span className="text-on-surface-muted">Garanties a transferer: </span>
            <span className="font-medium">{preview.garantiesATransferer}</span>
          </div>
        </div>
      </div>

      {/* Conflits */}
      {hasWarnings && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-on-surface">Conflits detectes</h4>
          <div className="space-y-2">
            {preview.conflits.map((conflit, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 rounded-md border p-3 text-sm',
                  conflit.resolution === 'manuel'
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-warning/30 bg-warning/5',
                )}
              >
                <AlertTriangle
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    conflit.resolution === 'manuel' ? 'text-destructive' : 'text-warning',
                  )}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={conflit.resolution === 'manuel' ? 'destructive' : 'secondary'}>
                      {conflit.type}
                    </Badge>
                    <Badge variant="outline">
                      {conflit.resolution === 'auto' ? 'Resolution auto' : 'Resolution manuelle'}
                    </Badge>
                  </div>
                  <div>{conflit.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avertissements */}
      {preview.avertissements.length > 0 && (
        <div className="space-y-1">
          {preview.avertissements.map((msg, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* No conflicts */}
      {!hasWarnings && preview.avertissements.length === 0 && (
        <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          <span>Aucun conflit detecte</span>
        </div>
      )}

      {/* Warning si erreurs non resolues */}
      {hasErrors && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          Des conflits necessitent une resolution manuelle. La fusion ne peut pas continuer.
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={onConfirm} disabled={hasErrors}>
          Confirmer la fusion
        </Button>
      </div>
    </div>
  );
}
