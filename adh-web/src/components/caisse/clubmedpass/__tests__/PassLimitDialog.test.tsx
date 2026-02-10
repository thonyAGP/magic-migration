// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassLimitDialog } from '../PassLimitDialog';
import type { PassValidationResult } from '@/types/clubmedpass';

const mockResult: PassValidationResult = {
  isValid: false,
  soldeDisponible: 50,
  peutTraiter: false,
  raison: 'Limite journaliere depassee',
  limitJournaliereRestante: 0,
  limitHebdomadaireRestante: 500,
};

describe('PassLimitDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog with limit info', () => {
    render(
      <PassLimitDialog
        open={true}
        validationResult={mockResult}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Limite depassee')).toBeDefined();
  });

  it('should show raison from validation', () => {
    render(
      <PassLimitDialog
        open={true}
        validationResult={mockResult}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Limite journaliere depassee')).toBeDefined();
  });

  it('should call onClose on fermer', () => {
    const onClose = vi.fn();
    render(
      <PassLimitDialog
        open={true}
        validationResult={mockResult}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText('Fermer'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should show forcer button when onForce provided', () => {
    render(
      <PassLimitDialog
        open={true}
        validationResult={mockResult}
        onClose={vi.fn()}
        onForce={vi.fn()}
      />,
    );

    expect(screen.getByText('Forcer')).toBeDefined();
  });

  it('should hide forcer button when no onForce', () => {
    render(
      <PassLimitDialog
        open={true}
        validationResult={mockResult}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByText('Forcer')).toBeNull();
  });
});
