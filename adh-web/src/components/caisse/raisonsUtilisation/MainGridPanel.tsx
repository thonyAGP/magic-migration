import { useState, useMemo, useCallback } from 'react';
import { DataGrid } from '@/components/ui';
import type { RaisonUtilisation } from '@/types/raisonsUtilisation';
import { cn } from '@/lib/utils';

export interface MainGridPanelProps {
  raisons: RaisonUtilisation[];
  selectedRaisonPrimaire: number | null;
  onRowClick: (idPrimaire: number) => void;
  className?: string;
}

export const MainGridPanel = ({
  raisons,
  selectedRaisonPrimaire,
  onRowClick,
  className,
}: MainGridPanelProps) => {
  const [sortColumn, setSortColumn] = useState<string>('idPrimaire');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const columns = useMemo(
    () => [
      {
        key: 'idPrimaire',
        label: 'Code Primaire',
        width: '150px',
        sortable: true,
      },
      {
        key: 'idSecondaire',
        label: 'Code Secondaire',
        width: '150px',
        sortable: true,
        render: (row: RaisonUtilisation) => row.idSecondaire ?? '-',
      },
      {
        key: 'commentaire',
        label: 'Libellé',
        width: 'auto',
        sortable: true,
      },
    ],
    [],
  );

  const sortedRaisons = useMemo(() => {
    const sorted = [...raisons].sort((a, b) => {
      let aVal: number | string | null = a[sortColumn as keyof RaisonUtilisation];
      let bVal: number | string | null = b[sortColumn as keyof RaisonUtilisation];

      if (aVal === null) aVal = -1;
      if (bVal === null) bVal = -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, [raisons, sortColumn, sortDirection]);

  const handleSort = useCallback((column: string) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDirection('asc');
      return column;
    });
  }, []);

  const handleRowClickInternal = useCallback(
    (row: RaisonUtilisation) => {
      onRowClick(row.idPrimaire);
    },
    [onRowClick],
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <DataGrid
        columns={columns}
        data={sortedRaisons}
        keyExtractor={(row: RaisonUtilisation) => `${row.idPrimaire}`}
        onRowClick={handleRowClickInternal}
        selectedRowKey={selectedRaisonPrimaire ? `${selectedRaisonPrimaire}` : undefined}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="Aucune raison d'utilisation disponible"
      />
    </div>
  );
};