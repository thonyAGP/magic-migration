// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperationRetryDialog } from '../OperationRetryDialog';

describe('OperationRetryDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    operationName: 'Execution separation',
    errorMessage: 'Timeout reseau',
    onRetry: vi.fn(),
    onMarkDone: vi.fn(),
    onSkip: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    render(<OperationRetryDialog {...defaultProps} />);
    expect(screen.getByText('Echec de l\'operation')).toBeDefined();
    expect(screen.getByText('Execution separation')).toBeDefined();
    expect(screen.getByText('Timeout reseau')).toBeDefined();
  });

  it('should not render when closed', () => {
    render(<OperationRetryDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Echec de l\'operation')).toBeNull();
  });

  it('should render without error message', () => {
    render(
      <OperationRetryDialog
        {...defaultProps}
        errorMessage={undefined}
      />,
    );
    expect(screen.getByText('Execution separation')).toBeDefined();
    expect(screen.queryByText('Timeout reseau')).toBeNull();
  });

  it('should call onRetry when Reessayer is clicked', () => {
    render(<OperationRetryDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Reessayer'));
    expect(defaultProps.onRetry).toHaveBeenCalledOnce();
  });

  it('should call onMarkDone when Marquer terminee is clicked', () => {
    render(<OperationRetryDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Marquer terminee'));
    expect(defaultProps.onMarkDone).toHaveBeenCalledOnce();
  });

  it('should call onSkip when Passer is clicked', () => {
    render(<OperationRetryDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Passer'));
    expect(defaultProps.onSkip).toHaveBeenCalledOnce();
  });
});
