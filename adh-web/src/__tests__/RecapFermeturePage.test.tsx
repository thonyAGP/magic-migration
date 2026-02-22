import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockUseAuthStore = vi.fn();
const mockLoadRecapFermeture = vi.fn();
const mockGenererTableau = vi.fn();
const mockSaveRemise = vi.fn();
const mockSetModeReimpression = vi.fn();
const mockCheckPrinter = vi.fn();
const mockExportRecap = vi.fn();
const mockReset = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/stores', () => ({
  useAuthStore: (selector: unknown) => mockUseAuthStore(selector),
}));

vi.mock('@/stores/recapFermetureStore', () => ({
  useRecapFermetureStore: (selector: unknown) => {
    const state = {
      recap: null,
      lignesRecap: [],
      remises: [],
      articles: [],
      isLoading: false,
      error: null,
      isPrinting: false,
      modeReimpression: null,
      printerCourant: null,
      finTache: false,
      loadRecapFermeture: mockLoadRecapFermeture,
      genererTableau: mockGenererTableau,
      saveRemise: mockSaveRemise,
      setModeReimpression: mockSetModeReimpression,
      checkPrinter: mockCheckPrinter,
      exportRecap: mockExportRecap,
      reset: mockReset,
    };
    return selector(state);
  },
}));

import { RecapFermeturePage } from '@/pages/RecapFermeturePage';

const mockRecapData = {
  societe: 'ADH',
  session: 42,
  deviseLocale: 'EUR',
  dateDebut: new Date('2026-02-20'),
  heureDebut: '08:00',
  nbreDeviseOuverture: 5,
  nbreDeviseFermeture: 5,
  nbreDevisesCalcule: 5,
  nbreDevisesCompte: 5,
};

const mockLignesRecap = [
  {
    typeOperation: 'Vente',
    montantDevise: 100.0,
    codeDevise: 'EUR',
    tauxChange: 1.0,
    montantEquivalent: 100.0,
    ecart: 0.0,
  },
  {
    typeOperation: 'Change',
    montantDevise: 50.0,
    codeDevise: 'USD',
    tauxChange: 0.92,
    montantEquivalent: 46.0,
    ecart: -1.5,
  },
];

const mockRemises = [
  {
    detailProduitRemiseEdite: true,
    montantRemiseMonnaie: 250.0,
    detailRemiseFinaleEdite: false,
  },
];

const mockArticles = [
  {
    chronoHisto: 1,
    totalArticles: 10,
    codeArticle: 'ART001',
    libelleArticle: 'Article Test',
  },
];

const renderPage = () =>
  render(
    <BrowserRouter>
      <RecapFermeturePage />
    </BrowserRouter>
  );

describe('RecapFermeturePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        user: { prenom: 'Jean', nom: 'Dupont' },
      })
    );
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Récapitulatif de fermeture')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: null,
        lignesRecap: [],
        remises: [],
        articles: [],
        isLoading: true,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText('Chargement du récapitulatif...')).toBeInTheDocument();
  });

  it('loads recap data on mount', () => {
    renderPage();
    expect(mockLoadRecapFermeture).toHaveBeenCalledWith('ADH', 42);
  });

  it('displays error state', () => {
    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: null,
        lignesRecap: [],
        remises: [],
        articles: [],
        isLoading: false,
        error: 'Erreur de chargement',
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('displays recap data when loaded', () => {
    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: mockRecapData,
        lignesRecap: mockLignesRecap,
        remises: mockRemises,
        articles: mockArticles,
        isLoading: false,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText(/Session 42/)).toBeInTheDocument();
    expect(screen.getByText(/EUR/)).toBeInTheDocument();
    expect(screen.getByText('Vente')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  it('switches tabs on click', async () => {
    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: mockRecapData,
        lignesRecap: mockLignesRecap,
        remises: mockRemises,
        articles: mockArticles,
        isLoading: false,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();

    const remisesTab = screen.getByText('Remises en caisse');
    fireEvent.click(remisesTab);

    await waitFor(() => {
      expect(screen.getByText('Montant remise monnaie')).toBeInTheDocument();
    });

    const articlesTab = screen.getByText('Articles');
    fireEvent.click(articlesTab);

    await waitFor(() => {
      expect(screen.getByText('Code article')).toBeInTheDocument();
    });
  });

  it('handles print button click', async () => {
    mockCheckPrinter.mockResolvedValue(true);

    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: mockRecapData,
        lignesRecap: mockLignesRecap,
        remises: mockRemises,
        articles: mockArticles,
        isLoading: false,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: 1,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();

    const printButton = screen.getByText('Imprimer');
    fireEvent.click(printButton);

    await waitFor(() => {
      expect(mockCheckPrinter).toHaveBeenCalledWith(1);
      expect(mockGenererTableau).toHaveBeenCalledWith('ADH', 42);
    });
  });

  it('handles mode reimpression toggle', async () => {
    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: mockRecapData,
        lignesRecap: mockLignesRecap,
        remises: mockRemises,
        articles: mockArticles,
        isLoading: false,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();

    const detailButton = screen.getByText('Mode détaillé');
    fireEvent.click(detailButton);

    await waitFor(() => {
      expect(mockSetModeReimpression).toHaveBeenCalledWith('D');
    });
  });

  it('handles remise edit and save', async () => {
    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: mockRecapData,
        lignesRecap: mockLignesRecap,
        remises: mockRemises,
        articles: mockArticles,
        isLoading: false,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();

    const remisesTab = screen.getByText('Remises en caisse');
    fireEvent.click(remisesTab);

    await waitFor(() => {
      const editButton = screen.getByText('Éditer');
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Éditer la remise')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Enregistrer');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveRemise).toHaveBeenCalled();
    });
  });

  it('handles export to PDF', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    mockExportRecap.mockResolvedValue(mockBlob);

    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: mockRecapData,
        lignesRecap: mockLignesRecap,
        remises: mockRemises,
        articles: mockArticles,
        isLoading: false,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();

    const exportsTab = screen.getByText('Exports');
    fireEvent.click(exportsTab);

    await waitFor(() => {
      const pdfButton = screen.getByText('Exporter en PDF');
      fireEvent.click(pdfButton);
    });

    await waitFor(() => {
      expect(mockExportRecap).toHaveBeenCalledWith('PDF');
    });
  });

  it('navigates back to menu on retour button click', async () => {
    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: mockRecapData,
        lignesRecap: mockLignesRecap,
        remises: mockRemises,
        articles: mockArticles,
        isLoading: false,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();

    const retourButton = screen.getByText('Retour au menu');
    fireEvent.click(retourButton);

    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('displays ecart warning when ecarts detected', () => {
    vi.mocked(vi.fn()).mockImplementation((selector) =>
      selector({
        recap: mockRecapData,
        lignesRecap: mockLignesRecap,
        remises: mockRemises,
        articles: mockArticles,
        isLoading: false,
        error: null,
        isPrinting: false,
        modeReimpression: null,
        printerCourant: null,
        finTache: false,
        loadRecapFermeture: mockLoadRecapFermeture,
        genererTableau: mockGenererTableau,
        saveRemise: mockSaveRemise,
        setModeReimpression: mockSetModeReimpression,
        checkPrinter: mockCheckPrinter,
        exportRecap: mockExportRecap,
        reset: mockReset,
      })
    );

    renderPage();
    expect(screen.getByText(/Des écarts ont été détectés/)).toBeInTheDocument();
  });

  it('calls reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });
});