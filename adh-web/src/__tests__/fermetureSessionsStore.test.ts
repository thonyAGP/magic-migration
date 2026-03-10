/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { useFermetureSessionsStore } from "@/stores/fermetureSessionsStore"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { apiClient } from "@/services/api/apiClient"
import type { 
  Session, 
  UnilateralBilateral, 
  SessionCloseResponse, 
  SessionValidationResponse,
  SESSION_STATUTS 
} from "@/types/fermetureSessions"

vi.mock("@/services/api/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock("@/stores/dataSourceStore", () => ({
  useDataSourceStore: {
    getState: vi.fn()
  }
}))

const MOCK_SESSIONS: Session[] = [
  {
    id: 101,
    dateOuverture: new Date('2024-01-15T08:00:00'),
    dateFermeture: null,
    statut: 'O'
  },
  {
    id: 102,
    dateOuverture: new Date('2024-01-16T08:30:00'),
    dateFermeture: null,
    statut: 'O'
  }
]

const MOCK_TYPES: UnilateralBilateral[] = [
  {
    code: 'UNI',
    libelle: 'Opération Unilatérale',
    type: 'UNILATERAL'
  },
  {
    code: 'BIL',
    libelle: 'Opération Bilatérale',
    type: 'BILATERAL'
  }
]

const MOCK_SESSION_CLOSE_SUCCESS: SessionCloseResponse = {
  success: true,
  closureCode: 'N15.5CZ'
}

const MOCK_VALIDATION_SUCCESS: SessionValidationResponse = {
  valid: true,
  errors: []
}

