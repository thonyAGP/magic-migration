// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeviseStockPanel } from '../DeviseStockPanel';
import type { DeviseStock } from '@/types/change';

const mockStock: DeviseStock[] = [
  { deviseCode: 'USD', deviseLibelle: 'Dollar US', montant: 500.00, nbOperations: 3 },
  { deviseCode: 'GBP', deviseLibelle: 'Livre Sterling', montant: 0, nbOperations: 0 },
  { deviseCode: 'CHF', deviseLibelle: 'Franc Suisse', montant: 200.50, nbOperations: 1 },
];

describe('DeviseStockPanel', () => {
  it('should render empty state', () => {
    render(<DeviseStockPanel stock={[]} />);
    expect(screen.getByText('Aucun stock')).toBeInTheDocument();
  });

  it('should render stock data', () => {
    render(<DeviseStockPanel stock={mockStock} />);
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('Dollar US')).toBeInTheDocument();
    expect(screen.getByText('GBP')).toBeInTheDocument();
    expect(screen.getByText('CHF')).toBeInTheDocument();
  });

  it('should show loading skeleton', () => {
    const { container } = render(<DeviseStockPanel stock={[]} isLoading />);
    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('should highlight positive amounts with green background', () => {
    const { container } = render(<DeviseStockPanel stock={mockStock} />);
    const rows = container.querySelectorAll('[class*="bg-success"]');
    expect(rows.length).toBe(2); // USD and CHF have montant > 0
  });

  it('should display title', () => {
    render(<DeviseStockPanel stock={mockStock} />);
    expect(screen.getByText('Stock devises')).toBeInTheDocument();
  });
});
