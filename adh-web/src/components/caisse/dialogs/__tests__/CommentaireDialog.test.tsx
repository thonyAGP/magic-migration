// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommentaireDialog } from '../CommentaireDialog';

describe('CommentaireDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(
      <CommentaireDialog
        open={false}
        onOpenChange={vi.fn()}
        value=""
        onSave={vi.fn()}
      />,
    );

    expect(screen.queryByText('Commentaire')).toBeNull();
  });

  it('should render textarea with initial value when open', () => {
    render(
      <CommentaireDialog
        open={true}
        onOpenChange={vi.fn()}
        value="Texte initial"
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByText('Commentaire')).toBeDefined();
    expect(screen.getByDisplayValue('Texte initial')).toBeDefined();
  });

  it('should show character count', () => {
    render(
      <CommentaireDialog
        open={true}
        onOpenChange={vi.fn()}
        value="Hello"
        onSave={vi.fn()}
      />,
    );

    // 500 - 5 = 495 remaining
    expect(screen.getByText(/495 caracteres restants/)).toBeDefined();
  });

  it('should call onSave with trimmed text when Enregistrer clicked', () => {
    const onSave = vi.fn();
    render(
      <CommentaireDialog
        open={true}
        onOpenChange={vi.fn()}
        value=""
        onSave={onSave}
      />,
    );

    const textarea = screen.getByPlaceholderText('Ajouter un commentaire...');
    fireEvent.change(textarea, { target: { value: '  Mon commentaire  ' } });

    fireEvent.click(screen.getByText('Enregistrer'));
    expect(onSave).toHaveBeenCalledWith('Mon commentaire');
  });

  it('should call onOpenChange when Annuler clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <CommentaireDialog
        open={true}
        onOpenChange={onOpenChange}
        value=""
        onSave={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
