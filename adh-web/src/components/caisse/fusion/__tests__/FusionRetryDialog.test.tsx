// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FusionRetryDialog } from '../FusionRetryDialog';

describe('FusionRetryDialog', () => {
  it('should render operation name and error message', () => {
    render(
      <FusionRetryDialog
        open={true}
        onClose={vi.fn()}
        operationName="transfert garanties"
        errorMessage="Timeout lors de la connexion"
        onRetry={vi.fn()}
        onMarkDone={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText(/transfert garanties/)).toBeInTheDocument();
    expect(screen.getByText('Timeout lors de la connexion')).toBeInTheDocument();
  });

  it('should render without error message', () => {
    render(
      <FusionRetryDialog
        open={true}
        onClose={vi.fn()}
        operationName="verrouillage comptes"
        onRetry={vi.fn()}
        onMarkDone={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText(/verrouillage comptes/)).toBeInTheDocument();
    expect(screen.queryByText('Timeout')).not.toBeInTheDocument();
  });

  it('should call onRetry when Reessayer clicked', () => {
    const onRetry = vi.fn();
    render(
      <FusionRetryDialog
        open={true}
        onClose={vi.fn()}
        operationName="test"
        onRetry={onRetry}
        onMarkDone={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Reessayer'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('should call onMarkDone when Marquer terminee clicked', () => {
    const onMarkDone = vi.fn();
    render(
      <FusionRetryDialog
        open={true}
        onClose={vi.fn()}
        operationName="test"
        onRetry={vi.fn()}
        onMarkDone={onMarkDone}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Marquer terminee'));
    expect(onMarkDone).toHaveBeenCalledOnce();
  });

  it('should call onSkip when Passer clicked', () => {
    const onSkip = vi.fn();
    render(
      <FusionRetryDialog
        open={true}
        onClose={vi.fn()}
        operationName="test"
        onRetry={vi.fn()}
        onMarkDone={vi.fn()}
        onSkip={onSkip}
      />,
    );
    fireEvent.click(screen.getByText('Passer'));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('should not render when closed', () => {
    render(
      <FusionRetryDialog
        open={false}
        onClose={vi.fn()}
        operationName="test"
        onRetry={vi.fn()}
        onMarkDone={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.queryByText('Reessayer')).not.toBeInTheDocument();
  });
});
