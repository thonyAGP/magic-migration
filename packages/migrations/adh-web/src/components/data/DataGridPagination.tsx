import type { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataGridPaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions: number[];
}

export function DataGridPagination<TData>({
  table,
  pageSizeOptions,
}: DataGridPaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const btnBase = cn(
    'inline-flex items-center justify-center rounded-md border border-border',
    'h-8 w-8 text-sm transition-colors',
    'hover:bg-surface-bright disabled:opacity-40 disabled:cursor-not-allowed',
  );

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      {/* Row count */}
      <span className="text-sm text-on-surface-muted">
        {totalRows > 0
          ? `${startRow}-${endRow} sur ${totalRows}`
          : 'Aucune ligne'}
      </span>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-on-surface-muted">
            Lignes
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className={cn(
              'h-8 rounded-md border border-border bg-surface px-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/30',
            )}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            className={btnBase}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Premiere page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            className={btnBase}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Page precedente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-3 text-sm text-on-surface">
            {pageCount > 0 ? `${pageIndex + 1} / ${pageCount}` : '0 / 0'}
          </span>

          <button
            className={btnBase}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className={btnBase}
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Derniere page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
