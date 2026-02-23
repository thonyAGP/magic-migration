// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FactureClientSection } from '../FactureClientSection';
import type { FactureClient } from '../FactureClientSection';

const mockOnChange = vi.fn();
const mockOnSansNomChange = vi.fn();
const mockOnSansAdresseChange = vi.fn();

const fullClient: FactureClient = {
  nom: 'DUPONT',
  prenom: 'Jean',
  adresse1: '12 rue de Paris',
  adresse2: 'Apt 3',
  codePostal: '75001',
  ville: 'Paris',
  pays: 'FR',
  email: 'jean@example.com',
};

describe('FactureClientSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all client fields with data', () => {
    render(
      <FactureClientSection
        client={fullClient}
        onChange={mockOnChange}
        sansNom={false}
        sansAdresse={false}
        onSansNomChange={mockOnSansNomChange}
        onSansAdresseChange={mockOnSansAdresseChange}
      />,
    );

    expect(screen.getByText('Identite client')).toBeInTheDocument();
    expect(screen.getByDisplayValue('DUPONT')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jean')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12 rue de Paris')).toBeInTheDocument();
    expect(screen.getByDisplayValue('75001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Paris')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jean@example.com')).toBeInTheDocument();
  });

  it('should disable nom/prenom when sansNom is checked', () => {
    render(
      <FactureClientSection
        client={fullClient}
        onChange={mockOnChange}
        sansNom={true}
        sansAdresse={false}
        onSansNomChange={mockOnSansNomChange}
        onSansAdresseChange={mockOnSansAdresseChange}
      />,
    );

    // When sansNom, the nom field should show empty and be disabled
    const nomInput = screen.getByPlaceholderText('ANONYME');
    expect(nomInput).toBeDisabled();
  });

  it('should disable adresse fields when sansAdresse is checked', () => {
    render(
      <FactureClientSection
        client={fullClient}
        onChange={mockOnChange}
        sansNom={false}
        sansAdresse={true}
        onSansNomChange={mockOnSansNomChange}
        onSansAdresseChange={mockOnSansAdresseChange}
      />,
    );

    // CP field should be disabled
    const cpInputs = screen.getAllByRole('textbox');
    // Adresse1, Adresse2, CP, Ville, Pays should be disabled
    const disabledInputs = cpInputs.filter((input) => (input as HTMLInputElement).disabled);
    expect(disabledInputs.length).toBeGreaterThan(0);
  });

  it('should call onSansNomChange when checkbox clicked', () => {
    render(
      <FactureClientSection
        client={fullClient}
        onChange={mockOnChange}
        sansNom={false}
        sansAdresse={false}
        onSansNomChange={mockOnSansNomChange}
        onSansAdresseChange={mockOnSansAdresseChange}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // First checkbox is "Sans Nom"
    fireEvent.click(checkboxes[0]);
    expect(mockOnSansNomChange).toHaveBeenCalledWith(true);
  });

  it('should call onSansAdresseChange when checkbox clicked', () => {
    render(
      <FactureClientSection
        client={fullClient}
        onChange={mockOnChange}
        sansNom={false}
        sansAdresse={false}
        onSansNomChange={mockOnSansNomChange}
        onSansAdresseChange={mockOnSansAdresseChange}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    // Second checkbox is "Sans Adresse"
    fireEvent.click(checkboxes[1]);
    expect(mockOnSansAdresseChange).toHaveBeenCalledWith(true);
  });

  it('should display validation errors', () => {
    render(
      <FactureClientSection
        client={{ ...fullClient, nom: '' }}
        onChange={mockOnChange}
        sansNom={false}
        sansAdresse={false}
        onSansNomChange={mockOnSansNomChange}
        onSansAdresseChange={mockOnSansAdresseChange}
        errors={{ nom: 'Nom requis', adresse1: 'Adresse requise' }}
      />,
    );

    expect(screen.getByText('Nom requis')).toBeInTheDocument();
    expect(screen.getByText('Adresse requise')).toBeInTheDocument();
  });

  it('should call onChange when nom field changes', () => {
    render(
      <FactureClientSection
        client={fullClient}
        onChange={mockOnChange}
        sansNom={false}
        sansAdresse={false}
        onSansNomChange={mockOnSansNomChange}
        onSansAdresseChange={mockOnSansAdresseChange}
      />,
    );

    const nomInput = screen.getByDisplayValue('DUPONT');
    fireEvent.change(nomInput, { target: { value: 'MARTIN' } });
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ nom: 'MARTIN' }),
    );
  });
});
