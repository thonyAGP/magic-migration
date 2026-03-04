import { create } from 'zustand'
import type { 
  AccountMergeState, 
  MergeRequest, 
  Account, 
  MergeHistory, 
  MergeLog, 
  ValidationStatus 
} from '@/types/accountMerge'
import type { ApiResponse } from '@/services/api/apiClient'
import { apiClient } from '@/services/api/apiClient'
import { useDataSourceStore } from '@/stores/dataSourceStore'

interface AccountMergeActions {
  validatePrerequisites: () => Promise<ValidationStatus>
  loadAccounts: (sourceAccountId: number, targetAccountId: number) => Promise<{ source: Account; target: Account }>
  executeMerge: (autoResume?: boolean, withoutInterface?: boolean) => Promise<MergeRequest>
  saveMergeHistory: (mergeId: number, operation: string, details?: string) => Promise<void>
  writeMergeLogs: (mergeId: number, tableName: string, recordCount: number, success: boolean) => Promise<void>
  cleanupTemporaryData: (mergeId: number) => Promise<void>
  printMergeTicket: (mergeId: number) => Promise<void>
  cancelMerge: () => Promise<void>
  getMergeHistory: (filters?: { startDate?: Date; endDate?: Date; accountId?: number }) => Promise<MergeHistory[]>
  getMergeLogs: (mergeId: number) => Promise<MergeLog[]>
  setCurrentStep: (step: 'validation' | 'preparation' | 'execution' | 'completion') => void
  updateProgress: (current: number, total: number, table: string) => void
  setError: (error: string | null) => void
  reset: () => void
  
  // RM-001: Condition: W0 reseau [M] different de 'R'
  checkNetworkCondition: (network: string) => boolean
  
  // RM-002: Condition: W0 validation [N] egale 'V'
  checkValidationEqual: (validation: string) => boolean
  
  // RM-003: Condition: W0 validation [N] different de 'V'
  checkValidationNotEqual: (validation: string) => boolean
  
  // RM-004: Condition: W0 chrono histo [BA] egale 'F'
  checkChronoHistoEqual: (chronoHisto: string) => boolean
  
  // RM-005: Condition: W0 chrono histo [BA] different de 'F'
  checkChronoHistoNotEqual: (chronoHisto: string) => boolean
  
  // RM-006: Negation de (W0 code LOG existe [BB]) (condition inversee)
  checkCodeLogNotExists: (codeLog: string | null) => boolean
  
  // RM-007: Si W0 Filiation garantie ... [BF] alors IF (W0 reprise confirmee [BD] sinon 'RETRY','DONE'),'PASSED')
  checkFiliationCondition: (filiationGarantie: boolean, repriseConfirmee: boolean) => 'RETRY' | 'DONE' | 'PASSED'
  
  // RM-008: Negation de (W0 reprise confirmee [BD]) (condition inversee)
  checkResumeNotConfirmed: (resumeConfirmed: boolean) => boolean
  
  // RM-009: Negation de (W0 Compte remplace à l... [BI]) (condition inversee)
  checkAccountNotReplaced: (accountReplaced: boolean) => boolean
  
  // RM-011: Condition toujours vraie (flag actif)
  checkAlwaysTrue: () => boolean
  
  // RM-010: Condition composite: [BK]=6 OR P0 Reprise Auto [I]
  checkCompositeCondition: (bkValue: number, autoResume: boolean) => boolean
  
  // RM-012: Negation de P0.Sans interface [J] (condition inversee)
  checkWithInterface: (withoutInterface: boolean) => boolean
  
  // RM-013: Negation de VG78 (condition inversee)
  checkVG78Negation: (vg78: boolean) => boolean
}

interface MergeVariables {
  // FA: W0 validation
  validation: string
  
  // FN: W0 chrono histo
  chronoHisto: string
  
  // FJ: W0 reprise
  reprise: boolean
  
  // FQ: W0 filiation garantie
  filiationGarantie: boolean
}

const initialState: AccountMergeState = {
  mergeRequest: null,
  sourceAccount: null,
  targetAccount: null,
  mergeHistory: [],
  mergeLogs: [],
  validationStatus: null,
  currentStep: 'validation',
  isProcessing: false,
  error: null,
  progressData: { current: 0, total: 0, table: '' }
}

