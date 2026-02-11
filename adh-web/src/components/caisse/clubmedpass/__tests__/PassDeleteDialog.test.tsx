// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassDeleteDialog } from '../PassDeleteDialog';

describe('PassDeleteDialog', () => {
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
    render(<PassDeleteDialog {...defaultProps} />);

    expect(screen.getByText('Supprimer la carte')).toBeDefined();
    expect(screen.getByText(/Jean Dupont/)).toBeDefined();
    expect(screen.getByText(/Cette action est irreversible/)).toBeDefined();
  });

  it('should have disabled submit button initially', () => {
    render(<PassDeleteDialog {...defaultProps} />);

    const submitBtn = screen.getByText('Supprimer');
    expect(submitBtn).toHaveProperty('disabled', true);
  });

  it('should keep button disabled with wrong text', () => {
    render(<PassDeleteDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('SUPPRIMER');
    fireEvent.change(input, { target: { value: 'wrong' } });

    const submitBtn = screen.getByText('Supprimer');
    expect(submitBtn).toHaveProperty('disabled', true);
  });

  it('should enable button when SUPPRIMER is typed', () => {
    render(<PassDeleteDialog {...defaultProps} />);

    const input = screen.getByPlaceholderText('SUPPRIMER');
    fireEvent.change(input, { target: { value: 'SUPPRIMER' } });

    const submitBtn = screen.getByText('Supprimer');
    expect(submitBtn).toHaveProperty('disabled', false);
  });

  it('should call onConfirm when confirmed', () => {
    const onConfirm = vi.fn();
    render(<PassDeleteDialog {...defaultProps} onConfirm={onConfirm} />);

    const input = screen.getByPlaceholderText('SUPPRIMER');
    fireEvent.change(input, { target: { value: 'SUPPRIMER' } });

    fireEvent.click(screen.getByText('Supprimer'));

    expect(onConfirm).toHaveBeenCalled();
  });

  it('should call onClose when cancel clicked', () => {
    const onClose = vi.fn();
    render(<PassDeleteDialog {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Annuler'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should not render when closed', () => {
    render(<PassDeleteDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Supprimer la carte')).toBeNull();
  });
});
