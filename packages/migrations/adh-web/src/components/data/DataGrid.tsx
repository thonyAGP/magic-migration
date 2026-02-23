import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type RowSelectionState,
  type ColumnResizeMode,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataGridProps } from './types';
import { DataGridPagination } from './DataGridPagination';
import { DataGridSkeleton } from './DataGridSkeleton';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataGrid<TData>({
  data,
  columns,
  // Sorting
  enableSorting = false,
  initialSorting = [],
  // Filtering
  enableFiltering = false,
  enableGlobalFilter = false,
  globalFilterPlaceholder = 'Rechercher...',
  // Pagination
  enablePagination = false,
  pageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  // Selection
  enableRowSelection = false,
  enableMultiRowSelection = true,
  onRowSelectionChange,
  // Column features
  enableColumnResizing = false,
  // States
  isLoading = false,
  emptyMessage = 'Aucune donnee',
  // Styling
  stickyHeader = false,
  compact = false,
  striped = false,
  className,
  // Events
  onRowClick,
  onRowDoubleClick,
}: DataGridProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columnResizeMode: ColumnResizeMode = 'onChange';

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: enableGlobalFilter ? globalFilter : undefined,
      rowSelection,
    },
    // Sorting
    enableSorting,
    onSortingChange: setSorting,
    // Filtering
    enableFilters: enableFiltering || enableGlobalFilter,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    // Pagination
    initialState: {
      pagination: { pageSize },
    },
    // Selection
    enableRowSelection,
    enableMultiRowSelection,
    onRowSelectionChange: setRowSelection,
    // Column resizing
    enableColumnResizing,
    columnResizeMode,
    // Row models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel:
      enableFiltering || enableGlobalFilter
        ? getFilteredRowModel()
        : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
  });

  // Notify selection changes
  const selectedRowIds = useMemo(
    () => JSON.stringify(rowSelection),
    [rowSelection],
  );

  const notifySelection = useCallback(() => {
    if (!onRowSelectionChange) return;
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);
    onRowSelectionChange(selectedRows);
  }, [onRowSelectionChange, table]);

  useEffect(() => {
    notifySelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowIds]);

  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
        <DataGridSkeleton
          rows={5}
          columns={columns.length}
          compact={compact}
        />
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      {/* Global filter */}
      {enableGlobalFilter && (
        <div className="border-b border-border px-4 py-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-muted" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={globalFilterPlaceholder}
              className={cn(
                'h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm',
                'placeholder:text-on-surface-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              )}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={
            enableColumnResizing
              ? { width: table.getCenterTotalSize() }
              : undefined
          }
        >
          <thead
            className={cn(
              stickyHeader && 'sticky top-0 z-10',
              'bg-surface-dim',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const align =
                    (header.column.columnDef.meta as { align?: string })
                      ?.align ?? 'left';

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        cellPadding,
                        'border-b border-border-strong text-sm font-medium text-on-surface-muted',
                        'relative select-none',
                        align === 'right' && 'text-right',
                        canSort && 'cursor-pointer hover:text-on-surface',
                      )}
                      style={
                        enableColumnResizing
                          ? { width: header.getSize() }
                          : undefined
                      }
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : undefined
                      }
                    >
                      <div
                        className={cn(
                          'flex items-center gap-1',
                          align === 'right' && 'justify-end',
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {canSort && (
                          <span className="ml-1 inline-flex flex-col">
                            <ChevronUp
                              className={cn(
                                'h-3 w-3 -mb-0.5',
                                sorted === 'asc'
                                  ? 'text-primary'
                                  : 'text-border-strong',
                              )}
                            />
                            <ChevronDown
                              className={cn(
                                'h-3 w-3 -mt-0.5',
                                sorted === 'desc'
                                  ? 'text-primary'
                                  : 'text-border-strong',
                              )}
                            />
                          </span>
                        )}
                      </div>
                      {/* Column resize handle */}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none',
                            'hover:bg-primary/40',
                            header.column.getIsResizing() && 'bg-primary/60',
                          )}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-on-surface-muted">
                    <Inbox className="h-10 w-10" />
                    <span className="text-sm">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, rowIdx) => {
                const isSelected = row.getIsSelected();

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-border transition-colors',
                      (onRowClick || onRowDoubleClick) && 'cursor-pointer',
                      isSelected
                        ? 'bg-primary/10'
                        : striped && rowIdx % 2 === 1
                          ? 'bg-surface-dim/50'
                          : 'hover:bg-surface-bright',
                    )}
                    onClick={() => onRowClick?.(row.original)}
                    onDoubleClick={() => onRowDoubleClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const cellAlign = (
                        cell.column.columnDef.meta as
                          | { align?: string }
                          | undefined
                      )?.align;

                      return (
                        <td
                          key={cell.id}
                          className={cn(
                            cellPadding,
                            'text-sm text-on-surface',
                            cellAlign === 'right' && 'text-right',
                          )}
                          style={
                            enableColumnResizing
                              ? { width: cell.column.getSize() }
                              : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <DataGridPagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  );
}
