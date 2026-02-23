import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { RecapWorksheetEntry, RecapWorksheetSummary } from '@/types/recapWorksheet';

interface RecapitulatifPanelProps {
  entries: RecapWorksheetEntry[];
  summary: RecapWorksheetSummary | null;
  className?: string;
}

interface SummaryCardProps {
  title: string;
  items: Record<string, number>;
  className?: string;
}

const SummaryCard = ({ title, items, className }: SummaryCardProps) => {
  const sortedItems = useMemo(() => {
    return Object.entries(items).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="space-y-2">
        {sortedItems.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{key}</span>
            <span className="font-medium text-gray-900">
              {value.toFixed(2)} €
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RecapitulatifPanel = ({ entries, summary, className }: RecapitulatifPanelProps) => {
  const columns = useMemo(
    () => [
      { key: 'dateComptable', label: 'Date', width: '100px' },
      { key: 'numeroSession', label: 'Session', width: '80px' },
      { key: 'type', label: 'Type', width: '120px' },
      { key: 'modePaiement', label: 'Mode', width: '100px' },
      { key: 'codeDevise', label: 'Dev.', width: '60px' },
      { key: 'quantiteDevise', label: 'Qté', width: '80px', align: 'right' as const },
      { key: 'tauxDevise', label: 'Taux', width: '80px', align: 'right' as const },
      { key: 'montant', label: 'Montant', width: '100px', align: 'right' as const },
      { key: 'libelle', label: 'Libellé', width: '200px' },
    ],
    []
  );

  const formatCellValue = (entry: RecapWorksheetEntry, key: string): string => {
    const value = entry[key as keyof RecapWorksheetEntry];

    if (value === null || value === undefined) {
      return '-';
    }

    if (key === 'dateComptable' && value instanceof Date) {
      return value.toLocaleDateString('fr-FR');
    }

    if (key === 'quantiteDevise' || key === 'tauxDevise') {
      return typeof value === 'number' ? value.toFixed(4) : '-';
    }

    if (key === 'montant') {
      return typeof value === 'number' ? `${value.toFixed(2)} €` : '-';
    }

    return String(value);
  };

  if (!summary) {
    return (
      <div className={cn('flex items-center justify-center py-12 text-gray-500', className)}>
        Aucune donnée à afficher. Générez un récapitulatif pour voir les détails.
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Totaux par devise" items={summary.totalParDevise} />
        <SummaryCard title="Totaux par type" items={summary.totalParType} />
        <SummaryCard title="Totaux par mode de paiement" items={summary.totalParModePaiement} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left font-semibold text-gray-700',
                      col.align === 'right' && 'text-right'
                    )}
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    Aucune entrée disponible
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-gray-900',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {formatCellValue(entry, col.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-900">Total Général</span>
          <span className="text-2xl font-bold text-blue-900">
            {summary.totalGeneral.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
};