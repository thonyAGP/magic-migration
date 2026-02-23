// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassCreationForm } from '../PassCreationForm';

describe('PassCreationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<PassCreationForm onValidate={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Nouvelle carte Club Med Pass')).toBeDefined();
    expect(screen.getByPlaceholderText('Dupont')).toBeDefined();
    expect(screen.getByPlaceholderText('Jean')).toBeDefined();
    expect(screen.getByText('Village')).toBeDefined();
    expect(screen.getByText('Standard')).toBeDefined();
    expect(screen.getByText('Premium')).toBeDefined();
    expect(screen.getByText('Enfant')).toBeDefined();
    expect(screen.getByText('Annuler')).toBeDefined();
  });

  it('should show validation errors on empty submit', () => {
    render(<PassCreationForm onValidate={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByText('Creer la carte'));

    expect(screen.getByText('Nom requis')).toBeDefined();
    expect(screen.getByText('Prenom requis')).toBeDefined();
  });

  it('should call onValidate with valid data', () => {
    const onValidate = vi.fn();
    render(<PassCreationForm onValidate={onValidate} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Dupont'), {
      target: { value: 'Martin' },
    });
    fireEvent.change(screen.getByPlaceholderText('Jean'), {
      target: { value: 'Pierre' },
    });
    // Date naissance
    const dateInputs = screen.getAllByDisplayValue('');
    const dateNaissanceInput = dateInputs.find(
      (el) => el.getAttribute('type') === 'date',
    );
    if (dateNaissanceInput) {
      fireEvent.change(dateNaissanceInput, { target: { value: '1990-01-15' } });
    }
    // Village
    const villageSelect = screen.getByDisplayValue('Selectionner un village');
    fireEvent.change(villageSelect, { target: { value: 'OPE' } });
    // Dates
    const _allDateInputs = screen.getAllByRole('textbox').length === 0
      ? document.querySelectorAll('input[type="date"]')
      : [];
    // Use direct query for date inputs
    const dateFields = document.querySelectorAll('input[type="date"]');
    if (dateFields[1]) {
      fireEvent.change(dateFields[1], { target: { value: '2026-03-01' } });
    }
    if (dateFields[2]) {
      fireEvent.change(dateFields[2], { target: { value: '2026-03-15' } });
    }

    fireEvent.click(screen.getByText('Creer la carte'));

    expect(onValidate).toHaveBeenCalledWith(
      expect.objectContaining({
        nom: 'Martin',
        prenom: 'Pierre',
        typePass: 'standard',
      }),
    );
  });

  it('should select pass type via radio buttons', () => {
    render(<PassCreationForm onValidate={vi.fn()} onCancel={vi.fn()} />);

    const premiumRadio = screen.getByDisplayValue('premium');
    fireEvent.click(premiumRadio);

    expect(premiumRadio).toHaveProperty('checked', true);
  });

  it('should call onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<PassCreationForm onValidate={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Annuler'));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should show submitting state', () => {
    render(
      <PassCreationForm onValidate={vi.fn()} onCancel={vi.fn()} isSubmitting />,
    );

    expect(screen.getByText('Creation en cours...')).toBeDefined();
  });
});
