// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FactureForm } from '../FactureForm';

describe('FactureForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<FactureForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Nouvelle facture')).toBeInTheDocument();
    expect(screen.getByText('Code adherent')).toBeInTheDocument();
    expect(screen.getByText('Filiation')).toBeInTheDocument();
    expect(screen.getByText('Facture')).toBeInTheDocument();
    expect(screen.getByText('Avoir')).toBeInTheDocument();
    expect(screen.getByText('Commentaire')).toBeInTheDocument();
    expect(screen.getByText('Creer la facture')).toBeInTheDocument();
  });

  it('should have facture type selected by default', () => {
    render(<FactureForm onSubmit={vi.fn()} />);
    const factureBtn = screen.getByText('Facture');
    expect(factureBtn.className).toContain('bg-primary');
  });

  it('should toggle to avoir type', () => {
    render(<FactureForm onSubmit={vi.fn()} />);
    const avoirBtn = screen.getByText('Avoir');
    fireEvent.click(avoirBtn);
    expect(avoirBtn.className).toContain('bg-warning');
  });

  it('should show validation errors on submit with empty fields', () => {
    const onSubmit = vi.fn();
    render(<FactureForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText('Creer la facture'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with valid data', () => {
    const onSubmit = vi.fn();
    render(<FactureForm onSubmit={onSubmit} />);

    const inputs = screen.getAllByRole('spinbutton');
    // Code adherent
    fireEvent.change(inputs[0], { target: { value: '1234' } });
    // Filiation
    fireEvent.change(inputs[1], { target: { value: '1' } });

    // Check "Sans Nom" and "Sans Adresse" to bypass client validation
    fireEvent.click(screen.getByLabelText('Sans Nom'));
    fireEvent.click(screen.getByLabelText('Sans Adresse'));

    fireEvent.click(screen.getByText('Creer la facture'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        codeAdherent: 1234,
        filiation: 1,
        type: 'facture',
      }),
    );
  });

  it('should show submitting state', () => {
    render(<FactureForm onSubmit={vi.fn()} isSubmitting />);
    expect(screen.getByText('Creation...')).toBeInTheDocument();
  });
});
