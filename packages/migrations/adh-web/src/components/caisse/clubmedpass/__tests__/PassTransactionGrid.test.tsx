// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassTransactionGrid } from '../PassTransactionGrid';
import type { PassTransaction } from '@/types/clubmedpass';

const mockTransactions: PassTransaction[] = [
  {
    id: 1,
    passId: 1,
    numeroPass: 'CM-2026-001234',
    type: 'debit',
    montant: 45.5,
    libelle: 'Achat boutique',
    date: '2026-02-09',
    heure: '14:30',
    operateur: 'CAISSE01',
  },
  {
    id: 2,
    passId: 1,
    numeroPass: 'CM-2026-001234',
    type: 'credit',
    montant: 100.0,
    libelle: 'Rechargement',
    date: '2026-02-08',
    heure: '10:00',
    operateur: 'ACCUEIL',
  },
];

describe('PassTransactionGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state', () => {
    render(<PassTransactionGrid transactions={[]} />);

    expect(screen.getByText('Aucune transaction')).toBeDefined();
  });

  it('should render transaction rows', () => {
    render(<PassTransactionGrid transactions={mockTransactions} />);

    expect(screen.getByText('Achat boutique')).toBeDefined();
    expect(screen.getByText('Rechargement')).toBeDefined();
    expect(screen.getByText('CAISSE01')).toBeDefined();
    expect(screen.getByText('ACCUEIL')).toBeDefined();
  });

  it('should show debit badge and credit badge', () => {
    render(<PassTransactionGrid transactions={mockTransactions} />);

    expect(screen.getByText('Debit')).toBeDefined();
    expect(screen.getByText('Credit')).toBeDefined();
  });

  it('should show loading state', () => {
    const { container } = render(
      <PassTransactionGrid transactions={[]} isLoading />,
    );

    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('should format amounts correctly', () => {
    render(<PassTransactionGrid transactions={mockTransactions} />);

    // Debit row should have text-danger class
    const cells = screen.getAllByRole('cell');
    const debitAmountCell = cells.find((c) => c.textContent?.includes('45,50'));
    expect(debitAmountCell).toBeDefined();
    expect(debitAmountCell?.className).toContain('text-danger');
  });
});
