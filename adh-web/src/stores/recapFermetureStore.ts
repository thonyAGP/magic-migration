import { create } from 'zustand';
import type {
  RecapFermeture,
  LigneRecap,
  RemiseEnCaisse,
  ArticleSession,
  LoadRecapFermetureResponse,
  CalculerEquivalentRequest,
  CalculerEquivalentResponse,
  SaveRemiseRequest,
  SaveDiscountRequest,
  SetModeReimpressionRequest,
  CheckPrinterRequest,
  GenererTableauRequest,
} from '@/types/recapFermeture';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';

interface RecapFermetureState {
  recap: RecapFermeture | null;
  lignesRecap: LigneRecap[];
  remises: RemiseEnCaisse[];
  articles: ArticleSession[];
  isLoading: boolean;
  error: string | null;
  isPrinting: boolean;
  modeReimpression: 'D' | 'G' | null;
  printerCourant: number | null;
  finTache: boolean;
}

interface RecapFermetureActions {
  loadRecapFermeture: (societe: string, session: number) => Promise<void>;
  genererTableau: (societe: string, session: number) => Promise<void>;
  calculerEquivalent: (
    montant: number,
    deviseSource: string,
    deviseCible: string,
  ) => Promise<number>;
  saveRemise: (remise: RemiseEnCaisse) => Promise<void>;
  saveDiscount: (discount: SaveDiscountRequest) => Promise<void>;
  setModeReimpression: (mode: 'D' | 'G' | null) => Promise<void>;
  checkPrinter: (printerNum: number) => Promise<boolean>;
  exportRecap: (format: 'PDF' | 'EXCEL') => Promise<Blob>;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setIsPrinting: (isPrinting: boolean) => void;
  setPrinterCourant: (printerNum: number | null) => void;
  setFinTache: (finTache: boolean) => void;
  reset: () => void;
}

type RecapFermetureStore = RecapFermetureState & RecapFermetureActions;

const MOCK_RECAP: RecapFermeture = {
  societe: 'SOC1',
  session: 42,
  deviseLocale: 'EUR',
  dateDebut: new Date('2026-02-10T08:00:00'),
  heureDebut: '08:00',
  nbreDeviseOuverture: 3,
  nbreDeviseFermeture: 3,
  nbreDevisesCalcule: 3,
  nbreDevisesCompte: 3,
};

const MOCK_LIGNES: LigneRecap[] = [
  {
    typeOperation: 'Ventes boutique',
    montantDevise: 1245.50,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: 1245.50,
    ecart: null,
  },
  {
    typeOperation: 'Change USD',
    montantDevise: 850.00,
    codeDevise: 'USD',
    tauxChange: 0.92,
    montantEquivalent: 782.00,
    ecart: 2.50,
  },
  {
    typeOperation: 'Change GBP',
    montantDevise: 320.00,
    codeDevise: 'GBP',
    tauxChange: 1.18,
    montantEquivalent: 377.60,
    ecart: null,
  },
  {
    typeOperation: 'Remises espèces',
    montantDevise: -450.00,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: -450.00,
    ecart: null,
  },
  {
    typeOperation: 'Cartes bancaires',
    montantDevise: 2340.00,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: 2340.00,
    ecart: null,
  },
  {
    typeOperation: 'GiftPass utilisés',
    montantDevise: 680.00,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: 680.00,
    ecart: null,
  },
  {
    typeOperation: 'Resort Credit',
    montantDevise: 1520.00,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: 1520.00,
    ecart: null,
  },
  {
    typeOperation: 'Dépôts garantie',
    montantDevise: 350.00,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: 350.00,
    ecart: null,
  },
  {
    typeOperation: 'Annulations ventes',
    montantDevise: -125.00,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: -125.00,
    ecart: null,
  },
  {
    typeOperation: 'Régularisations',
    montantDevise: 45.00,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: 45.00,
    ecart: -1.20,
  },
];

const MOCK_REMISES: RemiseEnCaisse[] = [
  {
    detailProduitRemiseEdite: true,
    montantRemiseMonnaie: 450.00,
    detailRemiseFinaleEdite: true,
  },
  {
    detailProduitRemiseEdite: false,
    montantRemiseMonnaie: 0,
    detailRemiseFinaleEdite: false,
  },
  {
    detailProduitRemiseEdite: true,
    montantRemiseMonnaie: 120.00,
    detailRemiseFinaleEdite: false,
  },
];

const MOCK_ARTICLES: ArticleSession[] = [
  {
    chronoHisto: 1,
    totalArticles: 142,
    codeArticle: 'ART-001',
    libelleArticle: 'Boissons soft',
  },
  {
    chronoHisto: 2,
    totalArticles: 87,
    codeArticle: 'ART-002',
    libelleArticle: 'Snacks salés',
  },
  {
    chronoHisto: 3,
    totalArticles: 65,
    codeArticle: 'ART-003',
    libelleArticle: 'Cartes postales',
  },
  {
    chronoHisto: 4,
    totalArticles: 54,
    codeArticle: 'ART-004',
    libelleArticle: 'Souvenirs textiles',
  },
  {
    chronoHisto: 5,
    totalArticles: 48,
    codeArticle: 'ART-005',
    libelleArticle: 'Produits solaires',
  },
  {
    chronoHisto: 6,
    totalArticles: 39,
    codeArticle: 'ART-006',
    libelleArticle: 'Accessoires plage',
  },
  {
    chronoHisto: 7,
    totalArticles: 32,
    codeArticle: 'ART-007',
    libelleArticle: 'Magazines presse',
  },
  {
    chronoHisto: 8,
    totalArticles: 28,
    codeArticle: 'ART-008',
    libelleArticle: 'Confiseries sucrées',
  },
];

