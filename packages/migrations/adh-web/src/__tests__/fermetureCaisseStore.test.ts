import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFermetureCaisseStore } from '@/stores/fermetureCaisseStore';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import type { ApiResponse } from '@/services/api/apiClient';
import type {
  RecapFermeture,
  PointageDevise,
  PointageArticle,
  PointageApproRemise,
  ValiderFermetureResponse,
  GenererTicketsResponse,
} from '@/types/fermetureCaisse';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: false })),
  },
}));

const MOCK_RECAP: RecapFermeture = {
  societe: 'SOC1',
  numeroSession: 1001,
  moyensPaiement: [
    { code: 'CASH', libelle: 'Cash', soldeOuverture: 500, montantCompte: 1245.50, montantCalcule: 1245.50, ecart: 0 },
    { code: 'CB', libelle: 'Cartes', soldeOuverture: 0, montantCompte: 3420.80, montantCalcule: 3420.80, ecart: 0 },
  ],
  totalVersementCoffre: 800,
  soldeFinal: 4623.95,
};

const MOCK_POINTAGES_DEVISE: PointageDevise[] = [
  { societe: 'SOC1', numeroSession: 1001, codeDevise: 'EUR', montantOuverture: 500, montantCompte: 1245.50, montantCalcule: 1245.50, ecart: 0, commentaireEcart: null },
  { societe: 'SOC1', numeroSession: 1001, codeDevise: 'USD', montantOuverture: 100, montantCompte: 312.45, montantCalcule: 300, ecart: 12.45, commentaireEcart: null },
];

const MOCK_POINTAGES_ARTICLE: PointageArticle[] = [
  { societe: 'SOC1', numeroSession: 1001, codeArticle: 'SKI001', quantiteOuverture: 10, quantiteComptee: 8, quantiteCalculee: 8, ecart: 0 },
];

const MOCK_POINTAGES_APPRO_REMISE: PointageApproRemise[] = [
  { societe: 'SOC1', numeroSession: 1001, type: 'APPORT', montant: 500, ticketEdite: true },
];

