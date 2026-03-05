import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { useFusionSeparationHistoryStore } from "@/stores/fusionSeparationHistoryStore"
import type { FusionSeparationHistoryEntry } from "@/types/fusionSeparationHistory"

vi.mock("@/services/api/apiClient")
vi.mock("@/stores/dataSourceStore")

const MOCK_ENTRY_1: FusionSeparationHistoryEntry = {
  chronoEF: 1001,
  societe: "ACME Corp",
  compteReference: 12345,
  filiationReference: 1,
  comptePointeOld: 98765,
  filiationPointeOld: 2,
  comptePointeNew: 11111,
  filiationPointeNew: 3,
  typeEF: "FUSION",
  nom: "Dupont",
  prenom: "Jean"
}

const MOCK_ENTRY_2: FusionSeparationHistoryEntry = {
  chronoEF: 1002,
  societe: "TechSoft Ltd",
  compteReference: 67890,
  filiationReference: 4,
  comptePointeOld: 22222,
  filiationPointeOld: 5,
  comptePointeNew: 33333,
  filiationPointeNew: 6,
  typeEF: "SEPARATION",
  nom: "Martin",
  prenom: "Marie"
}

const MOCK_ENTRY_3: FusionSeparationHistoryEntry = {
  chronoEF: 1003,
  societe: "Global Solutions",
  compteReference: 24680,
  filiationReference: 7,
  comptePointeOld: 44444,
  filiationPointeOld: 8,
  comptePointeNew: 55555,
  filiationPointeNew: 9,
  typeEF: "FUSION",
  nom: "Bernard",
  prenom: "Pierre"
}

const MOCK_ENTRY_4: FusionSeparationHistoryEntry = {
  chronoEF: 1004,
  societe: "Another Corp",
  compteReference: 99999,
  filiationReference: 10,
  comptePointeOld: 66666,
  filiationPointeOld: 11,
  comptePointeNew: 77777,
  filiationPointeNew: 12,
  typeEF: "SEPARATION",
  nom: "Test",
  prenom: "User"
}

const MOCK_HISTORY_ENTRIES: FusionSeparationHistoryEntry[] = [
  MOCK_ENTRY_1,
  MOCK_ENTRY_2,
  MOCK_ENTRY_3,
  MOCK_ENTRY_4
]

