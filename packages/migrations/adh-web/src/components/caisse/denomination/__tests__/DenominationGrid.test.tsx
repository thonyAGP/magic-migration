import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DenominationGrid } from '../DenominationGrid';
import type { DenominationCatalog } from '@/types/denomination';

const mockDenominations: DenominationCatalog[] = [
  { id: 1, deviseCode: 'EUR', valeur: 50, type: 'billet', libelle: '50 EUR', ordre: 1 },
  { id: 2, deviseCode: 'EUR', valeur: 20, type: 'billet', libelle: '20 EUR', ordre: 2 },
  { id: 3, deviseCode: 'EUR', valeur: 10, type: 'billet', libelle: '10 EUR', ordre: 3 },
  { id: 4, deviseCode: 'EUR', valeur: 2, type: 'piece', libelle: '2 EUR', ordre: 7 },
  { id: 5, deviseCode: 'EUR', valeur: 1, type: 'piece', libelle: '1 EUR', ordre: 8 },
  { id: 6, deviseCode: 'USD', valeur: 100, type: 'billet', libelle: '100 USD', ordre: 1 },
];

describe('DenominationGrid', () => {
  it('should render with denomination list', () => {
    const onCountChange = vi.fn();
    render(
      <DenominationGrid
        deviseCode="EUR"
        denominations={mockDenominations}
        counting={new Map()}
        onCountChange={onCountChange}
      />,
    );

    expect(screen.getByText('50 EUR')).toBeInTheDocument();
    expect(screen.getByText('20 EUR')).toBeInTheDocument();
    expect(screen.getByText('2 EUR')).toBeInTheDocument();
  });

  it('should separate billets and pieces sections', () => {
    const onCountChange = vi.fn();
    render(
      <DenominationGrid
        deviseCode="EUR"
        denominations={mockDenominations}
        counting={new Map()}
        onCountChange={onCountChange}
      />,
    );

    expect(screen.getByText('Billets')).toBeInTheDocument();
    expect(screen.getByText('Pieces')).toBeInTheDocument();
  });

  it('should only show denominations for the specified devise', () => {
    const onCountChange = vi.fn();
    render(
      <DenominationGrid
        deviseCode="EUR"
        denominations={mockDenominations}
        counting={new Map()}
        onCountChange={onCountChange}
      />,
    );

    expect(screen.getByText('50 EUR')).toBeInTheDocument();
    expect(screen.queryByText('100 USD')).not.toBeInTheDocument();
  });

  it('should display footer with total for the devise', () => {
    const onCountChange = vi.fn();
    render(
      <DenominationGrid
        deviseCode="EUR"
        denominations={mockDenominations}
        counting={new Map()}
        onCountChange={onCountChange}
      />,
    );

    expect(screen.getByText('Total EUR')).toBeInTheDocument();
    // Footer total should be 0,00 € - it's the bold element in the footer
    const footer = screen.getByText('Total EUR').closest('div')!;
    const totalEl = footer.querySelector('.text-lg.font-bold');
    expect(totalEl?.textContent).toMatch(/0,00/);
  });

  it('should calculate correct footer total when counts exist', () => {
    const onCountChange = vi.fn();
    const counting = new Map<number, number>([
      [1, 2], // 2 * 50 = 100
      [2, 3], // 3 * 20 = 60
      [4, 5], // 5 * 2  = 10
    ]);

    render(
      <DenominationGrid
        deviseCode="EUR"
        denominations={mockDenominations}
        counting={counting}
        onCountChange={onCountChange}
      />,
    );

    // Total should be 170 EUR
    expect(screen.getByText(/170,00/)).toBeInTheDocument();
  });

  it('should sort denominations by value in descending order', () => {
    const onCountChange = vi.fn();
    render(
      <DenominationGrid
        deviseCode="EUR"
        denominations={mockDenominations}
        counting={new Map()}
        onCountChange={onCountChange}
      />,
    );

    const labels = screen.getAllByText(/EUR/).filter(
      (el) => el.classList.contains('font-medium'),
    );

    // Billets: 50, 20, 10 then Pieces: 2, 1 (descending within each section)
    const texts = labels.map((el) => el.textContent);
    expect(texts).toEqual(['50 EUR', '20 EUR', '10 EUR', '2 EUR', '1 EUR']);
  });

  it('should not render billets section when no billets exist for devise', () => {
    const onCountChange = vi.fn();
    const piecesOnly: DenominationCatalog[] = [
      { id: 4, deviseCode: 'EUR', valeur: 2, type: 'piece', libelle: '2 EUR', ordre: 7 },
    ];

    render(
      <DenominationGrid
        deviseCode="EUR"
        denominations={piecesOnly}
        counting={new Map()}
        onCountChange={onCountChange}
      />,
    );

    expect(screen.queryByText('Billets')).not.toBeInTheDocument();
    expect(screen.getByText('Pieces')).toBeInTheDocument();
  });

  it('should not include other-devise counts in total', () => {
    const onCountChange = vi.fn();
    const counting = new Map<number, number>([
      [1, 1],  // 1 * 50 EUR = 50
      [6, 10], // 10 * 100 USD (should NOT count for EUR total)
    ]);

    render(
      <DenominationGrid
        deviseCode="EUR"
        denominations={mockDenominations}
        counting={counting}
        onCountChange={onCountChange}
      />,
    );

    // Footer total should be 50 EUR only, not 1050
    const footer = screen.getByText('Total EUR').closest('div')!;
    const totalEl = footer.querySelector('.text-lg.font-bold');
    expect(totalEl?.textContent).toMatch(/50,00/);
    expect(totalEl?.textContent).not.toMatch(/1.*050/);
  });
});
