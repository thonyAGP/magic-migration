// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassOppositionDialog } from '../PassOppositionDialog';

describe('PassOppositionDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    passId: 'pass-123',
    passHolder: 'Jean Dupont',
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with pass holder name', () => {
    render(<PassOppositionDialog {...defaultProps} />);

    expect(screen.getByText('Opposer la carte')).toBeDefined();
    expect(screen.getByText(/Jean Dupont/)).toBeDefined();
    expect(screen.getByText(/Cette action est irreversible/)).toBeDefined();
  });

  it('should render motif select with options', () => {
    render(<PassOppositionDialog {...defaultProps} />);

    const select = screen.getByDisplayValue('Perte');
    expect(select).toBeDefined();

    fireEvent.change(select, { target: { value: 'vol' } });
    expect(screen.getByDisplayValue('Vol')).toBeDefined();
  });

  it('should require commentaire when motif is autre', () => {
    render(<PassOppositionDialog {...defaultProps} />);

    const select = screen.getByDisplayValue('Perte');
    fireEvent.change(select, { target: { value: 'autre' } });

    expect(screen.getByText(/Commentaire requis pour le motif/)).toBeDefined();

    // Confirm button should be disabled
    const confirmBtn = screen.getByText('Confirmer opposition');
    expect(confirmBtn).toHaveProperty('disabled', true);
  });

  it('should enable confirm when motif autre has commentaire', () => {
    render(<PassOppositionDialog {...defaultProps} />);

    const select = screen.getByDisplayValue('Perte');
    fireEvent.change(select, { target: { value: 'autre' } });

    const textarea = screen.getByPlaceholderText('Precisez le motif...');
    fireEvent.change(textarea, { target: { value: 'Carte endommagee' } });

    const confirmBtn = screen.getByText('Confirmer opposition');
    expect(confirmBtn).toHaveProperty('disabled', false);
  });

  it('should call onConfirm with correct data', () => {
    const onConfirm = vi.fn();
    render(<PassOppositionDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText('Confirmer opposition'));

    expect(onConfirm).toHaveBeenCalledWith({
      passId: 'pass-123',
      motif: 'perte',
      commentaire: undefined,
    });
  });

  it('should call onClose when cancel clicked', () => {
    const onClose = vi.fn();
    render(<PassOppositionDialog {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Annuler'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should not render when closed', () => {
    render(<PassOppositionDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Opposer la carte')).toBeNull();
  });
});
