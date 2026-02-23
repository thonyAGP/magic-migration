import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid } from './DataGrid';
import {
  textColumn,
  currencyColumn,
  dateColumn,
  selectionColumn,
} from './columns';
import type { ColumnDef } from '@tanstack/react-table';

// --- Mock data ---

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'cancelled';
  reference: string;
}

const STATUSES = ['completed', 'pending', 'cancelled'] as const;
const DESCRIPTIONS = [
  'Vente GP chambre 401',
  'Encaissement gift pass',
  'Resort credit rechargement',
  'Remboursement minibar',
  'Vente boutique souvenirs',
  'Facture restaurant',
  'Location equipement plage',
  'Service spa et bien-etre',
  'Transfert inter-villages',
  'Garantie carte bancaire',
  'Encaissement package excursion',
  'Vente bar piscine',
];

function generateMockData(count: number): Transaction[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 1000 + i,
    date: new Date(2026, 0, 1 + (i % 28), 8 + (i % 12), i % 60)
      .toISOString(),
    description: DESCRIPTIONS[i % DESCRIPTIONS.length],
    amount: Math.round((10 + Math.random() * 490) * 100) / 100,
    currency: 'EUR',
    status: STATUSES[i % 3],
    reference: `TXN-${String(1000 + i).padStart(6, '0')}`,
  }));
}

const mockData50 = generateMockData(50);
const mockData100 = generateMockData(100);

// --- Column definitions ---

const columns: ColumnDef<Transaction, unknown>[] = [
  textColumn<Transaction>({
    id: 'reference',
    header: 'Reference',
    accessorKey: 'reference',
    size: 140,
  }),
  dateColumn<Transaction>({
    id: 'date',
    header: 'Date',
    accessorKey: 'date',
    size: 120,
  }),
  textColumn<Transaction>({
    id: 'description',
    header: 'Description',
    accessorKey: 'description',
  }),
  currencyColumn<Transaction>({
    id: 'amount',
    header: 'Montant',
    accessorKey: 'amount',
    size: 120,
  }),
  textColumn<Transaction>({
    id: 'status',
    header: 'Statut',
    accessorKey: 'status',
    size: 100,
  }),
];

const columnsWithSelection: ColumnDef<Transaction, unknown>[] = [
  selectionColumn<Transaction>(),
  ...columns,
];

// --- Stories ---

const meta: Meta<typeof DataGrid<Transaction>> = {
  title: 'Data/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof DataGrid<Transaction>>;

/** Default with 50 rows, no features */
export const Default: Story = {
  args: {
    data: mockData50,
    columns,
  },
};

/** Empty state with custom message */
export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyMessage: 'Aucune transaction trouvee',
  },
};

/** Loading skeleton */
export const Loading: Story = {
  args: {
    data: [],
    columns,
    isLoading: true,
  },
};

/** Sorting enabled on all columns */
export const WithSorting: Story = {
  args: {
    data: mockData50,
    columns,
    enableSorting: true,
    initialSorting: [{ id: 'date', desc: true }],
  },
};

/** Global filter + column sorting */
export const WithFiltering: Story = {
  args: {
    data: mockData50,
    columns,
    enableSorting: true,
    enableFiltering: true,
    enableGlobalFilter: true,
    globalFilterPlaceholder: 'Filtrer les transactions...',
  },
};

/** 100 rows with pagination */
export const WithPagination: Story = {
  args: {
    data: mockData100,
    columns,
    enablePagination: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
};

/** Multi-row selection with callback */
export const WithSelection: Story = {
  args: {
    data: mockData50,
    columns: columnsWithSelection,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: (rows: Transaction[]) => {
      console.log('Selected:', rows);
    },
  },
};

/** Compact mode */
export const Compact: Story = {
  args: {
    data: mockData50,
    columns,
    compact: true,
  },
};

/** Striped rows */
export const Striped: Story = {
  args: {
    data: mockData50,
    columns,
    striped: true,
  },
};

/** All features enabled */
export const FullFeatured: Story = {
  args: {
    data: mockData100,
    columns: columnsWithSelection,
    enableSorting: true,
    enableFiltering: true,
    enableGlobalFilter: true,
    globalFilterPlaceholder: 'Rechercher dans les transactions...',
    enablePagination: true,
    pageSize: 25,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: true,
    stickyHeader: true,
    striped: true,
    onRowSelectionChange: (rows: Transaction[]) => {
      console.log('Selected:', rows.length, 'rows');
    },
    onRowClick: (row: Transaction) => {
      console.log('Clicked:', row.reference);
    },
  },
};
