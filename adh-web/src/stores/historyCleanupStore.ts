import { create } from "zustand"
import { apiClient } from "@/services/api/apiClient"
import type { ApiResponse } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import type {
  HistoryCleanupState,
  HistoryCleanupActions,
  HistoFusionSeparationCriteria,
  DeletionResult,
  DeleteHistoFusionSeparationSaisieResponse
} from "@/types/historyCleanup"

type HistoryCleanupStore = HistoryCleanupState & HistoryCleanupActions & {
  reset: () => void
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
  if (criteria.comptePointeOld !== undefined) {
    queryParams.append('comptePointeOld', criteria.comptePointeOld.toString())
  }
  if (criteria.filiationPointeOld !== undefined) {
    queryParams.append('filiationPointeOld', criteria.filiationPointeOld.toString())
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
    criteria.filiationPointeOld !== undefined
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

export const useHistoryCleanupStore = create<HistoryCleanupStore>((set, get) => ({
  ...initialHistoryCleanupState,

  deleteHistoFusionSeparationSaisie: async (criteria: HistoFusionSeparationCriteria): Promise<DeletionResult> => {
    set({ isLoading: true, error: null, deletionCriteria: criteria })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi

      if (isRealApi) {
        const queryParams = buildHistoryCleanupQueryParams(criteria)
        const url = `/api/historyCleanup/fusionSeparationSaisie?${queryParams.toString()}`
        const response = await apiClient.delete<DeleteHistoFusionSeparationSaisieResponse>(url)

        if (!response.data?.success) {
          throw new Error('Failed to delete fusion separation history records')
        }

        set({ 
          deletionResult: response.data.data,
          isLoading: false 
        })

        return response.data.data
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200))

        const result = generateMockHistoryCleanupResult()

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

  reset: () => {
    set(initialHistoryCleanupState)
  }
}))