// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GarantieOperationGrid } from '../GarantieOperationGrid';
import type { GarantieOperation } from '@/types/garantie';

const mockOperations: GarantieOperation[] = [
  {
    id: 1,
    garantieId: 10,
    type: 'depot',
    montant: 500,
    date: '2026-02-10',
    heure: '09:00',
    operateur: 'caissier1',
    motif: 'Caution chambre',
  },
  {
    id: 2,
    garantieId: 10,
    type: 'versement',
    montant: 100,
    date: '2026-02-10',
    heure: '10:00',
    operateur: 'caissier1',
    motif: 'Versement partiel',
  },
  {
    id: 3,
    garantieId: 10,
    type: 'retrait',
    montant: 50,
    date: '2026-02-10',
    heure: '11:00',
    operateur: 'caissier2',
    motif: 'Retrait minibar',
  },
  {
    id: 4,
    garantieId: 10,
    type: 'annulation',
    montant: 500,
    date: '2026-02-10',
    heure: '12:00',
    operateur: 'superviseur',
    motif: 'Annulation erreur saisie',
  },
];

describe('GarantieOperationGrid', () => {
  it('should render operations table', () => {
    render(<GarantieOperationGrid operations={mockOperations} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Heure')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Montant')).toBeInTheDocument();
    expect(screen.getByText('Motif')).toBeInTheDocument();
    expect(screen.getByText('Operateur')).toBeInTheDocument();
  });

  it('should show empty state', () => {
    render(<GarantieOperationGrid operations={[]} />);

    expect(screen.getByText('Aucune operation')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const { container } = render(
      <GarantieOperationGrid operations={[]} isLoading />,
    );

    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('should display type badges with correct labels', () => {
    render(<GarantieOperationGrid operations={mockOperations} />);

    expect(screen.getByText('Depot')).toBeInTheDocument();
    expect(screen.getByText('Versement')).toBeInTheDocument();
    expect(screen.getByText('Retrait')).toBeInTheDocument();
    expect(screen.getByText('Annulation')).toBeInTheDocument();
  });

  it('should format montant correctly', () => {
    render(<GarantieOperationGrid operations={[mockOperations[0]]} />);

    // Intl.NumberFormat with fr-FR and EUR produces "500,00 €" (with nbsp)
    const cell = screen.getByText(/500,00/);
    expect(cell).toBeInTheDocument();
  });
});
