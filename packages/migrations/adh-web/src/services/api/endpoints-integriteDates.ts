import { apiClient, type ApiResponse } from './apiClient';
import type {
  DateIntegrityCheck,
  DateComptable,
  DateCheckRequest,
} from '@/types/integriteDates';

export const integriteDatesApi = {
  checkIntegrity: (request: DateCheckRequest) =>
    apiClient.post<ApiResponse<DateIntegrityCheck>>(
      '/controles/integrite-dates',
      request,
    ),

  getDateComptable: (societe: string, checkType: string) =>
    apiClient.get<ApiResponse<DateComptable>>(
      `/controles/date-comptable?societe=${encodeURIComponent(societe)}&checkType=${encodeURIComponent(checkType)}`,
    ),
};