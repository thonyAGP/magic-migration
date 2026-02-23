// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleTypeSelector } from '../ArticleTypeSelector';
import { PaymentMethodGrid } from '../PaymentMethodGrid';
import { TransactionSummary } from '../TransactionSummary';
import { GiftPassCheck } from '../GiftPassCheck';
import { ResortCreditCheck } from '../ResortCreditCheck';
import { TPERecoveryDialog } from '../TPERecoveryDialog';
import type { MoyenPaiementCatalog, SelectedMOP, TransactionDraft, GiftPassResult, ResortCreditResult } from '@/types/transaction-lot2';

// --- Fixtures ---

const mopCatalog: MoyenPaiementCatalog[] = [
  { code: 'ESP', libelle: 'Especes', type: 'especes', classe: 'I', estTPE: false },
  { code: 'CB', libelle: 'Carte Bancaire', type: 'carte', classe: 'K', estTPE: true },
  { code: 'CHQ', libelle: 'Cheque', type: 'cheque', classe: 'L', estTPE: false },
];

const selectedMOP: SelectedMOP[] = [
  { code: 'ESP', montant: 50 },
  { code: 'CB', montant: 100 },
];

const mockDraft: TransactionDraft = {
  compteId: 12345,
  compteNom: 'DUPONT Jean',
  articleType: 'default',
  lignes: [
    { description: 'Article 1', quantite: 2, prixUnitaire: 25, devise: 'EUR' },
    { description: 'Article 2', quantite: 1, prixUnitaire: 100, devise: 'EUR' },
  ],
  mop: [],
  paymentSide: 'unilateral',
  devise: 'EUR',
  montantTotal: 150,
};

const giftPassAvailable: GiftPassResult = { balance: 200, available: true, devise: 'EUR' };
const giftPassUnavailable: GiftPassResult = { balance: 0, available: false, devise: 'EUR' };
const resortCreditAvailable: ResortCreditResult = { balance: 150, available: true, devise: 'EUR' };

// --- Tests ---

