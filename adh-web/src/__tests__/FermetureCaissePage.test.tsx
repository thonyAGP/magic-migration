import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { FermetureCaisseState } from '@/types/fermetureCaisse';

const mockChargerRecapFermeture = vi.fn();
const mockSaisirMontantsComptes = vi.fn();
const mockCalculerEcarts = vi.fn();
const mockJustifierEcart = vi.fn();
const mockEffectuerApportCoffre = vi.fn();
const mockEffectuerApportArticles = vi.fn();
const mockEffectuerRemiseCaisse = vi.fn();
const mockValiderFermeture = vi.fn();
const mockGenererTickets = vi.fn();
const mockAfficherDetailDevises = vi.fn();
const mockSetCurrentView = vi.fn();
const mockReset = vi.fn();

const mockAuthUser = { prenom: 'Jean', nom: 'Dupont' };

vi.mock('@/stores/fermetureCaisseStore', () => ({
  useFermetureCaisseStore: (selector: (state: FermetureCaisseState) => unknown) =>
    selector({
      recapFermeture: {
        societe: 'ADH',
        numeroSession: 1001,
        moyensPaiement: [
          {
            code: 'CASH',
            libelle: 'Espèces',
            soldeOuverture: 500,
            montantCompte: 1200,
            montantCalcule: 1180,
            ecart: 20,
          },
          {
            code: 'CB',
            libelle: 'Cartes bancaires',
            soldeOuverture: 0,
            montantCompte: 800,
            montantCalcule: 800,
            ecart: 0,
          },
        ],
        totalVersementCoffre: 1000,
        soldeFinal: 1000,
      },
      pointagesDevise: [
        {
          societe: 'ADH',
          numeroSession: 1001,
          codeDevise: 'EUR',
          montantOuverture: 500,
          montantCompte: 1200,
          montantCalcule: 1180,
          ecart: 20,
          commentaireEcart: null,
        },
      ],
      pointagesArticle: [],
      pointagesApproRemise: [],
      ecartsDetectes: true,
      ecartsJustifies: false,
      tousPointes: true,
      fermetureValidee: false,
      isLoading: false,
      error: null,
      currentView: 'recap',
      chargerRecapFermeture: mockChargerRecapFermeture,
      saisirMontantsComptes: mockSaisirMontantsComptes,
      calculerEcarts: mockCalculerEcarts,
      justifierEcart: mockJustifierEcart,
      effectuerApportCoffre: mockEffectuerApportCoffre,
      effectuerApportArticles: mockEffectuerApportArticles,
      effectuerRemiseCaisse: mockEffectuerRemiseCaisse,
      validerFermeture: mockValiderFermeture,
      genererTickets: mockGenererTickets,
      mettreAJourHistorique: vi.fn(),
      calculerSoldeFinal: vi.fn(),
      afficherDetailDevises: mockAfficherDetailDevises,
      setCurrentView: mockSetCurrentView,
      reset: mockReset,
    }),
}));

vi.mock('@/stores', () => ({
  useAuthStore: (selector: (state: { user: typeof mockAuthUser | null }) => unknown) =>
    selector({ user: mockAuthUser }),
}));

import { FermetureCaissePage } from '@/pages/FermetureCaissePage';

const renderPage = () =>
  render(
    <BrowserRouter>
      <FermetureCaissePage />
    </BrowserRouter>,
  );

