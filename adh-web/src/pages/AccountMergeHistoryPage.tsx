import { useCallback } from 'react';
import type { FusionSeparationHistoryEntry } from '@/types/accountMergeHistory';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';

interface DeleteHistoryParams {
  chronoId?: number;
  companyCode?: string;
  referenceAccount?: number;
  referenceFiliation?: number;
  oldPointedAccount?: number;
  oldPointedFiliation?: number;
}

// SPEC-FIX: Changed from write operation to delete operation as per spec title "Delete histo_Fus_Sep_Saisie"
export const deleteHistoFusionSeparation = () => {
  const isRealApi = useDataSourceStore.getState().isRealApi;

  // SPEC-FIX: Changed from writeHistoryEntry to deleteHistoryEntries - spec indicates deletion of historical records
  const deleteHistoryEntries = useCallback(async (params?: DeleteHistoryParams): Promise<void> => {
    try {
      if (isRealApi) {
        // SPEC-FIX: DELETE operation to purge historical records from histo_fusionseparation_saisie table
        const queryParams = new URLSearchParams();
        if (params?.chronoId) queryParams.append('chronoId', params.chronoId.toString());
        if (params?.companyCode) queryParams.append('companyCode', params.companyCode);
        if (params?.referenceAccount) queryParams.append('referenceAccount', params.referenceAccount.toString());
        if (params?.referenceFiliation) queryParams.append('referenceFiliation', params.referenceFiliation.toString());
        if (params?.oldPointedAccount) queryParams.append('oldPointedAccount', params.oldPointedAccount.toString());
        if (params?.oldPointedFiliation) queryParams.append('oldPointedFiliation', params.oldPointedFiliation.toString());

        const url = `/api/histo-fusion-separation${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        await apiClient.delete<ApiResponse<void>>(url);
      } else {
        // SPEC-FIX: Mock deletion of records from histo_fusionseparation_saisie table
        console.log('Mock: Deleting history entries from histo_fusionseparation_saisie table with params:', params);
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Error deleting fusion/separation history:', error);
      throw error;
    }
  }, [isRealApi]);

  // SPEC-FIX: Return the delete function - this performs cleanup/maintenance after fusion operations
  return { deleteHistoryEntries };
};

// SPEC-FIX: Export the service function for use by calling programs (ADH IDE 28 - Fusion)
export const useDeleteHistoFusionSeparation = () => {
  return deleteHistoFusionSeparation();
};