import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import type { 
  HistoFusionSeparationCriteria,
  DeletionResult,
  DeleteHistoFusionSeparationSaisieResponse
} from "@/types/historyCleanup"

const buildQueryParams = (criteria: HistoFusionSeparationCriteria): URLSearchParams => {
  const queryParams = new URLSearchParams()

  if (criteria.chronoEF !== undefined) queryParams.append('chronoEF', criteria.chronoEF.toString())
  if (criteria.societe) queryParams.append('societe', criteria.societe)
  if (criteria.compteReference !== undefined) queryParams.append('compteReference', criteria.compteReference.toString())
  if (criteria.filiationReference !== undefined) queryParams.append('filiationReference', criteria.filiationReference.toString())

  return queryParams
}

export const historyCleanupService = {
  deleteHistoFusionSeparationSaisie: async (
    criteria: HistoFusionSeparationCriteria
  ): Promise<DeletionResult> => {
    const queryParams = buildQueryParams(criteria)

    const response: DeleteHistoFusionSeparationSaisieResponse = await apiClient.delete(
      `/api/historyCleanup/fusionSeparationSaisie?${queryParams.toString()}`
    )

    return response.data
  },

  validateDeletionCriteria: async (
    criteria: HistoFusionSeparationCriteria
  ): Promise<boolean> => {
    return Object.values(criteria).some(value => value !== undefined && value !== null)
  }
}