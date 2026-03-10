import { create } from "zustand"
import { apiClient } from "@/services/api/apiClient"
import type { ApiResponse } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { useGlobalContextStore } from "@/stores/globalContextStore"
import type {
  HistoryCleanupState,
  HistoryCleanupActions,
  HistoFusionSeparationCriteria,
  DeletionResult,
  DeleteHistoFusionSeparationSaisieResponse,
  AuditLogEntry,
  GlobalContext
} from "@/types/historyCleanup"

type HistoryCleanupStore = HistoryCleanupState & HistoryCleanupActions & {
  reset: () => void
  deleteWithContext: (context?: GlobalContext) => Promise<DeletionResult>
  logDeletionAudit: (result: DeletionResult, criteria: HistoFusionSeparationCriteria) => Promise<void>
  validateConstraints: (criteria: HistoFusionSeparationCriteria) => Promise<{ isValid: boolean; violations: string[] }>
}

const initialHistoryCleanupState: HistoryCleanupState = {
  isLoading: false,
  error: null,
  deletionCriteria: null,
  deletionResult: null
}

const mockHistoryCleanupResults: DeletionResult[] = [
  {
    recordsDeleted: 125,
    success: true,
    timestamp: new Date().toISOString()
  },
  {
    recordsDeleted: 78,
    success: true,
    timestamp: new Date().toISOString()
  },
  {
    recordsDeleted: 203,
    success: true,
    timestamp: new Date().toISOString()
  }
]

const buildHistoryCleanupQueryParams = (criteria: HistoFusionSeparationCriteria): URLSearchParams => {
  const queryParams = new URLSearchParams()
  
  if (criteria.chronoEF !== undefined) {
    queryParams.append('chronoEF', criteria.chronoEF.toString())
  }
  if (criteria.societe) {
    queryParams.append('societe', criteria.societe)
  }
  if (criteria.compteReference !== undefined) {
    queryParams.append('compteReference', criteria.compteReference.toString())
  }
  if (criteria.filiationReference !== undefined) {
    queryParams.append('filiationReference', criteria.filiationReference.toString())
  }
  // RM-001: Add missing table columns for complete deletion criteria
  if (criteria.comptePointeOld !== undefined) {
    queryParams.append('comptePointeOld', criteria.comptePointeOld.toString())
  }
  if (criteria.filiationPointeOld !== undefined) {
    queryParams.append('filiationPointeOld', criteria.filiationPointeOld.toString())
  }
  if (criteria.iComptePointeOld !== undefined) {
    queryParams.append('iComptePointeOld', criteria.iComptePointeOld.toString())
  }
  if (criteria.iFiliationPointeOld !== undefined) {
    queryParams.append('iFiliationPointeOld', criteria.iFiliationPointeOld.toString())
  }
  
  return queryParams
}

const validateHistoryCleanupCriteriaMock = (criteria: HistoFusionSeparationCriteria): boolean => {
  const hasAnyCriteria = !!(
    criteria.chronoEF || 
    criteria.societe || 
    criteria.compteReference !== undefined || 
    criteria.filiationReference !== undefined ||
    criteria.comptePointeOld !== undefined ||
    criteria.filiationPointeOld !== undefined ||
    criteria.iComptePointeOld !== undefined ||
    criteria.iFiliationPointeOld !== undefined
  )

  return hasAnyCriteria && (!criteria.societe || criteria.societe.length >= 2)
}

const generateMockHistoryCleanupResult = (): DeletionResult => {
  const mockResult = mockHistoryCleanupResults[
    Math.floor(Math.random() * mockHistoryCleanupResults.length)
  ]

  return {
    ...mockResult,
    timestamp: new Date().toISOString(),
    recordsDeleted: Math.floor(Math.random() * 200) + 50
  }
}

// RM-002: Build context-based deletion criteria from global session/operation state
const buildContextBasedCriteria = (context: GlobalContext): HistoFusionSeparationCriteria => {
  return {
    chronoEF: context.sessionKey,
    societe: context.currentSociete,
    compteReference: context.operationContext?.compteReference,
    filiationReference: context.operationContext?.filiationReference,
    comptePointeOld: context.operationContext?.comptePointeOld,
    filiationPointeOld: context.operationContext?.filiationPointeOld,
    iComptePointeOld: context.operationContext?.iComptePointeOld,
    iFiliationPointeOld: context.operationContext?.iFiliationPointeOld
  }
}

// RM-003: Create audit log entry for deletion operations
const createAuditLogEntry = (result: DeletionResult, criteria: HistoFusionSeparationCriteria): AuditLogEntry => {
  return {
    operation: 'DELETE_HISTO_FUSION_SEPARATION',
    timestamp: new Date().toISOString(),
    recordsAffected: result.recordsDeleted,
    criteria: JSON.stringify(criteria),
    success: result.success,
    userId: useGlobalContextStore.getState().currentUser?.id || 'system',
    sessionId: useGlobalContextStore.getState().sessionKey || ''
  }
}

