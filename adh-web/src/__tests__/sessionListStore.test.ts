/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest"
import type { ApiResponse } from "@/services/api/apiClient"
import type { Session, SessionFilter } from "@/types/sessionList"
import { useSessionListStore } from "@/stores/sessionListStore"
import { useDataSourceStore } from "@/stores/dataSourceStore"

const MOCK_SESSIONS: Session[] = [
  {
    id: 1,
    societe: "SARL MARTIN",
    caisse: "CAISSE01",
    operateur: "DUPONT",
    dateOuverture: new Date("2024-01-15T08:30:00"),
    etat: "O",
    montantOuverture: 150.00
  },
  {
    id: 2,
    societe: "SARL MARTIN",
    caisse: "CAISSE02",
    operateur: "BERNARD",
    dateOuverture: new Date("2024-01-15T09:00:00"),
    etat: "",
    montantOuverture: 200.00
  },
  {
    id: 3,
    societe: "SAS TECHNOLOGIES",
    caisse: "CAISSE01",
    operateur: "LEFEBVRE",
    dateOuverture: new Date("2024-01-14T14:15:00"),
    etat: "F",
    montantOuverture: null
  },
  {
    id: 4,
    societe: "SAS TECHNOLOGIES",
    caisse: "CAISSE03",
    operateur: "MOREAU",
    dateOuverture: new Date("2024-01-15T07:45:00"),
    etat: "O",
    montantOuverture: 100.00
  }
]

const DEFAULT_FILTERS: SessionFilter = {
  existeSession: true,
  existeSessionOuverte: true,
  societe: null,
  deviseLocale: null
}

vi.mock("@/services/api/apiClient", () => ({
  apiClient: {
    get: vi.fn()
  }
}))

vi.mock("@/stores/dataSourceStore", () => ({
  useDataSourceStore: {
    getState: vi.fn()
  }
}))

