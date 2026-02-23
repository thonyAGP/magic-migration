// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtraitTransactionGrid } from '../ExtraitTransactionGrid';
import type { ExtraitTransaction, ExtraitSummary } from '@/types/extrait';

const mockTransactions: ExtraitTransaction[] = [
  {
    id: 1,
    date: '2026-01-15',
    heure: '09:30',
    libelle: 'Achat restaurant',
    debit: 25.5,
    credit: 0,
    solde: -25.5,
    codeService: 'REST',
    codeImputation: 'REPAS',
    giftPassFlag: false,
    status: 'debit',
    nbArticles: 2,
  },
  {
    id: 2,
    date: '2026-01-16',
    heure: '14:00',
    libelle: 'Credit GiftPass',
    debit: 0,
    credit: 100,
    solde: 74.5,
    codeService: 'ACCUEIL',
    codeImputation: 'CREDIT',
    giftPassFlag: true,
    status: 'credit',
  },
  {
    id: 3,
    date: '2026-01-17',
    heure: '11:00',
    libelle: 'Annulation vente',
    debit: 0,
    credit: 10,
    solde: 84.5,
    codeService: 'BTQ',
    codeImputation: 'ANN',
    giftPassFlag: false,
    status: 'annule',
  },
  {
    id: 4,
    date: '2026-01-17',
    heure: '16:45',
    libelle: 'Regularisation',
    libelleSupplementaire: 'Ajustement solde',
    debit: 0,
    credit: 5,
    solde: 89.5,
    codeService: 'CAI',
    codeImputation: 'REG',
    giftPassFlag: false,
    status: 'regularise',
    nbArticles: 1,
  },
];

const mockSummary: ExtraitSummary = {
  totalDebit: 25.5,
  totalCredit: 115,
  soldeActuel: 89.5,
  nbTransactions: 4,
};

describe('ExtraitTransactionGrid', () => {
  it('should show empty state when no transactions', () => {
    render(
      <ExtraitTransactionGrid transactions={[]} summary={null} />,
    );

    expect(screen.getByText('Aucune transaction')).toBeDefined();
  });

  it('should render transactions', () => {
    render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    expect(screen.getByText('Achat restaurant')).toBeDefined();
    expect(screen.getByText('Credit GiftPass')).toBeDefined();
  });

  it('should display gift pass badge', () => {
    render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    expect(screen.getByText('GP')).toBeDefined();
  });

  it('should display summary footer', () => {
    render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    expect(screen.getByText('Total (4 transactions)')).toBeDefined();
  });

  it('should show loading skeleton when isLoading', () => {
    const { container } = render(
      <ExtraitTransactionGrid transactions={[]} summary={null} isLoading />,
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(5);
  });

  it('should display Heure column', () => {
    render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    expect(screen.getByText('Heure')).toBeDefined();
    expect(screen.getByText('09:30')).toBeDefined();
    expect(screen.getByText('14:00')).toBeDefined();
  });

  it('should display Articles column header', () => {
    render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    expect(screen.getByText('Articles')).toBeDefined();
  });

  it('should display nbArticles badge when > 1', () => {
    render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    // Transaction 1 has nbArticles=2 -> badge
    expect(screen.getByText('2')).toBeDefined();
  });

  it('should display libelleSupplementaire in parentheses', () => {
    render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    expect(screen.getByText('(Ajustement solde)')).toBeDefined();
  });

  it('should apply red background for annule status', () => {
    const { container } = render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    const rows = container.querySelectorAll('tbody tr');
    // annule row (id=3) should have bg-red-50 class
    const annuleRow = Array.from(rows).find((r) =>
      r.textContent?.includes('Annulation vente'),
    );
    expect(annuleRow?.className).toContain('bg-red-50');
  });

  it('should apply green background for credit status', () => {
    const { container } = render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    const rows = container.querySelectorAll('tbody tr');
    const creditRow = Array.from(rows).find((r) =>
      r.textContent?.includes('Credit GiftPass'),
    );
    expect(creditRow?.className).toContain('bg-green-50');
  });

  it('should apply orange background for regularise status', () => {
    const { container } = render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    const rows = container.querySelectorAll('tbody tr');
    const regRow = Array.from(rows).find((r) =>
      r.textContent?.includes('Regularisation'),
    );
    expect(regRow?.className).toContain('bg-orange-50');
  });

  it('should open detail dialog when row is clicked', () => {
    render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    const rows = screen.getAllByRole('row');
    // Click on the first data row (index 1 since 0 is the header)
    fireEvent.click(rows[1]);

    // Detail dialog should be visible
    expect(screen.getByText(/Detail transaction/)).toBeDefined();
  });

  it('should have cursor-pointer on transaction rows', () => {
    const { container } = render(
      <ExtraitTransactionGrid
        transactions={mockTransactions}
        summary={mockSummary}
      />,
    );

    const rows = container.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      expect(row.className).toContain('cursor-pointer');
    });
  });
});
