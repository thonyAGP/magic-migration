// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PointageAppRemGrid } from '../PointageAppRemGrid';
import type { PointageData } from '@/types/caisseOps';

const mockData: PointageData = {
  deviseCode: 'EUR',
  comptages: [
    { type: 'Especes', montantAttendu: 500, montantCompte: 495, ecart: -5 },
    { type: 'CB', montantAttendu: 1200, montantCompte: 1200, ecart: 0 },
    { type: 'Cheques', montantAttendu: 300, montantCompte: 300, ecart: 0 },
  ],
};

const balancedData: PointageData = {
  deviseCode: 'EUR',
  comptages: [
    { type: 'Especes', montantAttendu: 500, montantCompte: 500, ecart: 0 },
    { type: 'CB', montantAttendu: 1200, montantCompte: 1200, ecart: 0 },
  ],
};

describe('PointageAppRemGrid', () => {
  it('should render pointage table with rows', () => {
    render(<PointageAppRemGrid data={mockData} onRegularise={vi.fn()} deviseCode="EUR" />);
    expect(screen.getByText('Pointage caisse')).toBeInTheDocument();
    expect(screen.getByText('Especes')).toBeInTheDocument();
    expect(screen.getByText('CB')).toBeInTheDocument();
    expect(screen.getByText('Cheques')).toBeInTheDocument();
  });

  it('should display totals row', () => {
    render(<PointageAppRemGrid data={mockData} onRegularise={vi.fn()} deviseCode="EUR" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('2000.00')).toBeInTheDocument(); // attendu
    expect(screen.getByText('1995.00')).toBeInTheDocument(); // compte
  });

  it('should show regularise button when ecart exists', () => {
    render(<PointageAppRemGrid data={mockData} onRegularise={vi.fn()} deviseCode="EUR" />);
    expect(screen.getByText('Regulariser')).toBeInTheDocument();
  });

  it('should not show regularise button when balanced', () => {
    render(<PointageAppRemGrid data={balancedData} onRegularise={vi.fn()} deviseCode="EUR" />);
    expect(screen.queryByText('Regulariser')).not.toBeInTheDocument();
  });

  it('should color ecart green when zero', () => {
    render(<PointageAppRemGrid data={balancedData} onRegularise={vi.fn()} deviseCode="EUR" />);
    const zeroEcarts = screen.getAllByText('0.00');
    zeroEcarts.forEach((el) => {
      expect(el.className).toContain('text-green-600');
    });
  });
});
