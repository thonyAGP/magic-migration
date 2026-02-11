// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GarantieRetraitDialog } from '../GarantieRetraitDialog';
import type { GarantieArticle } from '@/types/garantie';

const mockArticle: GarantieArticle = {
  id: 1,
  garantieId: 10,
  code: 'SKI01',
  libelle: 'Paire de skis',
  description: 'Skis adulte 170cm',
  valeurEstimee: 300,
  etat: 'depose',
};

describe('GarantieRetraitDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with article details', () => {
    render(
      <GarantieRetraitDialog
        open
        onClose={vi.fn()}
        article={mockArticle}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("Retrait d'article")).toBeInTheDocument();
    expect(screen.getByText('SKI01')).toBeInTheDocument();
    expect(screen.getByText('Paire de skis')).toBeInTheDocument();
    expect(screen.getByText('Skis adulte 170cm')).toBeInTheDocument();
    expect(screen.getByText(/300,00/)).toBeInTheDocument();
  });

  it('should not render when article is null', () => {
    render(
      <GarantieRetraitDialog
        open
        onClose={vi.fn()}
        article={null}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByText("Retrait d'article")).not.toBeInTheDocument();
  });

  it('should call onConfirm and onClose on confirm click', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <GarantieRetraitDialog
        open
        onClose={onClose}
        article={mockArticle}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByText('Confirmer retrait'));
    expect(onConfirm).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose on cancel', () => {
    const onClose = vi.fn();
    render(
      <GarantieRetraitDialog
        open
        onClose={onClose}
        article={mockArticle}
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should show confirmation message with article name', () => {
    render(
      <GarantieRetraitDialog
        open
        onClose={vi.fn()}
        article={mockArticle}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(/Confirmer le retrait de Paire de skis/)).toBeInTheDocument();
  });
});
