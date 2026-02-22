import { apiClient, type ApiResponse } from './apiClient';
import type {
  RaisonUtilisation,
  GetRaisonsUtilisationRequest,
  GetRaisonsUtilisationResponse,
} from '@/types/raisonsUtilisation';

export const raisonsUtilisationApi = {
  getRaisonsUtilisation: (params?: GetRaisonsUtilisationRequest) => {
    const queryString = params?.serviceCode
      ? `?serviceCode=${params.serviceCode}`
      : '';
    return apiClient.get<ApiResponse<RaisonUtilisation[]>>(
      `/api/raisons-utilisation${queryString}`,
    );
  },
};