/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAccountMergeStore } from '@/stores/accountMergeStore'
import type { ValidationStatus, Account, MergeRequest, MergeHistory, MergeLog } from '@/types/accountMerge'
import { useDataSourceStore } from '@/stores/dataSourceStore'

const MOCK_VALIDATION_STATUS: ValidationStatus = {
  network: true,
  closure: false,
  validation: 'V'
}

const MOCK_SOURCE_ACCOUNT: Account = {
  id: 100245,
  status: 'active',
  balance: 15750.85,
  clientName: 'Martin Dupont',
  linkedAccounts: 2
}

const MOCK_TARGET_ACCOUNT: Account = {
  id: 100123,
  status: 'active',
  balance: 8432.90,
  clientName: 'Martin Dupont',
  linkedAccounts: 1
}

const MOCK_MERGE_REQUEST: MergeRequest = {
  id: 1001,
  sourceAccountId: 100245,
  targetAccountId: 100123,
  status: 'completed',
  validatedBy: 'admin',
  validatedAt: new Date('2024-01-15T10:30:00'),
  chronoCode: 'F2024001'
}

const MOCK_MERGE_HISTORY: MergeHistory[] = [
  {
    id: 1,
    mergeRequestId: 1001,
    timestamp: new Date('2024-01-15T10:30:00'),
    operation: 'FUSION_COMPLETE',
    details: 'Fusion compte 100245 vers 100123 - 2850 enregistrements transférés'
  },
  {
    id: 2,
    mergeRequestId: 1002,
    timestamp: new Date('2024-01-20T14:15:00'),
    operation: 'FUSION_ANNULEE',
    details: 'Fusion compte 100378 vers 100156 - Annulée par utilisateur'
  }
]

const MOCK_MERGE_LOGS: MergeLog[] = [
  {
    id: 1,
    mergeId: 1001,
    operation: 'TRANSFER',
    tableName: 'compte_gm',
    recordCount: 1,
    timestamp: new Date('2024-01-15T10:30:00'),
    success: true
  },
  {
    id: 2,
    mergeId: 1001,
    operation: 'TRANSFER',
    tableName: 'prestations',
    recordCount: 245,
    timestamp: new Date('2024-01-15T10:35:00'),
    success: true
  }
]

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn()
  }
}))

const { apiClient } = await import('@/services/api/apiClient')

