// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeparationProcessing } from '../SeparationProcessing';
import type { SeparationProgress } from '@/types/separation';

const mockProgress: SeparationProgress = {
  etape: 'Deplacement des operations',
  progression: 65,
  message: 'Traitement operation 13/20',
};

describe('SeparationProcessing', () => {
  it('should show waiting state when no progress and not processing', () => {
    render(<SeparationProcessing progress={null} isProcessing={false} />);

    expect(screen.getByText('En attente du demarrage...')).toBeDefined();
  });

  it('should render progress bar with correct width', () => {
    render(<SeparationProcessing progress={mockProgress} isProcessing={true} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.width).toBe('65%');
  });

  it('should show current step name', () => {
    render(<SeparationProcessing progress={mockProgress} isProcessing={true} />);

    expect(screen.getByText('Deplacement des operations')).toBeDefined();
  });

  it('should show processing message', () => {
    render(<SeparationProcessing progress={mockProgress} isProcessing={true} />);

    expect(screen.getByText('Traitement operation 13/20')).toBeDefined();
  });
});
