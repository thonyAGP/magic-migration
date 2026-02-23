// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonalInfoForm } from '../PersonalInfoForm';
import type { CustomerPersonalInfo } from '@/types/datacatch';

const mockInitialData: CustomerPersonalInfo = {
  civilite: 'Mme',
  nom: 'Dupont',
  prenom: 'Marie',
  dateNaissance: '1990-05-15',
  nationalite: 'Francaise',
  typeIdentite: 'carte_identite',
  numeroIdentite: 'ABC123456',
};

describe('PersonalInfoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all fields', () => {
    render(
      <PersonalInfoForm onSave={vi.fn()} onBack={vi.fn()} />,
    );

    expect(screen.getByText('Informations personnelles')).toBeDefined();
    expect(screen.getByText('Civilite')).toBeDefined();
    expect(screen.getByPlaceholderText('Nom')).toBeDefined();
    expect(screen.getByPlaceholderText('Prenom')).toBeDefined();
    expect(screen.getByText('Date de naissance')).toBeDefined();
    expect(screen.getByPlaceholderText('Nationalite')).toBeDefined();
    expect(screen.getByText('Type identite')).toBeDefined();
    expect(screen.getByPlaceholderText("Numero d'identite")).toBeDefined();
  });

  it('should pre-fill from initialData', () => {
    render(
      <PersonalInfoForm
        initialData={mockInitialData}
        onSave={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const nomInput = screen.getByPlaceholderText('Nom') as HTMLInputElement;
    expect(nomInput.value).toBe('Dupont');

    const prenomInput = screen.getByPlaceholderText('Prenom') as HTMLInputElement;
    expect(prenomInput.value).toBe('Marie');
  });

  it('should show validation errors on empty submit', () => {
    render(
      <PersonalInfoForm onSave={vi.fn()} onBack={vi.fn()} />,
    );

    fireEvent.click(screen.getByText('Suivant'));

    expect(screen.getByText('Nom requis')).toBeDefined();
    expect(screen.getByText('Prenom requis')).toBeDefined();
  });

  it('should call onSave with valid data', () => {
    const onSave = vi.fn();
    render(
      <PersonalInfoForm
        initialData={mockInitialData}
        onSave={onSave}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Suivant'));
    expect(onSave).toHaveBeenCalledOnce();
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ nom: 'Dupont', prenom: 'Marie' }),
    );
  });

  it('should call onBack on retour click', () => {
    const onBack = vi.fn();
    render(
      <PersonalInfoForm onSave={vi.fn()} onBack={onBack} />,
    );

    fireEvent.click(screen.getByText('Retour'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
