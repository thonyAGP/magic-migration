import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataGrid } from '@/components/data/DataGrid';
import { dateColumn, textColumn } from '@/components/data/columns';
import type { SessionHistoryItem } from '@/types';
import { SessionStatusBadge } from './SessionStatusBadge';
import type { SessionHistoryGridProps } from './types';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export function SessionHistoryGrid({
  sessions,
  onSelect,
  isLoading = false,
}: SessionHistoryGridProps) {
  const columns = useMemo<ColumnDef<SessionHistoryItem, unknown>[]>(
    () => [
      dateColumn<SessionHistoryItem>({
        id: 'dateOuverture',
        header: 'Ouverture',
        accessorKey: 'dateOuverture',
        size: 160,
        format: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      }),
      dateColumn<SessionHistoryItem>({
        id: 'dateFermeture',
        header: 'Fermeture',
        accessorKey: 'dateFermeture',
        size: 160,
        format: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      }),
      textColumn<SessionHistoryItem>({
        id: 'caisseNumero',
        header: 'Caisse',
        accessorKey: 'caisseNumero',
        size: 100,
      }),
      textColumn<SessionHistoryItem>({
        id: 'userLogin',
        header: 'Utilisateur',
        accessorKey: 'userLogin',
        size: 140,
      }),
      {
        id: 'status',
        header: 'Statut',
        accessorKey: 'status',
        size: 120,
        enableSorting: true,
        cell: ({ row }) => (
          <SessionStatusBadge status={row.original.status} size="sm" />
        ),
      },
      {
        id: 'ecart',
        header: 'Ecart',
        size: 120,
        enableSorting: true,
        accessorFn: (row) => row.ecart?.ecart ?? 0,
        cell: ({ row }) => {
          const ecart = row.original.ecart;
          if (!ecart) return <span className="text-on-surface-muted">-</span>;
          if (ecart.estEquilibre) {
            return <span className="text-green-600 font-medium">OK</span>;
          }
          return (
            <span
              className={
                ecart.statut === 'alerte'
                  ? 'text-red-600 font-medium'
                  : ecart.statut === 'negatif'
                    ? 'text-orange-600 font-medium'
                    : 'text-blue-600 font-medium'
              }
            >
              {formatCurrency(ecart.ecart)}
            </span>
          );
        },
        meta: { align: 'right' },
      },
    ],
    [],
  );

  return (
    <DataGrid<SessionHistoryItem>
      data={sessions}
      columns={columns}
      enableSorting
      initialSorting={[{ id: 'dateOuverture', desc: true }]}
      enablePagination
      pageSize={10}
      onRowClick={onSelect}
      isLoading={isLoading}
      compact
      striped
      emptyMessage="Aucun historique de session"
    />
  );
}
