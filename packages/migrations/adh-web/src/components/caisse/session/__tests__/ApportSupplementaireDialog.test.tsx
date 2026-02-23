import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApportSupplementaireDialog } from '../ApportSupplementaireDialog';

describe('ApportSupplementaireDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onValidate: vi.fn(),
    deviseCode: 'EUR',
  };

  it('should render when open', () => {
    render(<ApportSupplementaireDialog {...defaultProps} />);

    expect(screen.getByText('Apport supplementaire')).toBeInTheDocument();
    expect(screen.getByText(/Ajouter un apport avant la fermeture/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ApportSupplementaireDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Apport supplementaire')).not.toBeInTheDocument();
  });

  it('should have coffre and produits radio buttons', () => {
    render(<ApportSupplementaireDialog {...defaultProps} />);

    expect(screen.getByLabelText('Coffre')).toBeInTheDocument();
    expect(screen.getByLabelText('Produits')).toBeInTheDocument();
  });

  it('should have coffre selected by default', () => {
    render(<ApportSupplementaireDialog {...defaultProps} />);

    const coffreRadio = screen.getByLabelText('Coffre') as HTMLInputElement;
    expect(coffreRadio.checked).toBe(true);
  });

  it('should switch between coffre and produits', () => {
    render(<ApportSupplementaireDialog {...defaultProps} />);

    const produitsRadio = screen.getByLabelText('Produits') as HTMLInputElement;
    fireEvent.click(produitsRadio);
    expect(produitsRadio.checked).toBe(true);

    const coffreRadio = screen.getByLabelText('Coffre') as HTMLInputElement;
    expect(coffreRadio.checked).toBe(false);
  });

  it('should show validation error for empty montant', () => {
    render(<ApportSupplementaireDialog {...defaultProps} />);

    // Fill motif but not montant
    fireEvent.change(screen.getByPlaceholderText(/Raison de l'apport/), {
      target: { value: 'Test motif' },
    });

    fireEvent.click(screen.getByText("Valider l'apport"));

    expect(screen.getByText('Le montant doit etre superieur a 0')).toBeInTheDocument();
    expect(defaultProps.onValidate).not.toHaveBeenCalled();
  });

  it('should show validation error for negative montant', () => {
    render(<ApportSupplementaireDialog {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '-10' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Raison de l'apport/), {
      target: { value: 'Test motif' },
    });

    fireEvent.click(screen.getByText("Valider l'apport"));

    expect(screen.getByText('Le montant doit etre superieur a 0')).toBeInTheDocument();
  });

  it('should show validation error for empty motif', () => {
    render(<ApportSupplementaireDialog {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '50' },
    });

    fireEvent.click(screen.getByText("Valider l'apport"));

    expect(screen.getByText('Le motif est obligatoire')).toBeInTheDocument();
    expect(defaultProps.onValidate).not.toHaveBeenCalled();
  });

  it('should call onValidate with correct data', () => {
    const onValidate = vi.fn();
    render(<ApportSupplementaireDialog {...defaultProps} onValidate={onValidate} />);

    // Select produits
    fireEvent.click(screen.getByLabelText('Produits'));

    // Set montant
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '75.50' },
    });

    // Set motif
    fireEvent.change(screen.getByPlaceholderText(/Raison de l'apport/), {
      target: { value: 'Reappro produits' },
    });

    fireEvent.click(screen.getByText("Valider l'apport"));

    expect(onValidate).toHaveBeenCalledWith('produits', 75.50, 'Reappro produits');
  });

  it('should call onClose when annuler is clicked', () => {
    const onClose = vi.fn();
    render(<ApportSupplementaireDialog {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should display the devise code in description', () => {
    render(<ApportSupplementaireDialog {...defaultProps} deviseCode="USD" />);

    expect(screen.getByText(/fermeture de caisse \(USD\)/i)).toBeInTheDocument();
  });
});
