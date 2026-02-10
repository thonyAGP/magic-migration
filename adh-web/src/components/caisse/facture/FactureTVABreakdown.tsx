import type { FactureTVABreakdownProps } from './types';

const formatEUR = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function FactureTVABreakdown({
  summary,
  isLoading = false,
}: FactureTVABreakdownProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 rounded-md border border-border p-4">
        <h3 className="text-sm font-semibold">Ventilation TVA</h3>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-surface-dim" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-dim" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-dim" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-3 rounded-md border border-border p-4">
        <h3 className="text-sm font-semibold">Ventilation TVA</h3>
        <p className="text-sm text-on-surface-muted">Aucune donnee</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Ventilation TVA</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-xs font-medium text-on-surface-muted py-2 px-3">
              Taux TVA (%)
            </th>
            <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">
              Base HT
            </th>
            <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">
              Montant TVA
            </th>
          </tr>
        </thead>
        <tbody>
          {summary.ventilationTVA.map((line) => (
            <tr key={line.tauxTVA} className="border-b border-border/50">
              <td className="text-sm py-2 px-3">{line.tauxTVA}%</td>
              <td className="text-sm py-2 px-3 text-right">{formatEUR(line.baseHT)}</td>
              <td className="text-sm py-2 px-3 text-right">{formatEUR(line.montantTVA)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-t border-border pt-3">
        <div className="flex justify-between text-sm font-semibold">
          <span>Total HT</span>
          <span>{formatEUR(summary.totalHT)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Total TVA</span>
          <span>{formatEUR(summary.totalTVA)}</span>
        </div>
        <div className="flex justify-between rounded-md bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          <span>Total TTC</span>
          <span>{formatEUR(summary.totalTTC)}</span>
        </div>
      </div>
    </div>
  );
}
