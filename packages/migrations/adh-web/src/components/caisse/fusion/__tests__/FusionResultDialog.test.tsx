// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionResultDialog } from '../FusionResultDialog';
import type { FusionResult } from '@/types/fusion';

const successResult: FusionResult = {
  success: true,
  compteFinal: {
    codeAdherent: 1001, filiation: 0, nom: 'Dupont', prenom: 'Jean',
    societe: 'ADH', solde: 2140.5, nbTransactions: 68, nbGaranties: 3,
  },
  nbOperationsFusionnees: 23,
  nbGarantiesTransferees: 1,
  message: 'Fusion effectuee avec succes',
  dateExecution: '2026-02-10 10:30:00',
};

const failureResult: FusionResult = {
  success: false,
  compteFinal: {
    codeAdherent: 1001, filiation: 0, nom: 'Dupont', prenom: 'Jean',
    societe: 'ADH', solde: 1250.0, nbTransactions: 45, nbGaranties: 2,
  },
  nbOperationsFusionnees: 0,
  nbGarantiesTransferees: 0,
  message: 'Erreur lors du transfert des garanties',
  dateExecution: '2026-02-10 10:30:00',
};

describe('FusionResultDialog', () => {
  it('should display success state with check icon', () => {
    render(
      <FusionResultDialog result={successResult} onRetry={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText('Fusion reussie')).toBeInTheDocument();
    expect(screen.getByText('Fusion effectuee avec succes')).toBeInTheDocument();
  });

  it('should display result details on success', () => {
    render(
      <FusionResultDialog result={successResult} onRetry={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2026-02-10 10:30:00')).toBeInTheDocument();
  });

  it('should display failure state with error icon', () => {
    render(
      <FusionResultDialog result={failureResult} onRetry={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText('Echec de la fusion')).toBeInTheDocument();
    expect(screen.getByText('Erreur lors du transfert des garanties')).toBeInTheDocument();
  });

  it('should show retry button only on failure', () => {
    const { rerender } = render(
      <FusionResultDialog result={successResult} onRetry={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.queryByText('Reessayer')).not.toBeInTheDocument();

    rerender(
      <FusionResultDialog result={failureResult} onRetry={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText('Reessayer')).toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', () => {
    const onRetry = vi.fn();
    render(
      <FusionResultDialog result={failureResult} onRetry={onRetry} onClose={vi.fn()} />,
    );
    fireEvent.click(screen.getByText('Reessayer'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <FusionResultDialog result={successResult} onRetry={vi.fn()} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText('Retour au menu'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should display account info in success details', () => {
    render(
      <FusionResultDialog result={successResult} onRetry={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText(/1001/)).toBeInTheDocument();
    expect(screen.getByText(/Dupont/)).toBeInTheDocument();
  });
});
