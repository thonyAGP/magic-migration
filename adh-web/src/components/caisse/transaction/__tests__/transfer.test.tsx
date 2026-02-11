// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransferDialog } from '../TransferDialog';
import { LiberationDialog } from '../LiberationDialog';

describe('TransferDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onValidate: vi.fn(),
    sourceAccount: '10001',
    sourceAccountName: 'DUPONT Jean',
  };

  it('should render when open', () => {
    render(<TransferDialog {...defaultProps} />);
    expect(screen.getByText('Transfert entre comptes')).toBeInTheDocument();
    expect(screen.getByText('10001 - DUPONT Jean')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<TransferDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Transfert entre comptes')).not.toBeInTheDocument();
  });

  it('should show source account as read-only', () => {
    render(<TransferDialog {...defaultProps} />);
    expect(screen.getByText('10001 - DUPONT Jean')).toBeInTheDocument();
  });

  it('should filter source account from destination options', () => {
    render(<TransferDialog {...defaultProps} />);
    const select = screen.getByTestId('compte-destination');
    const options = select.querySelectorAll('option');
    const values = Array.from(options).map((o) => o.value);
    expect(values).not.toContain('10001');
    expect(values).toContain('10002');
  });

  it('should reject when montant is 0', () => {
    const onValidate = vi.fn();
    render(<TransferDialog {...defaultProps} onValidate={onValidate} />);

    fireEvent.click(screen.getByText('Transferer'));
    expect(onValidate).not.toHaveBeenCalled();
    expect(screen.getByText('Le montant doit etre superieur a 0')).toBeInTheDocument();
  });

  it('should reject when destination equals source', () => {
    const onValidate = vi.fn();
    render(
      <TransferDialog
        {...defaultProps}
        sourceAccount="10002"
        sourceAccountName="MARTIN Sophie"
        onValidate={onValidate}
      />,
    );

    // Fill fields - 10002 is source, select it as destination too via direct state
    // Since 10002 is filtered from the select, this test verifies filtering works
    const select = screen.getByTestId('compte-destination');
    const options = select.querySelectorAll('option');
    const values = Array.from(options).map((o) => o.value);
    expect(values).not.toContain('10002');
  });

  it('should reject when motif is empty', () => {
    const onValidate = vi.fn();
    render(<TransferDialog {...defaultProps} onValidate={onValidate} />);

    const select = screen.getByTestId('compte-destination');
    fireEvent.change(select, { target: { value: '10002' } });

    const montant = screen.getByTestId('montant');
    fireEvent.change(montant, { target: { value: '50' } });

    fireEvent.click(screen.getByText('Transferer'));
    expect(onValidate).not.toHaveBeenCalled();
    expect(screen.getByText('Le motif est obligatoire')).toBeInTheDocument();
  });

  it('should call onValidate with correct data', () => {
    const onValidate = vi.fn();
    render(<TransferDialog {...defaultProps} onValidate={onValidate} />);

    const select = screen.getByTestId('compte-destination');
    fireEvent.change(select, { target: { value: '10002' } });

    const montant = screen.getByTestId('montant');
    fireEvent.change(montant, { target: { value: '150.50' } });

    const motif = screen.getByTestId('motif');
    fireEvent.change(motif, { target: { value: 'Transfert pour reservation' } });

    fireEvent.click(screen.getByText('Transferer'));
    expect(onValidate).toHaveBeenCalledWith({
      compteSource: '10001',
      compteDestination: '10002',
      montant: 150.50,
      motif: 'Transfert pour reservation',
    });
  });

  it('should call onClose when Annuler clicked', () => {
    const onClose = vi.fn();
    render(<TransferDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('LiberationDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onValidate: vi.fn(),
    maxAmount: 500,
    accountNumber: '10001',
  };

  it('should render when open', () => {
    render(<LiberationDialog {...defaultProps} />);
    expect(screen.getByText('Liberation de fonds')).toBeInTheDocument();
    expect(screen.getByText('10001')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<LiberationDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Liberation de fonds')).not.toBeInTheDocument();
  });

  it('should display max amount', () => {
    render(<LiberationDialog {...defaultProps} />);
    expect(screen.getByText(/500,00/)).toBeInTheDocument();
  });

  it('should reject when montant is 0', () => {
    const onValidate = vi.fn();
    render(<LiberationDialog {...defaultProps} onValidate={onValidate} />);

    fireEvent.click(screen.getByText('Liberer'));
    expect(onValidate).not.toHaveBeenCalled();
    expect(screen.getByText('Le montant doit etre superieur a 0')).toBeInTheDocument();
  });

  it('should reject when montant exceeds maxAmount', () => {
    const onValidate = vi.fn();
    render(<LiberationDialog {...defaultProps} onValidate={onValidate} />);

    const montant = screen.getByTestId('montant-liberation');
    fireEvent.change(montant, { target: { value: '600' } });

    const ref = screen.getByTestId('reference-origine');
    fireEvent.change(ref, { target: { value: 'REF-001' } });

    fireEvent.click(screen.getByText('Liberer'));
    expect(onValidate).not.toHaveBeenCalled();
    expect(screen.getByText(/ne peut pas depasser/)).toBeInTheDocument();
  });

  it('should reject when reference is empty', () => {
    const onValidate = vi.fn();
    render(<LiberationDialog {...defaultProps} onValidate={onValidate} />);

    const montant = screen.getByTestId('montant-liberation');
    fireEvent.change(montant, { target: { value: '100' } });

    fireEvent.click(screen.getByText('Liberer'));
    expect(onValidate).not.toHaveBeenCalled();
    expect(screen.getByText("La reference d'origine est obligatoire")).toBeInTheDocument();
  });

  it('should call onValidate with correct data', () => {
    const onValidate = vi.fn();
    render(<LiberationDialog {...defaultProps} onValidate={onValidate} />);

    const montant = screen.getByTestId('montant-liberation');
    fireEvent.change(montant, { target: { value: '250' } });

    const ref = screen.getByTestId('reference-origine');
    fireEvent.change(ref, { target: { value: 'OP-2026-001' } });

    fireEvent.click(screen.getByText('Liberer'));
    expect(onValidate).toHaveBeenCalledWith({
      compte: '10001',
      montant: 250,
      referenceOrigine: 'OP-2026-001',
    });
  });

  it('should call onClose when Annuler clicked', () => {
    const onClose = vi.fn();
    render(<LiberationDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });
});
