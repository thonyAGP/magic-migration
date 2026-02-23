// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FacturePreview } from '../FacturePreview';
import type { Facture } from '@/types/facture';

const mockFacture: Facture = {
  id: 1,
  reference: 'FAC-2026-001',
  societe: 'SOC1',
  codeAdherent: 1234,
  filiation: 1,
  nomAdherent: 'Jean Dupont',
  type: 'facture',
  statut: 'emise',
  dateEmission: '2026-02-10',
  dateEcheance: null,
  lignes: [
    {
      id: 1,
      factureId: 1,
      codeArticle: 'ART001',
      libelle: 'Article test',
      quantite: 2,
      prixUnitaireHT: 10,
      tauxTVA: 20,
      montantHT: 20,
      montantTVA: 4,
      montantTTC: 24,
    },
  ],
  totalHT: 20,
  totalTVA: 4,
  totalTTC: 24,
  devise: 'EUR',
  commentaire: 'Commentaire test',
  operateur: 'OP1',
};

describe('FacturePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render facture details', () => {
    render(
      <FacturePreview
        open
        facture={mockFacture}
        onClose={vi.fn()}
        onPrint={vi.fn()}
      />,
    );
    expect(screen.getByText('Apercu facture #FAC-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('should show reference and date', () => {
    render(
      <FacturePreview
        open
        facture={mockFacture}
        onClose={vi.fn()}
        onPrint={vi.fn()}
      />,
    );
    expect(screen.getByText('FAC-2026-001')).toBeInTheDocument();
    // Date formatted fr-FR
    expect(screen.getByText('10/02/2026')).toBeInTheDocument();
  });

  it('should display line items', () => {
    render(
      <FacturePreview
        open
        facture={mockFacture}
        onClose={vi.fn()}
        onPrint={vi.fn()}
      />,
    );
    expect(screen.getByText('ART001')).toBeInTheDocument();
    expect(screen.getByText('Article test')).toBeInTheDocument();
  });

  it('should call onPrint on button click', () => {
    const onPrint = vi.fn();
    render(
      <FacturePreview
        open
        facture={mockFacture}
        onClose={vi.fn()}
        onPrint={onPrint}
      />,
    );
    fireEvent.click(screen.getByText('Imprimer'));
    expect(onPrint).toHaveBeenCalledTimes(1);
  });

  it('should call onClose on fermer', () => {
    const onClose = vi.fn();
    render(
      <FacturePreview
        open
        facture={mockFacture}
        onClose={onClose}
        onPrint={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Fermer'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
