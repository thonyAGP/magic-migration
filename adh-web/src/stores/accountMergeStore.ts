import { create } from "zustand";
import type {
  AccountMergeState,
  AccountMergeActions,
  MergeHistory,
  Account,
  MergeValidation,
  ValidateMergeResponse,
  ExecuteMergeResponse,
  RollbackMergeResponse,
  PrintMergeTicketResponse,
} from "@/types/accountMerge";
import { useDataSourceStore } from "@/stores/dataSourceStore";
import { apiClient } from "@/services/api/apiClient";

type AccountMergeStore = AccountMergeState & AccountMergeActions & {
  reset: () => void;
  reseau: string | null;
  chronoHisto: string | null;
  reprise: boolean;
  repriseConfirmee: boolean;
  w0Reprise: boolean;
  w0RepriseConfirmee: boolean;
  w0ChronoHisto: string | null;
  w0CodeLog: string | null;
  w0FiliationGarantie: boolean;
  w0CompteRemplace: boolean;
  p0RepriseAuto: boolean;
  p0SansInterface: boolean;
  globalFlag78: boolean;
  alwaysActiveFlag: boolean;
  validation: string;
  setReseau: (value: string | null) => void;
  setChronoHisto: (value: string | null) => void;
  setReprise: (value: boolean) => void;
  setRepriseConfirmee: (value: boolean) => void;
  setW0Reprise: (value: boolean) => void;
  setW0RepriseConfirmee: (value: boolean) => void;
  setW0ChronoHisto: (value: string | null) => void;
  setW0CodeLog: (value: string | null) => void;
  setW0FiliationGarantie: (value: boolean) => void;
  setW0CompteRemplace: (value: boolean) => void;
  setP0RepriseAuto: (value: boolean) => void;
  setP0SansInterface: (value: boolean) => void;
  setGlobalFlag78: (value: boolean) => void;
  setAlwaysActiveFlag: (value: boolean) => void;
  setValidation: (value: string) => void;
  checkBusinessRule004: () => boolean;
  checkBusinessRule005: () => boolean;
  checkBusinessRule006: () => boolean;
  checkBusinessRule007: () => string;
  checkBusinessRule008: () => boolean;
  checkBusinessRule009: () => boolean;
  checkBusinessRule010: () => boolean;
  checkBusinessRule011: () => boolean;
  checkBusinessRule012: () => boolean;
  checkBusinessRule013: () => boolean;
  validateAllBusinessRules: () => boolean;
  evaluateBusinessRule005: () => boolean;
  evaluateBusinessRule006: () => boolean;
  evaluateBusinessRule007: () => string;
  evaluateBusinessRule008: () => boolean;
  evaluateBusinessRule009: () => boolean;
  evaluateBusinessRule010: () => boolean;
  evaluateBusinessRule011: () => boolean;
  evaluateBusinessRule012: () => boolean;
  evaluateBusinessRule013: () => boolean;
  checkBusinessRules: () => boolean;
  validateNetworkStatus: () => boolean;
  validateClosureBlocking: () => boolean;
};

const mockSourceAccount: Account = {
  accountNumber: "ACC001",
  balance: 1250.75,
  status: "active",
  createdDate: new Date("2023-06-10"),
};

const mockTargetAccount: Account = {
  accountNumber: "ACC002",
  balance: 3450.20,
  status: "active",
  createdDate: new Date("2022-03-15"),
};

const initialState: AccountMergeState & Pick<AccountMergeStore, "reseau" | "chronoHisto" | "reprise" | "repriseConfirmee" | "w0Reprise" | "w0RepriseConfirmee" | "w0ChronoHisto" | "w0CodeLog" | "w0FiliationGarantie" | "w0CompteRemplace" | "p0RepriseAuto" | "p0SansInterface" | "globalFlag78" | "alwaysActiveFlag" | "validation"> = {
  mergeHistories: [],
  sourceAccount: null,
  targetAccount: null,
  validationState: null,
  isLoading: false,
  error: null,
  mergeProgress: 0,
  currentStep: "validation",
  reseau: "OK",
  chronoHisto: "F",
  reprise: false,
  repriseConfirmee: true,
  w0Reprise: false,
  w0RepriseConfirmee: true,
  w0ChronoHisto: "F",
  w0CodeLog: null,
  w0FiliationGarantie: false,
  w0CompteRemplace: false,
  p0RepriseAuto: true,
  p0SansInterface: false,
  globalFlag78: false,
  alwaysActiveFlag: true,
  validation: "N",
};

