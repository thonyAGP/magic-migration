import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FermetureRecapTable } from '../FermetureRecapTable';
import type { FermetureRecapColumn } from '../FermetureRecapTable';

const mockColumns: FermetureRecapColumn[] = [
  { type: 'cash', label: 'Cash', montantAttendu: 500, montantCompte: 500, ecart: 0 },
  { type: 'cartes', label: 'Cartes', montantAttendu: 300, montantCompte: 298, ecart: -2 },
  { type: 'cheques', label: 'Cheques', montantAttendu: 100, montantCompte: 100, ecart: 0 },
  { type: 'produits', label: 'Produits', montantAttendu: 200, montantCompte: 200, ecart: 0 },
  { type: 'od', label: 'OD', montantAttendu: 50, montantCompte: 50, ecart: 0 },
  { type: 'devises', label: 'Devises', montantAttendu: 80, montantCompte: 80, ecart: 0 },
];

describe('FermetureRecapTable', () => {
  it('should render all 6 columns', () => {
    render(
      <FermetureRecapTable
        columns={mockColumns}
        totalAttendu={1230}
        totalCompte={1228}
        totalEcart={-2}
        deviseCode="EUR"
      />,
    );

    // Each label appears twice (desktop table + mobile stacked)
    expect(screen.getAllByText('Cash').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cartes').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cheques').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Produits').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('OD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Devises').length).toBeGreaterThanOrEqual(1);
  });

  it('should render total row', () => {
    render(
      <FermetureRecapTable
        columns={mockColumns}
        totalAttendu={1230}
        totalCompte={1228}
        totalEcart={-2}
        deviseCode="EUR"
      />,
    );

    expect(screen.getAllByText('Total').length).toBeGreaterThan(0);
  });

  it('should apply green color for zero ecart', () => {
    const zeroEcartColumns: FermetureRecapColumn[] = [
      { type: 'cash', label: 'Cash', montantAttendu: 100, montantCompte: 100, ecart: 0 },
    ];

    const { container } = render(
      <FermetureRecapTable
        columns={zeroEcartColumns}
        totalAttendu={100}
        totalCompte={100}
        totalEcart={0}
        deviseCode="EUR"
      />,
    );

    const ecartCells = container.querySelectorAll('.text-green-600');
    expect(ecartCells.length).toBeGreaterThan(0);
  });

  it('should apply orange color for small ecart (<=5)', () => {
    const smallEcartColumns: FermetureRecapColumn[] = [
      { type: 'cash', label: 'Cash', montantAttendu: 100, montantCompte: 103, ecart: 3 },
    ];

    const { container } = render(
      <FermetureRecapTable
        columns={smallEcartColumns}
        totalAttendu={100}
        totalCompte={103}
        totalEcart={3}
        deviseCode="EUR"
      />,
    );

    const ecartCells = container.querySelectorAll('.text-orange-600');
    expect(ecartCells.length).toBeGreaterThan(0);
  });

  it('should apply red color for large ecart (>5)', () => {
    const largeEcartColumns: FermetureRecapColumn[] = [
      { type: 'cash', label: 'Cash', montantAttendu: 100, montantCompte: 110, ecart: 10 },
    ];

    const { container } = render(
      <FermetureRecapTable
        columns={largeEcartColumns}
        totalAttendu={100}
        totalCompte={110}
        totalEcart={10}
        deviseCode="EUR"
      />,
    );

    const ecartCells = container.querySelectorAll('.text-red-600');
    expect(ecartCells.length).toBeGreaterThan(0);
  });

  it('should render recap heading', () => {
    render(
      <FermetureRecapTable
        columns={mockColumns}
        totalAttendu={1230}
        totalCompte={1228}
        totalEcart={-2}
        deviseCode="EUR"
      />,
    );

    expect(screen.getByText('Recap par type de paiement')).toBeTruthy();
  });
});
