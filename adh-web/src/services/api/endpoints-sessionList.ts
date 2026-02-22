import { apiClient, type ApiResponse } from './apiClient';
import type {
  Session,
  GetSessionsListRequest,
  GetSessionsListResponse,
} from '@/types/sessionList';

export const sessionListApi = {
  getSessions: (filters?: GetSessionsListRequest) => {
    const params = new URLSearchParams();

    if (filters?.societe) {
      params.append('societe', filters.societe);
    }
    if (filters?.existeSession !== undefined) {
      params.append('existeSession', String(filters.existeSession));
    }
    if (filters?.existeSessionOuverte !== undefined) {
      params.append('existeSessionOuverte', String(filters.existeSessionOuverte));
    }
    if (filters?.deviseLocale) {
      params.append('deviseLocale', filters.deviseLocale);
    }

    const queryString = params.toString();
    const url = queryString ? `/api/sessions/list?${queryString}` : '/api/sessions/list';

    return apiClient.get<ApiResponse<GetSessionsListResponse>>(url);
  },
};