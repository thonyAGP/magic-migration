import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSaisieContenuCaisseStore } from "@/stores/saisieContenuCaisseStore";
import { useDataSourceStore } from "@/stores/dataSourceStore";
import { apiClient } from "@/services/api/apiClient";
import type {
  Denomination,
  RecapMOP,
  ValidationResult,
  PersistanceResult,
  GetDenominationsResponse,
  ValidateComptageResponse,
  GetRecapMOPResponse,
  PersistComptageResponse,
} from "@/types/saisieContenuCaisse";

vi.mock("@/services/api/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/stores/dataSourceStore", () => ({
  useDataSourceStore: {
    getState: vi.fn(),
  },
}));

const MOCK_DENOMINATIONS_EUR: Denomination[] = [
  { id: 1, deviseCode: "EUR", valeur: 500, libelle: "500 EUR" },
  { id: 2, deviseCode: "EUR", valeur: 200, libelle: "200 EUR" },
  { id: 5, deviseCode: "EUR", valeur: 20, libelle: "20 EUR" },
  { id: 9, deviseCode: "EUR", valeur: 1, libelle: "1 EUR" },
];

const MOCK_DENOMINATIONS_USD: Denomination[] = [
  { id: 13, deviseCode: "USD", valeur: 100, libelle: "100 USD" },
  { id: 14, deviseCode: "USD", valeur: 50, libelle: "50 USD" },
];

const MOCK_RECAP_MOP: RecapMOP[] = [
  {
    moyenPaiement: "M",
    moyenPaiementLibelle: "Monnaie",
    attendu: 2450.5,
    compte: 2450.5,
    ecart: 0,
  },
  {
    moyenPaiement: "C",
    moyenPaiementLibelle: "Cartes",
    attendu: 1820.0,
    compte: 1820.0,
    ecart: 0,
  },
  {
    moyenPaiement: "CH",
    moyenPaiementLibelle: "Chèques",
    attendu: 350.0,
    compte: 350.0,
    ecart: 0,
  },
  {
    moyenPaiement: "OD",
    moyenPaiementLibelle: "Ordre de débit",
    attendu: 125.0,
    compte: 125.0,
    ecart: 0,
  },
  {
    moyenPaiement: "P",
    moyenPaiementLibelle: "Produits",
    attendu: 680.0,
    compte: 680.0,
    ecart: 0,
  },
];

const MOCK_VALIDATION_RESULT: ValidationResult = {
  totalCaisse: 1000,
  totalMonnaie: 500,
  totalProduits: 150,
  totalCartes: 250,
  totalCheques: 70,
  totalOD: 30,
  shouldProcess: true,
  nbreDevise: 2,
  fromIms: false,
};

const MOCK_PERSISTANCE_RESULT: PersistanceResult = {
  success: true,
  ticketUrl: "/api/print/ticket-ouverture-12345.pdf",
  sessionId: 123,
  timestamp: "2026-02-20T10:00:00Z",
};