describe("sessionListStore", () => {
  beforeEach(() => {
    useSessionListStore.getState().reset()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("fetchSessions", () => {
    it("should fetch sessions successfully with real API", async () => {
      const mockResponse: ApiResponse<Session[]> = {
        success: true,
        data: MOCK_SESSIONS.map(session => ({
          ...session,
          dateOuverture: session.dateOuverture.toISOString()
        })) as unknown as Session[],
        message: ""
      }

      const mockGet = vi.fn().mockResolvedValue({ data: mockResponse })
      const { apiClient } = await import("@/services/api/apiClient")
      vi.mocked(apiClient.get).mockImplementation(mockGet)
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })

      const store = useSessionListStore.getState()
      
      await store.fetchSessions(DEFAULT_FILTERS)

      const finalState = useSessionListStore.getState()
      expect(finalState.isLoading).toBe(false)
      expect(finalState.sessions).toHaveLength(4)
      expect(finalState.sessions[0].dateOuverture).toBeInstanceOf(Date)
      expect(mockGet).toHaveBeenCalledWith("/api/sessions/list", {
        params: {
          existeSession: true,
          existeSessionOuverte: true
        }
      })
    })

    it("should fetch sessions with societe filter in real API", async () => {
      const mockResponse: ApiResponse<Session[]> = {
        success: true,
        data: [],
        message: ""
      }

      const mockGet = vi.fn().mockResolvedValue({ data: mockResponse })
      const { apiClient } = await import("@/services/api/apiClient")
      vi.mocked(apiClient.get).mockImplementation(mockGet)
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })

      const filtersWithSociete: SessionFilter = {
        ...DEFAULT_FILTERS,
        societe: "SARL MARTIN",
        deviseLocale: "EUR"
      }

      await useSessionListStore.getState().fetchSessions(filtersWithSociete)

      expect(mockGet).toHaveBeenCalledWith("/api/sessions/list", {
        params: {
          existeSession: true,
          existeSessionOuverte: true,
          societe: "SARL MARTIN",
          deviseLocale: "EUR"
        }
      })
    })

    it("should handle API error", async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error("API Error"))
      const { apiClient } = await import("@/services/api/apiClient")
      vi.mocked(apiClient.get).mockImplementation(mockGet)
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })

      await useSessionListStore.getState().fetchSessions(DEFAULT_FILTERS)

      const finalState = useSessionListStore.getState()
      expect(finalState.isLoading).toBe(false)
      expect(finalState.error).toBe("API Error")
      expect(finalState.sessions).toHaveLength(0)
    })

    it("should handle unsuccessful API response", async () => {
      const mockResponse: ApiResponse<Session[]> = {
        success: false,
        data: null,
        message: "Service unavailable"
      }

      const mockGet = vi.fn().mockResolvedValue({ data: mockResponse })
      const { apiClient } = await import("@/services/api/apiClient")
      vi.mocked(apiClient.get).mockImplementation(mockGet)
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })

      await useSessionListStore.getState().fetchSessions(DEFAULT_FILTERS)

      const finalState = useSessionListStore.getState()
      expect(finalState.error).toBe("Service unavailable")
      expect(finalState.sessions).toHaveLength(0)
    })

    it("should apply RM-003 and RM-004: filter sessions when existeSession is false", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const filters: SessionFilter = {
        ...DEFAULT_FILTERS,
        existeSession: false
      }

      const promise = useSessionListStore.getState().fetchSessions(filters)
      vi.advanceTimersByTime(800)
      await promise

      const finalState = useSessionListStore.getState()
      expect(finalState.sessions).toHaveLength(0)
    })

    it("should apply RM-003 and RM-004: filter sessions when existeSessionOuverte is false", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const filters: SessionFilter = {
        ...DEFAULT_FILTERS,
        existeSessionOuverte: false
      }

      const promise = useSessionListStore.getState().fetchSessions(filters)
      vi.advanceTimersByTime(800)
      await promise

      const finalState = useSessionListStore.getState()
      expect(finalState.sessions).toHaveLength(0)
    })

    it("should apply RM-001 and RM-002: filter sessions by etat (empty string or 'O')", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const promise = useSessionListStore.getState().fetchSessions(DEFAULT_FILTERS)
      vi.advanceTimersByTime(800)
      await promise

      const finalState = useSessionListStore.getState()
      expect(finalState.sessions).toHaveLength(4)

      const etats = finalState.sessions.map(session => session.etat)
      expect(etats).toEqual(expect.arrayContaining(["O", "", "O", "O"]))
      expect(etats).not.toContain("F")
    })

    it("should filter sessions by societe in mock mode", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const filtersWithSociete: SessionFilter = {
        ...DEFAULT_FILTERS,
        societe: "SARL"
      }

      const promise = useSessionListStore.getState().fetchSessions(filtersWithSociete)
      vi.advanceTimersByTime(800)
      await promise

      const finalState = useSessionListStore.getState()
      expect(finalState.sessions).toHaveLength(2)
      expect(finalState.sessions.every(session => 
        session.societe.toLowerCase().includes("sarl")
      )).toBe(true)
    })

    it("should handle loading state correctly", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const promise = useSessionListStore.getState().fetchSessions(DEFAULT_FILTERS)
      
      expect(useSessionListStore.getState().isLoading).toBe(true)
      
      vi.advanceTimersByTime(800)
      await promise

      expect(useSessionListStore.getState().isLoading).toBe(false)
    })
  })

  describe("setFilters", () => {
    it("should update filters and trigger fetchSessions", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const newFilters: Partial<SessionFilter> = {
        societe: "SARL MARTIN"
      }

      const promise = useSessionListStore.getState().setFilters(newFilters)
      vi.advanceTimersByTime(800)
      await promise

      const finalState = useSessionListStore.getState()
      expect(finalState.filters.societe).toBe("SARL MARTIN")
      expect(finalState.filters.existeSession).toBe(true)
      expect(finalState.sessions.length).toBeGreaterThan(0)
    })

    it("should merge partial filters with existing ones", () => {
      const initialState = useSessionListStore.getState()
      expect(initialState.filters.existeSession).toBe(true)

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      useSessionListStore.getState().setFilters({ societe: "TEST" })

      const finalState = useSessionListStore.getState()
      expect(finalState.filters.existeSession).toBe(true)
      expect(finalState.filters.societe).toBe("TEST")
    })
  })

  describe("clearError", () => {
    it("should clear error state", async () => {
      const mockGet = vi.fn().mockRejectedValue(new Error("Test Error"))
      const { apiClient } = await import("@/services/api/apiClient")
      vi.mocked(apiClient.get).mockImplementation(mockGet)
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })

      await useSessionListStore.getState().fetchSessions(DEFAULT_FILTERS)
      
      expect(useSessionListStore.getState().error).toBe("Test Error")

      useSessionListStore.getState().clearError()

      expect(useSessionListStore.getState().error).toBe(null)
    })
  })

  describe("reset", () => {
    it("should reset store to initial state", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      useSessionListStore.setState({
        sessions: MOCK_SESSIONS,
        error: "Some error",
        filters: { ...DEFAULT_FILTERS, societe: "TEST" }
      })

      useSessionListStore.getState().reset()

      const finalState = useSessionListStore.getState()
      expect(finalState.sessions).toHaveLength(0)
      expect(finalState.error).toBe(null)
      expect(finalState.isLoading).toBe(false)
      expect(finalState.filters).toEqual(DEFAULT_FILTERS)
    })
  })
})