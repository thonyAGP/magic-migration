import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ExtraitTransactionGridProps } from './types';
import type { ExtraitTransaction } from '@/types/extrait';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

type SortDir = 'asc' | 'desc';

export function ExtraitTransactionGrid({
  transactions,
  summary,
  isLoading = false,
}: ExtraitTransactionGridProps) {
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    const copy = [...transactions];
    copy.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === 'desc' ? db - da : da - db;
    });
    return copy;
  }, [transactions, sortDir]);

  const toggleSort = () => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-surface-hover animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-on-surface-muted text-sm">
        Aucune transaction
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-hover">
            <th
              className="px-3 py-2 text-left cursor-pointer select-none hover:text-primary"
              onClick={toggleSort}
            >
              Date {sortDir === 'desc' ? '\u25BC' : '\u25B2'}
            </th>
            <th className="px-3 py-2 text-left">Libelle</th>
            <th className="px-3 py-2 text-right">Debit</th>
            <th className="px-3 py-2 text-right">Credit</th>
            <th className="px-3 py-2 text-right">Solde</th>
            <th className="px-3 py-2 text-left">Service</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((tx: ExtraitTransaction) => (
            <tr
              key={tx.id}
              className="border-b border-border last:border-b-0 hover:bg-surface-hover"
            >
              <td className="px-3 py-2 whitespace-nowrap">{formatDate(tx.date)}</td>
              <td className="px-3 py-2">
                <span>{tx.libelle}</span>
                {tx.giftPassFlag && (
                  <Badge variant="secondary" className="ml-1 text-xs">GP</Badge>
                )}
              </td>
              <td className={cn('px-3 py-2 text-right font-mono', tx.debit > 0 && 'text-error')}>
                {tx.debit > 0 ? formatCurrency(tx.debit) : ''}
              </td>
              <td className={cn('px-3 py-2 text-right font-mono', tx.credit > 0 && 'text-success')}>
                {tx.credit > 0 ? formatCurrency(tx.credit) : ''}
              </td>
              <td className="px-3 py-2 text-right font-mono font-medium">
                {formatCurrency(tx.solde)}
              </td>
              <td className="px-3 py-2 text-on-surface-muted">{tx.codeService}</td>
            </tr>
          ))}
        </tbody>
        {summary && (
          <tfoot>
            <tr className="border-t-2 border-border bg-surface-hover font-semibold">
              <td className="px-3 py-2" colSpan={2}>
                Total ({summary.nbTransactions} transactions)
              </td>
              <td className="px-3 py-2 text-right font-mono text-error">
                {formatCurrency(summary.totalDebit)}
              </td>
              <td className="px-3 py-2 text-right font-mono text-success">
                {formatCurrency(summary.totalCredit)}
              </td>
              <td className="px-3 py-2 text-right font-mono">
                {formatCurrency(summary.soldeActuel)}
              </td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
