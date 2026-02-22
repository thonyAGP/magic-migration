import { apiClient, type ApiResponse } from '@/services/api/apiClient';
import type {
  TauxChange,
  ConversionParams,
  ConversionResult,
  GetTauxChangeRequest,
  CalculerEquivalentRequest,
  CalculerEquivalentResponse,
  GetTauxChangeResponse,
} from '@/types/calculEquivalent';

export const calculEquivalentApi = {
  calculerEquivalent: (params: ConversionParams) =>
    apiClient.post<CalculerEquivalentResponse>(
      '/api/change/calculer-equivalent',
      { params } as CalculerEquivalentRequest,
    ),

  getTauxChange: (
    societe: string,
    devise: string,
    typeOperation: 'A' | 'V',
    uniBi: 'U' | 'B',
  ) =>
    apiClient.get<GetTauxChangeResponse>(
      `/api/change/taux?societe=${encodeURIComponent(societe)}&devise=${encodeURIComponent(devise)}&typeOperation=${typeOperation}&uniBi=${uniBi}`,
    ),
};