const handleMergeExecution = async (
  sourceAccountId: string,
  targetAccountId: string,
  state: AccountMergeStore,
  set: (partial: Partial<AccountMergeStore>) => void,
  get: () => AccountMergeStore
) => {
  const currentState = get();
  
  const isFusionCondition = currentState.w0ChronoHisto === "F"; // RM-004
  if (isFusionCondition) {
    console.log("Fusion condition detected, proceeding with standard fusion flow");
  }
  
  const isNonFusion = currentState.w0ChronoHisto !== "F"; // RM-005
  if (isNonFusion) {
    console.warn("Warning: chrono histo is not set to Fusion");
  }

  const logCodeNotExists = !currentState.w0CodeLog; // RM-006
  if (logCodeNotExists) {
    console.log("Code LOG does not exist, proceeding with merge");
  }

  if (currentState.w0FiliationGarantie) {
    const result = currentState.w0RepriseConfirmee ? "DONE" : "RETRY"; // RM-007
    if (result === "RETRY") {
      set({ currentStep: "retry" });
      return;
    }
  }

  const repriseNotConfirmed = !currentState.w0RepriseConfirmee; // RM-008
  if (repriseNotConfirmed) {
    console.warn("Warning: reprise not confirmed");
  }

  const compteNotReplaced = !currentState.w0CompteRemplace; // RM-009
  if (compteNotReplaced) {
    console.log("Account replacement not required");
  }

  const compositeCondition = currentState.chronoHisto === "6" || currentState.p0RepriseAuto; // RM-010
  if (!compositeCondition) {
    console.warn("Warning: invalid chrono condition or auto reprise not set");
  }

  const alwaysActiveCondition = currentState.w0RepriseConfirmee; // RM-011
  if (!alwaysActiveCondition) {
    console.warn("Warning: always active flag condition not met");
  }

  const sansInterfaceBlocked = !currentState.p0SansInterface; // RM-012
  if (!sansInterfaceBlocked) {
    console.warn("Warning: sans interface flag is active");
  }

  const vg78Blocked = !currentState.globalFlag78; // RM-013
  if (!vg78Blocked) {
    console.warn("Warning: global flag VG78 is active");
  }

  if (!state.validateAllBusinessRules()) {
    console.warn("Warning: Business rules validation returned false");
  }

  set({ mergeProgress: 25, currentStep: "transferring" });
  await new Promise((resolve) => setTimeout(resolve, 500));

  set({ mergeProgress: 50, currentStep: "updating" });
  await new Promise((resolve) => setTimeout(resolve, 500));

  set({ mergeProgress: 75, currentStep: "recording" });
  await new Promise((resolve) => setTimeout(resolve, 500));

  const isRealApi = useDataSourceStore.getState().isRealApi;

  if (isRealApi) {
    const response = await apiClient.post<ExecuteMergeResponse>(
      "/api/accountMerge/execute",
      {
        sourceAccountId,
        targetAccountId,
      }
    );

    if (!response.success) {
      throw new Error(response.error || "Merge execution failed");
    }

    set({
      mergeProgress: 100,
      currentStep: "completed",
      isLoading: false,
      mergeHistories: [...state.mergeHistories, response.data],
    });
  } else {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mergeStatus = state.checkBusinessRule007();

    const newHistory: MergeHistory = {
      id: Date.now(),
      sourceAccount: sourceAccountId,
      targetAccount: targetAccountId,
      mergeDate: new Date(),
      operator: "Current User",
      status: (mergeStatus === "DONE" || mergeStatus === "PASSED") ? "completed" : mergeStatus === "RETRY" ? "retry" : "passed",
    };

    set({
      mergeProgress: 100,
      currentStep: "completed",
      isLoading: false,
      mergeHistories: [...state.mergeHistories, newHistory],
    });
  }
};

const handleValidationSuccess = (
  validation: MergeValidation,
  sourceAccountId: string,
  targetAccountId: string,
  set: (partial: Partial<AccountMergeStore>) => void
) => {
  set({
    validationState: validation,
    reseau: validation.networkStatus,
    chronoHisto: "6",
    reprise: false,
    repriseConfirmee: false,
    sourceAccount: { ...mockSourceAccount, accountNumber: sourceAccountId },
    targetAccount: { ...mockTargetAccount, accountNumber: targetAccountId },
    currentStep: "validated",
    isLoading: false,
  });
};

