import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/stores/facturationAppelStore', () => ({
  useFacturationAppelStore: vi.fn(),
}));

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
}));

import { FacturationAppelPage } from '@/pages/FacturationAppelPage';
import { useFacturationAppelStore } from '@/stores/facturationAppelStore';
import { useAuthStore } from '@/stores';
import type { HistoriqueAppel } from '@/types/facturationAppel';

describe('FacturationAppelPage', () => {
  const mockChargerHistoriqueAppels = vi.fn();
  const mockRecupererCoefficient = vi.fn();
  const mockFacturerAppel = vi.fn();
  const mockVerifierCloture = vi.fn();
  const mockDebloquerCloture = vi.fn();
  const mockMarquerGratuit = vi.fn();
  const mockAnnulerFacturation = vi.fn();
  const mockSetFilterSociete = vi.fn();
  const mockSetFilterDateDebut = vi.fn();
  const mockSetFilterDateFin = vi.fn();
  const mockResetFilters = vi.fn();
  const mockReset = vi.fn();

  const defaultStoreState = {
    historiqueAppels: [],
    coefficientTelephone: null,
    cloture: null,
    isLoading: false,
    error: null,
    filterSociete: '',
    filterDateDebut: null,
    filterDateFin: null,
    chargerHistoriqueAppels: mockChargerHistoriqueAppels,
    recupererCoefficient: mockRecupererCoefficient,
    facturerAppel: mockFacturerAppel,
    verifierCloture: mockVerifierCloture,
    debloquerCloture: mockDebloquerCloture,
    marquerGratuit: mockMarquerGratuit,
    annulerFacturation: mockAnnulerFacturation,
    setFilterSociete: mockSetFilterSociete,
    setFilterDateDebut: mockSetFilterDateDebut,
    setFilterDateFin: mockSetFilterDateFin,
    resetFilters: mockResetFilters,
    reset: mockReset,
  };

  const mockUser = {
    id: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector(defaultStoreState)
    );
    vi.mocked(useAuthStore).mockImplementation((selector) =>
      selector({ user: mockUser })
    );
    mockRecupererCoefficient.mockResolvedValue(undefined);
    mockChargerHistoriqueAppels.mockResolvedValue(undefined);
    mockVerifierCloture.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <FacturationAppelPage />
      </BrowserRouter>
    );
  };

  it('should render without crashing', () => {
    renderPage();
    expect(screen.getByText(/Facturation Appels/i)).toBeInTheDocument();
  });

  it('should display user name', () => {
    renderPage();
    expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
  });

  it('should call recupererCoefficient on mount', () => {
    renderPage();
    expect(mockRecupererCoefficient).toHaveBeenCalledTimes(1);
  });

  it('should call reset on unmount', () => {
    const { unmount } = renderPage();
    mockReset.mockClear();
    unmount();
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should display loading state', () => {
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, isLoading: true })
    );
    renderPage();
    expect(screen.getByText(/Chargement.../i)).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorMessage = 'Erreur de chargement';
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, error: errorMessage })
    );
    renderPage();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display coefficient when loaded', () => {
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, coefficientTelephone: 1.2345 })
    );
    renderPage();
    expect(screen.getByText('1.2345')).toBeInTheDocument();
  });

  it('should display cloture status ouvert', () => {
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({
        ...defaultStoreState,
        cloture: { cloture_enCours: false, testReseau: null },
      })
    );
    renderPage();
    expect(screen.getByText('Ouvert')).toBeInTheDocument();
  });

  it('should display cloture status cloture', () => {
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({
        ...defaultStoreState,
        cloture: { cloture_enCours: true, testReseau: null },
      })
    );
    renderPage();
    expect(screen.getByText('Clôturé')).toBeInTheDocument();
  });

  it('should update societe filter on input change', () => {
    renderPage();
    const societeInput = screen.getByPlaceholderText('SOC1');
    fireEvent.change(societeInput, { target: { value: 'SOC2' } });
    expect(mockSetFilterSociete).toHaveBeenCalledWith('SOC2');
  });

  it('should update prefixe filter on input change', () => {
    renderPage();
    const prefixeInput = screen.getByPlaceholderText('CAI01');
    fireEvent.change(prefixeInput, { target: { value: 'CAI02' } });
    expect(prefixeInput).toHaveValue('CAI02');
  });

  it('should disable search button when societe or prefixe is empty', () => {
    renderPage();
    const searchButton = screen.getByRole('button', { name: /Rechercher/i });
    expect(searchButton).toBeDisabled();
  });

  it('should enable search button when societe and prefixe are filled', async () => {
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, filterSociete: 'SOC1' })
    );
    renderPage();
    const prefixeInput = screen.getByPlaceholderText('CAI01');
    fireEvent.change(prefixeInput, { target: { value: 'CAI01' } });
    await waitFor(() => {
      const searchButton = screen.getByRole('button', { name: /Rechercher/i });
      expect(searchButton).not.toBeDisabled();
    });
  });

  it('should call chargerHistoriqueAppels on search click', async () => {
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, filterSociete: 'SOC1' })
    );
    renderPage();
    const prefixeInput = screen.getByPlaceholderText('CAI01');
    fireEvent.change(prefixeInput, { target: { value: 'CAI01' } });
    const searchButton = screen.getByRole('button', { name: /Rechercher/i });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(mockChargerHistoriqueAppels).toHaveBeenCalledWith('SOC1', 'CAI01', undefined, undefined);
    });
  });

  it('should reset filters on reset button click', () => {
    renderPage();
    const resetButton = screen.getByRole('button', { name: /Réinitialiser/i });
    fireEvent.click(resetButton);
    expect(mockResetFilters).toHaveBeenCalled();
  });

  it('should display empty state when no appels', () => {
    renderPage();
    expect(screen.getByText(/Aucun appel trouvé/i)).toBeInTheDocument();
  });

  it('should display appels when loaded', () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    renderPage();
    expect(screen.getByText('0123456789')).toBeInTheDocument();
    expect(screen.getAllByText('12.50 €').length).toBeGreaterThanOrEqual(1);
  });

  it('should toggle appel selection on checkbox click', () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    const appelCheckbox = checkboxes[1];
    fireEvent.click(appelCheckbox);
    expect(appelCheckbox).toBeChecked();
  });

  it('should disable facturer button when no appels selected', () => {
    renderPage();
    const facturerButton = screen.getByRole('button', { name: /Facturer \(0\)/i });
    expect(facturerButton).toBeDisabled();
  });

  it('should open facturation dialog on facturer button click', async () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const facturerButton = screen.getByRole('button', { name: /Facturer \(1\)/i });
    fireEvent.click(facturerButton);
    await waitFor(() => {
      expect(screen.getByText(/Facturer les appels sélectionnés/i)).toBeInTheDocument();
    });
  });

  it('should call facturerAppel on facturation confirm', async () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels, filterSociete: 'SOC1' })
    );
    mockFacturerAppel.mockResolvedValue(undefined);
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const facturerButton = screen.getByRole('button', { name: /Facturer \(1\)/i });
    fireEvent.click(facturerButton);
    await waitFor(() => {
      expect(screen.getByText(/Facturer les appels sélectionnés/i)).toBeInTheDocument();
    });
    const compteInput = screen.getByPlaceholderText('12345');
    const filiationInput = screen.getByPlaceholderText('1');
    fireEvent.change(compteInput, { target: { value: '12345' } });
    fireEvent.change(filiationInput, { target: { value: '1' } });
    // Multiple "Confirmer" buttons exist (all dialogs render children without DialogContent).
    // The facturation one is enabled (compte+filiation filled), others are disabled.
    const confirmButtons = screen.getAllByRole('button', { name: /^Confirmer$/i });
    const enabledConfirm = confirmButtons.find((btn) => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledConfirm!);
    await waitFor(() => {
      expect(mockFacturerAppel).toHaveBeenCalled();
    });
  });

  it('should show cloture warning when cloture is active', async () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    mockVerifierCloture.mockResolvedValue(true);
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const facturerButton = screen.getByRole('button', { name: /Facturer \(1\)/i });
    fireEvent.click(facturerButton);
    await waitFor(() => {
      expect(screen.getByText(/Facturer les appels sélectionnés/i)).toBeInTheDocument();
    });
    const compteInput = screen.getByPlaceholderText('12345');
    const filiationInput = screen.getByPlaceholderText('1');
    fireEvent.change(compteInput, { target: { value: '12345' } });
    fireEvent.change(filiationInput, { target: { value: '1' } });
    const confirmButtons = screen.getAllByRole('button', { name: /^Confirmer$/i });
    const enabledConfirm = confirmButtons.find((btn) => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledConfirm!);
    await waitFor(() => {
      expect(screen.getByText(/Réseau clôturé/i)).toBeInTheDocument();
    });
  });

  it('should call debloquerCloture on debloquer button click', async () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    mockVerifierCloture.mockResolvedValue(true);
    mockDebloquerCloture.mockResolvedValue(undefined);
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const facturerButton = screen.getByRole('button', { name: /Facturer \(1\)/i });
    fireEvent.click(facturerButton);
    await waitFor(() => {
      expect(screen.getByText(/Facturer les appels sélectionnés/i)).toBeInTheDocument();
    });
    const compteInput = screen.getByPlaceholderText('12345');
    const filiationInput = screen.getByPlaceholderText('1');
    fireEvent.change(compteInput, { target: { value: '12345' } });
    fireEvent.change(filiationInput, { target: { value: '1' } });
    const confirmButtons = screen.getAllByRole('button', { name: /^Confirmer$/i });
    const enabledConfirm = confirmButtons.find((btn) => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledConfirm!);
    await waitFor(() => {
      expect(screen.getByText(/Réseau clôturé/i)).toBeInTheDocument();
    });
    const debloquerButton = screen.getByRole('button', { name: /Débloquer et continuer/i });
    fireEvent.click(debloquerButton);
    await waitFor(() => {
      expect(mockDebloquerCloture).toHaveBeenCalled();
    });
  });

  it('should open gratuit dialog on marquer gratuit button click', async () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const gratuitButton = screen.getByRole('button', { name: /Marquer gratuit/i });
    fireEvent.click(gratuitButton);
    await waitFor(() => {
      expect(screen.getByText(/Marquer comme gratuit/i)).toBeInTheDocument();
    });
  });

  it('should call marquerGratuit on gratuit confirm', async () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    mockMarquerGratuit.mockResolvedValue(undefined);
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const gratuitButton = screen.getByRole('button', { name: /Marquer gratuit/i });
    fireEvent.click(gratuitButton);
    await waitFor(() => {
      expect(screen.getByText(/Marquer comme gratuit/i)).toBeInTheDocument();
    });
    const raisonInput = screen.getByPlaceholderText(/Appel urgence médicale/i);
    fireEvent.change(raisonInput, { target: { value: 'Urgence' } });
    // Multiple "Confirmer" buttons exist. The gratuit one is enabled (raison filled), others disabled.
    const confirmButtons = screen.getAllByRole('button', { name: /^Confirmer$/i });
    const enabledConfirm = confirmButtons.find((btn) => !btn.hasAttribute('disabled'));
    fireEvent.click(enabledConfirm!);
    await waitFor(() => {
      expect(mockMarquerGratuit).toHaveBeenCalledWith(1, 'Urgence');
    });
  });

  it('should call annulerFacturation on annuler button click', async () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: true,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    mockAnnulerFacturation.mockResolvedValue(undefined);
    renderPage();
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const annulerButton = screen.getByRole('button', { name: /Annuler facturation/i });
    fireEvent.click(annulerButton);
    await waitFor(() => {
      expect(mockAnnulerFacturation).toHaveBeenCalledWith(1);
    });
  });

  it('should navigate to menu on retour button click', () => {
    renderPage();
    const retourButton = screen.getByRole('button', { name: /Retour au menu/i });
    fireEvent.click(retourButton);
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('should display total appels count', () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
      {
        id: 2,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '11:00',
        numeroTel: '0987654321',
        duree: '00:03:00',
        montant: 7.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    renderPage();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display total montant', () => {
    const mockAppels: HistoriqueAppel[] = [
      {
        id: 1,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '10:30',
        numeroTel: '0123456789',
        duree: '00:05:30',
        montant: 12.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
      {
        id: 2,
        societe: 'SOC1',
        prefixe: 'CAI01',
        dateAppel: new Date('2026-02-20'),
        heureAppel: '11:00',
        numeroTel: '0987654321',
        duree: '00:03:00',
        montant: 7.5,
        qualite: 'OK',
        gratuite: false,
        raisonGratuite: null,
        facture: false,
      },
    ];
    vi.mocked(useFacturationAppelStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, historiqueAppels: mockAppels })
    );
    renderPage();
    expect(screen.getByText('20.00 €')).toBeInTheDocument();
  });
});