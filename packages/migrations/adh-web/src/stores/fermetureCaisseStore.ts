import { create } from 'zustand';
import type {
  FermetureCaisseView,
  PointageDevise,
  PointageArticle,
  PointageApproRemise,
  MoyenPaiement,
  RecapFermeture,
  SaisirMontantsRequest,
  JustifierEcartRequest,
  ApportCoffreRequest,
  ApportArticlesRequest,
  RemiseCaisseRequest,
  ValiderFermetureRequest,
  ValiderFermetureResponse,
  GenererTicketsResponse,
} from '@/types/fermetureCaisse';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface FermetureCaisseState {
  recapFermeture: RecapFermeture | null;
  pointagesDevise: PointageDevise[];
  pointagesArticle: PointageArticle[];
  pointagesApproRemise: PointageApproRemise[];
  ecartsDetectes: boolean;
  ecartsJustifies: boolean;
  tousPointes: boolean;
  fermetureValidee: boolean;
  isLoading: boolean;
  error: string | null;
  currentView: FermetureCaisseView;
}

interface FermetureCaisseActions {
  chargerRecapFermeture: (societe: string, numeroSession: number) => Promise<void>;
  saisirMontantsComptes: (moyenPaiement: string) => Promise<void>;
  calculerEcarts: () => Promise<void>;
  justifierEcart: (moyenPaiement: string, commentaire: string) => Promise<void>;
  effectuerApportCoffre: (montant: number) => Promise<void>;
  effectuerApportArticles: (codeArticle: string, quantite: number) => Promise<void>;
  effectuerRemiseCaisse: (montant: number) => Promise<void>;
  validerFermeture: (societe: string, numeroSession: number) => Promise<void>;
  genererTickets: (societe: string, numeroSession: number) => Promise<void>;
  mettreAJourHistorique: (societe: string, numeroSession: number) => Promise<void>;
  calculerSoldeFinal: () => Promise<void>;
  afficherDetailDevises: () => Promise<void>;
  setCurrentView: (view: FermetureCaisseView) => void;
  reset: () => void;
}

type FermetureCaisseStore = FermetureCaisseState & FermetureCaisseActions;

const MOCK_MOYENS_PAIEMENT: MoyenPaiement[] = [
  { code: 'CASH', libelle: 'Cash', soldeOuverture: 500, montantCompte: 1245.50, montantCalcule: 1245.50, ecart: 0 },
  { code: 'CB', libelle: 'Cartes', soldeOuverture: 0, montantCompte: 3420.80, montantCalcule: 3420.80, ecart: 0 },
  { code: 'CHQ', libelle: 'Chèques', soldeOuverture: 0, montantCompte: 150, montantCalcule: 150, ecart: 0 },
  { code: 'PRD', libelle: 'Produits', soldeOuverture: 200, montantCompte: 95.20, montantCalcule: 95.20, ecart: 0 },
  { code: 'OD', libelle: 'OD', soldeOuverture: 0, montantCompte: 0, montantCalcule: 0, ecart: 0 },
  { code: 'DEV', libelle: 'Devises', soldeOuverture: 100, montantCompte: 312.45, montantCalcule: 312.45, ecart: 0 },
];

const MOCK_RECAP: RecapFermeture = {
  societe: 'SOC1',
  numeroSession: 1001,
  moyensPaiement: MOCK_MOYENS_PAIEMENT,
  totalVersementCoffre: 800,
  soldeFinal: 4623.95,
};

const MOCK_POINTAGES_DEVISE: PointageDevise[] = [
  { societe: 'SOC1', numeroSession: 1001, codeDevise: 'EUR', montantOuverture: 500, montantCompte: 1245.50, montantCalcule: 1245.50, ecart: 0, commentaireEcart: null },
  { societe: 'SOC1', numeroSession: 1001, codeDevise: 'USD', montantOuverture: 100, montantCompte: 312.45, montantCalcule: 312.45, ecart: 0, commentaireEcart: null },
];

const MOCK_POINTAGES_ARTICLE: PointageArticle[] = [
  { societe: 'SOC1', numeroSession: 1001, codeArticle: 'SKI001', quantiteOuverture: 10, quantiteComptee: 8, quantiteCalculee: 8, ecart: 0 },
  { societe: 'SOC1', numeroSession: 1001, codeArticle: 'FORFAIT', quantiteOuverture: 50, quantiteComptee: 32, quantiteCalculee: 32, ecart: 0 },
];

