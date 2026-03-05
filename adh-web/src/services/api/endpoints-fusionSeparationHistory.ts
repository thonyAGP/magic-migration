import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import type { 
  FusionSeparationHistoryEntry, 
  FusionSeparationHistoryGetResponse,
  FusionSeparationHistoryWriteRequest 
} from "@/types/fusionSeparationHistory"

interface GetFusionSeparationHistoryEntriesParams {
  societe?: string
  compteReference?: number
  typeEF?: string
}

const checkRealApiMode = (): boolean => useDataSourceStore.getState().isRealApi

export const fusionSeparationHistoryService = {
  writeEntry: async (entry: FusionSeparationHistoryEntry): Promise<void> => {
    if (!checkRealApiMode()) return

    const request: FusionSeparationHistoryWriteRequest = { entry }
    await apiClient.post("/api/fusion-separation-history/entries", request)
  },

  getEntries: async (params: GetFusionSeparationHistoryEntriesParams): Promise<FusionSeparationHistoryGetResponse> => {
    if (!checkRealApiMode()) return []

    return await apiClient.get("/api/fusion-separation-history/entries", { params })
  }
}