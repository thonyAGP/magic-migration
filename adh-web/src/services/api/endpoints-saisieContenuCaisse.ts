import { apiClient, type ApiResponse } from './apiClient';
import type {
  Denomination,
  RecapMOP,
  DeviseComptage,
  ValidationResult,
} from '@/types/saisieContenuCaisse';

export const saisieContenuCaisseApi = {
  getDenominations: (deviseCode: string) =>
    apiClient.get<ApiResponse<Denomination[]>>(
      `/api/caisse/denominations/${encodeURIComponent(deviseCode)}`,
    ),

  validateComptage: (data: {
    comptageDevises: Record<string, DeviseComptage>;
    nbreDevise: number;
    fromIms: boolean;
  }) =>
    apiClient.post<ApiResponse<ValidationResult>>(
      '/api/caisse/comptage/validate',
      data,
    ),

  getRecapMOP: (sessionId: number) =>
    apiClient.get<ApiResponse<RecapMOP[]>>(
      `/api/caisse/session/${sessionId}/recap-mop`,
    ),

  persistComptage: (data: {
    sessionId: number;
    validationResult: ValidationResult;
    comptageDevises: Record<string, DeviseComptage>;
    recapMOP: RecapMOP[];
  }) =>
    apiClient.post<
      ApiResponse<{
        success: boolean;
        ticketUrl?: string;
      }>
    >('/api/caisse/comptage/persist', data),
};