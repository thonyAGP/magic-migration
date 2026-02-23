// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataCatchReview } from '../DataCatchReview';
import type {
  CustomerPersonalInfo,
  CustomerAddress,
  CustomerPreferences,
} from '@/types/datacatch';

const mockPersonalInfo: CustomerPersonalInfo = {
  civilite: 'M',
  nom: 'Dupont',
  prenom: 'Jean',
  dateNaissance: '1985-03-22',
  nationalite: 'Francaise',
  typeIdentite: 'passeport',
  numeroIdentite: 'FR12345',
};

const mockAddress: CustomerAddress = {
  adresse: '10 Avenue des Champs',
  complement: '',
  codePostal: '75008',
  ville: 'Paris',
  pays: 'France',
  telephone: '0601020304',
  email: 'jean@test.fr',
};

const mockPreferences: CustomerPreferences = {
  languePreferee: 'Francais',
  consentementMarketing: true,
  newsletter: false,
  consentementCommunication: true,
  activitesPreferees: ['Sport', 'Culture'],
};

describe('DataCatchReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all 3 sections', () => {
    render(
      <DataCatchReview
        personalInfo={mockPersonalInfo}
        address={mockAddress}
        preferences={mockPreferences}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('Informations personnelles')).toBeDefined();
    expect(screen.getByText('Adresse et contact')).toBeDefined();
    expect(screen.getByText('Preferences')).toBeDefined();
  });

  it('should show non renseigne for null sections', () => {
    render(
      <DataCatchReview
        personalInfo={null}
        address={null}
        preferences={null}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    const nonRenseigne = screen.getAllByText('Non renseigne');
    expect(nonRenseigne.length).toBe(3);
  });

  it('should show personal info details', () => {
    render(
      <DataCatchReview
        personalInfo={mockPersonalInfo}
        address={mockAddress}
        preferences={mockPreferences}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('Dupont')).toBeDefined();
    expect(screen.getByText('Jean')).toBeDefined();
    expect(screen.getByText('Monsieur')).toBeDefined();
    expect(screen.getByText('Passeport')).toBeDefined();
  });

  it('should call onConfirm on button click', () => {
    const onConfirm = vi.fn();
    render(
      <DataCatchReview
        personalInfo={mockPersonalInfo}
        address={mockAddress}
        preferences={mockPreferences}
        onConfirm={onConfirm}
        onBack={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Confirmer et enregistrer'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should show submitting state', () => {
    render(
      <DataCatchReview
        personalInfo={mockPersonalInfo}
        address={mockAddress}
        preferences={mockPreferences}
        onConfirm={vi.fn()}
        onBack={vi.fn()}
        isSubmitting
      />,
    );

    expect(screen.getByText('Enregistrement en cours...')).toBeDefined();
  });
});
