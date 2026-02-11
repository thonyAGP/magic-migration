// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressForm } from '../AddressForm';
import type { CustomerAddress } from '@/types/datacatch';

const mockInitialData: CustomerAddress = {
  adresse: '12 Rue de la Paix',
  complement: 'Apt 3B',
  codePostal: '75002',
  ville: 'Paris',
  pays: 'France',
  telephone: '0601020304',
  email: 'jean@test.fr',
};

describe('AddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all fields', () => {
    render(
      <AddressForm onSave={vi.fn()} onBack={vi.fn()} />,
    );

    expect(screen.getByText('Adresse et contact')).toBeDefined();
    expect(screen.getByPlaceholderText('Adresse')).toBeDefined();
    expect(screen.getByPlaceholderText("Complement d'adresse")).toBeDefined();
    expect(screen.getByPlaceholderText('Code postal')).toBeDefined();
    expect(screen.getByPlaceholderText('Ville')).toBeDefined();
    expect(screen.getByText('Pays')).toBeDefined();
    expect(screen.getByPlaceholderText('Telephone')).toBeDefined();
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
  });

  it('should pre-fill from initialData', () => {
    render(
      <AddressForm
        initialData={mockInitialData}
        onSave={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const adresseInput = screen.getByPlaceholderText('Adresse') as HTMLInputElement;
    expect(adresseInput.value).toBe('12 Rue de la Paix');

    const villeInput = screen.getByPlaceholderText('Ville') as HTMLInputElement;
    expect(villeInput.value).toBe('Paris');
  });

  it('should show validation errors on empty submit', () => {
    render(
      <AddressForm
        initialData={{ ...mockInitialData, adresse: '', codePostal: '', ville: '', telephone: '', email: '', pays: '' }}
        onSave={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Suivant'));

    expect(screen.getByText('Adresse requise')).toBeDefined();
  });

  it('should call onSave with valid data', () => {
    const onSave = vi.fn();
    render(
      <AddressForm
        initialData={mockInitialData}
        onSave={onSave}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Suivant'));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ ville: 'Paris', pays: 'France' }),
    );
  });

  it('should default pays to France', () => {
    render(
      <AddressForm onSave={vi.fn()} onBack={vi.fn()} />,
    );

    // Combobox displays "France (FR)" when pays=France
    expect(screen.getByText('France (FR)')).toBeDefined();
  });
});
