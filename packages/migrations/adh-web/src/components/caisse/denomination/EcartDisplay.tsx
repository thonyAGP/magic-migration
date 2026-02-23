import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { EcartDisplayProps } from './types';

const DEFAULT_SEUIL_ALERTE = 5;

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function EcartDisplay({
  ecart,
  seuilAlerte = DEFAULT_SEUIL_ALERTE,
  onJustify,
}: EcartDisplayProps) {
  const hasAlerte = ecart.ecartsDevises.some(
    (e) => Math.abs(e.ecart) > seuilAlerte,
  );

  if (ecart.estEquilibre) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-success/30 bg-success/5 px-4 py-3">
        <CheckCircle className="h-5 w-5 text-success" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-success">
            Caisse equilibree
          </p>
          <p className="text-xs text-on-surface-muted">
            Le comptage correspond au solde attendu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Global alert */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-md border px-4 py-3',
          hasAlerte
            ? 'border-danger/30 bg-danger/5'
            : 'border-warning/30 bg-warning/5',
        )}
      >
        {hasAlerte ? (
          <XCircle className="h-5 w-5 text-danger" aria-hidden="true" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
        )}
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-semibold',
              hasAlerte ? 'text-danger' : 'text-warning',
            )}
          >
            {ecart.statut === 'positif' ? 'Excedent detecte' : 'Deficit detecte'}
          </p>
          <p className="text-xs text-on-surface-muted">
            Ecart total :{' '}
            <span className="font-semibold">
              {ecart.ecart >= 0 ? '+' : ''}
              {formatCurrency(ecart.ecart)}
            </span>
          </p>
        </div>
        {hasAlerte && (
          <Badge variant="destructive" className="text-xs">
            Alerte
          </Badge>
        )}
      </div>

      {/* Per-devise detail */}
      {ecart.ecartsDevises.length > 0 && (
        <div className="space-y-1">
          {ecart.ecartsDevises
            .filter((e) => e.ecart !== 0)
            .map((devEcart) => (
              <div
                key={devEcart.deviseCode}
                className="flex items-center justify-between rounded-md border border-border px-4 py-2 bg-surface text-sm"
              >
                <span className="font-medium text-on-surface">
                  {devEcart.deviseCode}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-on-surface-muted">
                    Attendu: {formatCurrency(devEcart.attendu, devEcart.deviseCode)}
                  </span>
                  <span className="text-on-surface-muted">
                    Compte: {formatCurrency(devEcart.compte, devEcart.deviseCode)}
                  </span>
                  <span
                    className={cn(
                      'font-bold',
                      devEcart.ecart > 0 ? 'text-warning' : 'text-danger',
                    )}
                  >
                    {devEcart.ecart >= 0 ? '+' : ''}
                    {formatCurrency(devEcart.ecart, devEcart.deviseCode)}
                  </span>
                  {Math.abs(devEcart.ecart) > seuilAlerte && (
                    <Badge variant="destructive" className="text-xs">
                      &gt; {formatCurrency(seuilAlerte, devEcart.deviseCode)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Justify action */}
      {onJustify && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onJustify}
          >
            Justifier l'ecart
          </Button>
        </div>
      )}
    </div>
  );
}