const MOCK_POINTAGES_APPRO_REMISE: PointageApproRemise[] = [
  { societe: 'SOC1', numeroSession: 1001, type: 'APPORT', montant: 500, ticketEdite: true },
  { societe: 'SOC1', numeroSession: 1001, type: 'REMISE', montant: 300, ticketEdite: true },
];

const initialState: FermetureCaisseState = {
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
};

export const useFermetureCaisseStore = create<FermetureCaisseStore>()((set, get) => ({
  ...initialState,

  chargerRecapFermeture: async (societe, numeroSession) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        recapFermeture: MOCK_RECAP,
        pointagesDevise: MOCK_POINTAGES_DEVISE,
        pointagesArticle: MOCK_POINTAGES_ARTICLE,
        pointagesApproRemise: MOCK_POINTAGES_APPRO_REMISE,
        isLoading: false,
      });
      return;
    }

    try {
      const [recapRes, deviseRes, articleRes, approRemiseRes] = await Promise.all([
        apiClient.get<ApiResponse<RecapFermeture>>(`/api/fermeture-caisse/recap/${societe}/${numeroSession}`),
        apiClient.get<ApiResponse<PointageDevise[]>>(`/api/fermeture-caisse/pointages-devise/${societe}/${numeroSession}`),
        apiClient.get<ApiResponse<PointageArticle[]>>(`/api/fermeture-caisse/pointages-article/${societe}/${numeroSession}`),
        apiClient.get<ApiResponse<PointageApproRemise[]>>(`/api/fermeture-caisse/pointages-appro-remise/${societe}/${numeroSession}`),
      ]);

      set({
        recapFermeture: recapRes.data.data ?? null,
        pointagesDevise: deviseRes.data.data ?? [],
        pointagesArticle: articleRes.data.data ?? [],
        pointagesApproRemise: approRemiseRes.data.data ?? [],
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement recap fermeture';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  saisirMontantsComptes: async (moyenPaiement) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { recapFermeture } = get();

    if (!recapFermeture) {
      set({ error: 'Aucune session chargée' });
      return;
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      const body: SaisirMontantsRequest = {
        societe: recapFermeture.societe,
        numeroSession: recapFermeture.numeroSession,
        moyenPaiement,
      };
      await apiClient.post('/api/fermeture-caisse/saisir-montants', body);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur saisie montants';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  calculerEcarts: async () => {
    const { recapFermeture } = get();
    if (!recapFermeture) return;

    const moyensAvecEcart = recapFermeture.moyensPaiement.map((m) => ({
      ...m,
      ecart: m.montantCompte - m.montantCalcule,
    }));

    const ecartsExistent = moyensAvecEcart.some((m) => m.ecart !== 0);

    set({
      recapFermeture: {
        ...recapFermeture,
        moyensPaiement: moyensAvecEcart,
      },
      ecartsDetectes: ecartsExistent,
    });
  },

  justifierEcart: async (moyenPaiement, commentaire) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { recapFermeture, pointagesDevise } = get();

    if (!recapFermeture) {
      set({ error: 'Aucune session chargée' });
      return;
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const updatedPointages = pointagesDevise.map((p) =>
        p.codeDevise === moyenPaiement ? { ...p, commentaireEcart: commentaire } : p,
      );
      const allJustified = updatedPointages.every((p) => p.ecart === 0 || p.commentaireEcart !== null);

      set({
        pointagesDevise: updatedPointages,
        ecartsJustifies: allJustified,
        isLoading: false,
      });
      return;
    }

    try {
      const body: JustifierEcartRequest = {
        societe: recapFermeture.societe,
        numeroSession: recapFermeture.numeroSession,
        moyenPaiement,
        commentaire,
      };
      await apiClient.post('/api/fermeture-caisse/justifier-ecart', body);

      const updatedPointages = pointagesDevise.map((p) =>
        p.codeDevise === moyenPaiement ? { ...p, commentaireEcart: commentaire } : p,
      );
      const allJustified = updatedPointages.every((p) => p.ecart === 0 || p.commentaireEcart !== null);

      set({
        pointagesDevise: updatedPointages,
        ecartsJustifies: allJustified,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur justification ecart';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  effectuerApportCoffre: async (montant) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { recapFermeture } = get();

    if (!recapFermeture) {
      set({ error: 'Aucune session chargée' });
      return;
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const nouveauTotal = recapFermeture.totalVersementCoffre + montant;
      set({
        recapFermeture: {
          ...recapFermeture,
          totalVersementCoffre: nouveauTotal,
        },
        isLoading: false,
      });
      get().calculerSoldeFinal();
      return;
    }

    try {
      const body: ApportCoffreRequest = {
        societe: recapFermeture.societe,
        numeroSession: recapFermeture.numeroSession,
        montant,
      };
      await apiClient.post('/api/fermeture-caisse/apport-coffre', body);
      get().calculerSoldeFinal();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur apport coffre';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  effectuerApportArticles: async (codeArticle, quantite) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { recapFermeture, pointagesArticle } = get();

    if (!recapFermeture) {
      set({ error: 'Aucune session chargée' });
      return;
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const updatedArticles = pointagesArticle.map((a) =>
        a.codeArticle === codeArticle
          ? { ...a, quantiteComptee: a.quantiteComptee + quantite, ecart: (a.quantiteComptee + quantite) - a.quantiteCalculee }
          : a,
      );
      set({ pointagesArticle: updatedArticles, isLoading: false });
      return;
    }

    try {
      const body: ApportArticlesRequest = {
        societe: recapFermeture.societe,
        numeroSession: recapFermeture.numeroSession,
        codeArticle,
        quantite,
      };
      await apiClient.post('/api/fermeture-caisse/apport-articles', body);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur apport articles';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  effectuerRemiseCaisse: async (montant) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { recapFermeture } = get();

    if (!recapFermeture) {
      set({ error: 'Aucune session chargée' });
      return;
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const nouveauTotal = recapFermeture.totalVersementCoffre - montant;
      set({
        recapFermeture: {
          ...recapFermeture,
          totalVersementCoffre: nouveauTotal,
        },
        isLoading: false,
      });
      get().calculerSoldeFinal();
      return;
    }

    try {
      const body: RemiseCaisseRequest = {
        societe: recapFermeture.societe,
        numeroSession: recapFermeture.numeroSession,
        montant,
      };
      await apiClient.post('/api/fermeture-caisse/remise-caisse', body);
      get().calculerSoldeFinal();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur remise caisse';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  validerFermeture: async (societe, numeroSession) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { tousPointes, ecartsDetectes, ecartsJustifies } = get();

    set({ isLoading: true, error: null });

    if (!tousPointes) {
      set({ error: 'Tous les moyens de paiement doivent être pointés', isLoading: false });
      return;
    }

    if (ecartsDetectes && !ecartsJustifies) {
      set({ error: 'Tous les écarts doivent être justifiés', isLoading: false });
      return;
    }

    if (!isRealApi) {
      set({ fermetureValidee: true, isLoading: false });
      return;
    }

    try {
      const body: ValiderFermetureRequest = { societe, numeroSession };
      const response = await apiClient.post<ApiResponse<ValiderFermetureResponse>>('/api/fermeture-caisse/valider', body);

      if (response.data.data?.success) {
        set({ fermetureValidee: true });
      } else {
        set({ error: response.data.data?.errors?.join(', ') ?? 'Validation échouée' });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation fermeture';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  genererTickets: async (societe, numeroSession) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { fermetureValidee } = get();

    if (!fermetureValidee) {
      set({ error: 'La fermeture doit être validée avant de générer les tickets' });
      return;
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      await apiClient.post<ApiResponse<GenererTicketsResponse>>('/api/fermeture-caisse/generer-tickets', { societe, numeroSession });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur génération tickets';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  mettreAJourHistorique: async (societe, numeroSession) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { fermetureValidee } = get();

    if (!fermetureValidee) {
      set({ error: 'La fermeture doit être validée avant de mettre à jour l\'historique' });
      return;
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      await apiClient.put('/api/fermeture-caisse/historique', { societe, numeroSession });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur mise à jour historique';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  calculerSoldeFinal: async () => {
    const { recapFermeture } = get();
    if (!recapFermeture) return;

    const totalMontantsComptes = recapFermeture.moyensPaiement.reduce((sum, m) => sum + m.montantCompte, 0);
    const soldeFinal = totalMontantsComptes - recapFermeture.totalVersementCoffre;

    set({
      recapFermeture: {
        ...recapFermeture,
        soldeFinal,
      },
    });
  },

  afficherDetailDevises: async () => {
    set({ currentView: 'validation' });
  },

  setCurrentView: (view) => {
    set({ currentView: view });
  },

  reset: () => set({ ...initialState }),
}));