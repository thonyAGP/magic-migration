import { apiClient, type ApiResponse } from './apiClient';
import type { Title, TitleLookupResponse } from '@/types/titleLookup';

export const titleLookupApi = {
  getTitles: () =>
    apiClient.get<ApiResponse<Title[]>>('/api/titles'),

  getTitleByCode: (code: string, programType?: string) => {
    const params = new URLSearchParams();
    if (programType) {
      params.append('programType', programType);
    }
    const queryString = params.toString();
    const url = queryString ? `/api/titles/${code}?${queryString}` : `/api/titles/${code}`;
    return apiClient.get<ApiResponse<TitleLookupResponse>>(url);
  },
};