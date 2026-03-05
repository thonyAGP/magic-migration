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
  chronoHisto: number | null;
  reprise: boolean;
  repriseConfirmee: boolean;
  setReseau: (value: string | null) => void;
  setChronoHisto: (value: number | null) => void;
  setReprise: (value: boolean) => void;
  setRepriseConfirmee: (value: boolean) => void;
};

const mockMergeHistories: MergeHistory[] = [
  {
    id: 1,
    sourceAccount: "ACC001",
    targetAccount: "ACC002",
    mergeDate: new Date("2024-01-15T10:30:00"),
    operator: "John Doe",
    status: "completed",
  },
  {
    id: 2,
    sourceAccount: "ACC003",
    targetAccount: "ACC004",
    mergeDate: new Date("2024-01-16T14:20:00"),
    operator: "Jane Smith",
    status: "in-progress",
  },
  {
    id: 3,
    sourceAccount: "ACC005",
    targetAccount: "ACC006",
    mergeDate: new Date("2024-01-17T09:15:00"),
    operator: "Mike Johnson",
    status: "failed",
  },
  {
    id: 4,
    sourceAccount: "ACC007",
    targetAccount: "ACC008",
    mergeDate: new Date("2024-01-18T16:45:00"),
    operator: "Sarah Wilson",
    status: "completed",
  },
  {
    id: 5,
    sourceAccount: "ACC009",
    targetAccount: "ACC010",
    mergeDate: new Date("2024-01-19T11:00:00"),
    operator: "David Brown",
    status: "rollback",
  },
];

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

const mockValidation: MergeValidation = {
  isClosureInProgress: false,
  networkStatus: "OK",
  validationStatus: "PASSED",
};

const initialState: AccountMergeState & Pick<AccountMergeStore, "reseau" | "chronoHisto" | "reprise" | "repriseConfirmee"> = {
  mergeHistories: [],
  sourceAccount: null,
  targetAccount: null,
  validationState: null,
  isLoading: false,
  error: null,
  mergeProgress: 0,
  currentStep: "validation",
  reseau: null,
  chronoHisto: null,
  reprise: false,
  repriseConfirmee: false,
};

const handleMergeExecution = async (
  sourceAccountId: string,
  targetAccountId: string,
  state: AccountMergeStore,
  set: (partial: Partial<AccountMergeStore>) => void,
  get: () => AccountMergeStore
) => {
  const chronoValue = state.chronoHisto ?? 6;
  const repriseAuto = state.reprise;
  const sansInterface = false;
  const globalFlag78 = false;
  const logCodeExists = false;
  const repriseConfirmed = state.repriseConfirmee;
  const compteRemplace = false;
  const filiationGarantie = true;

  if (state.currentStep === "F") { 
    throw new Error("Merge already finalized"); // RM-004
  }

  if (state.currentStep !== "F") { // RM-005
    if (!logCodeExists) { // RM-006
      if (chronoValue === 6 || repriseAuto) { // RM-010
        if (!sansInterface) { // RM-012
          if (!globalFlag78) { // RM-013
            if (repriseConfirmed) { // RM-011
              if (!compteRemplace) { // RM-009
                if (filiationGarantie) { // RM-007
                  const mergeStatus = repriseConfirmed ? "PASSED" : "RETRY"; // RM-008

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

                    const newHistory: MergeHistory = {
                      id: Date.now(),
                      sourceAccount: sourceAccountId,
                      targetAccount: targetAccountId,
                      mergeDate: new Date(),
                      operator: "Current User",
                      status: mergeStatus,
                    };

                    set({
                      mergeProgress: 100,
                      currentStep: "completed",
                      isLoading: false,
                      mergeHistories: [...state.mergeHistories, newHistory],
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
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
    chronoHisto: 6,
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

  validateMergeConditions: async (sourceAccountId: string, targetAccountId: string) => {
    set({ isLoading: true, error: null });

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi;

      if (isRealApi) {
        const response = await apiClient.get<ValidateMergeResponse>(
          `/api/accountMerge/validation?sourceAccountId=${sourceAccountId}&targetAccountId=${targetAccountId}`
        );

        if (!response.success) {
          throw new Error(response.error || "Validation failed");
        }

        const validation = response.data;

        if (validation.validationStatus === "V") { 
          throw new Error("Closure in progress, merge not allowed"); // RM-002
        }

        if (validation.validationStatus !== "V") { // RM-003
          if (validation.networkStatus !== "R") { // RM-001
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

        if (mockValidationState.validationStatus === "V") { 
          throw new Error("Closure in progress, merge not allowed"); // RM-002
        }

        if (mockValidationState.validationStatus !== "V") { // RM-003
          if (mockValidationState.networkStatus !== "R") { // RM-001
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

  setChronoHisto: (value: number | null) => {
    set({ chronoHisto: value });
  },

  setReprise: (value: boolean) => {
    set({ reprise: value });
  },

  setRepriseConfirmee: (value: boolean) => {
    set({ repriseConfirmee: value });
  },

  reset: () => {
    set(initialState);
  },
}));