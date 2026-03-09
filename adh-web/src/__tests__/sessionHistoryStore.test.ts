/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import type { SessionHistoryItem, SessionDetail, SessionCurrency } from "@/types/sessionHistory"
import type { ApiResponse } from "@/services/api/apiClient"
import { useSessionHistoryStore } from "@/stores/sessionHistoryStore"
import { useDataSourceStore } from "@/stores/dataSourceStore"

const mockSessionsData: SessionHistoryItem[] = [
  {
    sessionId: "SES-2024-001",
    openedDate: new Date("2024-01-15"),
    openedTime: "08:30:00",
    closedDate: new Date("2024-01-15"),
    closedTime: "18:45:00",
    operatorId: "OP001",
    status: "CLOSED",
    hasDetails: true,
    title: "Session matinale"
  },
  {
    sessionId: "SES-2024-002",
    openedDate: new Date("2024-01-16"),
    openedTime: "09:15:00",
    closedDate: null,
    closedTime: null,
    operatorId: "OP002",
    status: "OPEN",
    hasDetails: true,
    title: "Session journée"
  }
]

const mockSessionDetail: SessionDetail = {
  sessionId: "SES-2024-001",
  totalAmount: 4567.89,
  hasDetails: true,
  isEndOfHistory: false
}

const mockSessionCurrencies: SessionCurrency[] = [
  {
    sessionId: "SES-2024-001",
    currencyCode: "EUR",
    amount: 4067.89,
    totalAmount: 4567.89,
    isLocalCurrency: true,
    isEndOfHistory: false
  },
  {
    sessionId: "SES-2024-001",
    currencyCode: "USD",
    amount: 500.00,
    totalAmount: 4567.89,
    isLocalCurrency: false,
    isEndOfHistory: false
  }
]

const mockApiClient = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock("@/services/api/apiClient", () => ({
  apiClient: mockApiClient
}))

vi.mock("@/stores/dataSourceStore", () => ({
  useDataSourceStore: {
    getState: vi.fn()
  }
}))

