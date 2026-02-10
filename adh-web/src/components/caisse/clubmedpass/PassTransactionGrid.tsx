import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PassTransactionGridProps } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function PassTransactionGrid({
  transactions,
  isLoading = false,
}: PassTransactionGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-surface-dim" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-border p-8 text-sm text-on-surface-muted">
        Aucune transaction
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-dim">
            <th className="px-3 py-2 text-left font-medium">Date</th>
            <th className="px-3 py-2 text-left font-medium">Heure</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-right font-medium">Montant</th>
            <th className="px-3 py-2 text-left font-medium">Libelle</th>
            <th className="px-3 py-2 text-left font-medium">Operateur</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-border last:border-b-0">
              <td className="px-3 py-2">{tx.date}</td>
              <td className="px-3 py-2">{tx.heure}</td>
              <td className="px-3 py-2">
                {tx.type === 'debit' ? (
                  <Badge variant="destructive">Debit</Badge>
                ) : (
                  <Badge variant="outline" className="border-success text-success">Credit</Badge>
                )}
              </td>
              <td
                className={cn(
                  'px-3 py-2 text-right font-medium',
                  tx.type === 'debit' ? 'text-danger' : 'text-success',
                )}
              >
                {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.montant)}
              </td>
              <td className="px-3 py-2">{tx.libelle}</td>
              <td className="px-3 py-2">{tx.operateur}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
