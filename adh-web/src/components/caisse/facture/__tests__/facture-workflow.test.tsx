// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FactureForm } from '../FactureForm';
import { FactureLigneGrid } from '../FactureLigneGrid';
import { FactureTVABreakdown } from '../FactureTVABreakdown';
import { FacturePreview } from '../FacturePreview';
import type { FactureLigne, FactureSummary, Facture } from '@/types/facture';

// Mock API for FactureSearchPanel
vi.mock('@/services/api/endpoints-lot4', () => ({
  factureApi: {
    search: vi.fn(() => Promise.resolve({ data: { data: { factures: [] } } })),
  },
}));

// --- Fixtures ---

const mockLignes: FactureLigne[] = [
  { id: 1, factureId: 1, codeArticle: 'ART01', libelle: 'Nuitee standard', quantite: 2, prixUnitaireHT: 100, tauxTVA: 10, montantHT: 200, montantTVA: 20, montantTTC: 220 },
  { id: 2, factureId: 1, codeArticle: 'ART02', libelle: 'Petit dejeuner', quantite: 4, prixUnitaireHT: 15, tauxTVA: 5.5, montantHT: 60, montantTVA: 3.30, montantTTC: 63.30 },
];

const mockSummary: FactureSummary = {
  totalHT: 260,
  totalTVA: 23.30,
  totalTTC: 283.30,
  ventilationTVA: [
    { tauxTVA: 10, baseHT: 200, montantTVA: 20 },
    { tauxTVA: 5.5, baseHT: 60, montantTVA: 3.30 },
  ],
};

const mockFacture: Facture = {
  id: 1,
  reference: 'FAC-2026-001',
  societe: 'ADH',
  codeAdherent: 12345,
  filiation: 0,
  nomAdherent: 'DUPONT Jean',
  type: 'facture',
  statut: 'emise',
  dateEmission: '2026-02-10',
  dateEcheance: '2026-03-10',
  lignes: mockLignes,
  totalHT: 260,
  totalTVA: 23.30,
  totalTTC: 283.30,
  devise: 'EUR',
  commentaire: 'Facture sejour fevrier',
  operateur: 'USR01',
};

// --- Tests ---

