import { create } from "zustand";
import type {
  Denomination,
  ComptageDetail,
  DeviseComptage,
  RecapMOP,
  ValidationResult,
  PersistanceResult,
  GetDenominationsResponse,
  ValidateComptageResponse,
  GetRecapMOPResponse,
  PersistComptageResponse,
} from "@/types/saisieContenuCaisse";
import { apiClient } from "@/services/api/apiClient";
import { useDataSourceStore } from "@/stores/dataSourceStore";

interface SaisieContenuCaisseState {
  activeDevise: string | null;
  comptageDevises: Map<string, DeviseComptage>;
  recapMOP: RecapMOP[];
  validationResult: ValidationResult | null;
  isValidating: boolean;
  validationError: string | null;
  isPersisting: boolean;
  canSubmit: boolean;
  devisesAutorisees: string[];
  sessionId: number | null;
  quand: "O" | "F" | null;
}

interface SaisieContenuCaisseActions {
  initComptage: (
    sessionId: number,
    quand: "O" | "F",
    devisesAutorisees: string[]
  ) => Promise<void>;
  updateQuantite: (
    deviseCode: string,
    denominationId: number,
    quantite: number
  ) => void;
  switchDevise: (deviseCode: string) => void;
  validateComptage: () => Promise<ValidationResult>;
  loadRecapMOP: (sessionId: number) => Promise<RecapMOP[]>;
  persistComptage: (
    sessionId: number,
    validationResult: ValidationResult
  ) => Promise<PersistanceResult>;
  resetState: () => void;
  setValidationError: (error: string | null) => void;
}

type SaisieContenuCaisseStore = SaisieContenuCaisseState &
  SaisieContenuCaisseActions;

const MOCK_DENOMINATIONS: Record<string, Denomination[]> = {
  EUR: [
    { id: 1, deviseCode: "EUR", valeur: 500, libelle: "500 EUR" },
    { id: 2, deviseCode: "EUR", valeur: 200, libelle: "200 EUR" },
    { id: 3, deviseCode: "EUR", valeur: 100, libelle: "100 EUR" },
    { id: 4, deviseCode: "EUR", valeur: 50, libelle: "50 EUR" },
    { id: 5, deviseCode: "EUR", valeur: 20, libelle: "20 EUR" },
    { id: 6, deviseCode: "EUR", valeur: 10, libelle: "10 EUR" },
    { id: 7, deviseCode: "EUR", valeur: 5, libelle: "5 EUR" },
    { id: 8, deviseCode: "EUR", valeur: 2, libelle: "2 EUR" },
    { id: 9, deviseCode: "EUR", valeur: 1, libelle: "1 EUR" },
    { id: 10, deviseCode: "EUR", valeur: 0.5, libelle: "0.50 EUR" },
    { id: 11, deviseCode: "EUR", valeur: 0.2, libelle: "0.20 EUR" },
    { id: 12, deviseCode: "EUR", valeur: 0.1, libelle: "0.10 EUR" },
  ],
  USD: [
    { id: 13, deviseCode: "USD", valeur: 100, libelle: "100 USD" },
    { id: 14, deviseCode: "USD", valeur: 50, libelle: "50 USD" },
    { id: 15, deviseCode: "USD", valeur: 20, libelle: "20 USD" },
    { id: 16, deviseCode: "USD", valeur: 10, libelle: "10 USD" },
    { id: 17, deviseCode: "USD", valeur: 5, libelle: "5 USD" },
    { id: 18, deviseCode: "USD", valeur: 1, libelle: "1 USD" },
    { id: 19, deviseCode: "USD", valeur: 0.25, libelle: "0.25 USD" },
    { id: 20, deviseCode: "USD", valeur: 0.1, libelle: "0.10 USD" },
  ],
  GBP: [
    { id: 21, deviseCode: "GBP", valeur: 50, libelle: "50 GBP" },
    { id: 22, deviseCode: "GBP", valeur: 20, libelle: "20 GBP" },
    { id: 23, deviseCode: "GBP", valeur: 10, libelle: "10 GBP" },
    { id: 24, deviseCode: "GBP", valeur: 5, libelle: "5 GBP" },
    { id: 25, deviseCode: "GBP", valeur: 2, libelle: "2 GBP" },
    { id: 26, deviseCode: "GBP", valeur: 1, libelle: "1 GBP" },
    { id: 27, deviseCode: "GBP", valeur: 0.5, libelle: "0.50 GBP" },
    { id: 28, deviseCode: "GBP", valeur: 0.2, libelle: "0.20 GBP" },
  ],
};

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

const initialState: SaisieContenuCaisseState = {
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
};