describe("fusionSeparationHistoryStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFusionSeparationHistoryStore.setState({
      historyEntries: [],
      isLoading: false,
      error: null,
      currentEntry: null
    })
  })

  describe("writeHistoryEntry with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      })
    })

    it("should write history entry successfully", async () => {
      const mockResponse: ApiResponse<void> = {
        success: true,
        data: undefined
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      await useFusionSeparationHistoryStore.getState().writeHistoryEntry(MOCK_ENTRY_1)

      const state = useFusionSeparationHistoryStore.getState()
      expect(apiClient.post).toHaveBeenCalledWith("/api/histo-fusionseparation-saisie", { entry: MOCK_ENTRY_1 })
      expect(state.historyEntries).toEqual([MOCK_ENTRY_1])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should handle API error", async () => {
      const errorMessage = "API write failed"
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error(errorMessage))

      await expect(useFusionSeparationHistoryStore.getState().writeHistoryEntry(MOCK_ENTRY_1)).rejects.toThrow(errorMessage)
      
      const state = useFusionSeparationHistoryStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
      expect(state.historyEntries).toEqual([])
    })

    it("should set loading state during API call", async () => {
      let resolvePromise: (value: ApiResponse<void>) => void
      const pendingPromise = new Promise<ApiResponse<void>>((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(apiClient.post).mockReturnValueOnce(pendingPromise)

      const writePromise = useFusionSeparationHistoryStore.getState().writeHistoryEntry(MOCK_ENTRY_1)

      expect(useFusionSeparationHistoryStore.getState().isLoading).toBe(true)
      expect(useFusionSeparationHistoryStore.getState().error).toBeNull()

      resolvePromise!({ success: true, data: undefined })
      await writePromise

      expect(useFusionSeparationHistoryStore.getState().isLoading).toBe(false)
    })
  })

  describe("loadHistoryEntries with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      })
    })

    it("should load history entries successfully", async () => {
      const mockResponse: ApiResponse<FusionSeparationHistoryEntry[]> = {
        success: true,
        data: MOCK_HISTORY_ENTRIES.slice(0, 3)
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      await useFusionSeparationHistoryStore.getState().loadHistoryEntries()

      const state = useFusionSeparationHistoryStore.getState()
      expect(apiClient.get).toHaveBeenCalledWith("/api/histo-fusionseparation-saisie", { params: undefined })
      expect(state.historyEntries).toEqual(MOCK_HISTORY_ENTRIES.slice(0, 3))
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should load history entries with filters", async () => {
      const filters = { societe: "ACME", compteReference: 12345, typeEF: "FUSION" }
      const filteredEntries = [MOCK_ENTRY_1]
      
      const mockResponse: ApiResponse<FusionSeparationHistoryEntry[]> = {
        success: true,
        data: filteredEntries
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      await useFusionSeparationHistoryStore.getState().loadHistoryEntries(filters)

      const state = useFusionSeparationHistoryStore.getState()
      expect(apiClient.get).toHaveBeenCalledWith("/api/histo-fusionseparation-saisie", { params: filters })
      expect(state.historyEntries).toEqual(filteredEntries)
    })

    it("should handle API error", async () => {
      const errorMessage = "API load failed"
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage))

      await expect(useFusionSeparationHistoryStore.getState().loadHistoryEntries()).rejects.toThrow(errorMessage)
      
      const state = useFusionSeparationHistoryStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(errorMessage)
      expect(state.historyEntries).toEqual([])
    })
  })

  describe("loadHistoryEntries with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      })
    })

    it("should load all entries without filters", async () => {
      await useFusionSeparationHistoryStore.getState().loadHistoryEntries()

      const state = useFusionSeparationHistoryStore.getState()
      expect(apiClient.get).not.toHaveBeenCalled()
      expect(state.historyEntries.length).toBe(3)
      expect(state.isLoading).toBe(false)
    })

    it("should filter by societe", async () => {
      const filters = { societe: "acme" }

      await useFusionSeparationHistoryStore.getState().loadHistoryEntries(filters)

      const state = useFusionSeparationHistoryStore.getState()
      expect(state.historyEntries).toEqual([MOCK_ENTRY_1])
    })

    it("should filter by compteReference", async () => {
      const filters = { compteReference: MOCK_ENTRY_2.compteReference }
      const expectedEntries = MOCK_HISTORY_ENTRIES.filter(entry => 
        entry.compteReference === MOCK_ENTRY_2.compteReference
      )

      await useFusionSeparationHistoryStore.getState().loadHistoryEntries(filters)

      const state = useFusionSeparationHistoryStore.getState()
      expect(state.historyEntries).toEqual(expectedEntries)
    })

    it("should filter by typeEF", async () => {
      const filters = { typeEF: "FUSION" }

      await useFusionSeparationHistoryStore.getState().loadHistoryEntries(filters)

      const state = useFusionSeparationHistoryStore.getState()
      expect(state.historyEntries).toEqual([MOCK_ENTRY_1, MOCK_ENTRY_3])
    })

    it("should apply multiple filters", async () => {
      const filters = { typeEF: "FUSION", societe: "global" }
      const expectedEntries = MOCK_HISTORY_ENTRIES.filter(entry => 
        entry.typeEF === "FUSION" && 
        entry.societe.toLowerCase().includes("global")
      )

      await useFusionSeparationHistoryStore.getState().loadHistoryEntries(filters)

      const state = useFusionSeparationHistoryStore.getState()
      expect(state.historyEntries).toEqual(expectedEntries)
    })

    it("should return empty array when no matches", async () => {
      const filters = { societe: "nonexistent" }

      await useFusionSeparationHistoryStore.getState().loadHistoryEntries(filters)

      const state = useFusionSeparationHistoryStore.getState()
      expect(state.historyEntries).toEqual([])
    })
  })

  describe("formatFullName", () => {
    it("should concatenate trimmed nom and prenom", () => {
      const store = useFusionSeparationHistoryStore.getState()
      
      const result = store.formatFullName("Dupont", "Jean")
      
      expect(result).toBe("Dupont Jean")
    })

    it("should handle strings with whitespace", () => {
      const store = useFusionSeparationHistoryStore.getState()
      
      const result = store.formatFullName("  Dupont  ", "  Jean  ")
      
      expect(result).toBe("Dupont Jean")
    })

    it("should handle empty strings", () => {
      const store = useFusionSeparationHistoryStore.getState()
      
      const result = store.formatFullName("", "")
      
      expect(result).toBe(" ")
    })
  })

  describe("setCurrentEntry", () => {
    it("should set the current entry", () => {
      useFusionSeparationHistoryStore.getState().setCurrentEntry(MOCK_ENTRY_1)
      
      const state = useFusionSeparationHistoryStore.getState()
      expect(state.currentEntry).toEqual(MOCK_ENTRY_1)
    })

    it("should replace existing current entry", () => {
      useFusionSeparationHistoryStore.getState().setCurrentEntry(MOCK_ENTRY_1)
      useFusionSeparationHistoryStore.getState().setCurrentEntry(MOCK_ENTRY_2)
      
      const state = useFusionSeparationHistoryStore.getState()
      expect(state.currentEntry).toEqual(MOCK_ENTRY_2)
    })
  })

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      useFusionSeparationHistoryStore.setState({
        historyEntries: MOCK_HISTORY_ENTRIES,
        isLoading: true,
        error: "Some error",
        currentEntry: MOCK_ENTRY_1
      })
      
      useFusionSeparationHistoryStore.getState().reset()
      
      const state = useFusionSeparationHistoryStore.getState()
      expect(state.historyEntries).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.currentEntry).toBeNull()
    })
  })

  describe("writeHistoryEntry with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      })
    })

    it("should write history entry with mock delay", async () => {
      const startTime = Date.now()
      await useFusionSeparationHistoryStore.getState().writeHistoryEntry(MOCK_ENTRY_1)
      const endTime = Date.now()

      expect(endTime - startTime).toBeGreaterThanOrEqual(490)
      expect(apiClient.post).not.toHaveBeenCalled()
      
      const state = useFusionSeparationHistoryStore.getState()
      expect(state.historyEntries).toEqual([MOCK_ENTRY_1])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe("addToHistoryEntries", () => {
    it("should add entry to existing entries in writeHistoryEntry", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      })

      useFusionSeparationHistoryStore.setState({
        historyEntries: [MOCK_ENTRY_1]
      })
      
      await useFusionSeparationHistoryStore.getState().writeHistoryEntry(MOCK_ENTRY_2)
      
      const state = useFusionSeparationHistoryStore.getState()
      const expectedEntries = [MOCK_ENTRY_1, MOCK_ENTRY_2]
      expect(state.historyEntries).toEqual(expectedEntries)
    })
  })
})