export const useAccountMergeStore = create<AccountMergeStore>((set, get) => ({
  ...initialState,

  checkBusinessRule004: () => {
    const state = get();
    return state.w0ChronoHisto === "F"; // RM-004
  },

  checkBusinessRule005: () => {
    const state = get();
    return state.w0ChronoHisto !== "F"; // RM-005
  },

  checkBusinessRule006: () => {
    const state = get();
    return !state.w0CodeLog; // RM-006
  },

  checkBusinessRule007: () => {
    const state = get();
    if (state.w0FiliationGarantie) {
      return state.w0RepriseConfirmee ? "DONE" : "RETRY"; // RM-007
    }
    return "PASSED";
  },

  checkBusinessRule008: () => {
    const state = get();
    return !state.w0RepriseConfirmee; // RM-008
  },

  checkBusinessRule009: () => {
    const state = get();
    return !state.w0CompteRemplace; // RM-009
  },

  checkBusinessRule010: () => {
    const state = get();
    return state.chronoHisto === "6" || state.p0RepriseAuto; // RM-010
  },

  checkBusinessRule011: () => {
    const state = get();
    return state.w0RepriseConfirmee; // RM-011
  },

  checkBusinessRule012: () => {
    const state = get();
    return !state.p0SansInterface; // RM-012
  },

  checkBusinessRule013: () => {
    const state = get();
    return !state.globalFlag78; // RM-013
  },

  evaluateBusinessRule005: () => {
    const state = get();
    return state.w0ChronoHisto !== "F"; // RM-005
  },

  evaluateBusinessRule006: () => {
    const state = get();
    return !state.w0CodeLog; // RM-006
  },

  evaluateBusinessRule007: () => {
    const state = get();
    if (state.w0FiliationGarantie) {
      return state.w0RepriseConfirmee ? "DONE" : "RETRY"; // RM-007
    }
    return "PASSED";
  },

  evaluateBusinessRule008: () => {
    const state = get();
    return !state.w0RepriseConfirmee; // RM-008
  },

  evaluateBusinessRule009: () => {
    const state = get();
    return !state.w0CompteRemplace; // RM-009
  },

  evaluateBusinessRule010: () => {
    const state = get();
    return state.chronoHisto === "6" || state.p0RepriseAuto; // RM-010
  },

  evaluateBusinessRule011: () => {
    const state = get();
    return state.w0RepriseConfirmee; // RM-011
  },

  evaluateBusinessRule012: () => {
    const state = get();
    return !state.p0SansInterface; // RM-012
  },

  evaluateBusinessRule013: () => {
    const state = get();
    return !state.globalFlag78; // RM-013
  },

  checkBusinessRules: () => {
    const state = get();
    const rule005Result = state.w0ChronoHisto !== "F"; // RM-005
    const rule006Result = !state.w0CodeLog; // RM-006
    const rule008Result = !state.w0RepriseConfirmee; // RM-008
    const rule009Result = !state.w0CompteRemplace; // RM-009
    const rule010Result = state.chronoHisto === "6" || state.p0RepriseAuto; // RM-010
    const rule011Result = state.w0RepriseConfirmee; // RM-011
    const rule012Result = !state.p0SansInterface; // RM-012
    const rule013Result = !state.globalFlag78; // RM-013
    
    return rule005Result && rule006Result && rule008Result && rule009Result && rule010Result && rule011Result && rule012Result && rule013Result;
  },

  validateNetworkStatus: () => {
    const state = get();
    return state.reseau !== "R"; // RM-001
  },

  validateClosureBlocking: () => {
    const state = get();
    const validationNotV = state.validation !== "V"; // RM-003
    const validationIsV = state.validation === "V"; // RM-002
    return validationNotV && !validationIsV;
  },

  validateAllBusinessRules: () => {
    const state = get();
    const rule005 = state.w0ChronoHisto !== "F"; // RM-005
    const rule006 = !state.w0CodeLog; // RM-006
    const rule008 = !state.w0RepriseConfirmee; // RM-008
    const rule009 = !state.w0CompteRemplace; // RM-009
    const rule010 = state.chronoHisto === "6" || state.p0RepriseAuto; // RM-010
    const rule011 = state.w0RepriseConfirmee; // RM-011
    const rule012 = !state.p0SansInterface; // RM-012
    const rule013 = !state.globalFlag78; // RM-013
    
    return rule005 && rule006 && rule008 && rule009 && rule010 && rule011 && rule012 && rule013;
  },

  validateMergeConditions: async (sourceAccountId: string, targetAccountId: string) => {
    set({ isLoading: true, error: null });

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi;
      const state = get();

      if (isRealApi) {
        const response = await apiClient.get<ValidateMergeResponse>(
          `/api/accountMerge/validation?sourceAccountId=${sourceAccountId}&targetAccountId=${targetAccountId}`
        );

        if (!response.success) {
          throw new Error(response.error || "Validation failed");
        }

        const validation = response.data;

        if (state.validation === "V") { // RM-002
          throw new Error("Closure in progress, merge not allowed");
        }

        if (state.validation !== "V") { // RM-003
          if (state.reseau !== "R") { // RM-001
            handleValidationSuccess(validation, sourceAccountId, targetAccountId, set);
          } else {
            throw new Error("Network blocked, merge not allowed");
          }
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockValidationState = {
          isClosureInProgress: false,
          networkStatus: "OK",
          validationStatus: "PASSED",
        };

        if (state.validation === "V") { // RM-002
          throw new Error("Closure in progress, merge not allowed");
        }

        if (state.validation !== "V") { // RM-003
          if (state.reseau !== "R") { // RM-001
            handleValidationSuccess(mockValidationState, sourceAccountId, targetAccountId, set);
          } else {
            throw new Error("Network blocked, merge not allowed");
          }
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      set({ error: errorMessage, isLoading: false });
      throw e;
    }
  },

  executeMerge: async (sourceAccountId: string, targetAccountId: string) => {
    set({ isLoading: true, error: null, mergeProgress: 0 });

    try {
      const state = get();
      await handleMergeExecution(sourceAccountId, targetAccountId, state, set, get);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      set({ error: errorMessage, isLoading: false, mergeProgress: 0 });
      throw e;
    }
  },

  createMergeHistory: async (sourceAccount: string, targetAccount: string, operator: string) => {
    set({ isLoading: true, error: null });

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi;
      const state = get();

      if (isRealApi) {
        const response = await apiClient.post<ExecuteMergeResponse>(
          "/api/accountMerge/history",
          {
            sourceAccount,
            targetAccount,
            operator,
          }
        );

        if (!response.success) {
          throw new Error(response.error || "Failed to create merge history");
        }

        set({
          mergeHistories: [...state.mergeHistories, response.data],
          isLoading: false,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newHistory: MergeHistory = {
          id: Date.now(),
          sourceAccount,
          targetAccount,
          mergeDate: new Date(),
          operator,
          status: "completed",
        };

        set({
          mergeHistories: [...state.mergeHistories, newHistory],
          isLoading: false,
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      set({ error: errorMessage, isLoading: false });
      throw e;
    }
  },

  rollbackMerge: async (mergeHistoryId: number) => {
    set({ isLoading: true, error: null });

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi;
      const state = get();

      if (isRealApi) {
        const response = await apiClient.post<RollbackMergeResponse>(
          "/api/accountMerge/rollback",
          {
            mergeHistoryId,
          }
        );

        if (!response.success) {
          throw new Error(response.error || "Rollback failed");
        }

        set({
          mergeHistories: state.mergeHistories.map((h) =>
            h.id === mergeHistoryId ? { ...h, status: "rollback" } : h
          ),
          isLoading: false,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        set({
          mergeHistories: state.mergeHistories.map((h) =>
            h.id === mergeHistoryId ? { ...h, status: "rollback" } : h
          ),
          isLoading: false,
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      set({ error: errorMessage, isLoading: false });
      throw e;
    }
  },

  printMergeTicket: async (mergeHistoryId: number) => {
    set({ isLoading: true, error: null });

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi;
      const state = get();

      if (isRealApi) {
        const response = await apiClient.post<PrintMergeTicketResponse>(
          "/api/accountMerge/print-ticket",
          {
            mergeHistoryId,
          }
        );

        if (!response.success) {
          throw new Error(response.error || "Print ticket failed");
        }

        set({ isLoading: false });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const history = state.mergeHistories.find((h) => h.id === mergeHistoryId);

        if (!history) {
          throw new Error("Merge history not found");
        }

        console.log("Printing merge ticket:", {
          id: history.id,
          sourceAccount: history.sourceAccount,
          targetAccount: history.targetAccount,
          mergeDate: history.mergeDate,
          operator: history.operator,
          status: history.status,
        });

        set({ isLoading: false });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      set({ error: errorMessage, isLoading: false });
      throw e;
    }
  },

  setReseau: (value: string | null) => {
    set({ reseau: value });
  },

  setChronoHisto: (value: string | null) => {
    set({ chronoHisto: value });
  },

  setReprise: (value: boolean) => {
    set({ reprise: value });
  },

  setRepriseConfirmee: (value: boolean) => {
    set({ repriseConfirmee: value });
  },

  setW0Reprise: (value: boolean) => {
    set({ w0Reprise: value });
  },

  setW0RepriseConfirmee: (value: boolean) => {
    set({ w0RepriseConfirmee: value });
  },

  setW0ChronoHisto: (value: string | null) => {
    set({ w0ChronoHisto: value });
  },

  setW0CodeLog: (value: string | null) => {
    set({ w0CodeLog: value });
  },

  setW0FiliationGarantie: (value: boolean) => {
    set({ w0FiliationGarantie: value });
  },

  setW0CompteRemplace: (value: boolean) => {
    set({ w0CompteRemplace: value });
  },

  setP0RepriseAuto: (value: boolean) => {
    set({ p0RepriseAuto: value });
  },

  setP0SansInterface: (value: boolean) => {
    set({ p0SansInterface: value });
  },

  setGlobalFlag78: (value: boolean) => {
    set({ globalFlag78: value });
  },

  setAlwaysActiveFlag: (value: boolean) => {
    set({ alwaysActiveFlag: value });
  },

  setValidation: (value: string) => {
    set({ validation: value });
  },

  reset: () => {
    set(initialState);
  },
}));