// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataCatchCompletion } from '../DataCatchCompletion';

vi.mock('@/services/printer', () => ({
  executePrint: vi.fn(),
  TicketType: { RECAP: 'RECAP' },
}));

describe('DataCatchCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render success state with session id', () => {
    render(
      <DataCatchCompletion success={true} sessionId="SES-001" onClose={vi.fn()} />,
    );

    expect(screen.getByText('Donnees client enregistrees')).toBeDefined();
    expect(screen.getByText(/SES-001/)).toBeDefined();
  });

  it('should render error state', () => {
    render(
      <DataCatchCompletion success={false} sessionId={null} onClose={vi.fn()} />,
    );

    expect(screen.getByText("Erreur lors de l'enregistrement")).toBeDefined();
  });

  it('should show print button only on success', () => {
    const { rerender } = render(
      <DataCatchCompletion success={true} sessionId="SES-001" onClose={vi.fn()} />,
    );

    expect(screen.getByText('Imprimer')).toBeDefined();

    rerender(
      <DataCatchCompletion success={false} sessionId={null} onClose={vi.fn()} />,
    );

    expect(screen.queryByText('Imprimer')).toBeNull();
  });

  it('should call onClose when finish button clicked', () => {
    const onClose = vi.fn();
    render(
      <DataCatchCompletion success={true} sessionId="SES-001" onClose={onClose} />,
    );

    fireEvent.click(screen.getByText('Terminer'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should not show sessionId when null', () => {
    render(
      <DataCatchCompletion success={true} sessionId={null} onClose={vi.fn()} />,
    );

    expect(screen.getByText('Donnees client enregistrees')).toBeDefined();
    expect(screen.queryByText(/Session/)).toBeNull();
  });
});
