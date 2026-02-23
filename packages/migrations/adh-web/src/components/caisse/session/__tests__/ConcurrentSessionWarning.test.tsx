import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConcurrentSessionWarning } from '../ConcurrentSessionWarning';
import type { ConcurrentSessionInfo } from '@/types';

const mockSession: ConcurrentSessionInfo = {
  sessionId: 99,
  userId: 2,
  userName: 'jean_dupont',
  dateOuverture: '2026-02-11T08:30:00Z',
  caisseId: 1,
};

describe('ConcurrentSessionWarning', () => {
  it('should render dialog with session info when open', () => {
    render(
      <ConcurrentSessionWarning
        open={true}
        onClose={vi.fn()}
        onForceOpen={vi.fn()}
        concurrentSession={mockSession}
      />,
    );

    expect(screen.getByText('Session concurrente detectee')).toBeInTheDocument();
    expect(screen.getByText(/jean_dupont/)).toBeInTheDocument();
    expect(screen.getByText(/caisse 1/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <ConcurrentSessionWarning
        open={false}
        onClose={vi.fn()}
        onForceOpen={vi.fn()}
        concurrentSession={mockSession}
      />,
    );

    expect(screen.queryByText('Session concurrente detectee')).not.toBeInTheDocument();
  });

  it('should call onForceOpen when force button clicked', () => {
    const onForceOpen = vi.fn();
    render(
      <ConcurrentSessionWarning
        open={true}
        onClose={vi.fn()}
        onForceOpen={onForceOpen}
        concurrentSession={mockSession}
      />,
    );

    fireEvent.click(screen.getByText("Forcer l'ouverture"));
    expect(onForceOpen).toHaveBeenCalledOnce();
  });

  it('should call onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(
      <ConcurrentSessionWarning
        open={true}
        onClose={onClose}
        onForceOpen={vi.fn()}
        concurrentSession={mockSession}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should display warning message about data loss', () => {
    render(
      <ConcurrentSessionWarning
        open={true}
        onClose={vi.fn()}
        onForceOpen={vi.fn()}
        concurrentSession={mockSession}
      />,
    );

    expect(screen.getByText(/Forcer l'ouverture fermera la session existante/)).toBeInTheDocument();
  });
});
