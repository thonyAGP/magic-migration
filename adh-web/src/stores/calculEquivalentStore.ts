import { create } from 'zustand';
import type {
  ConversionParams,
  ConversionResult,
  ConversionError,
  ValidationResult,
  TauxChange,
  GetTauxChangeRequest,
  CalculEquivalentState,
} from '@/types/calculEquivalent';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';

const MOCK_TAUX_CHANGES: Record<string, TauxChange> = {
  USD: {
    societe: '1',
    devise: 'USD',
    tauxAchat: 0.925,
    tauxVente: 1.08,
    typeDevise: 1,
    dateValidite: '2026-02-22',
    nbDecimales: 2,
  },
  EUR: {
    societe: '1',
    devise: 'EUR',
    tauxAchat: 1,
    tauxVente: 1,
    typeDevise: 0,
    dateValidite: '2026-02-22',
    nbDecimales: 2,
  },
  GBP: {
    societe: '1',
    devise: 'GBP',
    tauxAchat: 1.175,
    tauxVente: 1.29,
    typeDevise: 1,
    dateValidite: '2026-02-22',
    nbDecimales: 2,
  },
  JPY: {
    societe: '1',
    devise: 'JPY',
    tauxAchat: 145.2,
    tauxVente: 145.8,
    typeDevise: 2,
    dateValidite: '2026-02-22',
    nbDecimales: 0,
  },
};

const MOCK_MOYENS_REGLEMENT: Record<string, boolean> = {
  ESP: true,
  CB: false,
  CHQ: false,
  VIR: false,
};

const initialState = {
  isCalculating: false,
  isValidating: false,
  error: null,
  validationErrors: [],
  lastConversion: null,
  conversionHistory: [],
  maxHistorySize: 20,
};

export const useCalculEquivalentStore = create<CalculEquivalentState>()((set, get) => ({
  ...initialState,

  validateConversionParams: async (params: ConversionParams): Promise<ValidationResult> => {
    set({ isValidating: true, validationErrors: [] });

    const errors: ConversionError[] = [];

    if (!params.societe || params.societe.trim() === '') {
      errors.push({ field: 'societe', message: 'La société est requise' });
    }

    if (!params.devise || params.devise.trim() === '') {
      errors.push({ field: 'devise', message: 'La devise est requise' });
    }

    if (!params.deviseLocale || params.deviseLocale.trim() === '') {
      errors.push({ field: 'deviseLocale', message: 'La devise locale est requise' });
    }

    if (params.quantite <= 0) {
      errors.push({ field: 'quantite', message: 'La quantité doit être supérieure à 0' });
    }

    if (!['A', 'V'].includes(params.typeOperation)) {
      errors.push({
        field: 'typeOperation',
        message: "Le type d'opération doit être 'A' (Achat) ou 'V' (Vente)",
      });
    }

    if (!['U', 'B'].includes(params.uniBi)) {
      errors.push({
        field: 'uniBi',
        message: "Le type directionnel doit être 'U' (Unidirectionnel) ou 'B' (Bilateral)",
      });
    }

    if (!params.modePaiement || params.modePaiement.trim() === '') {
      errors.push({ field: 'modePaiement', message: 'Le mode de paiement est requis' });
    }

    set({ validationErrors: errors, isValidating: false });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  getTauxChange: async (request: GetTauxChangeRequest): Promise<TauxChange> => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const mockTaux = MOCK_TAUX_CHANGES[request.devise];
      if (!mockTaux) {
        throw new Error(`Taux de change non trouvé pour la devise ${request.devise}`);
      }
      return mockTaux;
    }

    try {
      const response = await apiClient.get<TauxChange>('/api/change/taux', {
        params: {
          societe: request.societe,
          devise: request.devise,
          typeOperation: request.typeOperation,
          uniBi: request.uniBi,
        },
      });

      if (!response.data.data) {
        throw new Error('Aucun taux de change retourné par l\'API');
      }

      return response.data.data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur récupération taux de change';
      throw new Error(message);
    }
  },

  calculerEquivalent: async (params: ConversionParams): Promise<ConversionResult> => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isCalculating: true, error: null });

    const validation = await get().validateConversionParams(params);
    if (!validation.isValid) {
      set({ isCalculating: false, error: 'Paramètres invalides' });
      throw new Error('Paramètres de conversion invalides');
    }

    try {
      let result: ConversionResult;

      if (!isRealApi) {
        const taux = MOCK_TAUX_CHANGES[params.devise];
        if (!taux) {
          throw new Error(`Taux de change non trouvé pour ${params.devise}`);
        }

        const cdrtDeviseIn = MOCK_MOYENS_REGLEMENT[params.modePaiement] ?? false;

        let equivalent: number;

        if (params.typeOperation === 'A' && params.uniBi !== 'B') {
          equivalent = params.quantite * taux.tauxAchat;
        } else if (params.typeOperation === 'A' && params.uniBi === 'B') {
          equivalent = params.quantite / taux.tauxVente;
        } else if (params.uniBi !== 'B') {
          equivalent = params.quantite * taux.tauxAchat;
        } else if (params.uniBi === 'B') {
          equivalent = params.quantite / taux.tauxVente;
        } else {
          equivalent = params.quantite / taux.tauxVente;
        }

        equivalent = Number(equivalent.toFixed(params.nombreDecimal));

        result = {
          equivalent,
          cdrtDeviseIn,
          taux: params.typeOperation === 'A' ? taux.tauxAchat : taux.tauxVente,
          quantiteOriginale: params.quantite,
          deviseOriginale: params.devise,
          deviseLocale: params.deviseLocale,
        };
      } else {
        const response = await apiClient.post<ConversionResult>('/api/change/calculer-equivalent', {
          params,
        });

        if (!response.data.data) {
          throw new Error('Aucun résultat de conversion retourné');
        }

        result = response.data.data;
      }

      const history = get().conversionHistory;
      const maxSize = get().maxHistorySize;
      const newHistory = [result, ...history].slice(0, maxSize);

      set({
        lastConversion: result,
        conversionHistory: newHistory,
        isCalculating: false,
        error: null,
      });

      return result;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur calcul équivalent';
      set({ isCalculating: false, error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null, validationErrors: [] }),

  clearHistory: () => set({ conversionHistory: [], lastConversion: null }),

  resetState: () => set({ ...initialState }),
}));