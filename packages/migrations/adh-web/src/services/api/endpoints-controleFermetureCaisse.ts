import { apiClient, type ApiResponse } from './apiClient';
import type {
  ValiderParametresRequest,
  ValiderParametresResponse,
  GenererTableauRecapResponse,
  CalculerEcartsResponse,
  FinaliserFermetureResponse,
  RecupererClasseMoyenPaiementResponse,
  PointagesResponse,
} from '@/types/controleFermetureCaisse';

export const controleFermetureCaisseApi = {
  validerParametres: (data: ValiderParametresRequest) =>
    apiClient.post<ApiResponse<ValiderParametresResponse>>(
      '/api/caisse/fermeture/valider-parametres',
      data,
    ),

  genererRecap: (sessionId: number) =>
    apiClient.post<ApiResponse<GenererTableauRecapResponse>>(
      `/api/caisse/fermeture/generer-recap?sessionId=${sessionId}`,
      {},
    ),

  calculerEcarts: (sessionId: number, montantsDeclares: Record<string, number>) =>
    apiClient.post<ApiResponse<CalculerEcartsResponse>>(
      `/api/caisse/fermeture/calculer-ecarts?sessionId=${sessionId}`,
      { montantsDeclares },
    ),

  mettreAJourDevises: (data: MettreAJourDevisesSessionRequest) =>
    apiClient.post<ApiResponse<MettreAJourDevisesSessionResponse>>(
      '/api/caisse/fermeture/maj-devises-session',
      data,
    ),

  finaliser: (sessionId: number) =>
    apiClient.post<ApiResponse<FinaliserFermetureResponse>>(
      `/api/caisse/fermeture/finaliser?sessionId=${sessionId}`,
      {},
    ),

  getClasseMoyenPaiement: (moyenPaiementId: number) =>
    apiClient.get<ApiResponse<RecupererClasseMoyenPaiementResponse>>(
      `/api/caisse/fermeture/classe-moyen-paiement?moyenPaiementId=${moyenPaiementId}`,
    ),

  getPointages: (sessionId: number) =>
    apiClient.get<ApiResponse<PointagesResponse>>(
      `/api/caisse/fermeture/pointages?sessionId=${sessionId}`,
    ),
};