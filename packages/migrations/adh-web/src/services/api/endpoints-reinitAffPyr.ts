import { apiClient, type ApiResponse } from './apiClient';
import type {
  ReinitAffectationParams,
  ReinitAffectationResponse,
  AffectationStatusResponse,
} from '@/types/reinitAffPyr';

export const reinitAffPyrApi = {
  resetAffectationPyr: (params: ReinitAffectationParams) => {
    const queryParts = [
      `societe=${encodeURIComponent(params.societe)}`,
      `compte=${params.compte}`,
    ];
    if (params.chambre) {
      queryParts.push(`chambre=${encodeURIComponent(params.chambre)}`);
    }
    return apiClient.post<ApiResponse<ReinitAffectationResponse>>(
      `/api/reinitAffPyr/reset?${queryParts.join('&')}`,
      {},
    );
  },

  resetAllAffectations: () =>
    apiClient.post<ApiResponse<ReinitAffectationResponse>>(
      '/api/reinitAffPyr/reset-all',
      {},
    ),

  getAffectationStatus: (societe: string, compte: number) =>
    apiClient.get<ApiResponse<AffectationStatusResponse>>(
      `/api/reinitAffPyr/status?societe=${encodeURIComponent(societe)}&compte=${compte}`,
    ),
};