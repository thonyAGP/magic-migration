import { Badge } from '@/components/ui';
import type { GarantieOperationGridProps } from './types';
import type { GarantieType } from '@/types/garantie';

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

const TYPE_CONFIG: Record<GarantieType, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  depot: { label: 'Depot', variant: 'default' },
  versement: { label: 'Versement', variant: 'success' },
  retrait: { label: 'Retrait', variant: 'warning' },
  annulation: { label: 'Annulation', variant: 'destructive' },
};

export function GarantieOperationGrid({
  operations,
  _onCancel,
  isLoading = false,
}: GarantieOperationGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-surface-dim" />
        ))}
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-border p-8 text-sm text-on-surface-muted">
        Aucune operation
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-dim">
            <th className="px-3 py-2 text-left text-xs font-medium text-on-surface-muted">Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-on-surface-muted">Heure</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-on-surface-muted">Type</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-on-surface-muted">Montant</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-on-surface-muted">Motif</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-on-surface-muted">Operateur</th>
          </tr>
        </thead>
        <tbody>
          {operations.map((op) => {
            const config = TYPE_CONFIG[op.type];
            return (
              <tr key={op.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">{op.date}</td>
                <td className="px-3 py-2">{op.heure}</td>
                <td className="px-3 py-2">
                  <Badge variant={config.variant}>{config.label}</Badge>
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(op.montant)}
                </td>
                <td className="px-3 py-2 max-w-48 truncate">{op.motif}</td>
                <td className="px-3 py-2">{op.operateur}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
