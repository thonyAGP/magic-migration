import { apiClient, type ApiResponse } from './apiClient';
import type {
  RecapFermeture,
  PointageDevise,
  PointageArticle,
  PointageApproRemise,
  ValiderFermetureResponse,
  GenererTicketsResponse,
  SaisirMontantsRequest,
  JustifierEcartRequest,
  ApportCoffreRequest,
  ApportArticlesRequest,
  RemiseCaisseRequest,
  ValiderFermetureRequest,
} from '@/types/fermetureCaisse';

export const fermetureCaisseApi = {
  getRecapFermeture: (societe: string, numeroSession: number) =>
    apiClient.get<ApiResponse<RecapFermeture>>(
      `/fermeture-caisse/recap/${societe}/${numeroSession}`,
    ),

  getPointagesDevise: (societe: string, numeroSession: number) =>
    apiClient.get<ApiResponse<PointageDevise[]>>(
      `/fermeture-caisse/pointages-devise/${societe}/${numeroSession}`,
    ),

  getPointagesArticle: (societe: string, numeroSession: number) =>
    apiClient.get<ApiResponse<PointageArticle[]>>(
      `/fermeture-caisse/pointages-article/${societe}/${numeroSession}`,
    ),

  getPointagesApproRemise: (societe: string, numeroSession: number) =>
    apiClient.get<ApiResponse<PointageApproRemise[]>>(
      `/fermeture-caisse/pointages-appro-remise/${societe}/${numeroSession}`,
    ),

  saisirMontants: (data: SaisirMontantsRequest) =>
    apiClient.post<ApiResponse<void>>(
      '/fermeture-caisse/saisir-montants',
      data,
    ),

  justifierEcart: (data: JustifierEcartRequest) =>
    apiClient.post<ApiResponse<void>>(
      '/fermeture-caisse/justifier-ecart',
      data,
    ),

  apportCoffre: (data: ApportCoffreRequest) =>
    apiClient.post<ApiResponse<void>>(
      '/fermeture-caisse/apport-coffre',
      data,
    ),

  apportArticles: (data: ApportArticlesRequest) =>
    apiClient.post<ApiResponse<void>>(
      '/fermeture-caisse/apport-articles',
      data,
    ),

  remiseCaisse: (data: RemiseCaisseRequest) =>
    apiClient.post<ApiResponse<void>>(
      '/fermeture-caisse/remise-caisse',
      data,
    ),

  validerFermeture: (data: ValiderFermetureRequest) =>
    apiClient.post<ApiResponse<ValiderFermetureResponse>>(
      '/fermeture-caisse/valider',
      data,
    ),

  genererTickets: (societe: string, numeroSession: number) =>
    apiClient.post<ApiResponse<GenererTicketsResponse>>(
      '/fermeture-caisse/generer-tickets',
      { societe, numeroSession },
    ),

  mettreAJourHistorique: (societe: string, numeroSession: number) =>
    apiClient.put<ApiResponse<void>>(
      '/fermeture-caisse/historique',
      { societe, numeroSession },
    ),
};