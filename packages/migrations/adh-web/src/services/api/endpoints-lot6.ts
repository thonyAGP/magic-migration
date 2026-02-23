import { apiClient, type ApiResponse } from './apiClient';
import type {
  SeparationAccount,
  SeparationPreview,
  SeparationResult,
  SeparationProgress,
} from '@/types/separation';
import type {
  FusionAccount,
  FusionPreview,
  FusionResult,
  FusionProgress,
} from '@/types/fusion';
import type {
  SeparationValidateRequest,
  SeparationExecuteRequest,
  FusionValidateRequest,
  FusionExecuteRequest,
} from './types-lot6';

// Separation endpoints (IDE 27)
export const separationApi = {
  searchAccount: (societe: string, query: string) =>
    apiClient.get<ApiResponse<SeparationAccount[]>>(
      `/separation/search?societe=${societe}&q=${encodeURIComponent(query)}`,
    ),
  validate: (data: SeparationValidateRequest) =>
    apiClient.post<ApiResponse<SeparationPreview>>(
      '/separation/validate',
      data,
    ),
  execute: (data: SeparationExecuteRequest) =>
    apiClient.post<ApiResponse<{ operationId: string }>>(
      '/separation/execute',
      data,
    ),
  getProgress: (operationId: string) =>
    apiClient.get<ApiResponse<SeparationProgress>>(
      `/separation/progress/${operationId}`,
    ),
  getResult: (operationId: string) =>
    apiClient.get<ApiResponse<SeparationResult>>(
      `/separation/result/${operationId}`,
    ),
};

// Fusion endpoints (IDE 28)
export const fusionApi = {
  searchAccount: (societe: string, query: string) =>
    apiClient.get<ApiResponse<FusionAccount[]>>(
      `/fusion/search?societe=${societe}&q=${encodeURIComponent(query)}`,
    ),
  validate: (data: FusionValidateRequest) =>
    apiClient.post<ApiResponse<FusionPreview>>(
      '/fusion/validate',
      data,
    ),
  execute: (data: FusionExecuteRequest) =>
    apiClient.post<ApiResponse<{ operationId: string }>>(
      '/fusion/execute',
      data,
    ),
  getProgress: (operationId: string) =>
    apiClient.get<ApiResponse<FusionProgress>>(
      `/fusion/progress/${operationId}`,
    ),
  getResult: (operationId: string) =>
    apiClient.get<ApiResponse<FusionResult>>(
      `/fusion/result/${operationId}`,
    ),
};

// Account operations endpoints (IDE 37/190/217)
export const accountOpsApi = {
  changeAccount: (societe: string, codeAdherent: number, filiation: number) =>
    apiClient.post<ApiResponse<{ success: boolean }>>(
      '/account/change',
      { societe, codeAdherent, filiation },
    ),
  getSolde: (societe: string, codeAdherent: number, filiation: number) =>
    apiClient.get<ApiResponse<{ solde: number; devise: string }>>(
      `/account/solde/${societe}/${codeAdherent}/${filiation}`,
    ),
  getPhoneInfo: (societe: string, codeAdherent: number, filiation: number) =>
    apiClient.get<ApiResponse<{ telephone: string; portable: string }>>(
      `/account/phone/${societe}/${codeAdherent}/${filiation}`,
    ),
  updatePhone: (
    societe: string,
    codeAdherent: number,
    filiation: number,
    telephone: string,
    portable: string,
  ) =>
    apiClient.put<ApiResponse<void>>(
      `/account/phone/${societe}/${codeAdherent}/${filiation}`,
      { telephone, portable },
    ),
};
