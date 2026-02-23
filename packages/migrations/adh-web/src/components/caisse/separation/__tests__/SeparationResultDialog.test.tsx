// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeparationResultDialog } from '../SeparationResultDialog';
import type { SeparationResult } from '@/types/separation';

const mockSuccessResult: SeparationResult = {
  success: true,
  compteSource: {
    codeAdherent: 1001,
    filiation: 0,
    nom: 'Dupont',
    prenom: 'Jean',
    societe: 'ADH',
    solde: 800.0,
    nbTransactions: 33,
  },
  compteDestination: {
    codeAdherent: 1002,
    filiation: 0,
    nom: 'Martin',
    prenom: 'Marie',
    societe: 'ADH',
    solde: 1340.5,
    nbTransactions: 35,
  },
  nbOperationsDeplacees: 12,
  montantDeplace: 450.0,
  message: 'Separation reussie',
  dateExecution: '2026-02-10 10:30:00',
};

const mockErrorResult: SeparationResult = {
  success: false,
  compteSource: mockSuccessResult.compteSource,
  compteDestination: mockSuccessResult.compteDestination,
  nbOperationsDeplacees: 0,
  montantDeplace: 0,
  message: 'Erreur lors du deplacement des operations',
  dateExecution: '2026-02-10 10:30:00',
};

describe('SeparationResultDialog', () => {
  it('should render success result', () => {
    render(
      <SeparationResultDialog
        open={true}
        result={mockSuccessResult}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Separation terminee')).toBeDefined();
  });

  it('should show operation count and amount', () => {
    render(
      <SeparationResultDialog
        open={true}
        result={mockSuccessResult}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('Operations deplacees')).toBeDefined();
  });

  it('should render error result', () => {
    render(
      <SeparationResultDialog
        open={true}
        result={mockErrorResult}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Echec de la separation')).toBeDefined();
  });

  it('should show error message', () => {
    render(
      <SeparationResultDialog
        open={true}
        result={mockErrorResult}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Erreur lors du deplacement des operations'),
    ).toBeDefined();
  });

  it('should call onClose on button click', () => {
    const onClose = vi.fn();
    render(
      <SeparationResultDialog
        open={true}
        result={mockSuccessResult}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText('Fermer'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