const createMockValidationStatus = (): ValidationStatus => ({
  network: true,
  closure: false,
  validation: 'V'
})

const createMockAccounts = (sourceId: number, targetId: number): { source: Account; target: Account } => ({
  source: {
    id: sourceId,
    status: 'active',
    balance: 15750.85,
    clientName: 'Martin Dupont',
    linkedAccounts: 2
  },
  target: {
    id: targetId,
    status: 'active',
    balance: 8432.90,
    clientName: 'Martin Dupont',
    linkedAccounts: 1
  }
})

const createMockMergeRequest = (): MergeRequest => ({
  id: Date.now(),
  sourceAccountId: 100245,
  targetAccountId: 100123,
  status: 'completed',
  validatedBy: 'admin',
  validatedAt: new Date(),
  chronoCode: 'F2024001'
})

const createMockMergeHistory = (): MergeHistory[] => [
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
  },
  {
    id: 3,
    mergeRequestId: 1003,
    timestamp: new Date('2024-02-03T09:45:00'),
    operation: 'FUSION_COMPLETE',
    details: 'Fusion compte 100489 vers 100234 - 1725 enregistrements transférés'
  },
  {
    id: 4,
    mergeRequestId: 1004,
    timestamp: new Date('2024-02-10T16:20:00'),
    operation: 'FUSION_EN_COURS',
    details: 'Fusion compte 100567 vers 100345 - Étape 35/60 tables'
  },
  {
    id: 5,
    mergeRequestId: 1005,
    timestamp: new Date('2024-02-15T11:10:00'),
    operation: 'FUSION_VALIDEE',
    details: 'Fusion compte 100678 vers 100456 - Validation réussie, prête pour exécution'
  }
]

const createMockMergeLogs = (mergeId: number): MergeLog[] => [
  {
    id: 1,
    mergeId,
    operation: 'TRANSFER',
    tableName: 'compte_gm',
    recordCount: 1,
    timestamp: new Date(),
    success: true
  },
  {
    id: 2,
    mergeId,
    operation: 'TRANSFER',
    tableName: 'prestations',
    recordCount: 245,
    timestamp: new Date(),
    success: true
  },
  {
    id: 3,
    mergeId,
    operation: 'TRANSFER',
    tableName: 'garanties',
    recordCount: 12,
    timestamp: new Date(),
    success: true
  },
  {
    id: 4,
    mergeId,
    operation: 'TRANSFER',
    tableName: 'vente',
    recordCount: 67,
    timestamp: new Date(),
    success: true
  },
  {
    id: 5,
    mergeId,
    operation: 'TRANSFER',
    tableName: 'cc_comptable',
    recordCount: 189,
    timestamp: new Date(),
    success: true
  }
]

