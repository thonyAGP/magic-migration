import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAccountMergeStore } from "@/stores/accountMergeStore";
import { useDataSourceStore } from "@/stores/dataSourceStore";
import { apiClient } from "@/services/api/apiClient";
import type { ApiResponse } from "@/services/api/apiClient";
import type {
  MergeHistory,
  Account,
  MergeValidation,
} from "@/types/accountMerge";

vi.mock("@/stores/dataSourceStore");
vi.mock("@/services/api/apiClient");

const MOCK_SOURCE_ACCOUNT: Account = {
  accountNumber: "ACC001",
  balance: 1250.75,
  status: "active",
  createdDate: new Date("2023-06-10"),
};

const MOCK_TARGET_ACCOUNT: Account = {
  accountNumber: "ACC002",
  balance: 3450.20,
  status: "active",
  createdDate: new Date("2022-03-15"),
};

const MOCK_VALIDATION: MergeValidation = {
  isClosureInProgress: false,
  networkStatus: "OK",
  validationStatus: "PASSED",
};

const MOCK_MERGE_HISTORY: MergeHistory = {
  id: 1,
  sourceAccount: "ACC001",
  targetAccount: "ACC002",
  mergeDate: new Date("2024-01-15T10:30:00"),
  operator: "John Doe",
  status: "completed",
};

