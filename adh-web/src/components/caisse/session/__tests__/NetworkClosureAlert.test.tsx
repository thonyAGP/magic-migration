import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkClosureAlert } from '../NetworkClosureAlert';

describe('NetworkClosureAlert', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onProceed: vi.fn(),
    closureStatus: 'pending' as const,
  };

  it('should render pending status message', () => {
    render(<NetworkClosureAlert {...defaultProps} closureStatus="pending" />);

    expect(screen.getByText('Cloture reseau')).toBeTruthy();
    expect(screen.getByText(/cloture reseau en cours/i)).toBeTruthy();
  });

  it('should render error status message', () => {
    render(<NetworkClosureAlert {...defaultProps} closureStatus="error" />);

    expect(screen.getByText(/erreur lors de la cloture reseau/i)).toBeTruthy();
    expect(screen.getByText(/contactez le superviseur/i)).toBeTruthy();
  });

  it('should not render when status is completed', () => {
    const { container } = render(
      <NetworkClosureAlert {...defaultProps} closureStatus="completed" />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('should display last closure date when provided', () => {
    render(
      <NetworkClosureAlert
        {...defaultProps}
        closureStatus="pending"
        lastClosureDate="2026-02-10T18:00:00Z"
      />,
    );

    expect(screen.getByText(/derni.re cloture/i)).toBeTruthy();
  });

  it('should call onProceed when "Ouvrir quand meme" is clicked', () => {
    const onProceed = vi.fn();
    render(<NetworkClosureAlert {...defaultProps} onProceed={onProceed} />);

    fireEvent.click(screen.getByText('Ouvrir quand meme'));
    expect(onProceed).toHaveBeenCalledOnce();
  });

  it('should call onClose when "Patienter" is clicked', () => {
    const onClose = vi.fn();
    render(<NetworkClosureAlert {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Patienter'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
