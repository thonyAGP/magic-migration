import type {
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';

export interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  // Sorting
  enableSorting?: boolean;
  initialSorting?: SortingState;
  // Filtering
  enableFiltering?: boolean;
  enableGlobalFilter?: boolean;
  globalFilterPlaceholder?: string;
  // Pagination
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  // Selection
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  // Column features
  enableColumnResizing?: boolean;
  // States
  isLoading?: boolean;
  emptyMessage?: string;
  // Styling
  stickyHeader?: boolean;
  compact?: boolean;
  striped?: boolean;
  className?: string;
  // Events
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;
}
