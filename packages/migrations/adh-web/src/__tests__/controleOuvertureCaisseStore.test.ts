import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useControleOuvertureCaisseStore } from '@/stores/controleOuvertureCaisseStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { CaisseControl, CaisseCalculee, ValidationError } from '@/types/controleOuvertureCaisse';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const MOCK_PARAMS_UNI: CaisseControl = {
  societe: 'TEST',
  deviseLocale: 'EUR',
  modeUniBi: 'U',
  chronoSession: 1,
  soldeInitial: 1000,
  soldeInitialMonnaie: 600,
  soldeInitialProduits: 300,
  soldeInitialCartes: 100,
  soldeInitialCheques: 0,
  soldeInitialOd: 0,
  soldeInitialNbreDevise: 5,
  approCoffre: 200,
  approArticles: 200,
  approNbreDevises: 5,
};

const MOCK_PARAMS_BI: CaisseControl = {
  ...MOCK_PARAMS_UNI,
  modeUniBi: 'B',
  soldeInitial: 1500,
  soldeInitialMonnaie: 900,
  soldeInitialProduits: 500,
  soldeInitialCartes: 150,
  soldeInitialNbreDevise: 10,
  approCoffre: 300,
  approArticles: 200,
  approNbreDevises: 5,
};

const MOCK_PARAMS_ERROR: CaisseControl = {
  ...MOCK_PARAMS_UNI,
  chronoSession: 999,
};

// These match the fixed mock data in the production store
const EXPECTED_RESULT_UNI: CaisseCalculee = {
  caisseCalculee: 1500,
  caisseCalculeeMonnaie: 800,
  caisseCalculeeProduits: 500,
  caisseCalculeeCartes: 150,
  caisseCalculeeCheque: 50,
  caisseCalculeeOd: 0,
  caisseCalculeeNbDevise: 10,
};

const EXPECTED_RESULT_BI: CaisseCalculee = {
  caisseCalculee: 2200,
  caisseCalculeeMonnaie: 1200,
  caisseCalculeeProduits: 700,
  caisseCalculeeCartes: 250,
  caisseCalculeeCheque: 50,
  caisseCalculeeOd: 0,
  caisseCalculeeNbDevise: 15,
};

const MOCK_RESULT_API: CaisseCalculee = {
  caisseCalculee: 1400,
  caisseCalculeeMonnaie: 800,
  caisseCalculeeProduits: 500,
  caisseCalculeeCartes: 100,
  caisseCalculeeCheque: 0,
  caisseCalculeeOd: 0,
  caisseCalculeeNbDevise: 10,
};

const MOCK_ERROR: ValidationError = {
  code: 'ERR_SESSION_ALREADY_OPEN',
  message: 'Une session est déjà ouverte pour ce numéro de chrono',
  field: 'chronoSession',
};