describe('fermetureSessionsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFermetureSessionsStore.setState({
      sessions: [],
      currentSession: null,
      unilateralBilateralTypes: [],
      isLoading: false,
      error: null,
      isClosing: false
    })
  })

  describe('loadSessions', () => {
    it('should load sessions successfully with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockResolvedValue({
        success: true,
        data: MOCK_SESSIONS.map(s => ({
          ...s,
          dateOuverture: s.dateOuverture.toISOString(),
          dateFermeture: s.dateFermeture?.toISOString() || null
        }))
      })

      await useFermetureSessionsStore.getState().loadSessions()
      
      expect(apiClient.get).toHaveBeenCalledWith('/api/fermeture-sessions/sessions?statut=O')
      expect(useFermetureSessionsStore.getState().sessions).toHaveLength(2)
      expect(useFermetureSessionsStore.getState().sessions[0].id).toBe(101)
      expect(useFermetureSessionsStore.getState().isLoading).toBe(false)
      expect(useFermetureSessionsStore.getState().error).toBeNull()
    })

    it('should load sessions successfully with mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      await useFermetureSessionsStore.getState().loadSessions()
      
      expect(useFermetureSessionsStore.getState().sessions).toHaveLength(5)
      expect(useFermetureSessionsStore.getState().sessions.every(s => s.statut === 'O')).toBe(true)
      expect(useFermetureSessionsStore.getState().isLoading).toBe(false)
      expect(useFermetureSessionsStore.getState().error).toBeNull()
    })

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'))

      await useFermetureSessionsStore.getState().loadSessions()
      
      expect(useFermetureSessionsStore.getState().sessions).toHaveLength(0)
      expect(useFermetureSessionsStore.getState().error).toBe('Network error')
      expect(useFermetureSessionsStore.getState().isLoading).toBe(false)
    })

    it('should set loading state during request', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })
      
      const loadPromise = useFermetureSessionsStore.getState().loadSessions()
      
      expect(useFermetureSessionsStore.getState().isLoading).toBe(true)
      
      await loadPromise
      
      expect(useFermetureSessionsStore.getState().isLoading).toBe(false)
    })

    it('should filter only open sessions (status O)', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockResolvedValue({
        success: true,
        data: MOCK_SESSIONS.map(s => ({
          ...s,
          dateOuverture: s.dateOuverture.toISOString(),
          dateFermeture: s.dateFermeture?.toISOString() || null
        }))
      })

      await useFermetureSessionsStore.getState().loadSessions()
      
      expect(useFermetureSessionsStore.getState().sessions.every(s => s.statut === 'O')).toBe(true)
    })
  })

  describe('loadUnilateralBilateralTypes', () => {
    it('should load types successfully with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockResolvedValue({
        success: true,
        data: MOCK_TYPES
      })

      await useFermetureSessionsStore.getState().loadUnilateralBilateralTypes()
      
      expect(apiClient.get).toHaveBeenCalledWith('/api/fermeture-sessions/types')
      expect(useFermetureSessionsStore.getState().unilateralBilateralTypes).toHaveLength(2)
      expect(useFermetureSessionsStore.getState().unilateralBilateralTypes[0].code).toBe('UNI')
      expect(useFermetureSessionsStore.getState().isLoading).toBe(false)
      expect(useFermetureSessionsStore.getState().error).toBeNull()
    })

    it('should load types successfully with mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      await useFermetureSessionsStore.getState().loadUnilateralBilateralTypes()
      
      expect(useFermetureSessionsStore.getState().unilateralBilateralTypes).toHaveLength(3)
      expect(useFermetureSessionsStore.getState().unilateralBilateralTypes.find(t => t.code === 'MIX')).toBeDefined()
      expect(useFermetureSessionsStore.getState().isLoading).toBe(false)
      expect(useFermetureSessionsStore.getState().error).toBeNull()
    })

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockRejectedValue(new Error('API error'))

      await useFermetureSessionsStore.getState().loadUnilateralBilateralTypes()
      
      expect(useFermetureSessionsStore.getState().unilateralBilateralTypes).toHaveLength(0)
      expect(useFermetureSessionsStore.getState().error).toBe('API error')
      expect(useFermetureSessionsStore.getState().isLoading).toBe(false)
    })
  })

  describe('fermerSession', () => {
    beforeEach(() => {
      useFermetureSessionsStore.setState({
        sessions: [...MOCK_SESSIONS],
        currentSession: null,
        unilateralBilateralTypes: [],
        isLoading: false,
        error: null,
        isClosing: false
      })
    })

    it('should close session successfully with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post)
        .mockResolvedValueOnce({ success: true, data: { valid: true, errors: [] } })
        .mockResolvedValueOnce({ success: true, data: MOCK_SESSION_CLOSE_SUCCESS })

      await useFermetureSessionsStore.getState().fermerSession(101)
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-sessions/validate/101')
      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-sessions/close/101')
      expect(useFermetureSessionsStore.getState().sessions.find(s => s.id === 101)).toBeUndefined()
      expect(useFermetureSessionsStore.getState().isClosing).toBe(false)
      expect(useFermetureSessionsStore.getState().error).toBeNull()
    })

    it('should close session successfully with mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const initialCount = useFermetureSessionsStore.getState().sessions.length
      
      await useFermetureSessionsStore.getState().fermerSession(101)
      
      expect(useFermetureSessionsStore.getState().sessions).toHaveLength(initialCount - 1)
      expect(useFermetureSessionsStore.getState().sessions.find(s => s.id === 101)).toBeUndefined()
      expect(useFermetureSessionsStore.getState().isClosing).toBe(false)
      expect(useFermetureSessionsStore.getState().error).toBeNull()
    })

    it('should handle validation failure', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValue({ 
        success: true, 
        data: { valid: false, errors: ['Pending operations'] } 
      })

      await useFermetureSessionsStore.getState().fermerSession(101)
      
      expect(useFermetureSessionsStore.getState().error).toBe('La session ne peut pas être fermée')
      expect(useFermetureSessionsStore.getState().isClosing).toBe(false)
      expect(useFermetureSessionsStore.getState().sessions.find(s => s.id === 101)).toBeDefined()
    })

    it('should handle API error during closure', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post)
        .mockResolvedValueOnce({ success: true, data: { valid: true, errors: [] } })
        .mockRejectedValueOnce(new Error('Closure failed'))

      await useFermetureSessionsStore.getState().fermerSession(101)
      
      expect(useFermetureSessionsStore.getState().error).toBe('Closure failed')
      expect(useFermetureSessionsStore.getState().isClosing).toBe(false)
    })

    it('should set closing state during request', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })
      
      const closePromise = useFermetureSessionsStore.getState().fermerSession(101)
      
      expect(useFermetureSessionsStore.getState().isClosing).toBe(true)
      
      await closePromise
      
      expect(useFermetureSessionsStore.getState().isClosing).toBe(false)
    })
  })

  describe('generateClosureCode', () => {
    beforeEach(() => {
      useFermetureSessionsStore.setState({
        sessions: [...MOCK_SESSIONS],
        currentSession: null,
        unilateralBilateralTypes: [],
        isLoading: false,
        error: null,
        isClosing: false
      })
    })

    it('should generate closure code with RM-001 format', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const code = useFermetureSessionsStore.getState().generateClosureCode(101)
      
      expect(code).toBe('N15.5CZ')
    })

    it('should generate closure code without decimal when D=0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.05)

      const code = useFermetureSessionsStore.getState().generateClosureCode(101)
      
      expect(code).toBe('N15CZ')
    })

    it('should return empty string for non-existent session', () => {
      const code = useFermetureSessionsStore.getState().generateClosureCode(999)
      
      expect(code).toBe('')
    })

    it('should handle maximum D value (9)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.95)

      const code = useFermetureSessionsStore.getState().generateClosureCode(101)
      
      expect(code).toBe('N15.9CZ')
    })
  })

  describe('validateSessionClosure', () => {
    beforeEach(() => {
      useFermetureSessionsStore.setState({
        sessions: [...MOCK_SESSIONS],
        currentSession: null,
        unilateralBilateralTypes: [],
        isLoading: false,
        error: null,
        isClosing: false
      })
    })

    it('should validate session successfully with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValue({
        success: true,
        data: MOCK_VALIDATION_SUCCESS
      })

      const isValid = await useFermetureSessionsStore.getState().validateSessionClosure(101)
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-sessions/validate/101')
      expect(isValid).toBe(true)
    })

    it('should validate session successfully with mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const isValid = await useFermetureSessionsStore.getState().validateSessionClosure(101)
      
      expect(isValid).toBe(true)
    })

    it('should return false for non-existent session', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })

      const isValid = await useFermetureSessionsStore.getState().validateSessionClosure(999)
      
      expect(isValid).toBe(false)
    })

    it('should return false for closed session', async () => {
      useFermetureSessionsStore.setState({
        sessions: [{
          id: 103,
          dateOuverture: new Date('2024-01-17T09:00:00'),
          dateFermeture: new Date('2024-01-17T18:00:00'),
          statut: 'C'
        }],
        currentSession: null,
        unilateralBilateralTypes: [],
        isLoading: false,
        error: null,
        isClosing: false
      })

      const isValid = await useFermetureSessionsStore.getState().validateSessionClosure(103)
      
      expect(isValid).toBe(false)
    })

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Validation error'))

      const isValid = await useFermetureSessionsStore.getState().validateSessionClosure(101)
      
      expect(isValid).toBe(false)
    })

    it('should return false when API returns invalid', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValue({
        success: true,
        data: { valid: false, errors: ['Pending operations'] }
      })

      const isValid = await useFermetureSessionsStore.getState().validateSessionClosure(101)
      
      expect(isValid).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useFermetureSessionsStore.setState({
        sessions: [...MOCK_SESSIONS],
        currentSession: null,
        unilateralBilateralTypes: [...MOCK_TYPES],
        isLoading: true,
        error: 'Some error',
        isClosing: true
      })
      
      useFermetureSessionsStore.getState().reset()
      
      expect(useFermetureSessionsStore.getState().sessions).toHaveLength(0)
      expect(useFermetureSessionsStore.getState().currentSession).toBeNull()
      expect(useFermetureSessionsStore.getState().unilateralBilateralTypes).toHaveLength(0)
      expect(useFermetureSessionsStore.getState().isLoading).toBe(false)
      expect(useFermetureSessionsStore.getState().error).toBeNull()
      expect(useFermetureSessionsStore.getState().isClosing).toBe(false)
    })
  })
})