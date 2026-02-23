import { apiClient } from './apiClient';
import type {
  CalculerSoldeOuvertureRequest,
  CoherenceValidationResult,
  SoldeCalculationResult,
  SoldeOuverture,
  UpdateDeviseSessionRequest,
  ValiderCoherenceSoldeRequest,
} from '@/types/soldeOuverture';

export const soldeOuvertureApi = {
  calculerSoldeOuverture: (data: CalculerSoldeOuvertureRequest) =>
    apiClient.post<SoldeCalculationResult>(
      '/api/solde-ouverture/calculer',
      data,
    ),

  getSoldeOuverture: (societe: string, sessionId: number) =>
    apiClient.get<SoldeOuverture>(
      `/api/solde-ouverture/${societe}/${sessionId}`,
    ),

  validerCoherenceSolde: (data: ValiderCoherenceSoldeRequest) =>
    apiClient.post<CoherenceValidationResult>(
      '/api/solde-ouverture/valider-coherence',
      data,
    ),

  updateDeviseSession: (data: UpdateDeviseSessionRequest) =>
    apiClient.post<void>(
      '/api/solde-ouverture/update-devise-session',
      data,
    ),
};