describe('controleOuvertureCaisseStore', () => {
  beforeEach(() => {
    useControleOuvertureCaisseStore.getState().reset();
    useDataSourceStore.getState().setRealApi(false);
    vi.clearAllMocks();
  });

  describe('validateOuvertureCaisse', () => {
    describe('Mock mode (UNI)', () => {
      it('should calculate caisse totals correctly for UNI mode', async () => {
        expect(useControleOuvertureCaisseStore.getState().isValidating).toBe(false);
        expect(useControleOuvertureCaisseStore.getState().validationResult).toBeNull();

        const result = await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI);

        const state = useControleOuvertureCaisseStore.getState();
        expect(state.isValidating).toBe(false);
        expect(state.validationResult).toEqual(EXPECTED_RESULT_UNI);
        expect(result).toEqual(state.validationResult);
        expect(state.validationError).toBeNull();
      });

      it('should set isValidating to true during validation', async () => {
        // In mock mode, validation is synchronous, so we use subscribe to catch the intermediate state
        let sawValidating = false;
        const unsubscribe = useControleOuvertureCaisseStore.subscribe((state) => {
          if (state.isValidating === true) sawValidating = true;
        });

        await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI);
        unsubscribe();

        expect(sawValidating).toBe(true);
        expect(useControleOuvertureCaisseStore.getState().isValidating).toBe(false);
      });

      it('should clear previous errors on new validation', async () => {
        await expect(
          useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_ERROR)
        ).rejects.toThrow();
        expect(useControleOuvertureCaisseStore.getState().validationError).not.toBeNull();

        await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI);

        expect(useControleOuvertureCaisseStore.getState().validationError).toBeNull();
      });
    });

    describe('Mock mode (BI)', () => {
      it('should calculate caisse totals correctly for BI mode', async () => {
        const result = await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_BI);

        const state = useControleOuvertureCaisseStore.getState();
        expect(state.isValidating).toBe(false);
        expect(state.validationResult).toEqual(EXPECTED_RESULT_BI);
        expect(result).toEqual(state.validationResult);
      });
    });

    describe('Mock mode (Error)', () => {
      it('should handle validation error for chrono 999', async () => {
        await expect(
          useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_ERROR)
        ).rejects.toThrow(MOCK_ERROR.message);

        const state = useControleOuvertureCaisseStore.getState();
        expect(state.isValidating).toBe(false);
        expect(state.validationError).toEqual(MOCK_ERROR);
        expect(state.validationResult).toBeNull();
      });
    });

    describe('Real API mode', () => {
      beforeEach(() => {
        useDataSourceStore.getState().setRealApi(true);
      });

      it('should call API and return result on success', async () => {
        vi.mocked(apiClient.post).mockResolvedValueOnce({
          data: { data: MOCK_RESULT_API },
        });

        const result = await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI);

        expect(apiClient.post).toHaveBeenCalledWith('/api/caisse/controle-ouverture', {
          params: MOCK_PARAMS_UNI,
        });
        expect(result).toEqual(MOCK_RESULT_API);
        const state = useControleOuvertureCaisseStore.getState();
        expect(state.validationResult).toEqual(MOCK_RESULT_API);
        expect(state.validationError).toBeNull();
        expect(state.isValidating).toBe(false);
      });

      it('should handle API error', async () => {
        const apiError = new Error('Network error');
        vi.mocked(apiClient.post).mockRejectedValueOnce(apiError);

        await expect(
          useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI)
        ).rejects.toThrow('Network error');

        const state = useControleOuvertureCaisseStore.getState();
        expect(state.isValidating).toBe(false);
        expect(state.validationError).toEqual({
          code: 'ERR_CALCULATION_ERROR',
          message: 'Network error',
          field: null,
        });
        expect(state.validationResult).toBeNull();
      });

      it('should handle missing data in API response', async () => {
        vi.mocked(apiClient.post).mockResolvedValueOnce({
          data: { data: null },
        });

        await expect(
          useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI)
        ).rejects.toThrow('Aucune donnée retournée par le serveur');

        const state = useControleOuvertureCaisseStore.getState();
        expect(state.validationError).toEqual({
          code: 'ERR_CALCULATION_ERROR',
          message: 'Aucune donnée retournée par le serveur',
          field: null,
        });
      });

      it('should handle non-Error thrown exceptions', async () => {
        vi.mocked(apiClient.post).mockRejectedValueOnce('string error');

        await expect(
          useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI)
        ).rejects.toBe('string error');

        const state = useControleOuvertureCaisseStore.getState();
        expect(state.validationError).toEqual({
          code: 'ERR_CALCULATION_ERROR',
          message: "Erreur lors du contrôle d'ouverture",
          field: null,
        });
      });
    });
  });

  describe('checkModeUniBi', () => {
    it('should return isUni=true, isBi=false for UNI mode', async () => {
      const result = await useControleOuvertureCaisseStore.getState().checkModeUniBi('U');
      expect(result).toEqual({ isUni: true, isBi: false });
    });

    it('should return isUni=false, isBi=true for BI mode', async () => {
      const result = await useControleOuvertureCaisseStore.getState().checkModeUniBi('B');
      expect(result).toEqual({ isUni: false, isBi: true });
    });

    it('should return isUni=true, isBi=false for any non-B mode', async () => {
      const resultX = await useControleOuvertureCaisseStore.getState().checkModeUniBi('X');
      expect(resultX).toEqual({ isUni: true, isBi: false });

      const resultEmpty = await useControleOuvertureCaisseStore.getState().checkModeUniBi('');
      expect(resultEmpty).toEqual({ isUni: true, isBi: false });
    });

    it('should work in real API mode', async () => {
      useDataSourceStore.getState().setRealApi(true);
      const result = await useControleOuvertureCaisseStore.getState().checkModeUniBi('B');
      expect(result).toEqual({ isUni: false, isBi: true });
    });
  });

  describe('clearValidation', () => {
    it('should clear validation result and error', async () => {
      await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI);
      expect(useControleOuvertureCaisseStore.getState().validationResult).not.toBeNull();

      useControleOuvertureCaisseStore.getState().clearValidation();

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.validationResult).toBeNull();
      expect(state.validationError).toBeNull();
    });

    it('should clear validation error', async () => {
      await expect(
        useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_ERROR)
      ).rejects.toThrow();
      expect(useControleOuvertureCaisseStore.getState().validationError).not.toBeNull();

      useControleOuvertureCaisseStore.getState().clearValidation();

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.validationError).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI);
      expect(useControleOuvertureCaisseStore.getState().validationResult).not.toBeNull();

      useControleOuvertureCaisseStore.getState().reset();

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.isValidating).toBe(false);
      expect(state.validationResult).toBeNull();
      expect(state.validationError).toBeNull();
    });

    it('should reset error state', async () => {
      await expect(
        useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_ERROR)
      ).rejects.toThrow();

      useControleOuvertureCaisseStore.getState().reset();

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.validationError).toBeNull();
    });
  });

  describe('Business rules', () => {
    it('should return UNI mock data for UNI mode', async () => {
      const result = await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_UNI);
      expect(result).toEqual(EXPECTED_RESULT_UNI);
    });

    it('should return BI mock data for BI mode', async () => {
      const result = await useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_BI);
      expect(result).toEqual(EXPECTED_RESULT_BI);
    });

    it('should reject with error for chrono 999 (RM-001)', async () => {
      await expect(
        useControleOuvertureCaisseStore.getState().validateOuvertureCaisse(MOCK_PARAMS_ERROR)
      ).rejects.toThrow('Une session est déjà ouverte pour ce numéro de chrono');

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.validationError?.code).toBe('ERR_SESSION_ALREADY_OPEN');
      expect(state.validationError?.field).toBe('chronoSession');
    });
  });
});
