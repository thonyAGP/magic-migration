// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExtraitTransactionGrid } from '../ExtraitTransactionGrid';
import type { ExtraitTransaction, ExtraitSummary } from '@/types/extrait';

const mockTransactions: ExtraitTransaction[] = [
  {
    id: 1,
    date: '2026-01-15',
    libelle: 'Achat restaurant',
    debit: 25.5,
    credit: 0,
    solde: -25.5,
    codeService: 'REST',
    codeImputation: 'REPAS',
    giftPassFlag: false,
  },
  {
    id: 2,
    date: '2026-01-16',
    libelle: 'Credit GiftPass',
    debit: 0,
    credit: 100,
    solde: 74.5,
    codeService: 'ACCUEIL',
    codeImputation: 'CREDIT',
    giftPassFlag: true,
  },
];

const mockSummary: ExtraitSummary = {
  totalDebit: 25.5,
  totalCredit: 100,
  soldeActuel: 74.5,
  nbTransactions: 2,
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

    expect(screen.getByText('Total (2 transactions)')).toBeDefined();
  });

  it('should show loading skeleton when isLoading', () => {
    const { container } = render(
      <ExtraitTransactionGrid transactions={[]} summary={null} isLoading />,
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(5);
  });
});