const initialState: RecapFermetureState = {
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
};

export const useRecapFermetureStore = create<RecapFermetureStore>()((set, get) => ({
  ...initialState,

  loadRecapFermeture: async (societe, session) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        recap: MOCK_RECAP,
        lignesRecap: MOCK_LIGNES,
        remises: MOCK_REMISES,
        articles: MOCK_ARTICLES,
        finTache: true,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<LoadRecapFermetureResponse>>(
        `/api/recap-fermeture/${societe}/${session}`,
      );
      const data = response.data.data;
      set({
        recap: data?.recap ?? null,
        lignesRecap: data?.lignesRecap ?? [],
        remises: data?.remises ?? [],
        articles: data?.articles ?? [],
        finTache: data?.recap ? true : false,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement récap fermeture';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  genererTableau: async (societe, session) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { printerCourant } = get();

    if (printerCourant !== 1 && printerCourant !== 9) {
      set({ error: 'Imprimante courante doit être n°1 ou n°9' });
      return;
    }

    set({ isPrinting: true, error: null });

    if (!isRealApi) {
      set({ isPrinting: false });
      return;
    }

    try {
      const payload: GenererTableauRequest = { societe, session };
      await apiClient.post<ApiResponse<{ success: boolean; documentUrl?: string }>>(
        '/api/recap-fermeture/generer',
        payload,
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur génération tableau';
      set({ error: message });
    } finally {
      set({ isPrinting: false });
    }
  },

  calculerEquivalent: async (montant, deviseSource, deviseCible) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const mockTaux = deviseSource === 'USD' ? 0.92 : deviseSource === 'GBP' ? 1.18 : 1.0;
      return montant * mockTaux;
    }

    try {
      const payload: CalculerEquivalentRequest = { montant, deviseSource, deviseCible };
      const response = await apiClient.post<ApiResponse<CalculerEquivalentResponse>>(
        '/api/recap-fermeture/calculer-equivalent',
        payload,
      );
      return response.data.data?.montantEquivalent ?? 0;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur calcul équivalent';
      set({ error: message });
      return 0;
    }
  },

  saveRemise: async (remise) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const currentRemises = get().remises;
      set({ remises: [...currentRemises, remise], isLoading: false });
      return;
    }

    try {
      const payload: SaveRemiseRequest = remise;
      await apiClient.post<ApiResponse<{ success: boolean }>>(
        '/api/recap-fermeture/remise',
        payload,
      );
      const currentRemises = get().remises;
      set({ remises: [...currentRemises, remise] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur enregistrement remise';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  saveDiscount: async (discount) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      const payload: SaveDiscountRequest = discount;
      await apiClient.post<ApiResponse<{ success: boolean }>>(
        '/api/recap-fermeture/discount',
        payload,
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur enregistrement discount';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setModeReimpression: async (mode) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (mode !== null && mode !== 'D' && mode !== 'G') {
      set({ error: 'Mode réimpression invalide (D ou G requis)' });
      return;
    }

    set({ modeReimpression: mode, error: null });

    if (!isRealApi) {
      return;
    }

    try {
      const payload: SetModeReimpressionRequest = { mode };
      await apiClient.post<ApiResponse<{ success: boolean }>>(
        '/api/recap-fermeture/mode-reimpression',
        payload,
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur mode réimpression';
      set({ error: message });
    }
  },

  checkPrinter: async (printerNum) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const available = printerNum === 1 || printerNum === 9;
      if (available) {
        set({ printerCourant: printerNum });
      }
      return available;
    }

    try {
      const payload: CheckPrinterRequest = { printerNum };
      const response = await apiClient.post<ApiResponse<{ available: boolean }>>(
        '/api/recap-fermeture/check-printer',
        payload,
      );
      const available = response.data.data?.available ?? false;
      if (available) {
        set({ printerCourant: printerNum });
      }
      return available;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur vérification imprimante';
      set({ error: message });
      return false;
    }
  },

  exportRecap: async (format) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { recap } = get();

    if (!recap) {
      set({ error: 'Aucune récap à exporter' });
      throw new Error('Aucune récap à exporter');
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const mockBlob = new Blob(['MOCK RECAP EXPORT'], { type: 'application/pdf' });
      set({ isLoading: false });
      return mockBlob;
    }

    try {
      const response = await apiClient.get<Blob>(
        `/api/recap-fermeture/${recap.societe}/${recap.session}/export?format=${format}`,
        { responseType: 'blob' },
      );
      return response.data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur export récap';
      set({ error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setIsPrinting: (isPrinting) => set({ isPrinting }),
  setPrinterCourant: (printerNum) => set({ printerCourant: printerNum }),
  setFinTache: (finTache) => set({ finTache }),

  reset: () => set({ ...initialState }),
}));