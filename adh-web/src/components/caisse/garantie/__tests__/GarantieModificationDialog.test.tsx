// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GarantieModificationDialog } from '../GarantieModificationDialog';
import type { GarantieArticle } from '@/types/garantie';

const mockArticle: GarantieArticle = {
  id: 1,
  garantieId: 100,
  code: 'SKI01',
  libelle: 'Paire de skis',
  description: 'Skis de location',
  valeurEstimee: 250,
  etat: 'depose',
};

describe('GarantieModificationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render content when closed', () => {
    render(
      <GarantieModificationDialog
        open={false}
        onClose={vi.fn()}
        article={mockArticle}
        onValidate={vi.fn()}
      />,
    );

    expect(screen.queryByText("Modifier l'article")).toBeNull();
  });

  it('should render dialog with article data when open', () => {
    render(
      <GarantieModificationDialog
        open={true}
        onClose={vi.fn()}
        article={mockArticle}
        onValidate={vi.fn()}
      />,
    );

    expect(screen.getByText("Modifier l'article")).toBeDefined();
    expect(screen.getByDisplayValue('SKI01')).toBeDefined();
    expect(screen.getByDisplayValue('Paire de skis')).toBeDefined();
    expect(screen.getByDisplayValue('250')).toBeDefined();
  });

  it('should call onClose when Annuler clicked', () => {
    const onClose = vi.fn();
    render(
      <GarantieModificationDialog
        open={true}
        onClose={onClose}
        article={mockArticle}
        onValidate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onValidate with updated data when Modifier clicked', () => {
    const onValidate = vi.fn();
    render(
      <GarantieModificationDialog
        open={true}
        onClose={vi.fn()}
        article={mockArticle}
        onValidate={onValidate}
      />,
    );

    // Change the code
    const codeInput = screen.getByDisplayValue('SKI01');
    fireEvent.change(codeInput, { target: { value: 'SKI02' } });

    fireEvent.click(screen.getByText('Modifier'));

    expect(onValidate).toHaveBeenCalledOnce();
    expect(onValidate.mock.calls[0][0]).toMatchObject({
      id: 1,
      code: 'SKI02',
      libelle: 'Paire de skis',
      valeurEstimee: 250,
    });
  });

  it('should show validation error when code is empty', () => {
    const onValidate = vi.fn();
    render(
      <GarantieModificationDialog
        open={true}
        onClose={vi.fn()}
        article={mockArticle}
        onValidate={onValidate}
      />,
    );

    // Clear the code
    const codeInput = screen.getByDisplayValue('SKI01');
    fireEvent.change(codeInput, { target: { value: '' } });

    fireEvent.click(screen.getByText('Modifier'));

    expect(onValidate).not.toHaveBeenCalled();
    expect(screen.getByText('Code article requis')).toBeDefined();
  });
});
