import { apiClient } from './apiClient';
import type {
  FacturationRequest,
  MarquerGratuitRequest,
  AnnulerFacturationRequest,
  GetHistoriqueAppelsResponse,
  GetCoefficientResponse,
  FacturerAppelResponse,
  GetClotureStatusResponse,
  DebloquerClotureResponse,
  MarquerGratuitResponse,
  AnnulerFacturationResponse,
} from '@/types/facturationAppel';

export const facturationAppelApi = {
  getHistoriqueAppels: (
    societe: string,
    prefixe: string,
    dateDebut?: Date,
    dateFin?: Date,
  ) => {
    const params = new URLSearchParams();
    params.append('societe', societe);
    params.append('prefixe', prefixe);
    if (dateDebut) {
      params.append('dateDebut', dateDebut.toISOString().split('T')[0]);
    }
    if (dateFin) {
      params.append('dateFin', dateFin.toISOString().split('T')[0]);
    }
    return apiClient.get<GetHistoriqueAppelsResponse>(
      `/api/facturation-appel/historique?${params.toString()}`,
    );
  },

  getCoefficient: () =>
    apiClient.get<GetCoefficientResponse>(
      '/api/facturation-appel/coefficient',
    ),

  facturer: (request: FacturationRequest) =>
    apiClient.post<FacturerAppelResponse>(
      '/api/facturation-appel/facturer',
      request,
    ),

  getClotureStatus: () =>
    apiClient.get<GetClotureStatusResponse>(
      '/api/facturation-appel/cloture-status',
    ),

  debloquerCloture: () =>
    apiClient.post<DebloquerClotureResponse>(
      '/api/facturation-appel/debloquer-cloture',
      {},
    ),

  marquerGratuit: (id: number, request: MarquerGratuitRequest) =>
    apiClient.put<MarquerGratuitResponse>(
      `/api/facturation-appel/marquer-gratuit/${id}`,
      request,
    ),

  annulerFacturation: (id: number, request: AnnulerFacturationRequest) =>
    apiClient.delete<AnnulerFacturationResponse>(
      `/api/facturation-appel/annuler/${id}`,
      request,
    ),
};