export const useAccountMergeStore = create<AccountMergeState & AccountMergeActions & MergeVariables>((set, get) => ({
  ...initialState,
  
  // FA: W0 validation
  validation: '',
  
  // FN: W0 chrono histo
  chronoHisto: '',
  
  // FJ: W0 reprise
  reprise: false,
  
  // FQ: W0 filiation garantie
  filiationGarantie: false,

  validatePrerequisites: async () => {
    const { isRealApi } = useDataSourceStore.getState()
    set({ isProcessing: true, error: null })

    try {
      if (isRealApi) {
        const response = await apiClient.post<ApiResponse<ValidationStatus>>('/api/account-merge/validate')
        if (!response.data.success) {
          throw new Error(response.data.message || 'Validation failed')
        }
        const validationStatus = response.data.data!
        set({ validationStatus, isProcessing: false })
        return validationStatus
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const validationStatus = createMockValidationStatus()
        set({ validationStatus, isProcessing: false })
        return validationStatus
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation error'
      set({ error: errorMessage, isProcessing: false })
      throw error
    }
  },

  loadAccounts: async (sourceAccountId: number, targetAccountId: number) => {
    const { isRealApi } = useDataSourceStore.getState()
    set({ isProcessing: true, error: null })

    try {
      if (isRealApi) {
        const response = await apiClient.post<ApiResponse<{ source: Account; target: Account }>>('/api/account-merge/load-accounts', {
          sourceAccountId,
          targetAccountId
        })
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to load accounts')
        }
        const accounts = response.data.data!
        set({ 
          sourceAccount: accounts.source, 
          targetAccount: accounts.target, 
          isProcessing: false 
        })
        return accounts
      } else {
        await new Promise(resolve => setTimeout(resolve, 800))
        const accounts = createMockAccounts(sourceAccountId, targetAccountId)
        set({ 
          sourceAccount: accounts.source, 
          targetAccount: accounts.target, 
          isProcessing: false 
        })
        return accounts
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load accounts'
      set({ error: errorMessage, isProcessing: false })
      throw error
    }
  },

  executeMerge: async (autoResume = false, withoutInterface = false) => {
    const { isRealApi } = useDataSourceStore.getState()
    set({ isProcessing: true, error: null, currentStep: 'preparation' })

    try {
      if (isRealApi) {
        const response = await apiClient.post<ApiResponse<MergeRequest>>('/api/account-merge/execute', {
          autoResume,
          withoutInterface
        })
        if (!response.data.success) {
          throw new Error(response.data.message || 'Merge execution failed')
        }
        const mergeRequest = response.data.data!
        set({ mergeRequest, currentStep: 'completion', isProcessing: false })
        return mergeRequest
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
        set({ currentStep: 'execution' })
        
        const tables = ['compte_gm', 'prestations', 'garanties', 'vente', 'cc_comptable', 'histo_fusionseparation', 'fusion_eclatement']
        for (let i = 0; i < tables.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 300))
          set({ progressData: { current: i + 1, total: tables.length, table: tables[i] } })
        }
        
        const mergeRequest = createMockMergeRequest()
        set({ mergeRequest, currentStep: 'completion', isProcessing: false })
        return mergeRequest
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Merge execution failed'
      set({ error: errorMessage, isProcessing: false })
      throw error
    }
  },

  saveMergeHistory: async (mergeId: number, operation: string, details?: string) => {
    const { isRealApi } = useDataSourceStore.getState()

    try {
      if (isRealApi) {
        const response = await apiClient.post<ApiResponse<void>>('/api/account-merge/history', {
          mergeId,
          operation,
          details
        })
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to save merge history')
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save merge history'
      set({ error: errorMessage })
      throw error
    }
  },

  writeMergeLogs: async (mergeId: number, tableName: string, recordCount: number, success: boolean) => {
    const { isRealApi } = useDataSourceStore.getState()

    try {
      if (isRealApi) {
        const response = await apiClient.post<ApiResponse<void>>('/api/account-merge/logs', {
          mergeId,
          tableName,
          recordCount,
          success
        })
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to write merge logs')
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to write merge logs'
      set({ error: errorMessage })
      throw error
    }
  },

  cleanupTemporaryData: async (mergeId: number) => {
    const { isRealApi } = useDataSourceStore.getState()

    try {
      if (isRealApi) {
        const response = await apiClient.delete<ApiResponse<void>>(`/api/account-merge/cleanup/${mergeId}`)
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to cleanup temporary data')
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cleanup temporary data'
      set({ error: errorMessage })
      throw error
    }
  },

  printMergeTicket: async (mergeId: number) => {
    const { isRealApi } = useDataSourceStore.getState()

    try {
      if (isRealApi) {
        const response = await apiClient.post<ApiResponse<void>>(`/api/account-merge/print/${mergeId}`)
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to print merge ticket')
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 800))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to print merge ticket'
      set({ error: errorMessage })
      throw error
    }
  },

  cancelMerge: async () => {
    const { isRealApi } = useDataSourceStore.getState()
    set({ isProcessing: true, error: null })

    try {
      if (isRealApi) {
        const response = await apiClient.delete<ApiResponse<void>>('/api/account-merge/cancel')
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to cancel merge')
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      set({ 
        mergeRequest: null, 
        currentStep: 'validation',
        progressData: { current: 0, total: 0, table: '' },
        isProcessing: false 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel merge'
      set({ error: errorMessage, isProcessing: false })
      throw error
    }
  },

  getMergeHistory: async (filters?: { startDate?: Date; endDate?: Date; accountId?: number }) => {
    const { isRealApi } = useDataSourceStore.getState()
    set({ isProcessing: true, error: null })

    try {
      if (isRealApi) {
        const params = new URLSearchParams()
        if (filters?.startDate) params.append('startDate', filters.startDate.toISOString())
        if (filters?.endDate) params.append('endDate', filters.endDate.toISOString())
        if (filters?.accountId) params.append('accountId', filters.accountId.toString())
        
        const response = await apiClient.get<ApiResponse<MergeHistory[]>>(`/api/account-merge/history?${params}`)
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to get merge history')
        }
        const history = response.data.data!
        set({ mergeHistory: history, isProcessing: false })
        return history
      } else {
        await new Promise(resolve => setTimeout(resolve, 600))
        const history = createMockMergeHistory()
        set({ mergeHistory: history, isProcessing: false })
        return history
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get merge history'
      set({ error: errorMessage, isProcessing: false })
      throw error
    }
  },

  getMergeLogs: async (mergeId: number) => {
    const { isRealApi } = useDataSourceStore.getState()
    set({ isProcessing: true, error: null })

    try {
      if (isRealApi) {
        const response = await apiClient.get<ApiResponse<MergeLog[]>>(`/api/account-merge/logs/${mergeId}`)
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to get merge logs')
        }
        const logs = response.data.data!
        set({ mergeLogs: logs, isProcessing: false })
        return logs
      } else {
        await new Promise(resolve => setTimeout(resolve, 400))
        const logs = createMockMergeLogs(mergeId)
        set({ mergeLogs: logs, isProcessing: false })
        return logs
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get merge logs'
      set({ error: errorMessage, isProcessing: false })
      throw error
    }
  },

  setCurrentStep: (step) => {
    set({ currentStep: step })
  },

  updateProgress: (current, total, table) => {
    set({ progressData: { current, total, table } })
  },

  setError: (error) => {
    set({ error })
  },

  reset: () => {
    set(initialState)
  },

  // RM-001: Condition: W0 reseau [M] different de 'R'
  checkNetworkCondition: (network: string) => {
    return network !== 'R'
  },

  // RM-002: Condition: W0 validation [N] egale 'V'
  checkValidationEqual: (validation: string) => { // RM-002
    return validation === 'V'
  },

  // RM-003: Condition: W0 validation [N] different de 'V'
  checkValidationNotEqual: (validation: string) => { // RM-003
    return validation !== 'V'
  },

  // RM-004: Condition: W0 chrono histo [BA] egale 'F'
  checkChronoHistoEqual: (chronoHisto: string) => { // RM-004
    return chronoHisto === 'F'
  },

  // RM-005: Condition: W0 chrono histo [BA] different de 'F'
  checkChronoHistoNotEqual: (chronoHisto: string) => { // RM-005
    return chronoHisto !== 'F'
  },

  // RM-006: Negation de (W0 code LOG existe [BB]) (condition inversee)
  checkCodeLogNotExists: (codeLog: string | null) => {
    return !codeLog || codeLog.trim() === ''
  },

  // RM-007: Si W0 Filiation garantie ... [BF] alors IF (W0 reprise confirmee [BD] sinon 'RETRY','DONE'),'PASSED')
  checkFiliationCondition: (filiationGarantie: boolean, repriseConfirmee: boolean) => { // RM-007
    if (filiationGarantie) {
      return repriseConfirmee ? 'DONE' : 'RETRY'
    }
    return 'PASSED'
  },

  // RM-008: Negation de (W0 reprise confirmee [BD]) (condition inversee)
  checkResumeNotConfirmed: (resumeConfirmed: boolean) => {
    return !resumeConfirmed
  },

  // RM-009: Negation de (W0 Compte remplace à l... [BI]) (condition inversee)
  checkAccountNotReplaced: (accountReplaced: boolean) => {
    return !accountReplaced
  },

  // RM-011: Condition toujours vraie (flag actif)
  checkAlwaysTrue: () => {
    return true
  },

  // RM-010: Condition composite: [BK]=6 OR P0 Reprise Auto [I]
  checkCompositeCondition: (bkValue: number, autoResume: boolean) => {
    return bkValue === 6 || autoResume
  },

  // RM-012: Negation de P0.Sans interface [J] (condition inversee)
  checkWithInterface: (withoutInterface: boolean) => {
    return !withoutInterface
  },

  // RM-013: Negation de VG78 (condition inversee)
  checkVG78Negation: (vg78: boolean) => {
    return !vg78
  }
}))