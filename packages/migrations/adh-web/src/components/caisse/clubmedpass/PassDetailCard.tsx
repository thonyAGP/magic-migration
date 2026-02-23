import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PassDetailCardProps } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'destructive'; label: string }> = {
  active: { variant: 'success', label: 'Actif' },
  suspendu: { variant: 'warning', label: 'Suspendu' },
  expire: { variant: 'destructive', label: 'Expire' },
};

export function PassDetailCard({
  pass,
  validationResult,
  isLoading = false,
}: PassDetailCardProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-md border border-border p-4">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-dim" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-20 animate-pulse rounded bg-surface-dim" />
              <div className="h-5 w-28 animate-pulse rounded bg-surface-dim" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="flex items-center justify-center rounded-md border border-border p-8 text-sm text-on-surface-muted">
        Aucun pass selectionne
      </div>
    );
  }

  const badge = STATUS_BADGE[pass.statut] ?? { variant: 'destructive' as const, label: pass.statut };

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{pass.titulaire}</h3>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-on-surface-muted">Numero</p>
          <p className="font-medium">{pass.numeroPass}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-muted">Adherent</p>
          <p className="font-medium">#{pass.codeAdherent}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-muted">Solde</p>
          <p className="text-lg font-bold text-primary">{formatCurrency(pass.solde)}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-muted">Devise</p>
          <p className="font-medium">{pass.devise}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-muted">Limite journaliere</p>
          <p className="font-medium">{formatCurrency(pass.limitJournaliere)}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-muted">Limite hebdomadaire</p>
          <p className="font-medium">{formatCurrency(pass.limitHebdomadaire)}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-muted">Expiration</p>
          <p className="font-medium">{pass.dateExpiration}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-muted">Derniere utilisation</p>
          <p className="font-medium">{pass.derniereUtilisation ?? 'Jamais'}</p>
        </div>
      </div>

      {/* Validation result banner */}
      {validationResult && (
        <div
          className={cn(
            'rounded-md px-4 py-3 text-sm',
            validationResult.peutTraiter
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger',
          )}
        >
          {validationResult.peutTraiter ? (
            <p className="font-medium">
              Transaction autorisee — Solde disponible : {formatCurrency(validationResult.soldeDisponible)}
            </p>
          ) : (
            <p className="font-medium">
              Transaction refusee — {validationResult.raison}
            </p>
          )}
          <div className="mt-1 flex gap-4 text-xs">
            <span>Limite journaliere restante : {formatCurrency(validationResult.limitJournaliereRestante)}</span>
            <span>Limite hebdomadaire restante : {formatCurrency(validationResult.limitHebdomadaireRestante)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
