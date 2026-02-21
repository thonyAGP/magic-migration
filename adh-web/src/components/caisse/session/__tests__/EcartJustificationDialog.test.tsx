// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EcartJustificationDialog } from '../EcartJustificationDialog';
import type { SessionEcart } from '@/types';

const mockEcart: SessionEcart = {
  attendu: 1000,
  compte: 950,
  ecart: -50,
  estEquilibre: false,
  statut: 'negatif',
  ecartsDevises: [
    { deviseCode: 'EUR', attendu: 1000, compte: 950, ecart: -50 },
  ],
};

describe('EcartJustificationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(
      <EcartJustificationDialog
        ecart={mockEcart}
        open={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.queryByText("Justification de l'ecart")).toBeNull();
  });

  it('should render ecart summary when open', () => {
    render(
      <EcartJustificationDialog
        ecart={mockEcart}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Justification de l'ecart")).toBeDefined();
    expect(screen.getByText('Attendu')).toBeDefined();
    expect(screen.getByText('Compte')).toBeDefined();
    expect(screen.getByText('Ecart')).toBeDefined();
  });

  it('should require justification when ecart is non-zero', () => {
    const onSubmit = vi.fn();
    render(
      <EcartJustificationDialog
        ecart={mockEcart}
        open={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    // Valider button should be disabled without justification
    const validerBtn = screen.getByText('Valider');
    expect(validerBtn).toHaveProperty('disabled', true);

    // Type justification
    const textarea = screen.getByPlaceholderText("Saisissez la raison de cet ecart...");
    fireEvent.change(textarea, { target: { value: 'Erreur comptage especes' } });

    expect(validerBtn).toHaveProperty('disabled', false);

    fireEvent.click(validerBtn);
    expect(onSubmit).toHaveBeenCalledWith('Erreur comptage especes');
  });

  it('should call onClose when Annuler clicked', () => {
    const onClose = vi.fn();
    render(
      <EcartJustificationDialog
        ecart={mockEcart}
        open={true}
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should show required asterisk for non-zero ecart', () => {
    render(
      <EcartJustificationDialog
        ecart={mockEcart}
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('*')).toBeDefined();
  });
});
