import { describe, it, expect, beforeEach, vi } from "vitest"
import { useHistoryCleanupStore } from "@/stores/historyCleanupStore"
import { apiClient } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import type { ApiResponse } from "@/services/api/apiClient"
import type { 
  HistoFusionSeparationCriteria, 
  DeletionResult,
  DeleteHistoFusionSeparationSaisieResponse
} from "@/types/historyCleanup"

vi.mock("@/services/api/apiClient")
vi.mock("@/stores/dataSourceStore")

const MOCK_CRITERIA: HistoFusionSeparationCriteria = {
  chronoEF: 12345,
  societe: "ACME",
  compteReference: 987654,
  filiationReference: 456789
} as const

const MOCK_DELETION_RESULT: DeletionResult = {
  recordsDeleted: 125,
  success: true,
  timestamp: "2024-01-15T10:30:00Z"
} as const

const MOCK_MINIMAL_CRITERIA: HistoFusionSeparationCriteria = {
  societe: "AB"
} as const

const MOCK_INVALID_CRITERIA: HistoFusionSeparationCriteria = {
  societe: "A"
} as const

describe("historyCleanupStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useHistoryCleanupStore.getState().reset()
  })

  describe("deleteHistoFusionSeparationSaisie with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should delete records successfully with all criteria", async () => {
      const mockResponse: ApiResponse<DeleteHistoFusionSeparationSaisieResponse> = {
        success: true,
        data: {
          success: true,
          data: MOCK_DELETION_RESULT
        }
      }
      vi.mocked(apiClient.delete).mockResolvedValueOnce(mockResponse)

      const initialStore = useHistoryCleanupStore.getState()
      
      expect(initialStore.isLoading).toBe(false)
      
      const resultPromise = initialStore.deleteHistoFusionSeparationSaisie(MOCK_CRITERIA)
      
      const loadingStore = useHistoryCleanupStore.getState()
      expect(loadingStore.isLoading).toBe(true)
      expect(loadingStore.deletionCriteria).toEqual(MOCK_CRITERIA)
      
      const result = await resultPromise
      
      const expectedUrl = "/api/historyCleanup/fusionSeparationSaisie?chronoEF=12345&societe=ACME&compteReference=987654&filiationReference=456789"
      expect(apiClient.delete).toHaveBeenCalledWith(expectedUrl)
      expect(result).toEqual(MOCK_DELETION_RESULT)
      
      const finalStore = useHistoryCleanupStore.getState()
      expect(finalStore.deletionResult).toEqual(MOCK_DELETION_RESULT)
      expect(finalStore.isLoading).toBe(false)
      expect(finalStore.error).toBe(null)
    })

    it("should build URL with partial criteria", async () => {
      const partialCriteria: HistoFusionSeparationCriteria = {
        chronoEF: 12345,
        societe: "ACME"
      }
      
      const mockResponse: ApiResponse<DeleteHistoFusionSeparationSaisieResponse> = {
        success: true,
        data: {
          success: true,
          data: MOCK_DELETION_RESULT
        }
      }
      vi.mocked(apiClient.delete).mockResolvedValueOnce(mockResponse)

      await useHistoryCleanupStore.getState().deleteHistoFusionSeparationSaisie(partialCriteria)
      
      const expectedUrl = "/api/historyCleanup/fusionSeparationSaisie?chronoEF=12345&societe=ACME"
      expect(apiClient.delete).toHaveBeenCalledWith(expectedUrl)
    })

    it("should handle API response failure", async () => {
      const mockResponse: ApiResponse<DeleteHistoFusionSeparationSaisieResponse> = {
        success: true,
        data: {
          success: false,
          data: MOCK_DELETION_RESULT
        }
      }
      vi.mocked(apiClient.delete).mockResolvedValueOnce(mockResponse)

      const store = useHistoryCleanupStore.getState()
      
      await expect(store.deleteHistoFusionSeparationSaisie(MOCK_CRITERIA))
        .rejects.toThrow("Failed to delete fusion separation history records")
      
      const finalStore = useHistoryCleanupStore.getState()
      expect(finalStore.error).toBe("Failed to delete fusion separation history records")
      expect(finalStore.isLoading).toBe(false)
      expect(finalStore.deletionResult).toBe(null)
    })

    it("should handle API network error", async () => {
      const networkError = new Error("Network error")
      vi.mocked(apiClient.delete).mockRejectedValueOnce(networkError)

      const store = useHistoryCleanupStore.getState()
      
      await expect(store.deleteHistoFusionSeparationSaisie(MOCK_CRITERIA))
        .rejects.toThrow("Network error")
      
      const finalStore = useHistoryCleanupStore.getState()
      expect(finalStore.error).toBe("Network error")
      expect(finalStore.isLoading).toBe(false)
      expect(finalStore.deletionResult).toBe(null)
    })
  })

  describe("deleteHistoFusionSeparationSaisie with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should generate mock deletion result", async () => {
      const store = useHistoryCleanupStore.getState()
      
      const result = await store.deleteHistoFusionSeparationSaisie(MOCK_CRITERIA)
      
      expect(apiClient.delete).not.toHaveBeenCalled()
      expect(result).toMatchObject({
        success: true,
        recordsDeleted: expect.any(Number),
        timestamp: expect.any(String)
      })
      expect(result.recordsDeleted).toBeGreaterThanOrEqual(50)
      expect(result.recordsDeleted).toBeLessThan(250)
      expect(new Date(result.timestamp)).toBeInstanceOf(Date)
      
      const finalStore = useHistoryCleanupStore.getState()
      expect(finalStore.deletionResult).toEqual(result)
      expect(finalStore.isLoading).toBe(false)
    })
  })

  describe("validateDeletionCriteria with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should validate criteria successfully", async () => {
      const mockResponse: ApiResponse<{ isValid: boolean }> = {
        success: true,
        data: {
          data: { isValid: true }
        }
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useHistoryCleanupStore.getState()
      
      const isValid = await store.validateDeletionCriteria(MOCK_CRITERIA)
      
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/historyCleanup/validateCriteria",
        { criteria: MOCK_CRITERIA }
      )
      expect(isValid).toBe(true)
      
      const finalStore = useHistoryCleanupStore.getState()
      expect(finalStore.isLoading).toBe(false)
      expect(finalStore.error).toBe(null)
    })

    it("should handle invalid criteria response", async () => {
      const mockResponse: ApiResponse<{ isValid: boolean }> = {
        success: true,
        data: {
          data: { isValid: false }
        }
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const isValid = await useHistoryCleanupStore.getState().validateDeletionCriteria(MOCK_CRITERIA)
      
      expect(isValid).toBe(false)
    })

    it("should handle malformed API response", async () => {
      const mockResponse: ApiResponse<{ isValid: boolean }> = {
        success: true,
        data: undefined as never
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const isValid = await useHistoryCleanupStore.getState().validateDeletionCriteria(MOCK_CRITERIA)
      
      expect(isValid).toBe(false)
    })

    it("should handle validation API error", async () => {
      const validationError = new Error("Validation failed")
      vi.mocked(apiClient.post).mockRejectedValueOnce(validationError)

      const store = useHistoryCleanupStore.getState()
      
      const isValid = await store.validateDeletionCriteria(MOCK_CRITERIA)
      
      expect(isValid).toBe(false)
      
      const finalStore = useHistoryCleanupStore.getState()
      expect(finalStore.error).toBe("Validation failed")
      expect(finalStore.isLoading).toBe(false)
    })
  })

  describe("validateDeletionCriteria with mock validation", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should validate criteria with all fields", async () => {
      const isValid = await useHistoryCleanupStore.getState().validateDeletionCriteria(MOCK_CRITERIA)
      
      expect(apiClient.post).not.toHaveBeenCalled()
      expect(isValid).toBe(true)
    })

    it("should validate minimal valid criteria", async () => {
      const isValid = await useHistoryCleanupStore.getState().validateDeletionCriteria(MOCK_MINIMAL_CRITERIA)
      
      expect(isValid).toBe(true)
    })

    it("should reject criteria with short societe", async () => {
      const isValid = await useHistoryCleanupStore.getState().validateDeletionCriteria(MOCK_INVALID_CRITERIA)
      
      expect(isValid).toBe(false)
    })

    it("should reject empty criteria", async () => {
      const emptyCriteria: HistoFusionSeparationCriteria = {}
      
      const isValid = await useHistoryCleanupStore.getState().validateDeletionCriteria(emptyCriteria)
      
      expect(isValid).toBe(false)
    })

    it("should validate criteria with chronoEF only", async () => {
      const criteriaWithChrono: HistoFusionSeparationCriteria = {
        chronoEF: 12345
      }
      
      const isValid = await useHistoryCleanupStore.getState().validateDeletionCriteria(criteriaWithChrono)
      
      expect(isValid).toBe(true)
    })
  })

  describe("reset", () => {
    it("should reset store to initial state", () => {
      const store = useHistoryCleanupStore.getState()
      
      store.reset()
      
      const resetStore = useHistoryCleanupStore.getState()
      expect(resetStore.isLoading).toBe(false)
      expect(resetStore.error).toBe(null)
      expect(resetStore.deletionCriteria).toBe(null)
      expect(resetStore.deletionResult).toBe(null)
    })
  })
})