describe("accountMergeStore", () => {
  beforeEach(() => {
    useAccountMergeStore.getState().reset();
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  describe("validateMergeConditions with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should validate merge conditions successfully", async () => {
      const mockResponse: ApiResponse<MergeValidation> = {
        success: true,
        data: MOCK_VALIDATION,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();

      await store.validateMergeConditions("ACC001", "ACC002");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/api/accountMerge/validation?sourceAccountId=ACC001&targetAccountId=ACC002"
      );
      
      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.validationState).toEqual(MOCK_VALIDATION);
      expect(updatedStore.currentStep).toBe("validated");
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });

    it("should throw error when closure is in progress (RM-002)", async () => {
      const mockValidationClosure: MergeValidation = {
        isClosureInProgress: true,
        networkStatus: "OK",
        validationStatus: "V",
      };

      const mockResponse: ApiResponse<MergeValidation> = {
        success: true,
        data: mockValidationClosure,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

      useAccountMergeStore.setState({ validation: "V" });

      const store = useAccountMergeStore.getState();

      await expect(
        store.validateMergeConditions("ACC001", "ACC002")
      ).rejects.toThrow("Closure in progress, merge not allowed");

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.error).toBe("Closure in progress, merge not allowed");
      expect(updatedStore.isLoading).toBe(false);
    });

    it("should throw error when network is blocked (RM-001)", async () => {
      const mockValidationNetwork: MergeValidation = {
        isClosureInProgress: false,
        networkStatus: "R",
        validationStatus: "PASSED",
      };

      const mockResponse: ApiResponse<MergeValidation> = {
        success: true,
        data: mockValidationNetwork,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

      useAccountMergeStore.setState({ reseau: "R" });

      const store = useAccountMergeStore.getState();

      await expect(
        store.validateMergeConditions("ACC001", "ACC002")
      ).rejects.toThrow("Network blocked, merge not allowed");

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.error).toBe("Network blocked, merge not allowed");
      expect(updatedStore.isLoading).toBe(false);
    });

    it("should handle API failure", async () => {
      const mockResponse: ApiResponse<MergeValidation> = {
        success: false,
        error: "Network error",
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();

      await expect(
        store.validateMergeConditions("ACC001", "ACC002")
      ).rejects.toThrow("Network error");

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.error).toBe("Network error");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("validateMergeConditions with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should validate merge conditions with mock data", async () => {
      const store = useAccountMergeStore.getState();

      await store.validateMergeConditions("ACC001", "ACC002");

      expect(apiClient.get).not.toHaveBeenCalled();
      
      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.validationState).toEqual({
        isClosureInProgress: false,
        networkStatus: "OK",
        validationStatus: "PASSED",
      });
      expect(updatedStore.sourceAccount?.accountNumber).toBe("ACC001");
      expect(updatedStore.targetAccount?.accountNumber).toBe("ACC002");
      expect(updatedStore.currentStep).toBe("validated");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("executeMerge with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should execute merge successfully with progress updates", async () => {
      useAccountMergeStore.setState({
        chronoHisto: "6",
        w0ChronoHisto: null,
        w0CodeLog: null,
        w0RepriseConfirmee: true,
        w0CompteRemplace: false,
        p0RepriseAuto: true,
        p0SansInterface: false,
        globalFlag78: false,
        alwaysActiveFlag: true,
        w0FiliationGarantie: false,
      });

      const mockResponse: ApiResponse<MergeHistory> = {
        success: true,
        data: MOCK_MERGE_HISTORY,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();
      const initialHistoryCount = store.mergeHistories.length;

      await store.executeMerge("ACC001", "ACC002");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/accountMerge/execute",
        {
          sourceAccountId: "ACC001",
          targetAccountId: "ACC002",
        }
      );
      
      const updatedStore = useAccountMergeStore.getState();
      const expectedProgress = 100;
      const expectedHistoryCount = initialHistoryCount + 1;
      
      expect(updatedStore.mergeProgress).toBe(expectedProgress);
      expect(updatedStore.currentStep).toBe("completed");
      expect(updatedStore.mergeHistories.length).toBe(expectedHistoryCount);
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });

    it("should handle API failure during merge", async () => {
      useAccountMergeStore.setState({
        chronoHisto: "6",
        w0ChronoHisto: null,
        w0CodeLog: null,
        w0RepriseConfirmee: true,
        w0CompteRemplace: false,
        p0RepriseAuto: true,
        p0SansInterface: false,
        globalFlag78: false,
        alwaysActiveFlag: true,
        w0FiliationGarantie: false,
      });

      const mockResponse: ApiResponse<MergeHistory> = {
        success: false,
        error: "Merge execution failed",
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();

      await expect(
        store.executeMerge("ACC001", "ACC002")
      ).rejects.toThrow("Merge execution failed");

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.error).toBe("Merge execution failed");
      expect(updatedStore.mergeProgress).toBe(0);
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("executeMerge with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should execute merge with mock data and create history with completed status (RM-008)", async () => {
      useAccountMergeStore.setState({
        chronoHisto: "6",
        w0ChronoHisto: null,
        w0CodeLog: null,
        w0RepriseConfirmee: true,
        w0CompteRemplace: false,
        p0RepriseAuto: true,
        p0SansInterface: false,
        globalFlag78: false,
        alwaysActiveFlag: true,
        w0FiliationGarantie: false,
      });

      const store = useAccountMergeStore.getState();
      const initialHistoryCount = store.mergeHistories.length;

      await store.executeMerge("ACC001", "ACC002");

      expect(apiClient.post).not.toHaveBeenCalled();
      
      const updatedStore = useAccountMergeStore.getState();
      const expectedProgress = 100;
      const expectedHistoryCount = initialHistoryCount + 1;
      
      expect(updatedStore.mergeProgress).toBe(expectedProgress);
      expect(updatedStore.currentStep).toBe("completed");
      expect(updatedStore.mergeHistories.length).toBe(expectedHistoryCount);
      
      const newHistory = updatedStore.mergeHistories[updatedStore.mergeHistories.length - 1];
      expect(newHistory.sourceAccount).toBe("ACC001");
      expect(newHistory.targetAccount).toBe("ACC002");
      expect(newHistory.status).toBe("completed");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("createMergeHistory with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should create merge history successfully", async () => {
      const mockResponse: ApiResponse<MergeHistory> = {
        success: true,
        data: MOCK_MERGE_HISTORY,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();
      const initialHistoryCount = store.mergeHistories.length;

      await store.createMergeHistory("ACC001", "ACC002", "John Doe");

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/accountMerge/history",
        {
          sourceAccount: "ACC001",
          targetAccount: "ACC002",
          operator: "John Doe",
        }
      );
      
      const updatedStore = useAccountMergeStore.getState();
      const expectedHistoryCount = initialHistoryCount + 1;
      
      expect(updatedStore.mergeHistories.length).toBe(expectedHistoryCount);
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });

    it("should handle API failure when creating history", async () => {
      const mockResponse: ApiResponse<MergeHistory> = {
        success: false,
        error: "Failed to create merge history",
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();

      await expect(
        store.createMergeHistory("ACC001", "ACC002", "John Doe")
      ).rejects.toThrow("Failed to create merge history");

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.error).toBe("Failed to create merge history");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("createMergeHistory with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should create merge history with mock data and completed status", async () => {
      const store = useAccountMergeStore.getState();
      const initialHistoryCount = store.mergeHistories.length;

      await store.createMergeHistory("ACC001", "ACC002", "John Doe");

      expect(apiClient.post).not.toHaveBeenCalled();
      
      const updatedStore = useAccountMergeStore.getState();
      const expectedHistoryCount = initialHistoryCount + 1;
      
      expect(updatedStore.mergeHistories.length).toBe(expectedHistoryCount);
      
      const newHistory = updatedStore.mergeHistories[updatedStore.mergeHistories.length - 1];
      expect(newHistory.sourceAccount).toBe("ACC001");
      expect(newHistory.targetAccount).toBe("ACC002");
      expect(newHistory.operator).toBe("John Doe");
      expect(newHistory.status).toBe("completed");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("rollbackMerge with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should rollback merge successfully and update status", async () => {
      const mockResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      useAccountMergeStore.setState({
        mergeHistories: [MOCK_MERGE_HISTORY],
      });

      const store = useAccountMergeStore.getState();

      await store.rollbackMerge(1);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/accountMerge/rollback",
        {
          mergeHistoryId: 1,
        }
      );
      
      const updatedStore = useAccountMergeStore.getState();
      const rolledBackHistory = updatedStore.mergeHistories.find((h) => h.id === 1);
      expect(rolledBackHistory?.status).toBe("rollback");
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });

    it("should handle API failure during rollback", async () => {
      const mockResponse: ApiResponse<void> = {
        success: false,
        error: "Rollback failed",
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();

      await expect(
        store.rollbackMerge(1)
      ).rejects.toThrow("Rollback failed");

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.error).toBe("Rollback failed");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("rollbackMerge with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should rollback merge with mock data and update status", async () => {
      useAccountMergeStore.setState({
        mergeHistories: [MOCK_MERGE_HISTORY],
      });

      const store = useAccountMergeStore.getState();

      await store.rollbackMerge(1);

      expect(apiClient.post).not.toHaveBeenCalled();
      
      const updatedStore = useAccountMergeStore.getState();
      const rolledBackHistory = updatedStore.mergeHistories.find((h) => h.id === 1);
      expect(rolledBackHistory?.status).toBe("rollback");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("printMergeTicket with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should print merge ticket successfully", async () => {
      const mockResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();

      await store.printMergeTicket(1);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/accountMerge/print-ticket",
        {
          mergeHistoryId: 1,
        }
      );
      
      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });

    it("should handle API failure when printing ticket", async () => {
      const mockResponse: ApiResponse<void> = {
        success: false,
        error: "Print ticket failed",
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const store = useAccountMergeStore.getState();

      await expect(
        store.printMergeTicket(1)
      ).rejects.toThrow("Print ticket failed");

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.error).toBe("Print ticket failed");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("printMergeTicket with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it("should print merge ticket with mock data and log details", async () => {
      useAccountMergeStore.setState({
        mergeHistories: [MOCK_MERGE_HISTORY],
      });

      const store = useAccountMergeStore.getState();
      const consoleSpy = vi.spyOn(console, "log");

      await store.printMergeTicket(1);

      expect(apiClient.post).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Printing merge ticket:", {
        id: 1,
        sourceAccount: "ACC001",
        targetAccount: "ACC002",
        mergeDate: MOCK_MERGE_HISTORY.mergeDate,
        operator: "John Doe",
        status: "completed",
      });
      
      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.isLoading).toBe(false);

      consoleSpy.mockRestore();
    });

    it("should throw error when merge history not found", async () => {
      const store = useAccountMergeStore.getState();

      await expect(
        store.printMergeTicket(999)
      ).rejects.toThrow("Merge history not found");

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.error).toBe("Merge history not found");
      expect(updatedStore.isLoading).toBe(false);
    });
  });

  describe("reset", () => {
    it("should reset store to initial state", () => {
      useAccountMergeStore.setState({
        mergeHistories: [MOCK_MERGE_HISTORY],
        sourceAccount: MOCK_SOURCE_ACCOUNT,
        targetAccount: MOCK_TARGET_ACCOUNT,
        validationState: MOCK_VALIDATION,
        isLoading: true,
        error: "Some error",
        mergeProgress: 50,
        currentStep: "updating",
      });

      const store = useAccountMergeStore.getState();
      store.reset();

      const updatedStore = useAccountMergeStore.getState();
      expect(updatedStore.mergeHistories).toEqual([]);
      expect(updatedStore.sourceAccount).toBeNull();
      expect(updatedStore.targetAccount).toBeNull();
      expect(updatedStore.validationState).toBeNull();
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
      expect(updatedStore.mergeProgress).toBe(0);
      expect(updatedStore.currentStep).toBe("validation");
    });
  });
});