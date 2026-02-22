import { create } from 'zustand';
import type {
  FidelisationRemise,
  RemiseResult,
  FidelisationRemiseState,
} from '@/types/fidelisationRemise';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';

interface FidelisationRemiseActions {
  getFidelisationRemise: (
    societe: string,
    compte: number,
    filiation: number,
    service: string,
    imputation: number,
  ) => Promise<void>;
  validateRemiseEligibility: (remiseData: FidelisationRemise) => Promise<boolean>;
  calculateMontantRemise: (remiseData: FidelisationRemise) => Promise<number>;
  setError: (error: string | null) => void;
  reset: () => void;
}

type FidelisationRemiseStore = FidelisationRemiseState & FidelisationRemiseActions;

const MOCK_REMISE_DATA: FidelisationRemise[] = [
  {
    societe: 'SOC1',
    compte: 1001,
    filiation: 0,
    service: 'RST',
    imputation: 101,
    fidelisation: 'GOLD',
    remise: 15,
  },
  {
    societe: 'SOC1',
    compte: 1002,
    filiation: 0,
    service: 'BTQ',
    imputation: 102,
    fidelisation: 'SILVER',
    remise: 10,
  },
  {
    societe: 'SOC1',
    compte: 1003,
    filiation: 1,
    service: 'SPA',
    imputation: 103,
    fidelisation: 'BRONZE',
    remise: 5,
  },
  {
    societe: 'SOC1',
    compte: 1004,
    filiation: 0,
    service: 'BAR',
    imputation: 104,
    fidelisation: 'EXPIRED',
    remise: null,
  },
  {
    societe: 'SOC1',
    compte: 1005,
    filiation: 0,
    service: 'RST',
    imputation: 105,
    fidelisation: null,
    remise: null,
  },
];

const calculateRemiseResult = (data: FidelisationRemise | null): RemiseResult | null => {
  if (!data) return null;

  if (!data.fidelisation) {
    return {
      fidelisationId: null,
      montantRemise: 0,
      isValide: false,
      message: 'Aucun programme de fidelisation actif',
    };
  }

  if (data.fidelisation === 'EXPIRED') {
    return {
      fidelisationId: data.fidelisation,
      montantRemise: 0,
      isValide: false,
      message: 'Programme de fidelisation expire',
    };
  }

  if (!data.remise || data.remise <= 0) {
    return {
      fidelisationId: data.fidelisation,
      montantRemise: 0,
      isValide: false,
      message: 'Aucune remise disponible pour ce profil',
    };
  }

  return {
    fidelisationId: data.fidelisation,
    montantRemise: data.remise,
    isValide: true,
    message: null,
  };
};

const initialState: FidelisationRemiseState = {
  isLoading: false,
  error: null,
  remiseData: null,
  remiseResult: null,
  getFidelisationRemise: async () => {},
  validateRemiseEligibility: async () => false,
  calculateMontantRemise: async () => 0,
  setError: () => {},
  reset: () => {},
};

export const useFidelisationRemiseStore = create<FidelisationRemiseStore>()((set, get) => ({
  ...initialState,

  getFidelisationRemise: async (societe, compte, filiation, service, imputation) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const mockData = MOCK_REMISE_DATA.find(
        (d) =>
          d.societe === societe &&
          d.compte === compte &&
          d.filiation === filiation &&
          d.service === service &&
          d.imputation === imputation,
      );

      const result = calculateRemiseResult(mockData ?? null);
      set({
        remiseData: mockData ?? null,
        remiseResult: result,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<RemiseResult>>(
        '/api/fidelisation-remise/get',
        {
          params: { societe, compte, filiation, service, imputation },
        },
      );

      const remiseData: FidelisationRemise = {
        societe,
        compte,
        filiation,
        service,
        imputation,
        fidelisation: response.data.data?.fidelisationId ?? null,
        remise: response.data.data?.montantRemise ?? null,
      };

      set({
        remiseData,
        remiseResult: response.data.data ?? null,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement fidelisation';
      set({ remiseData: null, remiseResult: null, error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  validateRemiseEligibility: async (remiseData) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const isValid = !!(
        remiseData.fidelisation &&
        remiseData.fidelisation !== 'EXPIRED' &&
        remiseData.remise &&
        remiseData.remise > 0
      );
      set({ isLoading: false });
      return isValid;
    }

    try {
      const response = await apiClient.post<
        ApiResponse<{ isValide: boolean; message?: string }>
      >('/api/fidelisation-remise/validate', { remiseData });

      set({ isLoading: false });
      return response.data.data?.isValide ?? false;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation remise';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  calculateMontantRemise: async (remiseData) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const montant = remiseData.remise ?? 0;
      set({ isLoading: false });
      return montant;
    }

    try {
      const response = await apiClient.post<ApiResponse<{ montantRemise: number }>>(
        '/api/fidelisation-remise/calculate',
        { remiseData },
      );

      set({ isLoading: false });
      return response.data.data?.montantRemise ?? 0;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur calcul montant';
      set({ error: message, isLoading: false });
      return 0;
    }
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => set({ ...initialState }),
}));