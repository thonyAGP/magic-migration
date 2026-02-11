// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RemiseCoffreForm } from '../RemiseCoffreForm';

const devises = ['EUR', 'USD'];

describe('RemiseCoffreForm', () => {
  it('should render all form fields', () => {
    render(<RemiseCoffreForm onSubmit={vi.fn()} devises={devises} isSubmitting={false} />);
    expect(screen.getByText('Remise au coffre')).toBeInTheDocument();
    expect(screen.getByLabelText(/Montant/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Devise/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Motif/)).toBeInTheDocument();
    expect(screen.getByText('Valider la remise')).toBeInTheDocument();
  });

  it('should not submit with empty fields', () => {
    const onSubmit = vi.fn();
    render(<RemiseCoffreForm onSubmit={onSubmit} devises={devises} isSubmitting={false} />);
    fireEvent.click(screen.getByText('Valider la remise'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit with valid data', () => {
    const onSubmit = vi.fn();
    render(<RemiseCoffreForm onSubmit={onSubmit} devises={devises} isSubmitting={false} />);
    fireEvent.change(screen.getByLabelText(/Montant/), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/Motif/), { target: { value: 'Remise de fin de journee' } });
    fireEvent.click(screen.getByText('Valider la remise'));
    expect(onSubmit).toHaveBeenCalledWith({
      montant: 200,
      deviseCode: 'EUR',
      motif: 'Remise de fin de journee',
    });
  });

  it('should show submitting state', () => {
    render(<RemiseCoffreForm onSubmit={vi.fn()} devises={devises} isSubmitting={true} />);
    expect(screen.getByText('Validation...')).toBeInTheDocument();
  });
});
