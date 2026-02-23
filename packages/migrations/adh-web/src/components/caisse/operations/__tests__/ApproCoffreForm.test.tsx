// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApproCoffreForm } from '../ApproCoffreForm';

const devises = ['EUR', 'USD', 'GBP'];

describe('ApproCoffreForm', () => {
  it('should render all form fields', () => {
    render(<ApproCoffreForm onSubmit={vi.fn()} devises={devises} isSubmitting={false} />);
    expect(screen.getByText('Apport au coffre')).toBeInTheDocument();
    expect(screen.getByLabelText(/Montant/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Devise/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Motif/)).toBeInTheDocument();
    expect(screen.getByText("Valider l'apport")).toBeInTheDocument();
  });

  it('should render all devises in dropdown', () => {
    render(<ApproCoffreForm onSubmit={vi.fn()} devises={devises} isSubmitting={false} />);
    const select = screen.getByLabelText(/Devise/) as HTMLSelectElement;
    expect(select.options).toHaveLength(3);
  });

  it('should not submit with empty fields', () => {
    const onSubmit = vi.fn();
    render(<ApproCoffreForm onSubmit={onSubmit} devises={devises} isSubmitting={false} />);
    fireEvent.click(screen.getByText("Valider l'apport"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit with valid data', () => {
    const onSubmit = vi.fn();
    render(<ApproCoffreForm onSubmit={onSubmit} devises={devises} isSubmitting={false} />);
    fireEvent.change(screen.getByLabelText(/Montant/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Motif/), { target: { value: 'Approvisionnement' } });
    fireEvent.click(screen.getByText("Valider l'apport"));
    expect(onSubmit).toHaveBeenCalledWith({
      montant: 100,
      deviseCode: 'EUR',
      motif: 'Approvisionnement',
    });
  });

  it('should show submitting state', () => {
    render(<ApproCoffreForm onSubmit={vi.fn()} devises={devises} isSubmitting={true} />);
    expect(screen.getByText('Validation...')).toBeInTheDocument();
    expect(screen.getByText('Validation...').closest('button')).toBeDisabled();
  });
});
