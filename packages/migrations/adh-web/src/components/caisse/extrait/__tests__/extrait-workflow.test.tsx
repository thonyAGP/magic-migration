// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtraitTransactionGrid } from '../ExtraitTransactionGrid';
import { ExtraitFormatDialog } from '../ExtraitFormatDialog';
import type { ExtraitTransaction, ExtraitSummary } from '@/types/extrait';

// Mock the API for ExtraitAccountSelector
vi.mock('@/services/api/endpoints-lot3', () => ({
  extraitApi: {
    searchAccount: vi.fn(() => Promise.resolve({ data: { data: [] } })),
  },
}));

// --- Fixtures ---

const mockTransactions: ExtraitTransaction[] = [
  { id: 1, date: '2026-02-01', heure: '10:00', libelle: 'Vente Standard', debit: 0, credit: 50, solde: 50, codeService: 'ADH', codeImputation: 'VTE', giftPassFlag: false },
  { id: 2, date: '2026-02-02', heure: '11:30', libelle: 'Retrait GiftPass', debit: 30, credit: 0, solde: 20, codeService: 'GP', codeImputation: 'GP', giftPassFlag: true },
  { id: 3, date: '2026-02-03', heure: '15:45', libelle: 'Paiement carte', debit: 0, credit: 100, solde: 120, codeService: 'ADH', codeImputation: 'CB', giftPassFlag: false },
];

const mockSummary: ExtraitSummary = {
  totalDebit: 30,
  totalCredit: 150,
  soldeActuel: 120,
  nbTransactions: 3,
};

// --- Tests ---

describe('Extrait Workflow Integration', () => {
  describe('ExtraitTransactionGrid', () => {
    it('should render all transaction rows', () => {
      render(<ExtraitTransactionGrid transactions={mockTransactions} summary={mockSummary} />);

      expect(screen.getByText('Vente Standard')).toBeInTheDocument();
      expect(screen.getByText('Retrait GiftPass')).toBeInTheDocument();
      expect(screen.getByText('Paiement carte')).toBeInTheDocument();
    });

    it('should display GiftPass badge on flagged transactions', () => {
      render(<ExtraitTransactionGrid transactions={mockTransactions} summary={mockSummary} />);

      expect(screen.getAllByText('GP').length).toBeGreaterThan(0);
    });

    it('should display summary footer with totals', () => {
      render(<ExtraitTransactionGrid transactions={mockTransactions} summary={mockSummary} />);

      expect(screen.getByText(/3 transactions/)).toBeInTheDocument();
    });

    it('should toggle sort direction when date header is clicked', () => {
      render(<ExtraitTransactionGrid transactions={mockTransactions} summary={mockSummary} />);

      // Default is desc (▼)
      const dateHeader = screen.getByText(/Date/);
      expect(dateHeader.textContent).toContain('\u25BC');

      fireEvent.click(dateHeader);

      // After click, should be asc (▲)
      expect(dateHeader.textContent).toContain('\u25B2');
    });

    it('should show empty message when no transactions', () => {
      render(<ExtraitTransactionGrid transactions={[]} summary={null} />);

      expect(screen.getByText('Aucune transaction')).toBeInTheDocument();
    });

    it('should show loading skeletons when isLoading', () => {
      const { container } = render(
        <ExtraitTransactionGrid transactions={[]} summary={null} isLoading={true} />,
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display service codes in last column', () => {
      render(<ExtraitTransactionGrid transactions={mockTransactions} summary={mockSummary} />);

      expect(screen.getAllByText('ADH').length).toBe(2);
    });
  });

  describe('ExtraitFormatDialog', () => {
    it('should render all 6 print format options', () => {
      render(
        <ExtraitFormatDialog open={true} onClose={vi.fn()} onSelectFormat={vi.fn()} />,
      );

      expect(screen.getByText('Cumule')).toBeInTheDocument();
      expect(screen.getByText('Par date')).toBeInTheDocument();
      expect(screen.getByText('Par imputation')).toBeInTheDocument();
      expect(screen.getByText('Par nom')).toBeInTheDocument();
      expect(screen.getByText('Date + Imputation')).toBeInTheDocument();
      expect(screen.getByText('Par service')).toBeInTheDocument();
    });

    it('should call onSelectFormat when a format button is clicked', () => {
      const onSelectFormat = vi.fn();
      render(
        <ExtraitFormatDialog open={true} onClose={vi.fn()} onSelectFormat={onSelectFormat} />,
      );

      fireEvent.click(screen.getByText('Par date'));
      expect(onSelectFormat).toHaveBeenCalledWith('date');
    });

    it('should show printing overlay when isPrinting', () => {
      render(
        <ExtraitFormatDialog
          open={true}
          onClose={vi.fn()}
          onSelectFormat={vi.fn()}
          isPrinting={true}
        />,
      );

      expect(screen.getByText('Impression en cours...')).toBeInTheDocument();
    });

    it('should disable format buttons when printing', () => {
      render(
        <ExtraitFormatDialog
          open={true}
          onClose={vi.fn()}
          onSelectFormat={vi.fn()}
          isPrinting={true}
        />,
      );

      const buttons = screen.getAllByRole('button');
      const formatButtons = buttons.filter(
        (b) => b.textContent !== 'Impression en cours...' && !b.getAttribute('aria-label'),
      );
      formatButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });
});
