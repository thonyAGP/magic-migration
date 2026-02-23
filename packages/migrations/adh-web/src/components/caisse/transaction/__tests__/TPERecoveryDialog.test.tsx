// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TPERecoveryDialog } from '../TPERecoveryDialog';
import type { MoyenPaiementCatalog } from '@/types/transaction-lot2';

const mockCatalog: MoyenPaiementCatalog[] = [
  { code: 'ESP', libelle: 'Especes', type: 'especes', classe: 'A', estTPE: false },
  { code: 'CB', libelle: 'Carte bancaire', type: 'carte', classe: 'B', estTPE: true },
  { code: 'CHQ', libelle: 'Cheque', type: 'cheque', classe: 'C', estTPE: false },
];

describe('TPERecoveryDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    error: 'Refus carte bancaire',
    montant: 280,
    devise: 'EUR',
    mopCatalog: mockCatalog,
    onRetry: vi.fn(),
    onCancel: vi.fn(),
  };

  it('should render error message', () => {
    render(<TPERecoveryDialog {...defaultProps} />);

    expect(screen.getByText('Refus carte bancaire')).toBeDefined();
  });

  it('should render dialog title', () => {
    render(<TPERecoveryDialog {...defaultProps} />);

    expect(screen.getByText('Refus TPE')).toBeDefined();
  });

  it('should only show non-TPE methods in dropdown', () => {
    render(<TPERecoveryDialog {...defaultProps} />);

    expect(screen.getByText('Especes')).toBeDefined();
    expect(screen.getByText('Cheque')).toBeDefined();
    // CB is TPE, should not appear in dropdown options
    const select = screen.getByDisplayValue('Choisir...');
    const options = select.querySelectorAll('option');
    const optionTexts = Array.from(options).map((o) => o.textContent);
    expect(optionTexts).not.toContain('Carte bancaire');
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<TPERecoveryDialog {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Annuler transaction'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should disable validate button when no MOP selected', () => {
    render(<TPERecoveryDialog {...defaultProps} />);

    const validateBtn = screen.getByText('Valider nouveau reglement').closest('button');
    expect(validateBtn?.disabled).toBe(true);
  });

  it('should not render when closed', () => {
    render(<TPERecoveryDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Refus TPE')).toBeNull();
  });
});
