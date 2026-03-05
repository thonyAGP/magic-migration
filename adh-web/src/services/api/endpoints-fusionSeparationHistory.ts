import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import type { 
  FusionSeparationHistoryEntry, 
  FusionSeparationHistoryGetResponse,
  FusionSeparationHistoryWriteRequest 
} from "@/types/fusionSeparationHistory"

interface GetEntriesParams {
  societe?: string
  compteReference?: number
  typeEF?: string
}

export const fusionSeparationHistoryService = {
  writeEntry: async (entry: FusionSeparationHistoryEntry): Promise<void> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (!isRealApi) return

    const request: FusionSeparationHistoryWriteRequest = { entry }
    await apiClient.post("/api/fusion-separation-history/entries", request)
  },

  getEntries: async (params: GetEntriesParams): Promise<FusionSeparationHistoryGetResponse> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (!isRealApi) return []

    return await apiClient.get("/api/fusion-separation-history/entries", { params })
  }
}