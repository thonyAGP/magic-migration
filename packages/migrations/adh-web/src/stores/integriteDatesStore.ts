import { create } from 'zustand';
import type {
  DateIntegrityCheck,
  DateComptable,
  OuvertureValidation,
  TransactionValidation,
  FermetureValidation,
  DateCheckType,
} from '@/types/integriteDates';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from './dataSourceStore';

interface IntegriteDatesState {
  checkType: DateCheckType;
  societe: string;
  isLoading: boolean;
  error: string | null;
  validationResult: DateIntegrityCheck | null;
  ouvertureValidation: OuvertureValidation | null;
  transactionValidation: TransactionValidation | null;
  fermetureValidation: FermetureValidation | null;
}

interface IntegriteDatesActions {
  setCheckType: (checkType: DateCheckType) => void;
  setSociete: (societe: string) => void;
  setError: (error: string | null) => void;
  clearValidationResult: () => void;
  validateDateIntegrity: (checkType: DateCheckType, societe: string) => Promise<DateIntegrityCheck>;
  checkOuverture: (societe: string) => Promise<boolean>;
  checkTransaction: (societe: string, dateSession: string, heureSession: string) => Promise<boolean>;
  checkFermeture: (societe: string) => Promise<{ isValid: boolean; hasAnomaly: boolean }>;
  reset: () => void;
}

type IntegriteDatesStore = IntegriteDatesState & IntegriteDatesActions;

const MOCK_DATE_COMPTABLE: DateComptable = {
  checkType: 'O',
  societe: 'SOC1',
  controleOk: true,
  anomalieFermeture: false,
  dateComptable: '2026-02-20',
  delaiJours: 3,
};

const MOCK_VALIDATIONS: Record<DateCheckType, DateIntegrityCheck> = {
  O: {
    checkType: 'O',
    societe: 'SOC1',
    isValid: true,
    hasClosureAnomaly: false,
    timestamp: new Date().toISOString(),
  },
  T: {
    checkType: 'T',
    societe: 'SOC1',
    isValid: false,
    hasClosureAnomaly: false,
    errorMessage: 'Transaction timestamp invalide: session date/heure antérieure à maintenant',
    timestamp: new Date().toISOString(),
  },
  F: {
    checkType: 'F',
    societe: 'SOC1',
    isValid: false,
    hasClosureAnomaly: true,
    errorMessage: 'Anomalie détectée: fermeture bloquée',
    timestamp: new Date().toISOString(),
  },
};

const initialState: IntegriteDatesState = {
  checkType: 'O',
  societe: '',
  isLoading: false,
  error: null,
  validationResult: null,
  ouvertureValidation: null,
  transactionValidation: null,
  fermetureValidation: null,
};

