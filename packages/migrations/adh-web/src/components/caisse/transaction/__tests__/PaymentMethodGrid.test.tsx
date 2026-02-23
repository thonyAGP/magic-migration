// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentMethodGrid } from '../PaymentMethodGrid';
import type { MoyenPaiementCatalog } from '@/types/transaction-lot2';

const mockCatalog: MoyenPaiementCatalog[] = [
  { code: 'ESP', libelle: 'Especes', type: 'especes', classe: 'A', estTPE: false },
  { code: 'CB', libelle: 'Carte bancaire', type: 'carte', classe: 'B', estTPE: true },
  { code: 'CHQ', libelle: 'Cheque', type: 'cheque', classe: 'C', estTPE: false },
];

describe('PaymentMethodGrid', () => {
  const defaultProps = {
    catalog: mockCatalog,
    selectedMOP: [],
    paymentSide: 'unilateral' as const,
    totalTransaction: 280,
    devise: 'EUR',
    onAddMOP: vi.fn(),
    onRemoveMOP: vi.fn(),
    onTogglePaymentSide: vi.fn(),
  };

  it('should render all MOP from catalog', () => {
    render(<PaymentMethodGrid {...defaultProps} />);

    expect(screen.getByText('Especes')).toBeDefined();
    expect(screen.getByText('Carte bancaire')).toBeDefined();
    expect(screen.getByText('Cheque')).toBeDefined();
  });

  it('should show TPE indicator for TPE methods', () => {
    render(<PaymentMethodGrid {...defaultProps} />);

    expect(screen.getByText('TPE')).toBeDefined();
  });

  it('should render unilateral/bilateral toggle', () => {
    render(<PaymentMethodGrid {...defaultProps} />);

    expect(screen.getByText('Unilateral')).toBeDefined();
    expect(screen.getByText('Bilateral')).toBeDefined();
  });

  it('should call onTogglePaymentSide when bilateral is clicked', () => {
    const onToggle = vi.fn();
    render(<PaymentMethodGrid {...defaultProps} onTogglePaymentSide={onToggle} />);

    fireEvent.click(screen.getByText('Bilateral'));

    expect(onToggle).toHaveBeenCalled();
  });

  it('should show total and rest amounts', () => {
    render(
      <PaymentMethodGrid
        {...defaultProps}
        selectedMOP={[{ code: 'ESP', montant: 100 }]}
      />,
    );

    expect(screen.getByText('Reste a regler')).toBeDefined();
  });

  it('should call onAddMOP when Solde button is clicked', () => {
    const onAddMOP = vi.fn();
    render(<PaymentMethodGrid {...defaultProps} onAddMOP={onAddMOP} />);

    const soldeButtons = screen.getAllByText('Solde');
    fireEvent.click(soldeButtons[0]);

    expect(onAddMOP).toHaveBeenCalledWith('ESP', 280);
  });
});