describe("sessionHistoryStore", () => {
  beforeEach(() => {
    useSessionHistoryStore.getState().reset()
    vi.clearAllMocks()
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })
  })

  describe("loadSessions", () => {
    it("should load sessions successfully with mock data", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessions("COMPANY_001")

      const updatedState = useSessionHistoryStore.getState()
      expect(updatedState.isLoading).toBe(false)
      expect(updatedState.error).toBe(null)
      expect(updatedState.sessions.length).toBeGreaterThan(0)
      expect(updatedState.societe).toBe("COMPANY_001")
    })

    it("should apply date range filters correctly", async () => {
      const store = useSessionHistoryStore.getState()
      const startDate = new Date("2024-01-16")
      const endDate = new Date("2024-01-16")

      await store.loadSessions("COMPANY_001", { startDate, endDate })

      const filteredSessions = useSessionHistoryStore.getState().sessions
      filteredSessions.forEach(session => {
        expect(session.openedDate).toEqual(startDate)
      })
    })

    it("should apply status filter correctly", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessions("COMPANY_001", { status: "OPEN" })

      const filteredSessions = useSessionHistoryStore.getState().sessions
      filteredSessions.forEach(session => {
        expect(session.status).toBe("OPEN")
      })
    })

    it("should apply operator filter correctly", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessions("COMPANY_001", { operatorId: "OP001" })

      const filteredSessions = useSessionHistoryStore.getState().sessions
      filteredSessions.forEach(session => {
        expect(session.operatorId).toBe("OP001")
      })
    })

    it("should set loading state correctly during API call", async () => {
      const store = useSessionHistoryStore.getState()

      const loadPromise = store.loadSessions("COMPANY_001")
      
      expect(useSessionHistoryStore.getState().isLoading).toBe(true)
      
      await loadPromise
      
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
    })

    it("should handle API call with real data source", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionHistoryItem[]> = {
        success: true,
        data: mockSessionsData.map(session => ({
          ...session,
          openedDate: session.openedDate.toISOString(),
          closedDate: session.closedDate?.toISOString() || null
        })) as unknown as SessionHistoryItem[],
        message: "Success"
      }
      mockApiClient.get.mockResolvedValue({ data: mockResponse })

      const store = useSessionHistoryStore.getState()

      await store.loadSessions("COMPANY_001")

      expect(mockApiClient.get).toHaveBeenCalledWith("/api/caisse/sessions/history?societe=COMPANY_001")
      expect(useSessionHistoryStore.getState().sessions.length).toBe(2)
    })

    it("should handle API error from real data source", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionHistoryItem[]> = {
        success: false,
        data: null,
        message: "Server error"
      }
      mockApiClient.get.mockResolvedValue({ data: mockResponse })

      const store = useSessionHistoryStore.getState()

      await store.loadSessions("COMPANY_001")

      expect(useSessionHistoryStore.getState().error).toBe("Server error")
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
    })

    it("should handle network error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      mockApiClient.get.mockRejectedValue(new Error("Network error"))

      const store = useSessionHistoryStore.getState()

      await store.loadSessions("COMPANY_001")

      expect(useSessionHistoryStore.getState().error).toBe("Network error")
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
    })
  })

  describe("loadSessionDetails", () => {
    beforeEach(async () => {
      const store = useSessionHistoryStore.getState()
      await store.loadSessions("COMPANY_001")
    })

    it("should load session details successfully with mock data", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessionDetails("SES-2024-001")

      expect(useSessionHistoryStore.getState().selectedSessionDetails).toBeTruthy()
      expect(useSessionHistoryStore.getState().selectedSessionDetails?.sessionId).toBe("SES-2024-001")
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
      expect(useSessionHistoryStore.getState().error).toBe(null)
    })

    it("should handle session not found error", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessionDetails("NON_EXISTENT_SESSION")

      expect(useSessionHistoryStore.getState().error).toBe("Session non trouvée")
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
    })

    it("should handle session without details", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessionDetails("SES-2024-004")

      expect(useSessionHistoryStore.getState().error).toBe("Détails de session non disponibles")
    })

    it("should set loading state correctly during API call", async () => {
      const store = useSessionHistoryStore.getState()

      const loadPromise = store.loadSessionDetails("SES-2024-001")
      
      expect(useSessionHistoryStore.getState().isLoading).toBe(true)
      
      await loadPromise
      
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
    })

    it("should handle API call with real data source", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionDetail> = {
        success: true,
        data: mockSessionDetail,
        message: "Success"
      }
      mockApiClient.get.mockResolvedValue({ data: mockResponse })

      const store = useSessionHistoryStore.getState()

      await store.loadSessionDetails("SES-2024-001")

      expect(mockApiClient.get).toHaveBeenCalledWith("/api/caisse/sessions/history/SES-2024-001/details")
      expect(useSessionHistoryStore.getState().selectedSessionDetails).toEqual(mockSessionDetail)
    })

    it("should handle API error from real data source", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionDetail> = {
        success: false,
        data: null,
        message: "Details not found"
      }
      mockApiClient.get.mockResolvedValue({ data: mockResponse })

      const store = useSessionHistoryStore.getState()

      await store.loadSessionDetails("SES-2024-001")

      expect(useSessionHistoryStore.getState().error).toBe("Details not found")
    })
  })

  describe("loadSessionCurrencies", () => {
    beforeEach(async () => {
      const store = useSessionHistoryStore.getState()
      await store.loadSessions("COMPANY_001")
    })

    it("should load session currencies successfully with mock data", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessionCurrencies("SES-2024-001")

      const currencies = useSessionHistoryStore.getState().selectedSessionCurrencies
      expect(currencies.length).toBeGreaterThan(0)
      expect(currencies[0].sessionId).toBe("SES-2024-001")
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
      expect(useSessionHistoryStore.getState().error).toBe(null)
    })

    it("should handle session not found error", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessionCurrencies("NON_EXISTENT_SESSION")

      expect(useSessionHistoryStore.getState().error).toBe("Session non trouvée")
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
    })

    it("should handle empty currencies list", async () => {
      const store = useSessionHistoryStore.getState()

      await store.loadSessionCurrencies("SES-2024-004")

      expect(useSessionHistoryStore.getState().selectedSessionCurrencies).toEqual([])
      expect(useSessionHistoryStore.getState().error).toBe(null)
    })

    it("should set loading state correctly during API call", async () => {
      const store = useSessionHistoryStore.getState()

      const loadPromise = store.loadSessionCurrencies("SES-2024-001")
      
      expect(useSessionHistoryStore.getState().isLoading).toBe(true)
      
      await loadPromise
      
      expect(useSessionHistoryStore.getState().isLoading).toBe(false)
    })

    it("should handle API call with real data source", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionCurrency[]> = {
        success: true,
        data: mockSessionCurrencies,
        message: "Success"
      }
      mockApiClient.get.mockResolvedValue({ data: mockResponse })

      const store = useSessionHistoryStore.getState()

      await store.loadSessionCurrencies("SES-2024-001")

      expect(mockApiClient.get).toHaveBeenCalledWith("/api/caisse/sessions/history/SES-2024-001/currencies")
      expect(useSessionHistoryStore.getState().selectedSessionCurrencies).toEqual(mockSessionCurrencies)
    })

    it("should handle API error from real data source", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionCurrency[]> = {
        success: false,
        data: null,
        message: "Currencies not found"
      }
      mockApiClient.get.mockResolvedValue({ data: mockResponse })

      const store = useSessionHistoryStore.getState()

      await store.loadSessionCurrencies("SES-2024-001")

      expect(useSessionHistoryStore.getState().error).toBe("Currencies not found")
    })
  })

  describe("setFilters", () => {
    it("should update filters and reload sessions", async () => {
      const store = useSessionHistoryStore.getState()
      await store.loadSessions("COMPANY_001")
      
      const newFilters = {
        startDate: new Date("2024-01-15"),
        status: "CLOSED"
      }

      store.setFilters(newFilters)

      const updatedState = useSessionHistoryStore.getState()
      expect(updatedState.filters.startDate).toEqual(newFilters.startDate)
      expect(updatedState.filters.status).toBe("CLOSED")
    })

    it("should merge filters with existing ones", async () => {
      const store = useSessionHistoryStore.getState()
      await store.loadSessions("COMPANY_001")
      
      store.setFilters({ status: "OPEN" })
      store.setFilters({ operatorId: "OP001" })

      const updatedState = useSessionHistoryStore.getState()
      expect(updatedState.filters.status).toBe("OPEN")
      expect(updatedState.filters.operatorId).toBe("OP001")
    })

    it("should not reload sessions if societe is empty", () => {
      const store = useSessionHistoryStore.getState()
      
      store.setFilters({ status: "OPEN" })

      const updatedState = useSessionHistoryStore.getState()
      expect(updatedState.filters.status).toBe("OPEN")
      expect(updatedState.sessions).toEqual([])
    })
  })

  describe("clearFilters", () => {
    it("should reset all filters to null and reload sessions", async () => {
      const store = useSessionHistoryStore.getState()
      await store.loadSessions("COMPANY_001")
      
      store.setFilters({
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-01-16"),
        status: "CLOSED",
        operatorId: "OP001"
      })

      store.clearFilters()

      const updatedState = useSessionHistoryStore.getState()
      expect(updatedState.filters.startDate).toBe(null)
      expect(updatedState.filters.endDate).toBe(null)
      expect(updatedState.filters.status).toBe(null)
      expect(updatedState.filters.operatorId).toBe(null)
    })

    it("should not reload sessions if societe is empty", () => {
      const store = useSessionHistoryStore.getState()
      
      store.clearFilters()

      const updatedState = useSessionHistoryStore.getState()
      expect(updatedState.sessions).toEqual([])
    })
  })

  describe("reset", () => {
    it("should reset entire store to initial state", async () => {
      const store = useSessionHistoryStore.getState()
      await store.loadSessions("COMPANY_001")
      await store.loadSessionDetails("SES-2024-001")
      store.setFilters({ status: "OPEN" })

      store.reset()

      const resetState = useSessionHistoryStore.getState()
      expect(resetState.sessions).toEqual([])
      expect(resetState.selectedSessionDetails).toBe(null)
      expect(resetState.selectedSessionCurrencies).toEqual([])
      expect(resetState.isLoading).toBe(false)
      expect(resetState.error).toBe(null)
      expect(resetState.societe).toBe("")
      expect(resetState.filters.startDate).toBe(null)
      expect(resetState.filters.endDate).toBe(null)
      expect(resetState.filters.status).toBe(null)
      expect(resetState.filters.operatorId).toBe(null)
      expect(resetState.localCurrencyCode).toBe("EUR")
      expect(resetState.amountMask).toBe("###,###.##")
    })
  })
})