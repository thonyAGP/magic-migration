// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PassDetailCard } from '../PassDetailCard';
import type { ClubMedPass, PassValidationResult } from '@/types/clubmedpass';

const mockPass: ClubMedPass = {
  id: 1,
  numeroPass: 'CM-2026-001234',
  titulaire: 'Jean Dupont',
  societe: 'ADH',
  codeAdherent: 1001,
  filiation: 0,
  statut: 'active',
  solde: 250.0,
  devise: 'EUR',
  limitJournaliere: 500,
  limitHebdomadaire: 2000,
  dateExpiration: '2026-12-31',
  derniereUtilisation: '2026-02-09',
};

const validResult: PassValidationResult = {
  isValid: true,
  soldeDisponible: 200,
  peutTraiter: true,
  raison: null,
  limitJournaliereRestante: 450,
  limitHebdomadaireRestante: 1800,
};

const refusedResult: PassValidationResult = {
  isValid: false,
  soldeDisponible: 10,
  peutTraiter: false,
  raison: 'Solde insuffisant',
  limitJournaliereRestante: 0,
  limitHebdomadaireRestante: 200,
};

describe('PassDetailCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show empty state when pass is null', () => {
    render(<PassDetailCard pass={null} validationResult={null} />);

    expect(screen.getByText('Aucun pass selectionne')).toBeDefined();
  });

  it('should show loading placeholders', () => {
    const { container } = render(
      <PassDetailCard pass={null} validationResult={null} isLoading />,
    );

    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('should render pass details', () => {
    render(<PassDetailCard pass={mockPass} validationResult={null} />);

    expect(screen.getByText('Jean Dupont')).toBeDefined();
    expect(screen.getByText('CM-2026-001234')).toBeDefined();
    expect(screen.getByText('#1001')).toBeDefined();
    expect(screen.getByText('Actif')).toBeDefined();
    expect(screen.getByText('2026-12-31')).toBeDefined();
    expect(screen.getByText('2026-02-09')).toBeDefined();
  });

  it('should show green banner for valid transaction', () => {
    render(<PassDetailCard pass={mockPass} validationResult={validResult} />);

    expect(screen.getByText(/Transaction autorisee/)).toBeDefined();
  });

  it('should show red banner for refused transaction', () => {
    render(<PassDetailCard pass={mockPass} validationResult={refusedResult} />);

    expect(screen.getByText(/Transaction refusee/)).toBeDefined();
    expect(screen.getByText(/Solde insuffisant/)).toBeDefined();
  });
});
