import { cn } from '@/lib/utils';
import type { GarantieSummaryProps } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

interface StatBoxProps {
  label: string;
  value: string;
  color: string;
  isLoading?: boolean;
}

function StatBox({ label, value, color, isLoading = false }: StatBoxProps) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-on-surface-muted">{label}</p>
      {isLoading ? (
        <div className="mt-1 h-6 w-16 animate-pulse rounded bg-surface-dim" />
      ) : (
        <p className={cn('mt-1 text-lg font-semibold', color)}>{value}</p>
      )}
    </div>
  );
}

export function GarantieSummary({ summary, isLoading = false }: GarantieSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatBox
        label="Actives"
        value={summary ? String(summary.nbActives) : '-'}
        color="text-primary"
        isLoading={isLoading}
      />
      <StatBox
        label="Montant bloque"
        value={summary ? formatCurrency(summary.montantTotalBloque) : '-'}
        color="text-warning"
        isLoading={isLoading}
      />
      <StatBox
        label="Versees"
        value={summary ? String(summary.nbVersees) : '-'}
        color="text-success"
        isLoading={isLoading}
      />
      <StatBox
        label="Restituees"
        value={summary ? String(summary.nbRestituees) : '-'}
        color="text-on-surface-muted"
        isLoading={isLoading}
      />
    </div>
  );
}
