// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GarantieDepotForm } from '../GarantieDepotForm';

describe('GarantieDepotForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<GarantieDepotForm onSubmit={vi.fn()} />);

    expect(screen.getByText('Nouveau depot de garantie')).toBeInTheDocument();
    expect(screen.getByText('Code adherent')).toBeInTheDocument();
    expect(screen.getByText('Filiation')).toBeInTheDocument();
    expect(screen.getByText('Montant')).toBeInTheDocument();
    expect(screen.getByText('Devise')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<GarantieDepotForm onSubmit={vi.fn()} />);

    expect(screen.getByText('Enregistrer le depot')).toBeInTheDocument();
  });

  it('should show validation errors on empty submit', () => {
    const onSubmit = vi.fn();
    render(<GarantieDepotForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText('Enregistrer le depot'));

    expect(onSubmit).not.toHaveBeenCalled();
    // Should show at least one error (codeAdherent is 0 = invalid)
    expect(screen.getByText('Code adherent requis')).toBeInTheDocument();
  });

  it('should call onSubmit with valid data', () => {
    const onSubmit = vi.fn();
    render(<GarantieDepotForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Code adherent'), { target: { value: '1001' } });
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '0' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '150' } });
    fireEvent.change(screen.getByPlaceholderText('Description du depot...'), {
      target: { value: 'Depot caution chambre 101' },
    });

    fireEvent.click(screen.getByText('Enregistrer le depot'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        codeAdherent: 1001,
        montant: 150,
        devise: 'EUR',
        description: 'Depot caution chambre 101',
      }),
    );
  });

  it('should show submitting state', () => {
    render(<GarantieDepotForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
  });

  it('should disable fields when disabled prop is true', () => {
    render(<GarantieDepotForm onSubmit={vi.fn()} disabled />);

    const inputs = screen.getAllByRole('spinbutton');
    for (const input of inputs) {
      expect(input).toBeDisabled();
    }
    expect(screen.getByPlaceholderText('Description du depot...')).toBeDisabled();
  });

  it('should show description validation error', () => {
    const onSubmit = vi.fn();
    render(<GarantieDepotForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Code adherent'), { target: { value: '1001' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '150' } });
    // Description too short (< 3 chars)
    fireEvent.change(screen.getByPlaceholderText('Description du depot...'), {
      target: { value: 'ab' },
    });

    fireEvent.click(screen.getByText('Enregistrer le depot'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Description requise (3 car. min)')).toBeInTheDocument();
  });
});
