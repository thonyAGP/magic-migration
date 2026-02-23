// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeOperationGrid } from '../ChangeOperationGrid';
import type { ChangeOperation, ChangeOperationSummary } from '@/types/change';

const mockOperations: ChangeOperation[] = [
  {
    id: 1,
    type: 'achat',
    deviseCode: 'USD',
    deviseLibelle: 'Dollar US',
    montant: 100,
    taux: 1.0856,
    contreValeur: 108.56,
    modePaiement: 'especes',
    date: '2026-02-10',
    heure: '10:30',
    operateur: 'caissier1',
    annule: false,
  },
  {
    id: 2,
    type: 'vente',
    deviseCode: 'GBP',
    deviseLibelle: 'Livre Sterling',
    montant: 50,
    taux: 0.8534,
    contreValeur: 42.67,
    modePaiement: 'carte',
    date: '2026-02-10',
    heure: '11:00',
    operateur: 'caissier1',
    annule: false,
  },
  {
    id: 3,
    type: 'achat',
    deviseCode: 'CHF',
    deviseLibelle: 'Franc Suisse',
    montant: 200,
    taux: 0.9412,
    contreValeur: 188.24,
    modePaiement: 'especes',
    date: '2026-02-10',
    heure: '11:30',
    operateur: 'caissier2',
    annule: true,
  },
];

const mockSummary: ChangeOperationSummary = {
  totalAchats: 296.80,
  totalVentes: 42.67,
  nbOperations: 3,
};

describe('ChangeOperationGrid', () => {
  it('should render empty state', () => {
    render(
      <ChangeOperationGrid
        operations={[]}
        summary={null}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Aucune operation de change')).toBeInTheDocument();
  });

  it('should render operations with correct badges', () => {
    render(
      <ChangeOperationGrid
        operations={mockOperations}
        summary={mockSummary}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Achat')).toBeInTheDocument();
    expect(screen.getByText('Vente')).toBeInTheDocument();
  });

  it('should show strikethrough for cancelled operations', () => {
    render(
      <ChangeOperationGrid
        operations={mockOperations}
        summary={mockSummary}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Annule')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <ChangeOperationGrid
        operations={mockOperations}
        summary={mockSummary}
        onCancel={onCancel}
      />,
    );
    const cancelButtons = screen.getAllByLabelText(/Annuler operation/);
    fireEvent.click(cancelButtons[0]);
    expect(onCancel).toHaveBeenCalledWith(1);
  });

  it('should display summary row', () => {
    render(
      <ChangeOperationGrid
        operations={mockOperations}
        summary={mockSummary}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/Operations/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show loading skeleton', () => {
    const { container } = render(
      <ChangeOperationGrid
        operations={[]}
        summary={null}
        onCancel={vi.fn()}
        isLoading
      />,
    );
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });
});
