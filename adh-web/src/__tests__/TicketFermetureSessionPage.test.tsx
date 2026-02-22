import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockUseAuthStore = vi.fn();
const mockUseTicketFermetureSessionStore = vi.fn();

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

vi.mock('@/stores/ticketFermetureSessionStore', () => ({
  useTicketFermetureSessionStore: (selector: unknown) =>
    mockUseTicketFermetureSessionStore(selector),
}));

import { TicketFermetureSessionPage } from '@/pages/TicketFermetureSessionPage';

describe('TicketFermetureSessionPage', () => {
  const mockRecapData = {
    societe: 'ADH',
    session: 142,
    dateComptable: new Date('2026-02-22'),
    heureDebutSession: '08:00',
    caisseDepart: 1000,
    apportCoffre: 500,
    versement: 2000,
    retrait: 300,
    soldeCash: 3200,
    soldeCarte: 1500,
    change: 100,
    fraisChange: 5,
    deviseLocale: 'EUR',
    nomVillage: 'Village Test',
    editionDetaillee: true,
  };

  const mockMontantsComptables = [
    { cumulQuantite: 10, cumulMontant: 500, totalMontant: 500, equivalent: 500 },
    { cumulQuantite: 5, cumulMontant: 250, totalMontant: 250, equivalent: 250 },
  ];

  const mockLoadRecapData = vi.fn();
  const mockLoadMontantsComptables = vi.fn();
  const mockGenerateTicketFermeture = vi.fn();
  const mockValidateFinTache = vi.fn();
  const mockSelectPrinter = vi.fn();
  const mockReset = vi.fn();

  const defaultStoreState = {
    recapData: null,
    montantsComptables: [],
    isLoading: false,
    error: null,
    finTache: 'F',
    printerNum: 1,
    loadRecapData: mockLoadRecapData,
    loadMontantsComptables: mockLoadMontantsComptables,
    generateTicketFermeture: mockGenerateTicketFermeture,
    validateFinTache: mockValidateFinTache,
    selectPrinter: mockSelectPrinter,
    reset: mockReset,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthStore.mockImplementation((selector) =>
      selector({ user: { prenom: 'John', nom: 'Doe' } }),
    );

    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector(defaultStoreState),
    );
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <TicketFermetureSessionPage />
      </BrowserRouter>,
    );

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText(/Ticket de fermeture de session/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, isLoading: true, recapData: null }),
    );

    renderPage();
    expect(screen.getByText(/Chargement des données/i)).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, error: 'Une erreur est survenue' }),
    );

    renderPage();
    expect(screen.getByText(/Une erreur est survenue/i)).toBeInTheDocument();
  });

  it('displays no data message when recapData is null', () => {
    renderPage();
    expect(screen.getByText(/Aucune donnée de récapitulatif disponible/i)).toBeInTheDocument();
  });

  it('displays recap data when loaded', () => {
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData }),
    );

    renderPage();
    expect(screen.getByDisplayValue('142')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Village Test')).toBeInTheDocument();
  });

  it('displays montants comptables when available', () => {
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({
        ...defaultStoreState,
        recapData: mockRecapData,
        montantsComptables: mockMontantsComptables,
      }),
    );

    renderPage();
    expect(screen.getByText(/10 transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/5 transactions/i)).toBeInTheDocument();
  });

  it('loads data on mount', () => {
    renderPage();
    expect(mockLoadRecapData).toHaveBeenCalledWith('ADH', 142);
    expect(mockLoadMontantsComptables).toHaveBeenCalledWith('ADH', 142);
  });

  it('resets store on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });

  it('navigates back on Retour click', () => {
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData }),
    );

    renderPage();
    const backButton = screen.getByText(/Retour au menu/i);
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('validates fin_tache before opening dialog', () => {
    mockValidateFinTache.mockReturnValue(false);
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData, finTache: 'X' }),
    );

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderPage();
    const generateButton = screen.getByText(/Générer le ticket/i);
    fireEvent.click(generateButton);

    expect(mockValidateFinTache).toHaveBeenCalledWith('X');
    expect(alertSpy).toHaveBeenCalledWith('Erreur: fin_tache doit être "F" pour procéder');

    alertSpy.mockRestore();
  });

  it('opens dialog when validation succeeds', () => {
    mockValidateFinTache.mockReturnValue(true);
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData, finTache: 'F' }),
    );

    renderPage();
    const generateButton = screen.getByText(/Générer le ticket/i);
    fireEvent.click(generateButton);

    expect(screen.getByText(/Confirmer la génération du ticket/i)).toBeInTheDocument();
  });

  it('changes printer selection in dialog', () => {
    mockValidateFinTache.mockReturnValue(true);
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData, finTache: 'F' }),
    );

    renderPage();
    fireEvent.click(screen.getByText(/Générer le ticket/i));

    const printerSelect = screen.getByRole('combobox');
    fireEvent.change(printerSelect, { target: { value: '9' } });

    expect(mockSelectPrinter).toHaveBeenCalledWith(9);
  });

  it('generates ticket on confirm', async () => {
    mockValidateFinTache.mockReturnValue(true);
    mockGenerateTicketFermeture.mockResolvedValue(undefined);
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData, finTache: 'F' }),
    );

    renderPage();
    fireEvent.click(screen.getByText(/Générer le ticket/i));

    const confirmButton = screen.getByRole('button', { name: /Confirmer/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockGenerateTicketFermeture).toHaveBeenCalledWith(
        'ADH',
        142,
        mockRecapData.dateComptable,
      );
    });
  });

  it('closes dialog on cancel', () => {
    mockValidateFinTache.mockReturnValue(true);
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData, finTache: 'F' }),
    );

    renderPage();
    fireEvent.click(screen.getByText(/Générer le ticket/i));

    const cancelButton = screen.getByRole('button', { name: /Annuler/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Confirmer la génération du ticket/i)).not.toBeInTheDocument();
  });

  it('disables generate button when loading', () => {
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData, isLoading: true }),
    );

    renderPage();
    const generateButton = screen.getByText(/Générer le ticket/i);
    expect(generateButton).toBeDisabled();
  });

  it('displays user info in header', () => {
    renderPage();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData }),
    );

    renderPage();
    expect(screen.getByText(/1\s*000,00\s*€/)).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    mockUseTicketFermetureSessionStore.mockImplementation((selector) =>
      selector({ ...defaultStoreState, recapData: mockRecapData }),
    );

    renderPage();
    expect(screen.getByDisplayValue(/22\/02\/2026/i)).toBeInTheDocument();
  });
});