import { apiClient, type ApiResponse } from './apiClient';
import type {
  SessionOuverte,
  GetSessionsOuvertesRequest,
  VerifierExistenceSessionResponse,
} from '@/types/sessionsOuvertes';

export const sessionsOuvertesApi = {
  getSessions: (filters?: GetSessionsOuvertesRequest) => {
    const params = new URLSearchParams();
    if (filters?.societe) params.append('societe', filters.societe);
    if (filters?.operateur) params.append('operateur', filters.operateur);
    
    const queryString = params.toString();
    const url = queryString
      ? `/api/sessions/ouvertes?${queryString}`
      : '/api/sessions/ouvertes';

    return apiClient.get<ApiResponse<SessionOuverte[]>>(url);
  },

  getSessionsByFilters: (societe?: string, operateur?: string) => {
    const params = new URLSearchParams();
    if (societe) params.append('societe', societe);
    if (operateur) params.append('operateur', operateur);

    const queryString = params.toString();
    const url = queryString
      ? `/api/sessions/ouvertes?${queryString}`
      : '/api/sessions/ouvertes';

    return apiClient.get<ApiResponse<SessionOuverte[]>>(url);
  },

  verifierExistenceSession: (numeroSession: number) =>
    apiClient.get<ApiResponse<VerifierExistenceSessionResponse>>(
      `/api/sessions/existe/${numeroSession}`,
    ),
};