describe('accountMergeStore', () => {
  beforeEach(() => {
    useAccountMergeStore.getState().reset()
    vi.clearAllMocks()
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })
  })

  describe('validatePrerequisites', () => {
    it('should validate prerequisites successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      const result = await store.validatePrerequisites()
      
      expect(result).toEqual(MOCK_VALIDATION_STATUS)
      expect(store.validationStatus).toEqual(MOCK_VALIDATION_STATUS)
      expect(store.isProcessing).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should validate prerequisites with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: MOCK_VALIDATION_STATUS }
      })
      
      const store = useAccountMergeStore.getState()
      
      const result = await store.validatePrerequisites()
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/account-merge/validate')
      expect(result).toEqual(MOCK_VALIDATION_STATUS)
      expect(store.validationStatus).toEqual(MOCK_VALIDATION_STATUS)
    })

    it('should handle validation error with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: false, message: 'Network validation failed' }
      })
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.validatePrerequisites()).rejects.toThrow('Network validation failed')
      expect(store.error).toBe('Network validation failed')
      expect(store.isProcessing).toBe(false)
    })

    it('should handle network error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.validatePrerequisites()).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
      expect(store.isProcessing).toBe(false)
    })

    it('should set loading state during validation', async () => {
      const store = useAccountMergeStore.getState()
      
      const promise = store.validatePrerequisites()
      expect(store.isProcessing).toBe(true)
      expect(store.error).toBe(null)
      
      await promise
    })
  })

  describe('loadAccounts', () => {
    it('should load accounts successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      const result = await store.loadAccounts(100245, 100123)
      
      expect(result.source).toEqual(expect.objectContaining({ id: 100245 }))
      expect(result.target).toEqual(expect.objectContaining({ id: 100123 }))
      expect(store.sourceAccount).toEqual(expect.objectContaining({ id: 100245 }))
      expect(store.targetAccount).toEqual(expect.objectContaining({ id: 100123 }))
      expect(store.isProcessing).toBe(false)
    })

    it('should load accounts with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { 
          success: true, 
          data: { source: MOCK_SOURCE_ACCOUNT, target: MOCK_TARGET_ACCOUNT }
        }
      })
      
      const store = useAccountMergeStore.getState()
      
      const result = await store.loadAccounts(100245, 100123)
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/account-merge/load-accounts', {
        sourceAccountId: 100245,
        targetAccountId: 100123
      })
      expect(result.source).toEqual(MOCK_SOURCE_ACCOUNT)
      expect(result.target).toEqual(MOCK_TARGET_ACCOUNT)
    })

    it('should handle account loading error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: false, message: 'Account not found' }
      })
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.loadAccounts(100245, 100123)).rejects.toThrow('Account not found')
      expect(store.error).toBe('Account not found')
    })
  })

  describe('executeMerge', () => {
    it('should execute merge successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      const result = await store.executeMerge()
      
      expect(result).toEqual(expect.objectContaining({
        sourceAccountId: 100245,
        targetAccountId: 100123,
        status: 'completed'
      }))
      expect(store.mergeRequest).toBeTruthy()
      expect(store.currentStep).toBe('completion')
      expect(store.isProcessing).toBe(false)
    })

    it('should execute merge with parameters', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: MOCK_MERGE_REQUEST }
      })
      
      const store = useAccountMergeStore.getState()
      
      await store.executeMerge(true, false)
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/account-merge/execute', {
        autoResume: true,
        withoutInterface: false
      })
    })

    it('should handle merge execution error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Merge failed'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.executeMerge()).rejects.toThrow('Merge failed')
      expect(store.error).toBe('Merge failed')
      expect(store.isProcessing).toBe(false)
    })

    it('should update progress during mock execution', async () => {
      const store = useAccountMergeStore.getState()
      
      await store.executeMerge()
      
      expect(store.progressData.current).toBeGreaterThan(0)
      expect(store.progressData.total).toBeGreaterThan(0)
      expect(store.progressData.table).toBeTruthy()
    })

    it('should set step progression correctly', async () => {
      const store = useAccountMergeStore.getState()
      
      const promise = store.executeMerge()
      expect(store.currentStep).toBe('preparation')
      
      await promise
      expect(store.currentStep).toBe('completion')
    })
  })

  describe('saveMergeHistory', () => {
    it('should save merge history successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      await expect(store.saveMergeHistory(1001, 'FUSION_COMPLETE', 'Test merge')).resolves.not.toThrow()
      expect(store.error).toBe(null)
    })

    it('should save merge history with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true }
      })
      
      const store = useAccountMergeStore.getState()
      
      await store.saveMergeHistory(1001, 'FUSION_COMPLETE', 'Test merge')
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/account-merge/history', {
        mergeId: 1001,
        operation: 'FUSION_COMPLETE',
        details: 'Test merge'
      })
    })

    it('should handle save history error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Save failed'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.saveMergeHistory(1001, 'FUSION_COMPLETE')).rejects.toThrow('Save failed')
      expect(store.error).toBe('Save failed')
    })
  })

  describe('writeMergeLogs', () => {
    it('should write merge logs successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      await expect(store.writeMergeLogs(1001, 'compte_gm', 1, true)).resolves.not.toThrow()
      expect(store.error).toBe(null)
    })

    it('should write merge logs with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true }
      })
      
      const store = useAccountMergeStore.getState()
      
      await store.writeMergeLogs(1001, 'prestations', 245, true)
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/account-merge/logs', {
        mergeId: 1001,
        tableName: 'prestations',
        recordCount: 245,
        success: true
      })
    })

    it('should handle write logs error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Write failed'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.writeMergeLogs(1001, 'compte_gm', 1, false)).rejects.toThrow('Write failed')
      expect(store.error).toBe('Write failed')
    })
  })

  describe('cleanupTemporaryData', () => {
    it('should cleanup temporary data successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      await expect(store.cleanupTemporaryData(1001)).resolves.not.toThrow()
      expect(store.error).toBe(null)
    })

    it('should cleanup temporary data with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true }
      })
      
      const store = useAccountMergeStore.getState()
      
      await store.cleanupTemporaryData(1001)
      
      expect(apiClient.delete).toHaveBeenCalledWith('/api/account-merge/cleanup/1001')
    })

    it('should handle cleanup error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Cleanup failed'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.cleanupTemporaryData(1001)).rejects.toThrow('Cleanup failed')
      expect(store.error).toBe('Cleanup failed')
    })
  })

  describe('printMergeTicket', () => {
    it('should print merge ticket successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      await expect(store.printMergeTicket(1001)).resolves.not.toThrow()
      expect(store.error).toBe(null)
    })

    it('should print merge ticket with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true }
      })
      
      const store = useAccountMergeStore.getState()
      
      await store.printMergeTicket(1001)
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/account-merge/print/1001')
    })

    it('should handle print error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Print failed'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.printMergeTicket(1001)).rejects.toThrow('Print failed')
      expect(store.error).toBe('Print failed')
    })
  })

  describe('cancelMerge', () => {
    it('should cancel merge successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      store.setCurrentStep('execution')
      store.updateProgress(5, 10, 'prestations')
      
      await store.cancelMerge()
      
      expect(store.mergeRequest).toBe(null)
      expect(store.currentStep).toBe('validation')
      expect(store.progressData).toEqual({ current: 0, total: 0, table: '' })
      expect(store.isProcessing).toBe(false)
    })

    it('should cancel merge with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true }
      })
      
      const store = useAccountMergeStore.getState()
      
      await store.cancelMerge()
      
      expect(apiClient.delete).toHaveBeenCalledWith('/api/account-merge/cancel')
    })

    it('should handle cancel error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Cancel failed'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.cancelMerge()).rejects.toThrow('Cancel failed')
      expect(store.error).toBe('Cancel failed')
      expect(store.isProcessing).toBe(false)
    })
  })

  describe('getMergeHistory', () => {
    it('should get merge history successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      const result = await store.getMergeHistory()
      
      expect(result).toHaveLength(5)
      expect(result[0]).toEqual(expect.objectContaining({
        operation: 'FUSION_COMPLETE',
        mergeRequestId: 1001
      }))
      expect(store.mergeHistory).toEqual(result)
      expect(store.isProcessing).toBe(false)
    })

    it('should get merge history with filters and real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: MOCK_MERGE_HISTORY }
      })
      
      const store = useAccountMergeStore.getState()
      const filters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        accountId: 100245
      }
      
      const result = await store.getMergeHistory(filters)
      
      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/api/account-merge/history?'))
      expect(result).toEqual(MOCK_MERGE_HISTORY)
    })

    it('should handle get history error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('History fetch failed'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.getMergeHistory()).rejects.toThrow('History fetch failed')
      expect(store.error).toBe('History fetch failed')
    })
  })

  describe('getMergeLogs', () => {
    it('should get merge logs successfully with mock data', async () => {
      const store = useAccountMergeStore.getState()
      
      const result = await store.getMergeLogs(1001)
      
      expect(result).toHaveLength(5)
      expect(result[0]).toEqual(expect.objectContaining({
        mergeId: 1001,
        tableName: 'compte_gm',
        success: true
      }))
      expect(store.mergeLogs).toEqual(result)
      expect(store.isProcessing).toBe(false)
    })

    it('should get merge logs with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: MOCK_MERGE_LOGS }
      })
      
      const store = useAccountMergeStore.getState()
      
      const result = await store.getMergeLogs(1001)
      
      expect(apiClient.get).toHaveBeenCalledWith('/api/account-merge/logs/1001')
      expect(result).toEqual(MOCK_MERGE_LOGS)
    })

    it('should handle get logs error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Logs fetch failed'))
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.getMergeLogs(1001)).rejects.toThrow('Logs fetch failed')
      expect(store.error).toBe('Logs fetch failed')
    })
  })

  describe('setCurrentStep', () => {
    it('should update current step correctly', () => {
      const store = useAccountMergeStore.getState()
      
      store.setCurrentStep('preparation')
      expect(store.currentStep).toBe('preparation')
      
      store.setCurrentStep('execution')
      expect(store.currentStep).toBe('execution')
      
      store.setCurrentStep('completion')
      expect(store.currentStep).toBe('completion')
    })
  })

  describe('updateProgress', () => {
    it('should update progress data correctly', () => {
      const store = useAccountMergeStore.getState()
      
      store.updateProgress(25, 60, 'prestations')
      
      expect(store.progressData).toEqual({
        current: 25,
        total: 60,
        table: 'prestations'
      })
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      const store = useAccountMergeStore.getState()
      
      store.setError('Test error')
      expect(store.error).toBe('Test error')
      
      store.setError(null)
      expect(store.error).toBe(null)
    })
  })

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const store = useAccountMergeStore.getState()
      
      store.setCurrentStep('execution')
      store.setError('Test error')
      store.updateProgress(10, 20, 'test_table')
      
      store.reset()
      
      expect(store.mergeRequest).toBe(null)
      expect(store.sourceAccount).toBe(null)
      expect(store.targetAccount).toBe(null)
      expect(store.mergeHistory).toEqual([])
      expect(store.mergeLogs).toEqual([])
      expect(store.validationStatus).toBe(null)
      expect(store.currentStep).toBe('validation')
      expect(store.isProcessing).toBe(false)
      expect(store.error).toBe(null)
      expect(store.progressData).toEqual({ current: 0, total: 0, table: '' })
    })
  })

  describe('business rules validation', () => {
    it('should enforce RM-001: network validation check', async () => {
      const store = useAccountMergeStore.getState()
      
      const result = await store.validatePrerequisites()
      
      expect(result.network).toBe(true)
    })

    it('should enforce RM-004: validation status check', async () => {
      const store = useAccountMergeStore.getState()
      
      const result = await store.validatePrerequisites()
      
      expect(result.validation).toBe('V')
    })

    it('should enforce closure validation check', async () => {
      const store = useAccountMergeStore.getState()
      
      const result = await store.validatePrerequisites()
      
      expect(result.closure).toBe(false)
    })

    it('should handle table transfer progression correctly', async () => {
      const store = useAccountMergeStore.getState()
      
      await store.executeMerge()
      
      expect(store.progressData.total).toBe(7)
      expect(store.progressData.current).toBe(7)
    })

    it('should verify account existence before loading', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: false, message: 'Source account does not exist' }
      })
      
      const store = useAccountMergeStore.getState()
      
      await expect(store.loadAccounts(999999, 100123)).rejects.toThrow('Source account does not exist')
    })
  })
})