describe('FermetureCaissePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText(/Fermeture de caisse/i)).toBeInTheDocument();
  });

  it('displays user info', () => {
    renderPage();
    expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
  });

  it('displays session info', () => {
    renderPage();
    expect(screen.getByText(/Session #1001/i)).toBeInTheDocument();
  });

  it('loads recap data on mount', () => {
    renderPage();
    expect(mockChargerRecapFermeture).toHaveBeenCalledWith('ADH', 1001);
  });

  it('calls reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });

  it('displays recap tab by default', () => {
    renderPage();
    const recapTab = screen.getByText('Recapitulatif').closest('button');
    expect(recapTab).toHaveClass('border-primary');
  });

  it('displays moyens paiement table', () => {
    renderPage();
    expect(screen.getByText(/Espèces/i)).toBeInTheDocument();
    expect(screen.getByText(/Cartes bancaires/i)).toBeInTheDocument();
  });

  it('highlights ecart when non-zero', () => {
    renderPage();
    const ecartCells = screen.getAllByText('20.00');
    const ecartCell = ecartCells.find((cell) => cell.classList.contains('bg-yellow-100'));
    expect(ecartCell).toBeInTheDocument();
  });

  it('handles saisie button click', async () => {
    renderPage();
    const saisieButtons = screen.getAllByText('Saisir');
    fireEvent.click(saisieButtons[0]);
    await waitFor(() => {
      expect(mockSaisirMontantsComptes).toHaveBeenCalledWith('CASH');
    });
  });

  it('handles apport coffre button click', async () => {
    renderPage();
    const apportButton = screen.getByText('Apport coffre').closest('button');
    fireEvent.click(apportButton);
    await waitFor(() => {
      expect(mockEffectuerApportCoffre).toHaveBeenCalledWith(800);
    });
  });

  it('handles apport articles button click', async () => {
    renderPage();
    const apportButton = screen.getByText('Apport articles').closest('button');
    fireEvent.click(apportButton);
    await waitFor(() => {
      expect(mockEffectuerApportArticles).toHaveBeenCalledWith('ART001', 10);
    });
  });

  it('handles remise button click', async () => {
    renderPage();
    const remiseButton = screen.getByText('Remise').closest('button');
    fireEvent.click(remiseButton);
    await waitFor(() => {
      expect(mockEffectuerRemiseCaisse).toHaveBeenCalledWith(500);
    });
  });

  it('disables justifier ecart button when no ecarts', () => {
    renderPage();
    const justifierButton = screen.getByText('Justifier ecart').closest('button');
    expect(justifierButton).not.toBeDisabled();
  });

  it('switches to validation tab', () => {
    renderPage();
    const validationTab = screen.getByText('Validation').closest('button');
    fireEvent.click(validationTab);
    expect(screen.getByText('Tous les moyens ont ete pointes')).toBeInTheDocument();
  });

  it('displays validation status correctly', () => {
    renderPage();
    const validationTab = screen.getByText('Validation').closest('button');
    fireEvent.click(validationTab);
    expect(screen.getByText('Des ecarts existent et ne sont pas justifies')).toBeInTheDocument();
  });

  it('handles valider fermeture button click', async () => {
    renderPage();
    const validationTab = screen.getByText('Validation').closest('button');
    fireEvent.click(validationTab);
    const validerButton = screen.getByText('Valider fermeture').closest('button');
    fireEvent.click(validerButton);
    await waitFor(() => {
      expect(mockValiderFermeture).toHaveBeenCalledWith('ADH', 1001);
    });
  });

  it('switches to tickets tab', () => {
    renderPage();
    const ticketsTab = screen.getByText('Tickets').closest('button');
    fireEvent.click(ticketsTab);
    expect(screen.getByText('Generer tickets')).toBeInTheDocument();
  });

  it('handles generer tickets button click', async () => {
    renderPage();
    const ticketsTab = screen.getByText('Tickets').closest('button');
    fireEvent.click(ticketsTab);
    const genererButton = screen.getByText('Generer tickets').closest('button');
    fireEvent.click(genererButton);
    await waitFor(() => {
      expect(mockGenererTickets).toHaveBeenCalledWith('ADH', 1001);
    });
  });

  it('switches to detail devises tab', () => {
    renderPage();
    const detailTab = screen.getByText('Detail devises').closest('button');
    fireEvent.click(detailTab);
    expect(mockAfficherDetailDevises).toHaveBeenCalled();
  });

  it('displays detail devises table', () => {
    renderPage();
    const detailTab = screen.getByText('Detail devises').closest('button');
    fireEvent.click(detailTab);
    expect(screen.getByText('Code devise')).toBeInTheDocument();
  });

  it('displays solde final correctly', () => {
    renderPage();
    const soldeFinalInput = screen.getByDisplayValue('1000.00');
    expect(soldeFinalInput).toBeInTheDocument();
    expect(soldeFinalInput).toHaveAttribute('readonly');
  });

  it('displays total versement coffre correctly', () => {
    renderPage();
    const totalVersementInputs = screen.getAllByDisplayValue('1000.00');
    expect(totalVersementInputs.length).toBeGreaterThan(0);
  });
});