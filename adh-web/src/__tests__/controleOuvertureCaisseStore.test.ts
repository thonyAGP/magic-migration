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

const MOCK_RESULT_UNI: CaisseCalculee = {
  caisseCalculee: 1400,
  caisseCalculeeMonnaie: 800,
  caisseCalculeeProduits: 500,
  caisseCalculeeCartes: 100,
  caisseCalculeeCheque: 0,
  caisseCalculeeOd: 0,
  caisseCalculeeNbDevise: 10,
};

const MOCK_RESULT_BI: CaisseCalculee = {
  caisseCalculee: 2000,
  caisseCalculeeMonnaie: 1200,
  caisseCalculeeProduits: 700,
  caisseCalculeeCartes: 150,
  caisseCalculeeCheque: 0,
  caisseCalculeeOd: 0,
  caisseCalculeeNbDevise: 15,
};

const MOCK_ERROR: ValidationError = {
  code: 'ERR_SESSION_ALREADY_OPEN',
  message: 'Une session est déjà ouverte pour ce numéro de chrono',
  field: 'chronoSession',
};

describe('controleOuvertureCaisseStore', () => {
  beforeEach(() => {
    useControleOuvertureCaisseStore.getState().reset();
    useDataSourceStore.getState().setDataSource(false);
    vi.clearAllMocks();
  });

  describe('validateOuvertureCaisse', () => {
    describe('Mock mode (UNI)', () => {
      it('should calculate caisse totals correctly for UNI mode', async () => {
        const store = useControleOuvertureCaisseStore.getState();

        expect(store.isValidating).toBe(false);
        expect(store.validationResult).toBeNull();

        const result = await store.validateOuvertureCaisse(MOCK_PARAMS_UNI);

        expect(store.isValidating).toBe(false);
        expect(store.validationResult).toEqual({
          caisseCalculee: 1500,
          caisseCalculeeMonnaie: 800,
          caisseCalculeeProduits: 500,
          caisseCalculeeCartes: 150,
          caisseCalculeeCheque: 50,
          caisseCalculeeOd: 0,
          caisseCalculeeNbDevise: 10,
        });
        expect(result).toEqual(store.validationResult);
        expect(store.validationError).toBeNull();
      });

      it('should set isValidating to true during validation', async () => {
        const store = useControleOuvertureCaisseStore.getState();

        const promise = store.validateOuvertureCaisse(MOCK_PARAMS_UNI);

        const stateWhileValidating = useControleOuvertureCaisseStore.getState();
        expect(stateWhileValidating.isValidating).toBe(true);

        await promise;

        expect(useControleOuvertureCaisseStore.getState().isValidating).toBe(false);
      });

      it('should clear previous errors on new validation', async () => {
        const store = useControleOuvertureCaisseStore.getState();

        await expect(store.validateOuvertureCaisse(MOCK_PARAMS_ERROR)).rejects.toThrow();
        expect(store.validationError).not.toBeNull();

        await store.validateOuvertureCaisse(MOCK_PARAMS_UNI);

        expect(useControleOuvertureCaisseStore.getState().validationError).toBeNull();
      });
    });

    describe('Mock mode (BI)', () => {
      it('should calculate caisse totals correctly for BI mode', async () => {
        const store = useControleOuvertureCaisseStore.getState();

        const result = await store.validateOuvertureCaisse(MOCK_PARAMS_BI);

        expect(store.isValidating).toBe(false);
        expect(store.validationResult).toEqual({
          caisseCalculee: 2200,
          caisseCalculeeMonnaie: 1200,
          caisseCalculeeProduits: 700,
          caisseCalculeeCartes: 250,
          caisseCalculeeCheque: 50,
          caisseCalculeeOd: 0,
          caisseCalculeeNbDevise: 15,
        });
        expect(result).toEqual(store.validationResult);
      });
    });

    describe('Mock mode (Error)', () => {
      it('should handle validation error for chrono 999', async () => {
        const store = useControleOuvertureCaisseStore.getState();

        await expect(store.validateOuvertureCaisse(MOCK_PARAMS_ERROR)).rejects.toThrow(
          MOCK_ERROR.message,
        );

        expect(store.isValidating).toBe(false);
        expect(store.validationError).toEqual(MOCK_ERROR);
        expect(store.validationResult).toBeNull();
      });
    });

    describe('Real API mode', () => {
      beforeEach(() => {
        useDataSourceStore.getState().setDataSource(true);
      });

      it('should call API and return result on success', async () => {
        vi.mocked(apiClient.post).mockResolvedValueOnce({
          data: { data: MOCK_RESULT_UNI },
        });

        const store = useControleOuvertureCaisseStore.getState();
        const result = await store.validateOuvertureCaisse(MOCK_PARAMS_UNI);

        expect(apiClient.post).toHaveBeenCalledWith('/api/caisse/controle-ouverture', {
          params: MOCK_PARAMS_UNI,
        });
        expect(result).toEqual(MOCK_RESULT_UNI);
        expect(store.validationResult).toEqual(MOCK_RESULT_UNI);
        expect(store.validationError).toBeNull();
        expect(store.isValidating).toBe(false);
      });

      it('should handle API error', async () => {
        const apiError = new Error('Network error');
        vi.mocked(apiClient.post).mockRejectedValueOnce(apiError);

        const store = useControleOuvertureCaisseStore.getState();

        await expect(store.validateOuvertureCaisse(MOCK_PARAMS_UNI)).rejects.toThrow(
          'Network error',
        );

        expect(store.isValidating).toBe(false);
        expect(store.validationError).toEqual({
          code: 'ERR_CALCULATION_ERROR',
          message: 'Network error',
          field: null,
        });
        expect(store.validationResult).toBeNull();
      });

      it('should handle missing data in API response', async () => {
        vi.mocked(apiClient.post).mockResolvedValueOnce({
          data: { data: null },
        });

        const store = useControleOuvertureCaisseStore.getState();

        await expect(store.validateOuvertureCaisse(MOCK_PARAMS_UNI)).rejects.toThrow(
          'Aucune donnée retournée par le serveur',
        );

        expect(store.validationError).toEqual({
          code: 'ERR_CALCULATION_ERROR',
          message: 'Aucune donnée retournée par le serveur',
          field: null,
        });
      });

      it('should handle non-Error thrown exceptions', async () => {
        vi.mocked(apiClient.post).mockRejectedValueOnce('string error');

        const store = useControleOuvertureCaisseStore.getState();

        await expect(store.validateOuvertureCaisse(MOCK_PARAMS_UNI)).rejects.toBe('string error');

        expect(store.validationError).toEqual({
          code: 'ERR_CALCULATION_ERROR',
          message: "Erreur lors du contrôle d'ouverture",
          field: null,
        });
      });
    });
  });

  describe('checkModeUniBi', () => {
    it('should return isUni=true, isBi=false for UNI mode', async () => {
      const store = useControleOuvertureCaisseStore.getState();

      const result = await store.checkModeUniBi('U');

      expect(result).toEqual({ isUni: true, isBi: false });
    });

    it('should return isUni=false, isBi=true for BI mode', async () => {
      const store = useControleOuvertureCaisseStore.getState();

      const result = await store.checkModeUniBi('B');

      expect(result).toEqual({ isUni: false, isBi: true });
    });

    it('should return isUni=true, isBi=false for any non-B mode', async () => {
      const store = useControleOuvertureCaisseStore.getState();

      const resultX = await store.checkModeUniBi('X');
      expect(resultX).toEqual({ isUni: true, isBi: false });

      const resultEmpty = await store.checkModeUniBi('');
      expect(resultEmpty).toEqual({ isUni: true, isBi: false });
    });

    it('should work in real API mode', async () => {
      useDataSourceStore.getState().setDataSource(true);
      const store = useControleOuvertureCaisseStore.getState();

      const result = await store.checkModeUniBi('B');

      expect(result).toEqual({ isUni: false, isBi: true });
    });
  });

  describe('clearValidation', () => {
    it('should clear validation result and error', async () => {
      const store = useControleOuvertureCaisseStore.getState();

      await store.validateOuvertureCaisse(MOCK_PARAMS_UNI);
      expect(store.validationResult).not.toBeNull();

      store.clearValidation();

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.validationResult).toBeNull();
      expect(state.validationError).toBeNull();
    });

    it('should clear validation error', async () => {
      const store = useControleOuvertureCaisseStore.getState();

      await expect(store.validateOuvertureCaisse(MOCK_PARAMS_ERROR)).rejects.toThrow();
      expect(store.validationError).not.toBeNull();

      store.clearValidation();

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.validationError).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const store = useControleOuvertureCaisseStore.getState();

      await store.validateOuvertureCaisse(MOCK_PARAMS_UNI);
      expect(store.validationResult).not.toBeNull();

      store.reset();

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.isValidating).toBe(false);
      expect(state.validationResult).toBeNull();
      expect(state.validationError).toBeNull();
    });

    it('should reset error state', async () => {
      const store = useControleOuvertureCaisseStore.getState();

      await expect(store.validateOuvertureCaisse(MOCK_PARAMS_ERROR)).rejects.toThrow();

      store.reset();

      const state = useControleOuvertureCaisseStore.getState();
      expect(state.validationError).toBeNull();
    });
  });

  describe('Business rules', () => {
    it('should calculate caisseCalculee = soldeInitial + approCoffre + approArticles (Expression 1)', async () => {
      const params: CaisseControl = {
        ...MOCK_PARAMS_UNI,
        soldeInitial: 1000,
        approCoffre: 200,
        approArticles: 300,
      };

      const store = useControleOuvertureCaisseStore.getState();
      const result = await store.validateOuvertureCaisse(params);

      expect(result.caisseCalculee).toBe(1500);
    });

    it('should calculate caisseCalculeeMonnaie = soldeInitialMonnaie + approCoffre (Expression 2)', async () => {
      const params: CaisseControl = {
        ...MOCK_PARAMS_UNI,
        soldeInitialMonnaie: 600,
        approCoffre: 250,
      };

      const store = useControleOuvertureCaisseStore.getState();
      const result = await store.validateOuvertureCaisse(params);

      expect(result.caisseCalculeeMonnaie).toBe(850);
    });

    it('should calculate caisseCalculeeProduits = soldeInitialProduits + approArticles (Expression 3)', async () => {
      const params: CaisseControl = {
        ...MOCK_PARAMS_UNI,
        soldeInitialProduits: 400,
        approArticles: 150,
      };

      const store = useControleOuvertureCaisseStore.getState();
      const result = await store.validateOuvertureCaisse(params);

      expect(result.caisseCalculeeProduits).toBe(550);
    });

    it('should calculate caisseCalculeeNbDevise = soldeInitialNbreDevise + approNbreDevises (Expression 7)', async () => {
      const params: CaisseControl = {
        ...MOCK_PARAMS_UNI,
        soldeInitialNbreDevise: 8,
        approNbreDevises: 7,
      };

      const store = useControleOuvertureCaisseStore.getState();
      const result = await store.validateOuvertureCaisse(params);

      expect(result.caisseCalculeeNbDevise).toBe(15);
    });

    it('should preserve non-calculated fields', async () => {
      const params: CaisseControl = {
        ...MOCK_PARAMS_UNI,
        soldeInitialCartes: 125,
        soldeInitialCheques: 75,
        soldeInitialOd: 25,
      };

      const store = useControleOuvertureCaisseStore.getState();
      const result = await store.validateOuvertureCaisse(params);

      expect(result.caisseCalculeeCartes).toBe(150);
      expect(result.caisseCalculeeCheque).toBe(50);
      expect(result.caisseCalculeeOd).toBe(0);
    });

    it('should validate session not already open (RM-001)', async () => {
      const params: CaisseControl = {
        ...MOCK_PARAMS_UNI,
        chronoSession: 999,
      };

      const store = useControleOuvertureCaisseStore.getState();

      await expect(store.validateOuvertureCaisse(params)).rejects.toThrow(
        'Une session est déjà ouverte pour ce numéro de chrono',
      );

      expect(store.validationError?.code).toBe('ERR_SESSION_ALREADY_OPEN');
      expect(store.validationError?.field).toBe('chronoSession');
    });
  });
});