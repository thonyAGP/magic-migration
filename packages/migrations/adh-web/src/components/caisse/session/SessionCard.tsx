import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Clock, User, Monitor } from 'lucide-react';
import { SessionStatusBadge } from './SessionStatusBadge';
import type { SessionCardProps } from './types';
import type { SessionStatus } from '@/types';

const BORDER_COLOR: Record<SessionStatus, string> = {
  open: 'border-l-green-500',
  opening: 'border-l-blue-500',
  closing: 'border-l-orange-500',
  closed: 'border-l-gray-400',
};

function formatDuration(dateOuverture: string): string {
  const start = new Date(dateOuverture);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hours}h${String(minutes).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function formatCurrency(value: number, devise: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
  }).format(value);
}

export function SessionCard({ session, ecart }: SessionCardProps) {
  const duration = useMemo(
    () => (session.status === 'open' ? formatDuration(session.dateOuverture) : null),
    [session.dateOuverture, session.status],
  );

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface-elevated shadow-sm',
        'border-l-4',
        BORDER_COLOR[session.status],
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-on-surface-muted" />
          <span className="text-sm font-medium text-on-surface">
            Caisse {session.caisseId}
          </span>
        </div>
        <SessionStatusBadge status={session.status} size="sm" />
      </div>

      {/* Details */}
      <div className="space-y-2 px-4 pb-3">
        <div className="flex items-center gap-2 text-sm text-on-surface-muted">
          <User className="h-3.5 w-3.5" />
          <span>Utilisateur {session.userId}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-muted">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDate(session.dateOuverture)}</span>
          {duration && (
            <span className="ml-auto text-xs font-medium text-primary">
              {duration}
            </span>
          )}
        </div>
      </div>

      {/* Devises */}
      {session.devises.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <div className="space-y-1.5">
            {session.devises.map((d) => (
              <div key={d.deviseCode} className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">{d.deviseCode}</span>
                <span className="font-medium text-on-surface">
                  {formatCurrency(d.fondCaisse, d.deviseCode)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ecart indicator */}
      {ecart && !ecart.estEquilibre && (
        <div
          className={cn(
            'border-t border-border px-4 py-2 text-xs font-medium',
            ecart.statut === 'alerte'
              ? 'bg-red-50 text-red-700'
              : ecart.statut === 'negatif'
                ? 'bg-orange-50 text-orange-700'
                : 'bg-blue-50 text-blue-700',
          )}
        >
          Ecart : {formatCurrency(ecart.ecart, session.devises[0]?.deviseCode ?? 'EUR')}
        </div>
      )}
    </div>
  );
}