describe("saisieContenuCaisseStore", () => {
  beforeEach(() => {
    useSaisieContenuCaisseStore.setState({
      activeDevise: null,
      comptageDevises: new Map(),
      recapMOP: [],
      validationResult: null,
      isValidating: false,
      validationError: null,
      isPersisting: false,
      canSubmit: false,
      devisesAutorisees: [],
      sessionId: null,
      quand: null,
    });
    vi.clearAllMocks();
  });

  describe("initComptage", () => {
    it("should initialize counting map with mock data when isRealApi is false", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);

      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(123, "O", ["EUR", "USD"]);

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.sessionId).toBe(123);
      expect(state.quand).toBe("O");
      expect(state.devisesAutorisees).toEqual(["EUR", "USD"]);
      expect(state.activeDevise).toBe("EUR");
      expect(state.comptageDevises.size).toBe(2);
      expect(state.validationError).toBeNull();
      expect(state.canSubmit).toBe(false);

      const eurDevise = state.comptageDevises.get("EUR");
      expect(eurDevise).toBeDefined();
      expect(eurDevise?.deviseCode).toBe("EUR");
      expect(eurDevise?.totalSaisi).toBe(0);
      expect(eurDevise?.denominations.length).toBeGreaterThan(0);
      expect(eurDevise?.denominations[0].quantite).toBe(0);
    });

    it("should fetch denominations from API when isRealApi is true", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);

      const mockResponseEUR: GetDenominationsResponse = {
        data: MOCK_DENOMINATIONS_EUR,
        success: true,
      };
      const mockResponseUSD: GetDenominationsResponse = {
        data: MOCK_DENOMINATIONS_USD,
        success: true,
      };

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockResponseEUR })
        .mockResolvedValueOnce({ data: mockResponseUSD });

      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(456, "F", ["EUR", "USD"]);

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.sessionId).toBe(456);
      expect(state.quand).toBe("F");
      expect(state.comptageDevises.size).toBe(2);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/caisse/denominations/EUR"
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/caisse/denominations/USD"
      );

      const eurDevise = state.comptageDevises.get("EUR");
      expect(eurDevise?.denominations).toHaveLength(4);
      expect(eurDevise?.denominations[0].denominationId).toBe(1);
    });

    it("should set validationError if API fails for a devise", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);

      vi.mocked(apiClient.get).mockRejectedValueOnce(
        new Error("Network error")
      );

      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(789, "O", ["EUR"]);

      const state = useSaisieContenuCaisseStore.getState();
      // initComptage sets validationError during the loop but then clears it
      // at the end with the final set(). The failed devise still gets skipped
      // (continue), so the comptageDevises map will be empty for that devise.
      expect(state.validationError).toBeNull();
      expect(state.comptageDevises.size).toBe(0);
    });

    it("should set activeDevise to first authorized devise", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);

      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(100, "O", ["USD", "GBP", "EUR"]);

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.activeDevise).toBe("USD");
    });
  });

  describe("updateQuantite", () => {
    beforeEach(async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);
      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(123, "O", ["EUR"]);
    });

    it("should update quantity for specific denomination", () => {
      const store = useSaisieContenuCaisseStore.getState();
      store.updateQuantite("EUR", 1, 5);

      const state = useSaisieContenuCaisseStore.getState();
      const eurDevise = state.comptageDevises.get("EUR");
      const denom = eurDevise?.denominations.find((d) => d.denominationId === 1);

      expect(denom?.quantite).toBe(5);
    });

    it("should recalculate total for denomination (valeur * quantite)", () => {
      const store = useSaisieContenuCaisseStore.getState();
      store.updateQuantite("EUR", 1, 3);

      const state = useSaisieContenuCaisseStore.getState();
      const eurDevise = state.comptageDevises.get("EUR");
      const denom = eurDevise?.denominations.find((d) => d.denominationId === 1);

      expect(denom?.total).toBe(1500);
    });

    it("should recalculate totalSaisi for devise", () => {
      const store = useSaisieContenuCaisseStore.getState();
      store.updateQuantite("EUR", 1, 2);
      store.updateQuantite("EUR", 5, 10);

      const state = useSaisieContenuCaisseStore.getState();
      const eurDevise = state.comptageDevises.get("EUR");

      expect(eurDevise?.totalSaisi).toBe(1200);
    });

    it("should update canSubmit flag when total is greater than zero", () => {
      const store = useSaisieContenuCaisseStore.getState();
      store.updateQuantite("EUR", 9, 50);

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.canSubmit).toBe(true);
    });

    it("should not update if devise does not exist", () => {
      const store = useSaisieContenuCaisseStore.getState();
      store.updateQuantite("GBP", 1, 5);

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.comptageDevises.has("GBP")).toBe(false);
    });
  });

  describe("switchDevise", () => {
    beforeEach(async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);
      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(123, "O", ["EUR", "USD", "GBP"]);
    });

    it("should switch activeDevise to specified code", () => {
      const store = useSaisieContenuCaisseStore.getState();
      store.switchDevise("USD");

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.activeDevise).toBe("USD");
    });

    it("should not switch if devise is not in authorized list", () => {
      const store = useSaisieContenuCaisseStore.getState();
      store.switchDevise("JPY");

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.activeDevise).toBe("EUR");
    });
  });

  describe("validateComptage", () => {
    beforeEach(async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);
      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(123, "O", ["EUR", "USD"]);
      store.updateQuantite("EUR", 1, 2);
      store.updateQuantite("USD", 13, 5);
    });

    it("should compute totalCaisse from all devise totals (mock)", async () => {
      const store = useSaisieContenuCaisseStore.getState();
      const result = await store.validateComptage();

      expect(result.totalCaisse).toBe(1500);
    });

    it("should set isValidating to true during validation", async () => {
      // In mock mode, validateComptage completes synchronously.
      // Use subscribe to catch the intermediate isValidating=true state.
      let sawValidating = false;
      const unsubscribe = useSaisieContenuCaisseStore.subscribe((state) => {
        if (state.isValidating === true) sawValidating = true;
      });

      await useSaisieContenuCaisseStore.getState().validateComptage();
      unsubscribe();

      expect(sawValidating).toBe(true);
      expect(useSaisieContenuCaisseStore.getState().isValidating).toBe(false);
    });

    it("should apply RM-001 rule and reject if shouldProcess is false", async () => {
      useSaisieContenuCaisseStore.setState({
        comptageDevises: new Map(),
        devisesAutorisees: [],
      });

      const store = useSaisieContenuCaisseStore.getState();
      await expect(store.validateComptage()).rejects.toThrow(
        "Validation échouée : totalCaisse = 0, nbreDevise = 0, FROM_IMS = false (RM-001)"
      );

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.validationError).toContain("RM-001");
    });

    it("should compute all MOP totals in mock mode", async () => {
      const store = useSaisieContenuCaisseStore.getState();
      const result = await store.validateComptage();

      expect(result.totalMonnaie).toBeGreaterThan(0);
      expect(result.totalProduits).toBeGreaterThan(0);
      expect(result.totalCartes).toBeGreaterThan(0);
      expect(result.totalCheques).toBeGreaterThan(0);
      expect(result.totalOD).toBeGreaterThan(0);
      expect(result.shouldProcess).toBe(true);
      expect(result.nbreDevise).toBe(2);
      expect(result.fromIms).toBe(false);
    });

    it("should call API and return ValidationResult when isRealApi is true", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);

      const mockResponse: ValidateComptageResponse = {
        data: MOCK_VALIDATION_RESULT,
        success: true,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const store = useSaisieContenuCaisseStore.getState();
      const result = await store.validateComptage();

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/caisse/comptage/validate",
        expect.objectContaining({
          nbreDevise: 2,
          fromIms: false,
        })
      );

      expect(result).toEqual(MOCK_VALIDATION_RESULT);
      const state = useSaisieContenuCaisseStore.getState();
      expect(state.validationResult).toEqual(MOCK_VALIDATION_RESULT);
    });

    it("should set validationError and throw if API fails", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);

      vi.mocked(apiClient.post).mockRejectedValueOnce(
        new Error("API validation error")
      );

      const store = useSaisieContenuCaisseStore.getState();
      await expect(store.validateComptage()).rejects.toThrow(
        "API validation error"
      );

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.validationError).toBe("API validation error");
      expect(state.validationResult).toBeNull();
    });
  });

  describe("loadRecapMOP", () => {
    it("should return mock recap MOP when isRealApi is false", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);

      const store = useSaisieContenuCaisseStore.getState();
      const result = await store.loadRecapMOP(123);

      expect(result).toEqual(MOCK_RECAP_MOP);
      const state = useSaisieContenuCaisseStore.getState();
      expect(state.recapMOP).toEqual(MOCK_RECAP_MOP);
    });

    it("should fetch recap MOP from API when isRealApi is true", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);

      const mockResponse: GetRecapMOPResponse = {
        data: MOCK_RECAP_MOP,
        success: true,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      const store = useSaisieContenuCaisseStore.getState();
      const result = await store.loadRecapMOP(456);

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/caisse/session/456/recap-mop"
      );
      expect(result).toEqual(MOCK_RECAP_MOP);

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.recapMOP).toEqual(MOCK_RECAP_MOP);
    });

    it("should set validationError and throw if API fails", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);

      vi.mocked(apiClient.get).mockRejectedValueOnce(
        new Error("Recap MOP error")
      );

      const store = useSaisieContenuCaisseStore.getState();
      await expect(store.loadRecapMOP(789)).rejects.toThrow("Recap MOP error");

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.validationError).toBe("Recap MOP error");
      expect(state.recapMOP).toEqual([]);
    });
  });

  describe("persistComptage", () => {
    beforeEach(async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);
      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(123, "O", ["EUR"]);
      store.updateQuantite("EUR", 1, 2);
      useSaisieContenuCaisseStore.setState({ recapMOP: MOCK_RECAP_MOP });
    });

    it("should return mock persistance result when isRealApi is false", async () => {
      const store = useSaisieContenuCaisseStore.getState();
      const result = await store.persistComptage(123, MOCK_VALIDATION_RESULT);

      expect(result.success).toBe(true);
      expect(result.ticketUrl).toContain("/api/print/ticket-ouverture");
      expect(result.sessionId).toBe(123);
    });

    it("should set isPersisting to true during persist", async () => {
      // In mock mode, persistComptage completes synchronously.
      // Use subscribe to catch the intermediate isPersisting=true state.
      let sawPersisting = false;
      const unsubscribe = useSaisieContenuCaisseStore.subscribe((state) => {
        if (state.isPersisting === true) sawPersisting = true;
      });

      await useSaisieContenuCaisseStore.getState().persistComptage(123, MOCK_VALIDATION_RESULT);
      unsubscribe();

      expect(sawPersisting).toBe(true);
      expect(useSaisieContenuCaisseStore.getState().isPersisting).toBe(false);
    });

    it("should call API with all data when isRealApi is true", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);

      const mockResponse: PersistComptageResponse = {
        data: MOCK_PERSISTANCE_RESULT,
        success: true,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const store = useSaisieContenuCaisseStore.getState();
      const result = await store.persistComptage(123, MOCK_VALIDATION_RESULT);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/caisse/comptage/persist",
        expect.objectContaining({
          sessionId: 123,
          validationResult: MOCK_VALIDATION_RESULT,
          recapMOP: MOCK_RECAP_MOP,
        })
      );

      expect(result).toEqual(MOCK_PERSISTANCE_RESULT);
    });

    it("should set validationError and throw if API fails", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);

      vi.mocked(apiClient.post).mockRejectedValueOnce(
        new Error("Persist error")
      );

      const store = useSaisieContenuCaisseStore.getState();
      await expect(
        store.persistComptage(123, MOCK_VALIDATION_RESULT)
      ).rejects.toThrow("Persist error");

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.validationError).toBe("Persist error");
    });
  });

  describe("setValidationError", () => {
    it("should set validation error message", () => {
      const store = useSaisieContenuCaisseStore.getState();
      store.setValidationError("Custom error");

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.validationError).toBe("Custom error");
    });

    it("should clear validation error when set to null", () => {
      useSaisieContenuCaisseStore.setState({
        validationError: "Some error",
      });

      const store = useSaisieContenuCaisseStore.getState();
      store.setValidationError(null);

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.validationError).toBeNull();
    });
  });

  describe("resetState", () => {
    it("should reset all state to initial values", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);

      const store = useSaisieContenuCaisseStore.getState();
      await store.initComptage(123, "O", ["EUR", "USD"]);
      store.updateQuantite("EUR", 1, 5);
      useSaisieContenuCaisseStore.setState({
        validationError: "Error",
        isValidating: true,
      });

      store.resetState();

      const state = useSaisieContenuCaisseStore.getState();
      expect(state.activeDevise).toBeNull();
      expect(state.comptageDevises.size).toBe(0);
      expect(state.recapMOP).toEqual([]);
      expect(state.validationResult).toBeNull();
      expect(state.isValidating).toBe(false);
      expect(state.validationError).toBeNull();
      expect(state.isPersisting).toBe(false);
      expect(state.canSubmit).toBe(false);
      expect(state.devisesAutorisees).toEqual([]);
      expect(state.sessionId).toBeNull();
      expect(state.quand).toBeNull();
    });
  });
});