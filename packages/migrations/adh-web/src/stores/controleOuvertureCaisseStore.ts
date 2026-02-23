import { create } from 'zustand';
import type {
  CaisseControl,
  CaisseCalculee,
  ValidationError,
  ModeUniCheck,
} from '@/types/controleOuvertureCaisse';
import { useDataSourceStore } from './dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';

interface ControleOuvertureCaisseState {
  isValidating: boolean;
  validationResult: CaisseCalculee | null;
  validationError: ValidationError | null;
}

interface ControleOuvertureCaisseActions {
  validateOuvertureCaisse: (params: CaisseControl) => Promise<CaisseCalculee>;
  checkModeUniBi: (mode: string) => Promise<ModeUniCheck>;
  clearValidation: () => void;
  reset: () => void;
}

type ControleOuvertureCaisseStore = ControleOuvertureCaisseState & ControleOuvertureCaisseActions;

const MOCK_VALIDATION_SUCCESS_UNI: CaisseCalculee = {
  caisseCalculee: 1500,
  caisseCalculeeMonnaie: 800,
  caisseCalculeeProduits: 500,
  caisseCalculeeCartes: 150,
  caisseCalculeeCheque: 50,
  caisseCalculeeOd: 0,
  caisseCalculeeNbDevise: 10,
};

const MOCK_VALIDATION_SUCCESS_BI: CaisseCalculee = {
  caisseCalculee: 2200,
  caisseCalculeeMonnaie: 1200,
  caisseCalculeeProduits: 700,
  caisseCalculeeCartes: 250,
  caisseCalculeeCheque: 50,
  caisseCalculeeOd: 0,
  caisseCalculeeNbDevise: 15,
};

const MOCK_VALIDATION_ERROR: ValidationError = {
  code: 'ERR_SESSION_ALREADY_OPEN',
  message: 'Une session est déjà ouverte pour ce numéro de chrono',
  field: 'chronoSession',
};

const _calculateCaisseTotals = (params: CaisseControl): CaisseCalculee => {
  const caisseCalculee = params.soldeInitial + params.approCoffre + params.approArticles;
  const caisseCalculeeMonnaie = params.soldeInitialMonnaie + params.approCoffre;
  const caisseCalculeeProduits = params.soldeInitialProduits + params.approArticles;
  const caisseCalculeeNbDevise = params.soldeInitialNbreDevise + params.approNbreDevises;

  return {
    caisseCalculee,
    caisseCalculeeMonnaie,
    caisseCalculeeProduits,
    caisseCalculeeCartes: params.soldeInitialCartes,
    caisseCalculeeCheque: params.soldeInitialCheques,
    caisseCalculeeOd: params.soldeInitialOd,
    caisseCalculeeNbDevise,
  };
};

const initialState: ControleOuvertureCaisseState = {
  isValidating: false,
  validationResult: null,
  validationError: null,
};

export const useControleOuvertureCaisseStore = create<ControleOuvertureCaisseStore>()((set) => ({
  ...initialState,

  validateOuvertureCaisse: async (params) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isValidating: true, validationError: null, validationResult: null });

    if (!isRealApi) {
      const isBiMode = params.modeUniBi === 'B';
      
      if (params.chronoSession === 999) {
        set({
          validationError: MOCK_VALIDATION_ERROR,
          isValidating: false,
        });
        throw new Error(MOCK_VALIDATION_ERROR.message);
      }

      const mockResult = isBiMode ? MOCK_VALIDATION_SUCCESS_BI : MOCK_VALIDATION_SUCCESS_UNI;
      set({
        validationResult: mockResult,
        isValidating: false,
      });
      return mockResult;
    }

    try {
      const response = await apiClient.post<ApiResponse<CaisseCalculee>>(
        '/api/caisse/controle-ouverture',
        { params },
      );

      const result = response.data.data;
      if (!result) {
        throw new Error('Aucune donnée retournée par le serveur');
      }

      set({ validationResult: result });
      return result;
    } catch (e: unknown) {
      const errorData: ValidationError = {
        code: 'ERR_CALCULATION_ERROR',
        message: e instanceof Error ? e.message : 'Erreur lors du contrôle d\'ouverture',
        field: null,
      };
      set({ validationError: errorData });
      throw e;
    } finally {
      set({ isValidating: false });
    }
  },

  checkModeUniBi: async (mode) => {
    const { isRealApi } = useDataSourceStore.getState();

    const isUni = mode !== 'B';
    const isBi = mode === 'B';

    if (!isRealApi) {
      return { isUni, isBi };
    }

    return { isUni, isBi };
  },

  clearValidation: () => {
    set({ validationResult: null, validationError: null });
  },

  reset: () => set({ ...initialState }),
}));