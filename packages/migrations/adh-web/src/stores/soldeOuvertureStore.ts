import { create } from 'zustand';
import type {
  SoldeOuverture,
  MoyenReglement,
  GestionDeviseSession,
  SoldeCalculationResult,
  CoherenceValidationResult,
  CalculerSoldeOuvertureRequest,
  ValiderCoherenceSoldeRequest,
  UpdateDeviseSessionRequest,
} from '@/types/soldeOuverture';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface SoldeOuvertureState {
  soldeOuverture: SoldeOuverture | null;
  moyensReglement: MoyenReglement[];
  devisesSessions: GestionDeviseSession[];
  isLoading: boolean;
  error: string | null;
  isCalculating: boolean;
  calculationResult: SoldeCalculationResult | null;
}

interface SoldeOuvertureActions {
  loadSoldeOuverture: (societe: string, sessionId: number) => Promise<void>;
  calculerSoldeOuverture: (
    societe: string,
    sessionId: number,
  ) => Promise<SoldeCalculationResult>;
  updateDeviseSession: (sessionId: number) => Promise<void>;
  validerCoherenceSolde: (
    soldeEnregistre: number,
    soldeCalcule: number,
  ) => Promise<CoherenceValidationResult>;
  setSoldeOuverture: (solde: SoldeOuverture | null) => void;
  setMoyensReglement: (moyens: MoyenReglement[]) => void;
  setDevisesSessions: (devises: GestionDeviseSession[]) => void;
  setCalculationResult: (result: SoldeCalculationResult | null) => void;
  clearError: () => void;
  reset: () => void;
}

type SoldeOuvertureStore = SoldeOuvertureState & SoldeOuvertureActions;

const MOCK_MOYENS_REGLEMENT: MoyenReglement[] = [
  { id: 1, code: 'ESP', libelle: 'Espèces' },
  { id: 2, code: 'CB', libelle: 'Carte bancaire' },
  { id: 3, code: 'CHQ', libelle: 'Chèque' },
  { id: 4, code: 'GP', libelle: 'Gift Pass' },
  { id: 5, code: 'OD', libelle: 'Ordre de dépôt' },
];

const MOCK_DEVISES_SESSIONS: GestionDeviseSession[] = [
  { id: 1, sessionId: 1001, deviseCode: 'EUR', tauxChange: 1.0, montant: 500.0 },
  { id: 2, sessionId: 1001, deviseCode: 'USD', tauxChange: 1.08, montant: 324.0 },
  { id: 3, sessionId: 1001, deviseCode: 'GBP', tauxChange: 0.85, montant: 170.0 },
  { id: 4, sessionId: 1001, deviseCode: 'CHF', tauxChange: 0.95, montant: 95.0 },
  { id: 5, sessionId: 1001, deviseCode: 'JPY', tauxChange: 157.0, montant: 15700.0 },
];

const MOCK_SOLDE_OUVERTURE: SoldeOuverture = {
  societe: 'SOC1',
  deviseLocale: 'EUR',
  soldeOuverture: 1200.0,
  soldeOuvertureMonnaie: 500.0,
  soldeOuvertureProduits: 350.0,
  soldeOuvertureCartes: 200.0,
  soldeOuvertureCheques: 100.0,
  soldeOuvertureOd: 50.0,
  nbreDevise: 5,
  uniBi: 'BI',
};

const MOCK_CALCULATION_RESULT: SoldeCalculationResult = {
  totalEur: 1200.0,
  details: [
    { devise: 'EUR', montant: 500.0, tauxChange: 1.0, montantEur: 500.0 },
    { devise: 'USD', montant: 324.0, tauxChange: 1.08, montantEur: 300.0 },
    { devise: 'GBP', montant: 170.0, tauxChange: 0.85, montantEur: 200.0 },
    { devise: 'CHF', montant: 95.0, tauxChange: 0.95, montantEur: 100.0 },
    { devise: 'JPY', montant: 15700.0, tauxChange: 157.0, montantEur: 100.0 },
  ],
};

const initialState: SoldeOuvertureState = {
  soldeOuverture: null,
  moyensReglement: [],
  devisesSessions: [],
  isLoading: false,
  error: null,
  isCalculating: false,
  calculationResult: null,
};

export const useSoldeOuvertureStore = create<SoldeOuvertureStore>()((set) => ({
  ...initialState,

  loadSoldeOuverture: async (societe, sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        soldeOuverture: MOCK_SOLDE_OUVERTURE,
        moyensReglement: MOCK_MOYENS_REGLEMENT,
        devisesSessions: MOCK_DEVISES_SESSIONS,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<SoldeOuverture>>(
        `/api/solde-ouverture/${societe}/${sessionId}`,
      );
      const data = response.data.data;
      set({
        soldeOuverture: data ?? null,
        moyensReglement: MOCK_MOYENS_REGLEMENT,
        devisesSessions: MOCK_DEVISES_SESSIONS,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement solde ouverture';
      set({ soldeOuverture: null, error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  calculerSoldeOuverture: async (societe, sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isCalculating: true, error: null });

    if (!isRealApi) {
      set({
        calculationResult: MOCK_CALCULATION_RESULT,
        isCalculating: false,
      });
      return MOCK_CALCULATION_RESULT;
    }

    try {
      const request: CalculerSoldeOuvertureRequest = { societe, sessionId };
      const response = await apiClient.post<ApiResponse<SoldeCalculationResult>>(
        '/api/solde-ouverture/calculer',
        request,
      );
      const data = response.data.data;
      if (!data) {
        throw new Error('Aucune donnée retournée');
      }
      set({ calculationResult: data });
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur calcul solde ouverture';
      set({ calculationResult: null, error: message });
      throw e;
    } finally {
      set({ isCalculating: false });
    }
  },

  updateDeviseSession: async (sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      const request: UpdateDeviseSessionRequest = { sessionId };
      await apiClient.post<ApiResponse<void>>(
        '/api/solde-ouverture/update-devise-session',
        request,
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur mise à jour devises session';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  validerCoherenceSolde: async (soldeEnregistre, soldeCalcule) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const ecart = Math.abs(soldeEnregistre - soldeCalcule);
      const mockResult: CoherenceValidationResult = {
        coherent: ecart < 0.01,
        ecart: ecart > 0 ? ecart : null,
      };
      set({ isLoading: false });
      return mockResult;
    }

    try {
      const request: ValiderCoherenceSoldeRequest = { soldeEnregistre, soldeCalcule };
      const response = await apiClient.post<ApiResponse<CoherenceValidationResult>>(
        '/api/solde-ouverture/valider-coherence',
        request,
      );
      const data = response.data.data;
      if (!data) {
        throw new Error('Aucune donnée retournée');
      }
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation cohérence';
      set({ error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  setSoldeOuverture: (solde) => set({ soldeOuverture: solde }),
  setMoyensReglement: (moyens) => set({ moyensReglement: moyens }),
  setDevisesSessions: (devises) => set({ devisesSessions: devises }),
  setCalculationResult: (result) => set({ calculationResult: result }),
  clearError: () => set({ error: null }),
  reset: () => set({ ...initialState }),
}));