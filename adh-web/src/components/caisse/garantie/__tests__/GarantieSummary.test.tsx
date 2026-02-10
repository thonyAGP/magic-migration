// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GarantieSummary } from '../GarantieSummary';
import type { GarantieSummaryData } from '@/types/garantie';

const mockSummary: GarantieSummaryData = {
  nbActives: 12,
  montantTotalBloque: 5400,
  nbVersees: 8,
  nbRestituees: 3,
};

describe('GarantieSummary', () => {
  it('should render summary stats', () => {
    render(<GarantieSummary summary={mockSummary} />);

    expect(screen.getByText('Actives')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Montant bloque')).toBeInTheDocument();
    expect(screen.getByText(/5[\s\u202f]?400,00/)).toBeInTheDocument();
    expect(screen.getByText('Versees')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Restituees')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const { container } = render(<GarantieSummary summary={null} isLoading />);

    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBe(4);
  });

  it('should show dashes when summary is null', () => {
    render(<GarantieSummary summary={null} />);

    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBe(4);
  });

  it('should format montant correctly', () => {
    render(<GarantieSummary summary={mockSummary} />);

    // fr-FR EUR format: "5 400,00 €" with various space types
    expect(screen.getByText(/5[\s\u202f]?400,00/)).toBeInTheDocument();
  });
});