export const useIntegriteDatesStore = create<IntegriteDatesStore>()((set, _get) => ({
  ...initialState,

  setCheckType: (checkType) => {
    set({ checkType, error: null });
  },

  setSociete: (societe) => {
    set({ societe, error: null });
  },

  setError: (error) => {
    set({ error });
  },

  clearValidationResult: () => {
    set({
      validationResult: null,
      ouvertureValidation: null,
      transactionValidation: null,
      fermetureValidation: null,
      error: null,
    });
  },

  validateDateIntegrity: async (checkType, societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const mockResult = MOCK_VALIDATIONS[checkType];
      set({
        validationResult: mockResult,
        isLoading: false,
      });
      return mockResult;
    }

    try {
      const response = await apiClient.post<ApiResponse<DateIntegrityCheck>>(
        '/api/controles/integrite-dates',
        { checkType, societe },
      );

      const result = response.data.data;
      if (!result) {
        throw new Error('Réponse invalide du serveur');
      }

      set({ validationResult: result });
      return result;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation intégrité dates';
      set({ validationResult: null, error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  checkOuverture: async (societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const currentDate = new Date();
      const dateComptable = new Date(MOCK_DATE_COMPTABLE.dateComptable);
      const delai = MOCK_DATE_COMPTABLE.delaiJours;
      const dateLimit = new Date(dateComptable);
      dateLimit.setDate(dateLimit.getDate() + delai);

      const isValid = currentDate <= dateLimit;
      const validation: OuvertureValidation = {
        isValid,
        dateComptable: MOCK_DATE_COMPTABLE.dateComptable,
        currentDate: currentDate.toISOString().split('T')[0],
        delaiExceeded: currentDate > dateLimit,
      };

      set({
        ouvertureValidation: validation,
        isLoading: false,
      });
      return isValid;
    }

    try {
      const response = await apiClient.get<ApiResponse<DateComptable>>(
        '/api/controles/date-comptable',
        { params: { societe, checkType: 'O' } },
      );

      const data = response.data.data;
      if (!data) {
        throw new Error('Réponse invalide du serveur');
      }

      const currentDate = new Date();
      const dateComptable = new Date(data.dateComptable);
      const dateLimit = new Date(dateComptable);
      dateLimit.setDate(dateLimit.getDate() + data.delaiJours);

      const isValid = currentDate <= dateLimit && data.controleOk;
      const validation: OuvertureValidation = {
        isValid,
        dateComptable: data.dateComptable,
        currentDate: currentDate.toISOString().split('T')[0],
        delaiExceeded: currentDate > dateLimit,
      };

      set({ ouvertureValidation: validation });
      return isValid;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur contrôle ouverture';
      set({ ouvertureValidation: null, error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  checkTransaction: async (societe, dateSession, heureSession) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const currentTimestamp = Date.now();
      const sessionDate = new Date(dateSession);
      const [hours, minutes] = heureSession.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);
      const sessionTimestamp = sessionDate.getTime();

      const isValid = currentTimestamp >= sessionTimestamp;
      const validation: TransactionValidation = {
        isValid,
        dateSession,
        heureSession,
        currentTimestamp,
        sessionTimestamp,
        isTimestampValid: isValid,
      };

      set({
        transactionValidation: validation,
        isLoading: false,
      });
      return isValid;
    }

    try {
      const response = await apiClient.post<ApiResponse<DateIntegrityCheck>>(
        '/api/controles/integrite-dates',
        { checkType: 'T', societe, dateSession, heureSession },
      );

      const result = response.data.data;
      if (!result) {
        throw new Error('Réponse invalide du serveur');
      }

      const currentTimestamp = Date.now();
      const sessionDate = new Date(dateSession);
      const [hours, minutes] = heureSession.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);
      const sessionTimestamp = sessionDate.getTime();

      const validation: TransactionValidation = {
        isValid: result.isValid,
        dateSession,
        heureSession,
        currentTimestamp,
        sessionTimestamp,
        isTimestampValid: result.isValid,
      };

      set({ transactionValidation: validation });
      return result.isValid;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur contrôle transaction';
      set({ transactionValidation: null, error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  checkFermeture: async (societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const hasAnomaly = MOCK_VALIDATIONS.F.hasClosureAnomaly;
      const validation: FermetureValidation = {
        isValid: !hasAnomaly,
        hasAnomaly,
        blockedReason: hasAnomaly ? 'Anomalie de fermeture détectée' : undefined,
      };

      set({
        fermetureValidation: validation,
        isLoading: false,
      });
      return { isValid: !hasAnomaly, hasAnomaly };
    }

    try {
      const response = await apiClient.post<ApiResponse<DateIntegrityCheck>>(
        '/api/controles/integrite-dates',
        { checkType: 'F', societe },
      );

      const result = response.data.data;
      if (!result) {
        throw new Error('Réponse invalide du serveur');
      }

      const validation: FermetureValidation = {
        isValid: result.isValid && !result.hasClosureAnomaly,
        hasAnomaly: result.hasClosureAnomaly,
        blockedReason: result.hasClosureAnomaly ? result.errorMessage : undefined,
      };

      set({ fermetureValidation: validation });
      return { isValid: validation.isValid, hasAnomaly: result.hasClosureAnomaly };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur contrôle fermeture';
      set({ fermetureValidation: null, error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));