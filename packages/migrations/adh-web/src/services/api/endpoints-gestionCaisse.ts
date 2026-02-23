import { apiClient, type ApiResponse } from '@/services/api/apiClient';
import type {
  SessionCaisse,
  ParametresCaisse,
  DateComptable,
  SessionConcurrente,
  MouvementCaisse,
  HistoriqueQueryParams,
} from '@/types/gestionCaisse';

export const gestionCaisseApi = {
  getParametres: () =>
    apiClient.get<ApiResponse<ParametresCaisse>>(
      '/api/gestion-caisse/parametres',
    ),

  getSessionActive: () =>
    apiClient.get<ApiResponse<SessionCaisse | null>>(
      '/api/gestion-caisse/session-active',
    ),

  getDateComptable: () =>
    apiClient.get<ApiResponse<DateComptable>>(
      '/api/gestion-caisse/date-comptable',
    ),

  getSessionsConcurrentes: () =>
    apiClient.get<ApiResponse<SessionConcurrente[]>>(
      '/api/gestion-caisse/sessions-concurrentes',
    ),

  ouvrirSession: () =>
    apiClient.post<ApiResponse<SessionCaisse>>(
      '/api/gestion-caisse/ouvrir-session',
      {},
    ),

  apportCoffre: (montant: number, deviseCode: string) =>
    apiClient.post<ApiResponse<MouvementCaisse>>(
      `/api/gestion-caisse/apport-coffre?montant=${montant}&deviseCode=${encodeURIComponent(deviseCode)}`,
      {},
    ),

  apportProduit: (produitId: number, quantite: number) =>
    apiClient.post<ApiResponse<MouvementCaisse>>(
      `/api/gestion-caisse/apport-produit?produitId=${produitId}&quantite=${quantite}`,
      {},
    ),

  remiseCoffre: (montant: number, deviseCode: string) =>
    apiClient.post<ApiResponse<MouvementCaisse>>(
      `/api/gestion-caisse/remise-coffre?montant=${montant}&deviseCode=${encodeURIComponent(deviseCode)}`,
      {},
    ),

  fermerSession: () =>
    apiClient.post<ApiResponse<SessionCaisse>>(
      '/api/gestion-caisse/fermer-session',
      {},
    ),

  getHistorique: (params: HistoriqueQueryParams) => {
    const query = new URLSearchParams();
    if (params.dateDebut) query.append('dateDebut', params.dateDebut);
    if (params.dateFin) query.append('dateFin', params.dateFin);
    if (params.operateurId)
      query.append('operateurId', params.operateurId.toString());

    const queryString = query.toString();
    const url = `/api/gestion-caisse/historique${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<ApiResponse<SessionCaisse[]>>(url);
  },

  getSession: (sessionId: number) =>
    apiClient.get<ApiResponse<SessionCaisse>>(
      `/api/gestion-caisse/session/${sessionId}`,
    ),

  getMouvements: (sessionId: number) =>
    apiClient.get<ApiResponse<MouvementCaisse[]>>(
      `/api/gestion-caisse/mouvements/${sessionId}`,
    ),

  reimprimerTickets: (sessionId: number) =>
    apiClient.post<ApiResponse<void>>(
      `/api/gestion-caisse/reimprimer-tickets/${sessionId}`,
      {},
    ),
};