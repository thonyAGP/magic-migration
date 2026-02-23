import { useMemo } from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DenominationSummaryProps } from './types';

const formatCurrency = (value: number, devise: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

function getEcartVariant(ecart: number): 'success' | 'warning' | 'destructive' {
  if (ecart === 0) return 'success';
  if (ecart > 0) return 'warning';
  return 'destructive';
}

function getEcartLabel(ecart: number): string {
  if (ecart === 0) return 'Equilibre';
  if (ecart > 0) return 'Excedent';
  return 'Deficit';
}

export function DenominationSummary({ results }: DenominationSummaryProps) {
  const totaux = useMemo(() => {
    let totalCompte = 0;
    let totalAttendu = 0;
    for (const r of results) {
      totalCompte += r.totalCompte;
      totalAttendu += r.totalAttendu;
    }
    return {
      totalCompte,
      totalAttendu,
      ecart: totalCompte - totalAttendu,
    };
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="text-center py-6 text-on-surface-muted text-sm">
        Aucun comptage effectue
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Per-devise rows */}
      {results.map((result) => {
        const ecart = result.ecart;
        return (
          <div
            key={result.deviseCode}
            className="flex items-center justify-between rounded-md border border-border px-4 py-3 bg-surface"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-on-surface">
                {result.deviseCode}
              </span>
              <Badge variant={getEcartVariant(ecart)} className="text-xs">
                {getEcartLabel(ecart)}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-right">
                <div className="text-on-surface-muted text-xs">Compte</div>
                <div className="font-medium">
                  {formatCurrency(result.totalCompte, result.deviseCode)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-on-surface-muted text-xs">Attendu</div>
                <div className="font-medium">
                  {formatCurrency(result.totalAttendu, result.deviseCode)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-on-surface-muted text-xs">Ecart</div>
                <div
                  className={cn(
                    'font-bold',
                    ecart === 0 && 'text-success',
                    ecart > 0 && 'text-warning',
                    ecart < 0 && 'text-danger',
                  )}
                >
                  {ecart >= 0 ? '+' : ''}
                  {formatCurrency(ecart, result.deviseCode)}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* General total (only if multi-devise) */}
      {results.length > 1 && (
        <div className="flex items-center justify-between rounded-md border-2 border-border px-4 py-3 bg-surface-dim">
          <span className="text-sm font-bold text-on-surface">
            Total general
          </span>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <div className="text-on-surface-muted text-xs">Compte</div>
              <div className="font-bold">
                {formatCurrency(totaux.totalCompte, results[0]!.deviseCode)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-on-surface-muted text-xs">Attendu</div>
              <div className="font-bold">
                {formatCurrency(totaux.totalAttendu, results[0]!.deviseCode)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-on-surface-muted text-xs">Ecart</div>
              <div
                className={cn(
                  'font-bold text-base',
                  totaux.ecart === 0 && 'text-success',
                  totaux.ecart > 0 && 'text-warning',
                  totaux.ecart < 0 && 'text-danger',
                )}
              >
                {totaux.ecart >= 0 ? '+' : ''}
                {formatCurrency(totaux.ecart, results[0]!.deviseCode)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