describe('fermetureCaisseStore', () => {
  beforeEach(() => {
    useFermetureCaisseStore.setState({
      recapFermeture: null,
      pointagesDevise: [],
      pointagesArticle: [],
      pointagesApproRemise: [],
      ecartsDetectes: false,
      ecartsJustifies: false,
      tousPointes: false,
      fermetureValidee: false,
      isLoading: false,
      error: null,
      currentView: 'recap',
    });
    vi.clearAllMocks();
    (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: false });
  });

  describe('chargerRecapFermeture', () => {
    it('should load recap fermeture with mock data when isRealApi is false', async () => {
      await useFermetureCaisseStore.getState().chargerRecapFermeture('SOC1', 1001);

      const state = useFermetureCaisseStore.getState();
      expect(state.recapFermeture).not.toBeNull();
      expect(state.recapFermeture?.moyensPaiement).toHaveLength(6);
      expect(state.pointagesDevise).toHaveLength(2);
      expect(state.pointagesArticle).toHaveLength(2);
      expect(state.pointagesApproRemise).toHaveLength(2);
      expect(state.isLoading).toBe(false);
    });

    it('should call API endpoints when isRealApi is true', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });

      const mockRecapResponse: ApiResponse<RecapFermeture> = { data: MOCK_RECAP, success: true };
      const mockDeviseResponse: ApiResponse<PointageDevise[]> = { data: MOCK_POINTAGES_DEVISE, success: true };
      const mockArticleResponse: ApiResponse<PointageArticle[]> = { data: MOCK_POINTAGES_ARTICLE, success: true };
      const mockApproRemiseResponse: ApiResponse<PointageApproRemise[]> = { data: MOCK_POINTAGES_APPRO_REMISE, success: true };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockRecapResponse });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockDeviseResponse });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockArticleResponse });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockApproRemiseResponse });

      await useFermetureCaisseStore.getState().chargerRecapFermeture('SOC1', 1001);

      expect(apiClient.get).toHaveBeenCalledTimes(4);
      expect(apiClient.get).toHaveBeenCalledWith('/api/fermeture-caisse/recap/SOC1/1001');
      expect(apiClient.get).toHaveBeenCalledWith('/api/fermeture-caisse/pointages-devise/SOC1/1001');
      expect(apiClient.get).toHaveBeenCalledWith('/api/fermeture-caisse/pointages-article/SOC1/1001');
      expect(apiClient.get).toHaveBeenCalledWith('/api/fermeture-caisse/pointages-appro-remise/SOC1/1001');

      const state = useFermetureCaisseStore.getState();
      expect(state.recapFermeture).toEqual(MOCK_RECAP);
      expect(state.pointagesDevise).toEqual(MOCK_POINTAGES_DEVISE);
      expect(state.isLoading).toBe(false);
    });

    it('should set error when API call fails', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await useFermetureCaisseStore.getState().chargerRecapFermeture('SOC1', 1001);

      const state = useFermetureCaisseStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('saisirMontantsComptes', () => {
    it('should set error if no session is loaded', async () => {
      await useFermetureCaisseStore.getState().saisirMontantsComptes('CASH');

      expect(useFermetureCaisseStore.getState().error).toBe('Aucune session chargée');
    });

    it('should skip API call when isRealApi is false', async () => {
      useFermetureCaisseStore.setState({ recapFermeture: MOCK_RECAP });

      await useFermetureCaisseStore.getState().saisirMontantsComptes('CASH');

      expect(apiClient.post).not.toHaveBeenCalled();
      expect(useFermetureCaisseStore.getState().isLoading).toBe(false);
    });

    it('should call API when isRealApi is true', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({ recapFermeture: MOCK_RECAP });
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await useFermetureCaisseStore.getState().saisirMontantsComptes('CASH');

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-caisse/saisir-montants', {
        societe: 'SOC1',
        numeroSession: 1001,
        moyenPaiement: 'CASH',
      });
    });
  });

  describe('calculerEcarts', () => {
    it('should calculate ecarts for all moyens de paiement', async () => {
      const recapWithoutEcarts = {
        ...MOCK_RECAP,
        moyensPaiement: [
          { code: 'CASH', libelle: 'Cash', soldeOuverture: 500, montantCompte: 1250, montantCalcule: 1245.50, ecart: 0 },
          { code: 'CB', libelle: 'Cartes', soldeOuverture: 0, montantCompte: 3420.80, montantCalcule: 3420.80, ecart: 0 },
        ],
      };
      useFermetureCaisseStore.setState({ recapFermeture: recapWithoutEcarts });

      await useFermetureCaisseStore.getState().calculerEcarts();

      const state = useFermetureCaisseStore.getState();
      expect(state.recapFermeture?.moyensPaiement[0].ecart).toBe(4.5);
      expect(state.recapFermeture?.moyensPaiement[1].ecart).toBe(0);
      expect(state.ecartsDetectes).toBe(true);
    });

    it('should set ecartsDetectes to false when no ecarts exist', async () => {
      useFermetureCaisseStore.setState({ recapFermeture: MOCK_RECAP });

      await useFermetureCaisseStore.getState().calculerEcarts();

      expect(useFermetureCaisseStore.getState().ecartsDetectes).toBe(false);
    });
  });

  describe('justifierEcart', () => {
    it('should set error if no session is loaded', async () => {
      await useFermetureCaisseStore.getState().justifierEcart('EUR', 'Erreur caisse');

      expect(useFermetureCaisseStore.getState().error).toBe('Aucune session chargée');
    });

    it('should update pointage with commentaire and set ecartsJustifies when all justified', async () => {
      useFermetureCaisseStore.setState({
        recapFermeture: MOCK_RECAP,
        pointagesDevise: MOCK_POINTAGES_DEVISE,
      });

      await useFermetureCaisseStore.getState().justifierEcart('USD', 'Erreur de caisse');

      const state = useFermetureCaisseStore.getState();
      const usdPointage = state.pointagesDevise.find((p) => p.codeDevise === 'USD');
      expect(usdPointage?.commentaireEcart).toBe('Erreur de caisse');
      expect(state.ecartsJustifies).toBe(true);
    });

    it('should call API when isRealApi is true', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({
        recapFermeture: MOCK_RECAP,
        pointagesDevise: MOCK_POINTAGES_DEVISE,
      });
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await useFermetureCaisseStore.getState().justifierEcart('USD', 'Erreur de caisse');

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-caisse/justifier-ecart', {
        societe: 'SOC1',
        numeroSession: 1001,
        moyenPaiement: 'USD',
        commentaire: 'Erreur de caisse',
      });
    });
  });

  describe('effectuerApportCoffre', () => {
    it('should set error if no session is loaded', async () => {
      await useFermetureCaisseStore.getState().effectuerApportCoffre(200);

      expect(useFermetureCaisseStore.getState().error).toBe('Aucune session chargée');
    });

    it('should update totalVersementCoffre and recalculate solde final in mock mode', async () => {
      useFermetureCaisseStore.setState({ recapFermeture: MOCK_RECAP });

      await useFermetureCaisseStore.getState().effectuerApportCoffre(200);

      const state = useFermetureCaisseStore.getState();
      expect(state.recapFermeture?.totalVersementCoffre).toBe(1000);
    });

    it('should call API when isRealApi is true', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({ recapFermeture: MOCK_RECAP });
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await useFermetureCaisseStore.getState().effectuerApportCoffre(200);

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-caisse/apport-coffre', {
        societe: 'SOC1',
        numeroSession: 1001,
        montant: 200,
      });
    });
  });

  describe('effectuerApportArticles', () => {
    it('should update article quantities in mock mode', async () => {
      useFermetureCaisseStore.setState({
        recapFermeture: MOCK_RECAP,
        pointagesArticle: MOCK_POINTAGES_ARTICLE,
      });

      await useFermetureCaisseStore.getState().effectuerApportArticles('SKI001', 2);

      const state = useFermetureCaisseStore.getState();
      const article = state.pointagesArticle.find((a) => a.codeArticle === 'SKI001');
      expect(article?.quantiteComptee).toBe(10);
      expect(article?.ecart).toBe(2);
    });

    it('should call API when isRealApi is true', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({
        recapFermeture: MOCK_RECAP,
        pointagesArticle: MOCK_POINTAGES_ARTICLE,
      });
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await useFermetureCaisseStore.getState().effectuerApportArticles('SKI001', 2);

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-caisse/apport-articles', {
        societe: 'SOC1',
        numeroSession: 1001,
        codeArticle: 'SKI001',
        quantite: 2,
      });
    });
  });

  describe('effectuerRemiseCaisse', () => {
    it('should decrease totalVersementCoffre in mock mode', async () => {
      useFermetureCaisseStore.setState({ recapFermeture: MOCK_RECAP });

      await useFermetureCaisseStore.getState().effectuerRemiseCaisse(300);

      const state = useFermetureCaisseStore.getState();
      expect(state.recapFermeture?.totalVersementCoffre).toBe(500);
    });

    it('should call API when isRealApi is true', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({ recapFermeture: MOCK_RECAP });
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: true } });

      await useFermetureCaisseStore.getState().effectuerRemiseCaisse(300);

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-caisse/remise-caisse', {
        societe: 'SOC1',
        numeroSession: 1001,
        montant: 300,
      });
    });
  });

  describe('validerFermeture', () => {
    it('should block validation if tousPointes is false', async () => {
      useFermetureCaisseStore.setState({ tousPointes: false });

      await useFermetureCaisseStore.getState().validerFermeture('SOC1', 1001);

      const state = useFermetureCaisseStore.getState();
      expect(state.error).toBe('Tous les moyens de paiement doivent être pointés');
      expect(state.fermetureValidee).toBe(false);
    });

    it('should block validation if ecartsDetectes is true but ecartsJustifies is false', async () => {
      useFermetureCaisseStore.setState({
        tousPointes: true,
        ecartsDetectes: true,
        ecartsJustifies: false,
      });

      await useFermetureCaisseStore.getState().validerFermeture('SOC1', 1001);

      const state = useFermetureCaisseStore.getState();
      expect(state.error).toBe('Tous les écarts doivent être justifiés');
      expect(state.fermetureValidee).toBe(false);
    });

    it('should validate fermeture in mock mode when all checks pass', async () => {
      useFermetureCaisseStore.setState({
        tousPointes: true,
        ecartsDetectes: false,
      });

      await useFermetureCaisseStore.getState().validerFermeture('SOC1', 1001);

      expect(useFermetureCaisseStore.getState().fermetureValidee).toBe(true);
    });

    it('should call API and set fermetureValidee when successful', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({
        tousPointes: true,
        ecartsDetectes: false,
      });

      const mockResponse: ApiResponse<ValiderFermetureResponse> = {
        data: { success: true },
        success: true,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      await useFermetureCaisseStore.getState().validerFermeture('SOC1', 1001);

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-caisse/valider', {
        societe: 'SOC1',
        numeroSession: 1001,
      });
      expect(useFermetureCaisseStore.getState().fermetureValidee).toBe(true);
    });

    it('should set error when API returns validation errors', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({
        tousPointes: true,
        ecartsDetectes: false,
      });

      const mockResponse: ApiResponse<ValiderFermetureResponse> = {
        data: { success: false, errors: ['Ecart non justifié', 'Montant invalide'] },
        success: false,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      await useFermetureCaisseStore.getState().validerFermeture('SOC1', 1001);

      expect(useFermetureCaisseStore.getState().error).toBe('Ecart non justifié, Montant invalide');
    });
  });

  describe('genererTickets', () => {
    it('should set error if fermeture not validated', async () => {
      useFermetureCaisseStore.setState({ fermetureValidee: false });

      await useFermetureCaisseStore.getState().genererTickets('SOC1', 1001);

      expect(useFermetureCaisseStore.getState().error).toBe('La fermeture doit être validée avant de générer les tickets');
    });

    it('should skip API call in mock mode', async () => {
      useFermetureCaisseStore.setState({ fermetureValidee: true });

      await useFermetureCaisseStore.getState().genererTickets('SOC1', 1001);

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should call API when isRealApi is true', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({ fermetureValidee: true });

      const mockResponse: ApiResponse<GenererTicketsResponse> = {
        data: { tickets: ['T001', 'T002'] },
        success: true,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      await useFermetureCaisseStore.getState().genererTickets('SOC1', 1001);

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-caisse/generer-tickets', {
        societe: 'SOC1',
        numeroSession: 1001,
      });
    });
  });

  describe('mettreAJourHistorique', () => {
    it('should set error if fermeture not validated', async () => {
      useFermetureCaisseStore.setState({ fermetureValidee: false });

      await useFermetureCaisseStore.getState().mettreAJourHistorique('SOC1', 1001);

      expect(useFermetureCaisseStore.getState().error).toBe("La fermeture doit être validée avant de mettre à jour l'historique");
    });

    it('should call API when isRealApi is true', async () => {
      (useDataSourceStore.getState as ReturnType<typeof vi.fn>).mockReturnValue({ isRealApi: true });
      useFermetureCaisseStore.setState({ fermetureValidee: true });
      vi.mocked(apiClient.put).mockResolvedValue({ data: { success: true } });

      await useFermetureCaisseStore.getState().mettreAJourHistorique('SOC1', 1001);

      expect(apiClient.put).toHaveBeenCalledWith('/api/fermeture-caisse/historique', {
        societe: 'SOC1',
        numeroSession: 1001,
      });
    });
  });

  describe('calculerSoldeFinal', () => {
    it('should calculate solde final correctly', async () => {
      useFermetureCaisseStore.setState({ recapFermeture: MOCK_RECAP });

      await useFermetureCaisseStore.getState().calculerSoldeFinal();

      const state = useFermetureCaisseStore.getState();
      const expectedSolde = 1245.50 + 3420.80 - 800;
      expect(state.recapFermeture?.soldeFinal).toBe(expectedSolde);
    });

    it('should skip calculation if no recap loaded', async () => {
      useFermetureCaisseStore.setState({ recapFermeture: null });

      await useFermetureCaisseStore.getState().calculerSoldeFinal();

      expect(useFermetureCaisseStore.getState().recapFermeture).toBeNull();
    });
  });

  describe('afficherDetailDevises', () => {
    it('should set currentView to validation', async () => {
      await useFermetureCaisseStore.getState().afficherDetailDevises();

      expect(useFermetureCaisseStore.getState().currentView).toBe('validation');
    });
  });

  describe('setCurrentView', () => {
    it('should update currentView', () => {
      useFermetureCaisseStore.getState().setCurrentView('ecart');

      expect(useFermetureCaisseStore.getState().currentView).toBe('ecart');
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useFermetureCaisseStore.setState({
        recapFermeture: MOCK_RECAP,
        fermetureValidee: true,
        ecartsDetectes: true,
        currentView: 'coffre',
      });

      useFermetureCaisseStore.getState().reset();

      const state = useFermetureCaisseStore.getState();
      expect(state.recapFermeture).toBeNull();
      expect(state.fermetureValidee).toBe(false);
      expect(state.ecartsDetectes).toBe(false);
      expect(state.currentView).toBe('recap');
    });
  });
});