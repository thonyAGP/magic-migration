// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FactureLigneGrid } from '../FactureLigneGrid';
import type { FactureLigne } from '@/types/facture';

const mockLignes: FactureLigne[] = [
  {
    id: 1,
    factureId: 100,
    codeArticle: 'ART001',
    libelle: 'Article test',
    quantite: 2,
    prixUnitaireHT: 10,
    tauxTVA: 20,
    montantHT: 20,
    montantTVA: 4,
    montantTTC: 24,
  },
  {
    id: 2,
    factureId: 100,
    codeArticle: 'ART002',
    libelle: 'Article deux',
    quantite: 1,
    prixUnitaireHT: 50,
    tauxTVA: 5.5,
    montantHT: 50,
    montantTVA: 2.75,
    montantTTC: 52.75,
  },
];

describe('FactureLigneGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state', () => {
    render(
      <FactureLigneGrid
        lignes={[]}
        onAddLigne={vi.fn()}
        onRemoveLigne={vi.fn()}
      />,
    );
    expect(screen.getByText('Aucune ligne')).toBeInTheDocument();
  });

  it('should render ligne rows', () => {
    render(
      <FactureLigneGrid
        lignes={mockLignes}
        onAddLigne={vi.fn()}
        onRemoveLigne={vi.fn()}
      />,
    );
    expect(screen.getByText('ART001')).toBeInTheDocument();
    expect(screen.getByText('Article test')).toBeInTheDocument();
    expect(screen.getByText('ART002')).toBeInTheDocument();
    expect(screen.getByText('Article deux')).toBeInTheDocument();
  });

  it('should display correct amounts', () => {
    render(
      <FactureLigneGrid
        lignes={mockLignes}
        onAddLigne={vi.fn()}
        onRemoveLigne={vi.fn()}
      />,
    );
    // montantHT for first line = 20 EUR
    expect(screen.getByText('20,00 €')).toBeInTheDocument();
    // montantTTC for first line = 24 EUR
    expect(screen.getByText('24,00 €')).toBeInTheDocument();
  });

  it('should show add form when editable', () => {
    render(
      <FactureLigneGrid
        lignes={[]}
        onAddLigne={vi.fn()}
        onRemoveLigne={vi.fn()}
        isEditable
      />,
    );
    expect(screen.getByPlaceholderText('Code article')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Libelle')).toBeInTheDocument();
  });

  it('should call onAddLigne with valid input', () => {
    const onAddLigne = vi.fn();
    render(
      <FactureLigneGrid
        lignes={[]}
        onAddLigne={onAddLigne}
        onRemoveLigne={vi.fn()}
        isEditable
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Code article'), {
      target: { value: 'ART' },
    });
    fireEvent.change(screen.getByPlaceholderText('Libelle'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Qte'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByPlaceholderText('Prix HT'), {
      target: { value: '15' },
    });

    fireEvent.click(screen.getByLabelText('Ajouter une ligne'));
    expect(onAddLigne).toHaveBeenCalledWith(
      expect.objectContaining({
        codeArticle: 'ART',
        libelle: 'Test',
        quantite: 3,
        prixUnitaireHT: 15,
        tauxTVA: 20,
      }),
    );
  });

  it('should call onRemoveLigne on click', () => {
    const onRemoveLigne = vi.fn();
    render(
      <FactureLigneGrid
        lignes={mockLignes}
        onAddLigne={vi.fn()}
        onRemoveLigne={onRemoveLigne}
        isEditable
      />,
    );

    const removeButtons = screen.getAllByLabelText('Supprimer la ligne');
    fireEvent.click(removeButtons[0]);
    expect(onRemoveLigne).toHaveBeenCalledWith(0);
  });
});
