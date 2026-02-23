import { apiClient, type ApiResponse } from './apiClient';
import type {
  ApportCoffreRequest,
  ApportCoffreResponse,
  ApportProduitsRequest,
  ApportProduitsResponse,
  RemiseCoffreRequest,
  RemiseCoffreResponse,
  TelecollecteRequest,
  TelecollecteResponse,
  PointageResponse,
  RegularisationRequest,
  RegularisationResponse,
} from './types-caisse-ops';

export const caisseOpsApi = {
  apportCoffre: (data: ApportCoffreRequest) =>
    apiClient.post<ApiResponse<ApportCoffreResponse>>(
      '/caisse/apport-coffre',
      data,
    ),
  apportProduits: (data: ApportProduitsRequest) =>
    apiClient.post<ApiResponse<ApportProduitsResponse>>(
      '/caisse/apport-produits',
      data,
    ),
  remiseCoffre: (data: RemiseCoffreRequest) =>
    apiClient.post<ApiResponse<RemiseCoffreResponse>>(
      '/caisse/remise-coffre',
      data,
    ),
  telecollecte: (data: TelecollecteRequest) =>
    apiClient.post<ApiResponse<TelecollecteResponse>>(
      '/caisse/telecollecte',
      data,
    ),
  getPointage: (deviseCode: string) =>
    apiClient.get<ApiResponse<PointageResponse>>(
      `/caisse/pointage?deviseCode=${deviseCode}`,
    ),
  regularisation: (data: RegularisationRequest) =>
    apiClient.post<ApiResponse<RegularisationResponse>>(
      '/caisse/regularisation',
      data,
    ),
};
