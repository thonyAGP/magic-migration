// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GarantieVersementDialog } from '../GarantieVersementDialog';
import type { Garantie } from '@/types/garantie';

const mockGarantie: Garantie = {
  id: 10,
  societe: 'ADH',
  codeAdherent: 1001,
  filiation: 0,
  nomAdherent: 'Dupont Jean',
  type: 'depot',
  statut: 'active',
  montant: 500,
  devise: 'EUR',
  dateCreation: '2026-02-10',
  dateExpiration: null,
  description: 'Caution chambre 101',
  operateur: 'caissier1',
  articles: [],
};

describe('GarantieVersementDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render in versement mode', () => {
    render(
      <GarantieVersementDialog
        open
        garantie={mockGarantie}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        mode="versement"
      />,
    );

    expect(screen.getByText('Versement garantie')).toBeInTheDocument();
    expect(screen.getByText('Dupont Jean')).toBeInTheDocument();
    expect(screen.getByText('Confirmer le versement')).toBeInTheDocument();
  });

  it('should render in retrait mode with warning', () => {
    render(
      <GarantieVersementDialog
        open
        garantie={mockGarantie}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        mode="retrait"
      />,
    );

    expect(screen.getByText('Retrait garantie')).toBeInTheDocument();
    expect(screen.getByText('Confirmer le retrait')).toBeInTheDocument();
  });

  it('should validate montant positive', () => {
    const onConfirm = vi.fn();
    render(
      <GarantieVersementDialog
        open
        garantie={mockGarantie}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        mode="versement"
      />,
    );

    // Try to confirm without filling montant - button should be disabled
    const confirmBtn = screen.getByText('Confirmer le versement');
    expect(confirmBtn).toBeDisabled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should validate motif min length', () => {
    const onConfirm = vi.fn();
    render(
      <GarantieVersementDialog
        open
        garantie={mockGarantie}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        mode="versement"
      />,
    );

    // Set montant but motif too short - button disabled
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '100' } });
    const confirmBtn = screen.getByText('Confirmer le versement');
    expect(confirmBtn).toBeDisabled();
  });

  it('should call onConfirm with valid data', () => {
    const onConfirm = vi.fn();
    render(
      <GarantieVersementDialog
        open
        garantie={mockGarantie}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        mode="versement"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('Motif...'), { target: { value: 'Versement test valide' } });

    fireEvent.click(screen.getByText('Confirmer le versement'));
    expect(onConfirm).toHaveBeenCalledWith(100, 'Versement test valide');
  });

  it('should call onClose on cancel', () => {
    const onClose = vi.fn();
    render(
      <GarantieVersementDialog
        open
        garantie={mockGarantie}
        onClose={onClose}
        onConfirm={vi.fn()}
        mode="versement"
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });
});
