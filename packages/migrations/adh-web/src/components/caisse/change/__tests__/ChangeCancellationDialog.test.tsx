// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeCancellationDialog } from '../ChangeCancellationDialog';

describe('ChangeCancellationDialog', () => {
  it('should not render when closed', () => {
    render(
      <ChangeCancellationDialog
        open={false}
        operationId={1}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByText(/Annuler l'operation/)).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <ChangeCancellationDialog
        open
        operationId={42}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText(/Annuler l'operation #42/)).toBeInTheDocument();
  });

  it('should require motif with min 3 chars', () => {
    const onConfirm = vi.fn();
    render(
      <ChangeCancellationDialog
        open
        operationId={1}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    const confirmBtn = screen.getByText("Confirmer l'annulation");
    expect(confirmBtn).toBeDisabled();

    const textarea = screen.getByPlaceholderText("Motif d'annulation...");
    fireEvent.change(textarea, { target: { value: 'ab' } });
    expect(confirmBtn).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'Erreur saisie' } });
    expect(confirmBtn).not.toBeDisabled();
  });

  it('should call onConfirm with motif', () => {
    const onConfirm = vi.fn();
    render(
      <ChangeCancellationDialog
        open
        operationId={1}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    const textarea = screen.getByPlaceholderText("Motif d'annulation...");
    fireEvent.change(textarea, { target: { value: 'Erreur de saisie' } });
    fireEvent.click(screen.getByText("Confirmer l'annulation"));
    expect(onConfirm).toHaveBeenCalledWith('Erreur de saisie');
  });

  it('should show cancelling state', () => {
    render(
      <ChangeCancellationDialog
        open
        operationId={1}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isCancelling
      />,
    );
    expect(screen.getByText('Annulation...')).toBeInTheDocument();
  });

  it('should call onClose when cancel clicked', () => {
    const onClose = vi.fn();
    render(
      <ChangeCancellationDialog
        open
        operationId={1}
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalled();
  });
});
