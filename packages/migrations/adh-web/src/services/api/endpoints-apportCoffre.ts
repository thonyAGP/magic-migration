import { apiClient, type ApiResponse } from './apiClient';
import type {
  Devise,
  ApportCoffreRequest,
  CaisseConfig,
} from '@/types/apportCoffre';

export const apportCoffreApi = {
  getCaisseConfig: () =>
    apiClient.get<ApiResponse<CaisseConfig>>(
      '/api/caisse/config',
    ),

  createApportCoffre: (data: ApportCoffreRequest) =>
    apiClient.post<ApiResponse<ApportCoffreResponse>>(
      '/api/caisse/operations/apport-coffre',
      data,
    ),

  getDevises: (societe: string) =>
    apiClient.get<ApiResponse<Devise[]>>(
      `/api/caisse/devises?societe=${societe}`,
    ),
};