describe('Transaction Workflow Integration', () => {
  describe('ArticleTypeSelector', () => {
    it('should render all types in GP mode and emit selection', () => {
      const onSelect = vi.fn();
      render(<ArticleTypeSelector selected="default" onSelect={onSelect} mode="GP" />);

      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('VRL')).toBeInTheDocument();
      expect(screen.getByText('VSL')).toBeInTheDocument();
      expect(screen.getByText('Transfert')).toBeInTheDocument();

      fireEvent.click(screen.getByText('VRL'));
      expect(onSelect).toHaveBeenCalledWith('VRL');
    });

    it('should filter GP-only types in Boutique mode', () => {
      render(<ArticleTypeSelector selected="default" onSelect={vi.fn()} mode="Boutique" />);

      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.queryByText('Transfert')).not.toBeInTheDocument();
      expect(screen.queryByText('Liberation')).not.toBeInTheDocument();
    });

    it('should highlight selected type with aria-checked', () => {
      render(<ArticleTypeSelector selected="VRL" onSelect={vi.fn()} mode="GP" />);

      const checked = screen.getByRole('radio', { checked: true });
      expect(checked.textContent).toContain('VRL');
    });
  });

  describe('PaymentMethodGrid', () => {
    const defaultPaymentProps = {
      catalog: mopCatalog,
      selectedMOP,
      paymentSide: 'unilateral' as const,
      totalTransaction: 150,
      devise: 'EUR',
      onAddMOP: vi.fn(),
      onRemoveMOP: vi.fn(),
      onTogglePaymentSide: vi.fn(),
    };

    it('should display all MOP from catalog', () => {
      render(<PaymentMethodGrid {...defaultPaymentProps} />);

      expect(screen.getByText('Especes')).toBeInTheDocument();
      expect(screen.getByText('Carte Bancaire')).toBeInTheDocument();
      expect(screen.getByText('Cheque')).toBeInTheDocument();
    });

    it('should display total regle and reste a regler', () => {
      render(<PaymentMethodGrid {...defaultPaymentProps} />);

      expect(screen.getByText(/total regle/i)).toBeInTheDocument();
    });

    it('should show TPE label for card payment', () => {
      render(<PaymentMethodGrid {...defaultPaymentProps} />);

      expect(screen.getByText('TPE')).toBeInTheDocument();
    });

    it('should toggle payment side when bilateral is clicked', () => {
      const onToggle = vi.fn();
      render(<PaymentMethodGrid {...defaultPaymentProps} onTogglePaymentSide={onToggle} />);

      fireEvent.click(screen.getByText('Bilateral'));
      expect(onToggle).toHaveBeenCalled();
    });

    it('should call onAddMOP via Solde button (auto-fill)', () => {
      const onAddMOP = vi.fn();
      render(<PaymentMethodGrid {...defaultPaymentProps} onAddMOP={onAddMOP} />);

      const soldeButtons = screen.getAllByText('Solde');
      fireEvent.click(soldeButtons[0]);
      expect(onAddMOP).toHaveBeenCalled();
    });
  });

  describe('TransactionSummary', () => {
    it('should display account name and transaction lines', () => {
      render(<TransactionSummary draft={mockDraft} selectedMOP={[]} />);

      expect(screen.getByText(/DUPONT Jean/)).toBeInTheDocument();
      expect(screen.getByText(/Article 1/)).toBeInTheDocument();
      expect(screen.getByText(/Article 2/)).toBeInTheDocument();
    });

    it('should display total amount', () => {
      render(<TransactionSummary draft={mockDraft} selectedMOP={[]} />);

      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should show "En attente" badge when not balanced', () => {
      render(<TransactionSummary draft={mockDraft} selectedMOP={[{ code: 'ESP', montant: 50 }]} />);

      expect(screen.getByText('En attente')).toBeInTheDocument();
    });

    it('should show "Equilibree" badge when balanced', () => {
      render(
        <TransactionSummary
          draft={mockDraft}
          selectedMOP={[{ code: 'ESP', montant: 150 }]}
        />,
      );

      expect(screen.getByText('Equilibree')).toBeInTheDocument();
    });

    it('should show GiftPass info when available', () => {
      const draftWithGP: TransactionDraft = {
        ...mockDraft,
        giftPass: giftPassAvailable,
      };
      render(<TransactionSummary draft={draftWithGP} selectedMOP={[]} />);

      expect(screen.getByText(/GiftPass/)).toBeInTheDocument();
    });
  });

  describe('GiftPassCheck', () => {
    it('should show "Non verifie" when no result', () => {
      render(<GiftPassCheck result={null} isChecking={false} onCheck={vi.fn()} />);

      expect(screen.getByText('Non verifie')).toBeInTheDocument();
    });

    it('should show "Disponible" badge when available', () => {
      render(<GiftPassCheck result={giftPassAvailable} isChecking={false} onCheck={vi.fn()} />);

      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });

    it('should show "Indisponible" badge when not available', () => {
      render(<GiftPassCheck result={giftPassUnavailable} isChecking={false} onCheck={vi.fn()} />);

      expect(screen.getByText('Indisponible')).toBeInTheDocument();
    });

    it('should call onCheck when Verifier button is clicked', () => {
      const onCheck = vi.fn();
      render(<GiftPassCheck result={null} isChecking={false} onCheck={onCheck} />);

      fireEvent.click(screen.getByText('Verifier'));
      expect(onCheck).toHaveBeenCalled();
    });

    it('should show "Verification..." when checking', () => {
      render(<GiftPassCheck result={null} isChecking={true} onCheck={vi.fn()} />);

      expect(screen.getByText('Verification...')).toBeInTheDocument();
    });
  });

  describe('ResortCreditCheck', () => {
    it('should show "Non verifie" when no result', () => {
      render(<ResortCreditCheck result={null} isChecking={false} onCheck={vi.fn()} />);

      expect(screen.getByText('Non verifie')).toBeInTheDocument();
    });

    it('should show "Disponible" with balance when available', () => {
      render(<ResortCreditCheck result={resortCreditAvailable} isChecking={false} onCheck={vi.fn()} />);

      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });
  });

  describe('TPERecoveryDialog', () => {
    const tpeProps = {
      open: true,
      onOpenChange: vi.fn(),
      error: 'Carte refusee par la banque',
      montant: 100,
      devise: 'EUR',
      mopCatalog,
      onRetry: vi.fn(),
      onCancel: vi.fn(),
    };

    it('should display error message and amount', () => {
      render(<TPERecoveryDialog {...tpeProps} />);

      expect(screen.getByText('Carte refusee par la banque')).toBeInTheDocument();
      expect(screen.getByText(/100,00/)).toBeInTheDocument();
    });

    it('should only show non-TPE payment methods', () => {
      render(<TPERecoveryDialog {...tpeProps} />);

      expect(screen.getByText('Especes')).toBeInTheDocument();
      expect(screen.getByText('Cheque')).toBeInTheDocument();
      // CB is TPE, should not be in the dropdown
      const options = screen.getAllByRole('option');
      const optionTexts = options.map((o) => o.textContent);
      expect(optionTexts).not.toContain('Carte Bancaire');
    });

    it('should disable retry button when no MOP selected', () => {
      render(<TPERecoveryDialog {...tpeProps} />);

      const retryButton = screen.getByText('Valider nouveau reglement');
      expect(retryButton).toBeDisabled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(<TPERecoveryDialog {...tpeProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByText('Annuler transaction'));
      expect(onCancel).toHaveBeenCalled();
    });
  });
});