export const useSaisieContenuCaisseStore = create<SaisieContenuCaisseStore>()(
  (set, get) => ({
    ...initialState,

    initComptage: async (sessionId, quand, devisesAutorisees) => {
      const { isRealApi } = useDataSourceStore.getState();
      const comptageDevises = new Map<string, DeviseComptage>();

      for (const deviseCode of devisesAutorisees) {
        let denominations: Denomination[] = [];

        if (!isRealApi) {
          denominations = MOCK_DENOMINATIONS[deviseCode] || [];
        } else {
          try {
            const response =
              await apiClient.get<GetDenominationsResponse>(
                `/api/caisse/denominations/${deviseCode}`
              );
            denominations = response.data.data ?? [];
          } catch (e: unknown) {
            const message =
              e instanceof Error
                ? e.message
                : `Erreur chargement dénominations ${deviseCode}`;
            set({ validationError: message });
            continue;
          }
        }

        const comptageDetails: ComptageDetail[] = denominations.map((d) => ({
          denominationId: d.id,
          deviseCode: d.deviseCode,
          valeur: d.valeur,
          quantite: 0,
          total: 0,
        }));

        comptageDevises.set(deviseCode, {
          deviseCode,
          deviseLibelle: deviseCode,
          totalSaisi: 0,
          denominations: comptageDetails,
        });
      }

      set({
        sessionId,
        quand,
        devisesAutorisees,
        comptageDevises,
        activeDevise: devisesAutorisees[0] || null,
        validationError: null,
        canSubmit: false,
      });
    },

    updateQuantite: (deviseCode, denominationId, quantite) => {
      const { comptageDevises } = get();
      const devise = comptageDevises.get(deviseCode);

      if (!devise) return;

      const updatedDenominations = devise.denominations.map((d) =>
        d.denominationId === denominationId
          ? { ...d, quantite, total: d.valeur * quantite }
          : d
      );

      const totalSaisi = updatedDenominations.reduce(
        (sum, d) => sum + d.total,
        0
      );

      const updatedDevise: DeviseComptage = {
        ...devise,
        denominations: updatedDenominations,
        totalSaisi,
      };

      const newComptageDevises = new Map(comptageDevises);
      newComptageDevises.set(deviseCode, updatedDevise);

      const globalTotal = Array.from(newComptageDevises.values()).reduce(
        (sum, d) => sum + d.totalSaisi,
        0
      );

      const canSubmit =
        globalTotal > 0 || get().devisesAutorisees.length > 0;

      set({
        comptageDevises: newComptageDevises,
        canSubmit,
      });
    },

    switchDevise: (deviseCode) => {
      const { devisesAutorisees } = get();
      if (devisesAutorisees.includes(deviseCode)) {
        set({ activeDevise: deviseCode });
      }
    },

    validateComptage: async () => {
      const { isRealApi } = useDataSourceStore.getState();
      const { comptageDevises, devisesAutorisees } = get();

      set({ isValidating: true, validationError: null });

      const totalCaisse = Array.from(comptageDevises.values()).reduce(
        (sum, d) => sum + d.totalSaisi,
        0
      );
      const nbreDevise = devisesAutorisees.length;
      const fromIms = false;

      const shouldProcess = totalCaisse !== 0 || nbreDevise !== 0 || fromIms;

      if (!shouldProcess) {
        const errorMsg =
          "Validation échouée : totalCaisse = 0, nbreDevise = 0, FROM_IMS = false (RM-001)";
        set({ isValidating: false, validationError: errorMsg });
        throw new Error(errorMsg);
      }

      if (!isRealApi) {
        const mockResult: ValidationResult = {
          totalCaisse,
          totalMonnaie: totalCaisse * 0.5,
          totalProduits: totalCaisse * 0.15,
          totalCartes: totalCaisse * 0.25,
          totalCheques: totalCaisse * 0.07,
          totalOD: totalCaisse * 0.03,
          shouldProcess,
          nbreDevise,
          fromIms,
        };
        set({ validationResult: mockResult, isValidating: false });
        return mockResult;
      }

      try {
        const comptageRecord = Object.fromEntries(comptageDevises);
        const response =
          await apiClient.post<ValidateComptageResponse>(
            "/api/caisse/comptage/validate",
            { comptageDevises: comptageRecord, nbreDevise, fromIms }
          );
        const result = response.data.data;
        if (!result) throw new Error("Pas de résultat de validation");
        set({ validationResult: result });
        return result;
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : "Erreur validation comptage";
        set({ validationError: message, validationResult: null });
        throw e;
      } finally {
        set({ isValidating: false });
      }
    },

    loadRecapMOP: async (sessionId) => {
      const { isRealApi } = useDataSourceStore.getState();

      if (!isRealApi) {
        set({ recapMOP: MOCK_RECAP_MOP });
        return MOCK_RECAP_MOP;
      }

      try {
        const response = await apiClient.get<GetRecapMOPResponse>(
          `/api/caisse/session/${sessionId}/recap-mop`
        );
        const recap = response.data.data ?? [];
        set({ recapMOP: recap });
        return recap;
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : "Erreur chargement récap MOP";
        set({ validationError: message, recapMOP: [] });
        throw e;
      }
    },

    persistComptage: async (sessionId, validationResult) => {
      const { isRealApi } = useDataSourceStore.getState();
      const { comptageDevises, recapMOP } = get();

      set({ isPersisting: true, validationError: null });

      if (!isRealApi) {
        const mockResult: PersistanceResult = {
          success: true,
          ticketUrl: "/api/print/ticket-ouverture-12345.pdf",
          sessionId,
          timestamp: new Date().toISOString(),
        };
        set({ isPersisting: false });
        return mockResult;
      }

      try {
        const comptageRecord = Object.fromEntries(comptageDevises);
        const response =
          await apiClient.post<PersistComptageResponse>(
            "/api/caisse/comptage/persist",
            {
              sessionId,
              validationResult,
              comptageDevises: comptageRecord,
              recapMOP,
            }
          );
        const result = response.data.data;
        if (!result)
          throw new Error("Pas de résultat de persistance");
        return result;
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : "Erreur persistance comptage";
        set({ validationError: message });
        throw e;
      } finally {
        set({ isPersisting: false });
      }
    },

    setValidationError: (error) => {
      set({ validationError: error });
    },

    resetState: () => {
      set({ ...initialState });
    },
  })
);