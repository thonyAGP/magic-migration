// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FusionProcessing } from '../FusionProcessing';
import type { FusionProgress } from '@/types/fusion';

const baseProgress: FusionProgress = {
  etape: 'Transfert des operations',
  progression: 45,
  message: 'Traitement de 23 operations...',
};

describe('FusionProcessing', () => {
  it('should render processing title', () => {
    render(<FusionProcessing progress={baseProgress} />);
    expect(screen.getByText('Fusion en cours')).toBeInTheDocument();
  });

  it('should display current step label', () => {
    render(<FusionProcessing progress={baseProgress} />);
    expect(screen.getByText('Transfert des operations')).toBeInTheDocument();
  });

  it('should display progress percentage', () => {
    render(<FusionProcessing progress={baseProgress} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should render progress bar with correct width', () => {
    render(<FusionProcessing progress={baseProgress} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '45');
    expect(progressBar).toHaveStyle({ width: '45%' });
  });

  it('should display progress message', () => {
    render(<FusionProcessing progress={baseProgress} />);
    expect(screen.getByText('Traitement de 23 operations...')).toBeInTheDocument();
  });

  it('should clamp progress to 0-100 range', () => {
    render(<FusionProcessing progress={{ ...baseProgress, progression: 150 }} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('should handle zero progress', () => {
    render(<FusionProcessing progress={{ ...baseProgress, progression: 0 }} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });
});
