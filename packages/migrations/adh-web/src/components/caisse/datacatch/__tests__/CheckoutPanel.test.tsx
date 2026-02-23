// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutPanel } from '../CheckoutPanel';
import type { GuestData } from '@/types/datacatch';

const MOCK_GUEST: GuestData = {
  id: 'GUEST-001',
  nom: 'Dupont',
  prenom: 'Jean',
  chambre: '214',
  dateArrivee: '2026-02-08',
  dateDepart: '2026-02-15',
  passId: 'CMP-2026-0042',
  solde: 45.50,
  status: 'checking_out',
};

describe('CheckoutPanel', () => {
  const defaultProps = {
    guestData: MOCK_GUEST,
    onAccept: vi.fn(),
    onDecline: vi.fn(),
    onCancelPass: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render guest data summary', () => {
    render(<CheckoutPanel {...defaultProps} />);

    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('214')).toBeDefined();
    expect(screen.getByText('2026-02-08')).toBeDefined();
    expect(screen.getByText('2026-02-15')).toBeDefined();
  });

  it('should display status badge', () => {
    render(<CheckoutPanel {...defaultProps} />);

    expect(screen.getByText('Checking Out')).toBeDefined();
  });

  it('should display checked_in status badge', () => {
    render(
      <CheckoutPanel
        {...defaultProps}
        guestData={{ ...MOCK_GUEST, status: 'checked_in' }}
      />,
    );

    expect(screen.getByText('Checked In')).toBeDefined();
  });

  it('should display checked_out status badge', () => {
    render(
      <CheckoutPanel
        {...defaultProps}
        guestData={{ ...MOCK_GUEST, status: 'checked_out' }}
      />,
    );

    expect(screen.getByText('Checked Out')).toBeDefined();
  });

  it('should show warning when solde > 0', () => {
    render(<CheckoutPanel {...defaultProps} />);

    expect(screen.getByText('Solde restant: 45.50 EUR')).toBeDefined();
  });

  it('should not show warning when solde is 0', () => {
    render(
      <CheckoutPanel
        {...defaultProps}
        guestData={{ ...MOCK_GUEST, solde: 0 }}
      />,
    );

    expect(screen.queryByText(/Solde restant/)).toBeNull();
  });

  it('should call onAccept when clicking accept button', () => {
    render(<CheckoutPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Accepter checkout'));
    expect(defaultProps.onAccept).toHaveBeenCalledOnce();
  });

  it('should show decline form when clicking refuse', () => {
    render(<CheckoutPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Refuser'));
    expect(screen.getByText('Motif du refus')).toBeDefined();
    expect(screen.getByPlaceholderText('Indiquer le motif du refus...')).toBeDefined();
  });

  it('should call onDecline with reason when confirming refusal', () => {
    render(<CheckoutPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Refuser'));

    const textarea = screen.getByPlaceholderText('Indiquer le motif du refus...');
    fireEvent.change(textarea, { target: { value: 'Chambre endommagee' } });
    fireEvent.click(screen.getByText('Confirmer le refus'));

    expect(defaultProps.onDecline).toHaveBeenCalledWith('Chambre endommagee');
  });

  it('should disable confirm refusal when reason is empty', () => {
    render(<CheckoutPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Refuser'));

    const confirmBtn = screen.getByText('Confirmer le refus');
    expect(confirmBtn).toHaveProperty('disabled', true);
  });

  it('should show cancel pass confirmation when clicking annuler pass', () => {
    render(<CheckoutPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Annuler pass'));
    expect(screen.getByText("Confirmer l'annulation du pass ?")).toBeDefined();
  });

  it('should call onCancelPass when confirming pass cancellation', () => {
    render(<CheckoutPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Annuler pass'));
    fireEvent.click(screen.getByText('Oui, annuler le pass'));

    expect(defaultProps.onCancelPass).toHaveBeenCalledOnce();
  });

  it('should not show annuler pass button when guest has no pass', () => {
    render(
      <CheckoutPanel
        {...defaultProps}
        guestData={{ ...MOCK_GUEST, passId: undefined }}
      />,
    );

    expect(screen.queryByText('Annuler pass')).toBeNull();
  });

  it('should show empty state when no guest data', () => {
    render(
      <CheckoutPanel
        {...defaultProps}
        guestData={null}
      />,
    );

    expect(screen.getByText('Aucun guest selectionne pour le checkout.')).toBeDefined();
  });

  it('should disable action buttons when processing', () => {
    render(<CheckoutPanel {...defaultProps} isProcessing />);

    const acceptBtn = screen.getByText('Accepter checkout');
    expect(acceptBtn.closest('button')).toHaveProperty('disabled', true);
  });

  it('should display pass ID in summary', () => {
    render(<CheckoutPanel {...defaultProps} />);

    expect(screen.getByText('CMP-2026-0042')).toBeDefined();
  });
});
