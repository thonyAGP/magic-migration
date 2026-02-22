import { apiClient, type ApiResponse } from './apiClient';
import type {
  Cheque,
  EnregistrerDepotRequest,
  EnregistrerDepotResponse,
  EnregistrerRetraitRequest,
  EnregistrerRetraitResponse,
  ListerChequesResponse,
  ValiderChequeRequest,
  ValiderChequeResponse,
  CalculerTotauxResponse,
  ChequeFilters,
} from '@/types/gestionCheque';

export const gestionChequeApi = {
  enregistrerDepot: (data: EnregistrerDepotRequest) =>
    apiClient.post<ApiResponse<EnregistrerDepotResponse>>(
      '/api/gestion-cheque/depot',
      data,
    ),

  enregistrerRetrait: (data: EnregistrerRetraitRequest) =>
    apiClient.post<ApiResponse<EnregistrerRetraitResponse>>(
      '/api/gestion-cheque/retrait',
      data,
    ),

  listerCheques: (
    societe: string,
    compte: string,
    filiation: string,
    filters?: ChequeFilters,
  ) => {
    const params = new URLSearchParams();
    if (filters?.dateDebut) {
      params.append('dateDebut', filters.dateDebut.toISOString());
    }
    if (filters?.dateFin) {
      params.append('dateFin', filters.dateFin.toISOString());
    }
    if (filters?.estPostdate !== undefined) {
      params.append('estPostdate', String(filters.estPostdate));
    }

    const queryString = params.toString();
    const url = `/api/gestion-cheque/liste/${societe}/${compte}/${filiation}${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<ApiResponse<Cheque[]>>(url);
  },

  validerCheque: (data: ValiderChequeRequest) =>
    apiClient.post<ApiResponse<ValiderChequeResponse>>(
      '/api/gestion-cheque/valider',
      data,
    ),

  calculerTotaux: (societe: string, compte: string, filiation: string) =>
    apiClient.get<ApiResponse<CalculerTotauxResponse>>(
      `/api/gestion-cheque/totaux/${societe}/${compte}/${filiation}`,
    ),
};