import { apiClient, type ApiResponse } from './apiClient';
import type {
  FidelisationRemise,
  RemiseResult,
  GetFidelisationRemiseRequest,
  ValidateRemiseEligibilityRequest,
  CalculateMontantRemiseRequest,
} from '@/types/fidelisationRemise';

export const fidelisationRemiseApi = {
  getRemise: (
    societe: string,
    compte: number,
    filiation: number,
    service: string,
    imputation: number,
  ) =>
    apiClient.get<ApiResponse<RemiseResult>>(
      `/api/fidelisation-remise/get?societe=${societe}&compte=${compte}&filiation=${filiation}&service=${encodeURIComponent(service)}&imputation=${imputation}`,
    ),

  validateRemise: (remiseData: FidelisationRemise) =>
    apiClient.post<
      ApiResponse<{
        isValide: boolean;
        message?: string;
      }>
    >('/api/fidelisation-remise/validate', remiseData),

  calculateMontantRemise: (remiseData: FidelisationRemise) =>
    apiClient.post<
      ApiResponse<{
        montantRemise: number;
      }>
    >('/api/fidelisation-remise/calculate', remiseData),
};