describe('Facture Workflow Integration', () => {
  describe('FactureForm', () => {
    it('should render all form fields', () => {
      render(<FactureForm onSubmit={vi.fn()} />);

      expect(screen.getByText('Nouvelle facture')).toBeInTheDocument();
      expect(screen.getByText('Code adherent')).toBeInTheDocument();
      expect(screen.getByText('Filiation')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Commentaire')).toBeInTheDocument();
    });

    it('should toggle between Facture and Avoir types', () => {
      render(<FactureForm onSubmit={vi.fn()} />);

      const avoirButton = screen.getByText('Avoir');
      fireEvent.click(avoirButton);

      // Avoir button should be "active" (has bg-warning)
      expect(avoirButton.className).toContain('bg-warning');
    });

    it('should show "Creation..." when submitting', () => {
      render(<FactureForm onSubmit={vi.fn()} isSubmitting={true} />);

      expect(screen.getByText('Creation...')).toBeInTheDocument();
    });

    it('should show submit button', () => {
      render(<FactureForm onSubmit={vi.fn()} />);

      expect(screen.getByText('Creer la facture')).toBeInTheDocument();
    });
  });

  describe('FactureLigneGrid', () => {
    it('should render all lines with amounts', () => {
      render(
        <FactureLigneGrid lignes={mockLignes} onAddLigne={vi.fn()} onRemoveLigne={vi.fn()} />,
      );

      expect(screen.getByText('ART01')).toBeInTheDocument();
      expect(screen.getByText('Nuitee standard')).toBeInTheDocument();
      expect(screen.getByText('ART02')).toBeInTheDocument();
      expect(screen.getByText('Petit dejeuner')).toBeInTheDocument();
    });

    it('should show "Aucune ligne" when no lines', () => {
      render(
        <FactureLigneGrid lignes={[]} onAddLigne={vi.fn()} onRemoveLigne={vi.fn()} />,
      );

      expect(screen.getByText('Aucune ligne')).toBeInTheDocument();
    });

    it('should show add line form when editable', () => {
      render(
        <FactureLigneGrid lignes={[]} onAddLigne={vi.fn()} onRemoveLigne={vi.fn()} isEditable={true} />,
      );

      expect(screen.getByPlaceholderText('Code article')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Libelle')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Qte')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Prix HT')).toBeInTheDocument();
    });

    it('should not show add form when not editable', () => {
      render(
        <FactureLigneGrid lignes={mockLignes} onAddLigne={vi.fn()} onRemoveLigne={vi.fn()} isEditable={false} />,
      );

      expect(screen.queryByPlaceholderText('Code article')).not.toBeInTheDocument();
    });

    it('should show delete buttons when editable', () => {
      render(
        <FactureLigneGrid lignes={mockLignes} onAddLigne={vi.fn()} onRemoveLigne={vi.fn()} isEditable={true} />,
      );

      const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
      expect(deleteButtons.length).toBe(2);
    });

    it('should call onRemoveLigne when delete button is clicked', () => {
      const onRemove = vi.fn();
      render(
        <FactureLigneGrid lignes={mockLignes} onAddLigne={vi.fn()} onRemoveLigne={onRemove} isEditable={true} />,
      );

      const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
      fireEvent.click(deleteButtons[0]);
      expect(onRemove).toHaveBeenCalledWith(0);
    });

    it('should display footer totals', () => {
      render(
        <FactureLigneGrid lignes={mockLignes} onAddLigne={vi.fn()} onRemoveLigne={vi.fn()} />,
      );

      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('FactureTVABreakdown', () => {
    it('should display TVA breakdown by rate', () => {
      render(<FactureTVABreakdown summary={mockSummary} />);

      expect(screen.getByText('Ventilation TVA')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
      expect(screen.getByText('5.5%')).toBeInTheDocument();
    });

    it('should display totals HT, TVA, TTC', () => {
      render(<FactureTVABreakdown summary={mockSummary} />);

      expect(screen.getByText('Total HT')).toBeInTheDocument();
      expect(screen.getByText('Total TVA')).toBeInTheDocument();
      expect(screen.getByText('Total TTC')).toBeInTheDocument();
    });

    it('should show "Aucune donnee" when no summary', () => {
      render(<FactureTVABreakdown summary={null} />);

      expect(screen.getByText('Aucune donnee')).toBeInTheDocument();
    });

    it('should show loading skeleton', () => {
      const { container } = render(<FactureTVABreakdown summary={null} isLoading={true} />);

      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });

  describe('FacturePreview', () => {
    it('should display facture details in preview', () => {
      render(
        <FacturePreview
          open={true}
          facture={mockFacture}
          onClose={vi.fn()}
          onPrint={vi.fn()}
        />,
      );

      expect(screen.getAllByText(/FAC-2026-001/).length).toBeGreaterThan(0);
      expect(screen.getByText('DUPONT Jean')).toBeInTheDocument();
      expect(screen.getByText('emise')).toBeInTheDocument();
    });

    it('should display facture lines', () => {
      render(
        <FacturePreview
          open={true}
          facture={mockFacture}
          onClose={vi.fn()}
          onPrint={vi.fn()}
        />,
      );

      expect(screen.getByText('Nuitee standard')).toBeInTheDocument();
      expect(screen.getByText('Petit dejeuner')).toBeInTheDocument();
    });

    it('should display commentaire when present', () => {
      render(
        <FacturePreview
          open={true}
          facture={mockFacture}
          onClose={vi.fn()}
          onPrint={vi.fn()}
        />,
      );

      expect(screen.getByText(/Facture sejour fevrier/)).toBeInTheDocument();
    });

    it('should call onPrint when print button is clicked', () => {
      const onPrint = vi.fn();
      render(
        <FacturePreview
          open={true}
          facture={mockFacture}
          onClose={vi.fn()}
          onPrint={onPrint}
        />,
      );

      fireEvent.click(screen.getByText('Imprimer'));
      expect(onPrint).toHaveBeenCalled();
    });

    it('should show "Impression..." when printing', () => {
      render(
        <FacturePreview
          open={true}
          facture={mockFacture}
          onClose={vi.fn()}
          onPrint={vi.fn()}
          isPrinting={true}
        />,
      );

      expect(screen.getByText('Impression...')).toBeInTheDocument();
    });

    it('should render null when facture is null', () => {
      const { container } = render(
        <FacturePreview
          open={true}
          facture={null}
          onClose={vi.fn()}
          onPrint={vi.fn()}
        />,
      );

      expect(container.innerHTML).toBe('');
    });
  });
});
