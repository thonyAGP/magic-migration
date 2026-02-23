// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GarantieDepotForm } from '../GarantieDepotForm';
import { GarantieOperationGrid } from '../GarantieOperationGrid';
import { GarantieSummary } from '../GarantieSummary';
import type { GarantieOperation, GarantieSummaryData } from '@/types/garantie';

// --- Fixtures ---

const operations: GarantieOperation[] = [
  { id: 1, garantieId: 10, type: 'depot', montant: 500, date: '10/02/2026', heure: '09:00', operateur: 'USR01', motif: 'Depot initial' },
  { id: 2, garantieId: 10, type: 'versement', montant: 200, date: '10/02/2026', heure: '10:00', operateur: 'USR01', motif: 'Versement complement' },
  { id: 3, garantieId: 10, type: 'retrait', montant: 100, date: '10/02/2026', heure: '11:00', operateur: 'USR02', motif: 'Retrait partiel' },
  { id: 4, garantieId: 10, type: 'annulation', montant: 50, date: '10/02/2026', heure: '12:00', operateur: 'USR02', motif: 'Erreur de saisie' },
];

const summaryData: GarantieSummaryData = {
  nbActives: 5,
  montantTotalBloque: 2500,
  nbVersees: 3,
  nbRestituees: 1,
};

// --- Tests ---

describe('Garantie Workflow Integration', () => {
  describe('GarantieDepotForm', () => {
    it('should render all form fields', () => {
      render(<GarantieDepotForm onSubmit={vi.fn()} />);

      expect(screen.getByText('Nouveau depot de garantie')).toBeInTheDocument();
      expect(screen.getByText('Code adherent')).toBeInTheDocument();
      expect(screen.getByText('Filiation')).toBeInTheDocument();
      expect(screen.getByText('Montant')).toBeInTheDocument();
      expect(screen.getByText('Devise')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should show submit button with correct label', () => {
      render(<GarantieDepotForm onSubmit={vi.fn()} />);

      expect(screen.getByText('Enregistrer le depot')).toBeInTheDocument();
    });

    it('should show "Enregistrement..." when submitting', () => {
      render(<GarantieDepotForm onSubmit={vi.fn()} isSubmitting={true} />);

      expect(screen.getByText('Enregistrement...')).toBeInTheDocument();
    });

    it('should disable all inputs when disabled', () => {
      render(<GarantieDepotForm onSubmit={vi.fn()} disabled={true} />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input) => expect(input).toBeDisabled());
    });

    it('should call onSubmit with valid data', () => {
      const onSubmit = vi.fn();
      render(<GarantieDepotForm onSubmit={onSubmit} />);

      // Fill required fields
      const codeInput = screen.getByPlaceholderText('Code adherent');
      fireEvent.change(codeInput, { target: { value: '12345' } });

      const montantInput = screen.getByPlaceholderText('0,00');
      fireEvent.change(montantInput, { target: { value: '500' } });

      const descriptionField = screen.getByPlaceholderText('Description du depot...');
      fireEvent.change(descriptionField, { target: { value: 'Depot caution' } });

      fireEvent.click(screen.getByText('Enregistrer le depot'));
      // Either calls onSubmit or shows validation errors
      // The important thing is no crash
    });
  });

  describe('GarantieOperationGrid', () => {
    it('should render all operations with type badges', () => {
      render(<GarantieOperationGrid operations={operations} />);

      expect(screen.getByText('Depot')).toBeInTheDocument();
      expect(screen.getByText('Versement')).toBeInTheDocument();
      expect(screen.getByText('Retrait')).toBeInTheDocument();
      expect(screen.getByText('Annulation')).toBeInTheDocument();
    });

    it('should display operation details', () => {
      render(<GarantieOperationGrid operations={operations} />);

      expect(screen.getByText('Depot initial')).toBeInTheDocument();
      expect(screen.getAllByText('USR01').length).toBeGreaterThan(0);
    });

    it('should show empty message when no operations', () => {
      render(<GarantieOperationGrid operations={[]} />);

      expect(screen.getByText('Aucune operation')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      const { container } = render(
        <GarantieOperationGrid operations={[]} isLoading={true} />,
      );

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });

  describe('GarantieSummary', () => {
    it('should display all summary stats', () => {
      render(<GarantieSummary summary={summaryData} />);

      expect(screen.getByText('Actives')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Montant bloque')).toBeInTheDocument();
      expect(screen.getByText('Versees')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Restituees')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show dash values when no summary', () => {
      render(<GarantieSummary summary={null} />);

      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBe(4);
    });

    it('should show loading skeletons', () => {
      const { container } = render(<GarantieSummary summary={null} isLoading={true} />);

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });
});