// RM-004: Validate database constraints and foreign key relationships
const validateDatabaseConstraints = (criteria: HistoFusionSeparationCriteria): { isValid: boolean; violations: string[] } => {
  const violations: string[] = []
  
  if (criteria.compteReference !== undefined && criteria.compteReference <= 0) {
    violations.push('compteReference must be positive')
  }
  
  if (criteria.filiationReference !== undefined && criteria.filiationReference <= 0) {
    violations.push('filiationReference must be positive')
  }
  
  if (criteria.chronoEF !== undefined && criteria.chronoEF <= 0) {
    violations.push('chronoEF must be positive')
  }
  
  if (criteria.comptePointeOld !== undefined && criteria.filiationPointeOld === undefined) {
    violations.push('filiationPointeOld required when comptePointeOld is specified')
  }
  
  return {
    isValid: violations.length === 0,
    violations
  }
}

export const useHistoryCleanupStore = create<HistoryCleanupStore>((set, get) => ({
  ...initialHistoryCleanupState,

  deleteHistoFusionSeparationSaisie: async (criteria: HistoFusionSeparationCriteria): Promise<DeletionResult> => {
    set({ isLoading: true, error: null, deletionCriteria: criteria })

    try {
      // RM-005: Implement proper error handling for database constraints
      const constraintValidation = validateDatabaseConstraints(criteria)
      if (!constraintValidation.isValid) {
        throw new Error(`Constraint violations: ${constraintValidation.violations.join(', ')}`)
      }

      const isRealApi = useDataSourceStore.getState().isRealApi

      if (isRealApi) {
        const queryParams = buildHistoryCleanupQueryParams(criteria)
        const url = `/api/historyCleanup/fusionSeparationSaisie?${queryParams.toString()}`
        
        try {
          const response = await apiClient.delete<DeleteHistoFusionSeparationSaisieResponse>(url)

          if (!response.data?.success) {
            throw new Error('Failed to delete fusion separation history records')
          }

          const result = response.data.data

          // RM-006: Add audit logging for deletion operations
          await get().logDeletionAudit(result, criteria)

          set({ 
            deletionResult: result,
            isLoading: false 
          })

          return result
        } catch (apiError) {
          if (apiError instanceof Error && apiError.message.includes('foreign key')) {
            throw new Error('Cannot delete records: foreign key constraint violation. Records may be referenced by other tables.')
          }
          throw apiError
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200))

        const result = generateMockHistoryCleanupResult()

        // RM-007: Add audit logging for mock operations
        await get().logDeletionAudit(result, criteria)

        set({ 
          deletionResult: result,
          isLoading: false 
        })

        return result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete history records'
      set({ 
        error: errorMessage, 
        isLoading: false,
        deletionResult: null
      })
      throw error
    }
  },

  // RM-008: Implement context-based deletion for IDE 28 integration
  deleteWithContext: async (context?: GlobalContext): Promise<DeletionResult> => {
    const globalContext = context || useGlobalContextStore.getState()
    const criteria = buildContextBasedCriteria(globalContext)
    
    return get().deleteHistoFusionSeparationSaisie(criteria)
  },

  validateDeletionCriteria: async (criteria: HistoFusionSeparationCriteria): Promise<boolean> => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi

      if (isRealApi) {
        const response = await apiClient.post<ApiResponse<{ isValid: boolean }>>(
          '/api/historyCleanup/validateCriteria',
          { criteria }
        )

        const isValid = response.data?.data?.isValid ?? false
        set({ isLoading: false })
        return isValid
      } else {
        await new Promise(resolve => setTimeout(resolve, 800))

        const isValid = validateHistoryCleanupCriteriaMock(criteria)

        set({ isLoading: false })
        return isValid
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate deletion criteria'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      return false
    }
  },

  // RM-009: Implement constraint validation with detailed error reporting
  validateConstraints: async (criteria: HistoFusionSeparationCriteria): Promise<{ isValid: boolean; violations: string[] }> => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi

      if (isRealApi) {
        const response = await apiClient.post<ApiResponse<{ isValid: boolean; violations: string[] }>>(
          '/api/historyCleanup/validateConstraints',
          { criteria }
        )

        const result = response.data?.data || { isValid: false, violations: ['Validation failed'] }
        set({ isLoading: false })
        return result
      } else {
        await new Promise(resolve => setTimeout(resolve, 600))

        const result = validateDatabaseConstraints(criteria)
        set({ isLoading: false })
        return result
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate constraints'
      set({ 
        error: errorMessage, 
        isLoading: false 
      })
      return { isValid: false, violations: [errorMessage] }
    }
  },

  // RM-010: Implement audit logging for historical data operations
  logDeletionAudit: async (result: DeletionResult, criteria: HistoFusionSeparationCriteria): Promise<void> => {
    try {
      const auditEntry = createAuditLogEntry(result, criteria)
      const isRealApi = useDataSourceStore.getState().isRealApi

      if (isRealApi) {
        await apiClient.post('/api/audit/log', auditEntry)
      } else {
        console.log('Audit Log Entry (Mock):', auditEntry)
      }
    } catch (error) {
      console.warn('Failed to log audit entry:', error)
    }
  },

  reset: () => {
    set(initialHistoryCleanupState)
  }
}))