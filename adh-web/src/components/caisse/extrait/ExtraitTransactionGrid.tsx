import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ExtraitTransactionDetail } from './ExtraitTransactionDetail';
import type { ExtraitTransactionGridProps } from './types';
import type { ExtraitTransaction, ExtraitTransactionStatus } from '@/types/extrait';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const rowStatusClass: Record<ExtraitTransactionStatus, string> = {
  annule: 'bg-red-50 text-red-700',
  regularise: 'bg-orange-50 text-orange-700',
  credit: 'bg-green-50 text-green-700',
  debit: '',
  normal: '',
};

type SortDir = 'asc' | 'desc';

export function ExtraitTransactionGrid({
  transactions,
  summary,
  isLoading = false,
}: ExtraitTransactionGridProps) {
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<ExtraitTransaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

  const handleRowClick = (tx: ExtraitTransaction) => {
    setSelectedTransaction(tx);
    setDetailOpen(true);
  };

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
    <>
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
              <th className="px-3 py-2 text-left">Heure</th>
              <th className="px-3 py-2 text-left">Libelle</th>
              <th className="px-3 py-2 text-right">Debit</th>
              <th className="px-3 py-2 text-right">Credit</th>
              <th className="px-3 py-2 text-right">Solde</th>
              <th className="px-3 py-2 text-left">Service</th>
              <th className="px-3 py-2 text-center">Articles</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((tx: ExtraitTransaction) => (
              <tr
                key={tx.id}
                onClick={() => handleRowClick(tx)}
                className={cn(
                  'border-b border-border last:border-b-0 hover:bg-surface-hover cursor-pointer',
                  tx.status && rowStatusClass[tx.status],
                )}
              >
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(tx.date)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{tx.heure || '-'}</td>
                <td className="px-3 py-2">
                  <span>{tx.libelle}</span>
                  {tx.libelleSupplementaire && (
                    <span className="text-on-surface-muted text-xs ml-1">({tx.libelleSupplementaire})</span>
                  )}
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
                <td className="px-3 py-2 text-center">
                  {tx.nbArticles != null && tx.nbArticles > 1 ? (
                    <Badge variant="secondary" className="text-xs">{tx.nbArticles}</Badge>
                  ) : (
                    tx.nbArticles ?? ''
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {summary && (
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-hover font-semibold">
                <td className="px-3 py-2" colSpan={3}>
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
                <td className="px-3 py-2" colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <ExtraitTransactionDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
}
