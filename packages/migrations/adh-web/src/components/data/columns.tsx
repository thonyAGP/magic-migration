import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/react-table';
import { useEffect, useRef } from 'react';

/** Helper to create a basic text column */
export function textColumn<TData>(opts: {
  id: string;
  header: string;
  accessorKey: keyof TData & string;
  size?: number;
  enableSorting?: boolean;
}): ColumnDef<TData, unknown> {
  return {
    id: opts.id,
    header: opts.header,
    accessorKey: opts.accessorKey,
    size: opts.size,
    enableSorting: opts.enableSorting ?? true,
  };
}

/** Helper to create a right-aligned number column */
export function numberColumn<TData>(opts: {
  id: string;
  header: string;
  accessorKey: keyof TData & string;
  size?: number;
  enableSorting?: boolean;
  locale?: string;
  decimals?: number;
}): ColumnDef<TData, unknown> {
  const locale = opts.locale ?? 'fr-FR';
  const decimals = opts.decimals ?? 0;

  return {
    id: opts.id,
    header: opts.header,
    accessorKey: opts.accessorKey,
    size: opts.size,
    enableSorting: opts.enableSorting ?? true,
    cell: (info: CellContext<TData, unknown>) => {
      const value = info.getValue();
      if (value == null) return '';
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value as number);
    },
    meta: { align: 'right' as const },
  };
}

/** Helper to create a date column with locale formatting */
export function dateColumn<TData>(opts: {
  id: string;
  header: string;
  accessorKey: keyof TData & string;
  size?: number;
  enableSorting?: boolean;
  locale?: string;
  format?: Intl.DateTimeFormatOptions;
}): ColumnDef<TData, unknown> {
  const locale = opts.locale ?? 'fr-FR';
  const format = opts.format ?? {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  return {
    id: opts.id,
    header: opts.header,
    accessorKey: opts.accessorKey,
    size: opts.size,
    enableSorting: opts.enableSorting ?? true,
    cell: (info: CellContext<TData, unknown>) => {
      const value = info.getValue();
      if (value == null) return '';
      const date = value instanceof Date ? value : new Date(value as string);
      if (isNaN(date.getTime())) return String(value);
      return new Intl.DateTimeFormat(locale, format).format(date);
    },
  };
}

/** Helper to create a currency column (formatted with symbol) */
export function currencyColumn<TData>(opts: {
  id: string;
  header: string;
  accessorKey: keyof TData & string;
  size?: number;
  enableSorting?: boolean;
  currency?: string;
  locale?: string;
}): ColumnDef<TData, unknown> {
  const currency = opts.currency ?? 'EUR';
  const locale = opts.locale ?? 'fr-FR';

  return {
    id: opts.id,
    header: opts.header,
    accessorKey: opts.accessorKey,
    size: opts.size,
    enableSorting: opts.enableSorting ?? true,
    cell: (info: CellContext<TData, unknown>) => {
      const value = info.getValue();
      if (value == null) return '';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(value as number);
    },
    meta: { align: 'right' as const },
  };
}

/** Indeterminate checkbox for selection columns */
// eslint-disable-next-line react-refresh/only-export-components
function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (value: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 cursor-pointer rounded border-border-strong accent-primary"
    />
  );
}

/** Helper for a selection checkbox column */
export function selectionColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: '_select',
    size: 40,
    enableSorting: false,
    enableResizing: false,
    header: ({ table }: HeaderContext<TData, unknown>) => (
      <IndeterminateCheckbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(value) => table.toggleAllPageRowsSelected(value)}
      />
    ),
    cell: ({ row }: CellContext<TData, unknown>) => (
      <IndeterminateCheckbox
        checked={row.getIsSelected()}
        indeterminate={false}
        onChange={(value) => row.toggleSelected(value)}
      />
    ),
  };
}
