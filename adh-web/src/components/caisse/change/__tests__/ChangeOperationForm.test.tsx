// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeOperationForm } from '../ChangeOperationForm';
import type { Devise } from '@/types/change';

const mockDevises: Devise[] = [
  { code: 'USD', libelle: 'Dollar US', symbole: '$', tauxActuel: 1.0856, nbDecimales: 2 },
  { code: 'GBP', libelle: 'Livre Sterling', symbole: '\u00a3', tauxActuel: 0.8534, nbDecimales: 2 },
];

describe('ChangeOperationForm', () => {
  it('should render all form fields', () => {
    render(
      <ChangeOperationForm
        devises={mockDevises}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText('Achat')).toBeInTheDocument();
    expect(screen.getByText('Vente')).toBeInTheDocument();
    expect(screen.getByText('Devise')).toBeInTheDocument();
    expect(screen.getByText(/Montant/)).toBeInTheDocument();
    expect(screen.getByText('Taux de change')).toBeInTheDocument();
    expect(screen.getByText('Mode de paiement')).toBeInTheDocument();
    expect(screen.getByText("Valider l'operation")).toBeInTheDocument();
  });

  it('should toggle operation type', () => {
    render(
      <ChangeOperationForm
        devises={mockDevises}
        onSubmit={vi.fn()}
      />,
    );
    const venteBtn = screen.getByText('Vente');
    fireEvent.click(venteBtn);
    // Vente button should now be primary-styled
    expect(venteBtn.className).toContain('bg-primary');
  });

  it('should pre-fill taux when devise selected', () => {
    render(
      <ChangeOperationForm
        devises={mockDevises}
        onSubmit={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('USD'));
    const tauxInput = screen.getByPlaceholderText('0,0000') as HTMLInputElement;
    expect(Number(tauxInput.value)).toBeCloseTo(1.0856, 4);
  });

  it('should show validation errors on submit with empty fields', () => {
    const onSubmit = vi.fn();
    render(
      <ChangeOperationForm
        devises={mockDevises}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByText("Valider l'operation"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show submitting state', () => {
    render(
      <ChangeOperationForm
        devises={mockDevises}
        onSubmit={vi.fn()}
        isSubmitting
      />,
    );
    expect(screen.getByText('Validation en cours...')).toBeInTheDocument();
  });
});
