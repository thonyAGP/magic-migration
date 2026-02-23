// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviseSelector } from '../DeviseSelector';
import { ChangeOperationGrid } from '../ChangeOperationGrid';
import { DeviseStockPanel } from '../DeviseStockPanel';
import type { Devise, ChangeOperation, ChangeOperationSummary, DeviseStock } from '@/types/change';

const devises: Devise[] = [
  { code: 'USD', libelle: 'Dollar US', symbole: '$', tauxActuel: 1.0845, nbDecimales: 2 },
  { code: 'GBP', libelle: 'Livre Sterling', symbole: '£', tauxActuel: 0.8520, nbDecimales: 2 },
  { code: 'CHF', libelle: 'Franc Suisse', symbole: 'CHF', tauxActuel: 0.9310, nbDecimales: 2 },
];

const operations: ChangeOperation[] = [
  { id: 1, type: 'achat', deviseCode: 'USD', deviseLibelle: 'Dollar US', montant: 100, taux: 1.0845, contreValeur: 108.45, modePaiement: 'especes', date: '10/02/2026', heure: '09:15', operateur: 'USR01', annule: false },
  { id: 2, type: 'vente', deviseCode: 'GBP', deviseLibelle: 'Livre Sterling', montant: 50, taux: 0.8520, contreValeur: 42.60, modePaiement: 'carte', date: '10/02/2026', heure: '10:30', operateur: 'USR01', annule: false },
  { id: 3, type: 'achat', deviseCode: 'USD', deviseLibelle: 'Dollar US', montant: 200, taux: 1.0845, contreValeur: 216.90, modePaiement: 'especes', date: '10/02/2026', heure: '11:00', operateur: 'USR02', annule: true },
];

const summary: ChangeOperationSummary = {
  totalAchats: 325.35,
  totalVentes: 42.60,
  nbOperations: 3,
};

const stock: DeviseStock[] = [
  { deviseCode: 'USD', deviseLibelle: 'Dollar US', montant: 500, nbOperations: 5 },
  { deviseCode: 'GBP', deviseLibelle: 'Livre Sterling', montant: 0, nbOperations: 0 },
  { deviseCode: 'CHF', deviseLibelle: 'Franc Suisse', montant: 200, nbOperations: 2 },
];

describe('Change Workflow Integration', () => {
  describe('DeviseSelector', () => {
    it('should render all devises with code, libelle, and rate', () => {
      render(<DeviseSelector devises={devises} selected={null} onSelect={vi.fn()} />);

      expect(screen.getByText('USD')).toBeInTheDocument();
      expect(screen.getByText('Dollar US')).toBeInTheDocument();
      expect(screen.getByText('1.0845')).toBeInTheDocument();
      expect(screen.getByText('GBP')).toBeInTheDocument();
      expect(screen.getByText('CHF')).toBeInTheDocument();
    });

    it('should call onSelect when a devise is clicked', () => {
      const onSelect = vi.fn();
      render(<DeviseSelector devises={devises} selected={null} onSelect={onSelect} />);

      fireEvent.click(screen.getByText('USD'));
      expect(onSelect).toHaveBeenCalledWith('USD');
    });

    it('should highlight selected devise', () => {
      render(<DeviseSelector devises={devises} selected="GBP" onSelect={vi.fn()} />);

      const gbpButton = screen.getByText('GBP').closest('button');
      expect(gbpButton?.className).toContain('bg-primary');
    });

    it('should filter devises by search term', () => {
      render(<DeviseSelector devises={devises} selected={null} onSelect={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText('Rechercher devise...');
      fireEvent.change(searchInput, { target: { value: 'dollar' } });

      expect(screen.getByText('USD')).toBeInTheDocument();
      expect(screen.queryByText('GBP')).not.toBeInTheDocument();
      expect(screen.queryByText('CHF')).not.toBeInTheDocument();
    });

    it('should show "Aucune devise trouvee" for empty search', () => {
      render(<DeviseSelector devises={devises} selected={null} onSelect={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText('Rechercher devise...');
      fireEvent.change(searchInput, { target: { value: 'JPY' } });

      expect(screen.getByText('Aucune devise trouvee')).toBeInTheDocument();
    });
  });

  describe('ChangeOperationGrid', () => {
    it('should render all operations with correct data', () => {
      render(<ChangeOperationGrid operations={operations} summary={summary} onCancel={vi.fn()} />);

      expect(screen.getByText('Achat')).toBeInTheDocument();
      expect(screen.getByText('Vente')).toBeInTheDocument();
    });

    it('should show Annule badge for cancelled operations', () => {
      render(<ChangeOperationGrid operations={operations} summary={summary} onCancel={vi.fn()} />);

      expect(screen.getByText('Annule')).toBeInTheDocument();
    });

    it('should show cancel button only for non-cancelled operations', () => {
      render(<ChangeOperationGrid operations={operations} summary={summary} onCancel={vi.fn()} />);

      const cancelButtons = screen.getAllByRole('button', { name: /annuler operation/i });
      expect(cancelButtons.length).toBe(2);
    });

    it('should call onCancel with operation id', () => {
      const onCancel = vi.fn();
      render(<ChangeOperationGrid operations={operations} summary={summary} onCancel={onCancel} />);

      const cancelButtons = screen.getAllByRole('button', { name: /annuler operation/i });
      fireEvent.click(cancelButtons[0]);
      expect(onCancel).toHaveBeenCalledWith(1);
    });

    it('should display summary with totals', () => {
      render(<ChangeOperationGrid operations={operations} summary={summary} onCancel={vi.fn()} />);

      expect(screen.getByText(/Operations/)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show empty message when no operations', () => {
      render(<ChangeOperationGrid operations={[]} summary={null} onCancel={vi.fn()} />);

      expect(screen.getByText('Aucune operation de change')).toBeInTheDocument();
    });

    it('should show loading skeletons', () => {
      const { container } = render(
        <ChangeOperationGrid operations={[]} summary={null} onCancel={vi.fn()} isLoading={true} />,
      );

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });

  describe('DeviseStockPanel', () => {
    it('should display all devises stock with amounts', () => {
      const { container } = render(<DeviseStockPanel stock={stock} />);

      expect(screen.getByText('Stock devises')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
      
      expect(container.textContent).toContain('500,00');
      expect(container.textContent).toContain('(5 op.)');
    });

    it('should show empty message when no stock', () => {
      render(<DeviseStockPanel stock={[]} />);

      expect(screen.getByText('Aucun stock')).toBeInTheDocument();
    });

    it('should show loading skeletons', () => {
      const { container } = render(<DeviseStockPanel stock={[]} isLoading={true} />);

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });
});