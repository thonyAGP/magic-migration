// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FactureTVABreakdown } from '../FactureTVABreakdown';
import type { FactureSummary } from '@/types/facture';

const mockSummary: FactureSummary = {
  totalHT: 100,
  totalTVA: 20,
  totalTTC: 120,
  ventilationTVA: [
    { tauxTVA: 20, baseHT: 80, montantTVA: 16 },
    { tauxTVA: 5.5, baseHT: 20, montantTVA: 1.1 },
  ],
};

describe('FactureTVABreakdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render TVA ventilation table', () => {
    render(<FactureTVABreakdown summary={mockSummary} />);
    expect(screen.getByText('Ventilation TVA')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('5.5%')).toBeInTheDocument();
  });

  it('should show loading placeholders', () => {
    const { container } = render(
      <FactureTVABreakdown summary={null} isLoading />,
    );
    expect(screen.getByText('Ventilation TVA')).toBeInTheDocument();
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('should show empty state when null', () => {
    render(<FactureTVABreakdown summary={null} />);
    expect(screen.getByText('Aucune donnee')).toBeInTheDocument();
  });

  it('should format amounts as EUR', () => {
    render(<FactureTVABreakdown summary={mockSummary} />);
    // totalHT = 100 EUR
    expect(screen.getByText('100,00 €')).toBeInTheDocument();
    // totalTTC = 120 EUR
    expect(screen.getByText('120,00 €')).toBeInTheDocument();
  });

  it('should display total TTC highlighted', () => {
    render(<FactureTVABreakdown summary={mockSummary} />);
    const ttcElement = screen.getByText('120,00 €').closest('div');
    expect(ttcElement?.className).toContain('bg-primary/10');
    expect(ttcElement?.className).toContain('text-primary');
  });
});
