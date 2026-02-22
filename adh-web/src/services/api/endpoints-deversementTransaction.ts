import { apiClient, type ApiResponse } from "@/services/api/apiClient";
import type {
  Vente,
  OperationDiverse,
  CompteGM,
  Hebergement,
  TransfertAffectation,
  ComplementBiking,
  DeversementResult,
  DeverserVenteRequest,
  AffecterTransfertRequest,
  RazAffectationRequest,
  IncrementNumeroTicketRequest,
  GetCompteGMRequest,
  GetOperationsDiversesRequest,
  OperationDiverseType,
} from "@/types/deversementTransaction";

export const deversementApi = {
  // POST /api/ventes/deversement - Créer un déversement de vente
  deverserVente: (data: DeverserVenteRequest) =>
    apiClient.post<
      ApiResponse<{
        success: boolean;
        operationsDiverses: OperationDiverse[];
        numeroTicket?: number;
      }>
    >("/api/ventes/deversement", data),

  // GET /api/ventes/:id/od - Récupérer les opérations diverses d'une vente
  getOperationsDiverses: (venteId: number) =>
    apiClient.get<ApiResponse<OperationDiverse[]>>(
      `/api/ventes/${venteId}/od`,
    ),

  // POST /api/ventes/:id/affectation - Affecter un transfert à une vente
  affecterTransfert: (venteId: number, data: AffecterTransfertRequest) =>
    apiClient.post<ApiResponse<{ success: boolean; transfertId: number }>>(
      `/api/ventes/${venteId}/affectation`,
      data,
    ),

  // DELETE /api/ventes/:id/affectation - Supprimer l'affectation d'une vente
  razAffectation: (venteId: number, data: RazAffectationRequest) =>
    apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/api/ventes/${venteId}/affectation`,
    ),

  // GET /api/comptes/gm/:societe/:compte - Récupérer les informations du compte GM
  getCompteGM: (societe: string, compte: string) =>
    apiClient.get<ApiResponse<CompteGM>>(
      `/api/comptes/gm/${societe}/${compte}`,
    ),

  // POST /api/tickets/increment - Incrémenter le numéro de ticket
  incrementerNumeroTicket: (typeVente: "VRL" | "VSL") =>
    apiClient.post<ApiResponse<{ numeroTicket: number }>>(
      `/api/tickets/increment?type=${typeVente}`,
      {},
    ),

  // Helpers pour les opérations métier complexes
  creerOperationDiverse: (
    societe: string,
    compte: string,
    typeOD: OperationDiverseType,
    montant: number,
    description?: string,
  ) =>
    apiClient.post<ApiResponse<OperationDiverse>>(
      "/api/ventes/operations-diverses",
      {
        societe,
        compte,
        typeOD,
        montant,
        description,
      },
    ),

  mettreAJourCompteGM: (
    societe: string,
    compte: string,
    montant: number,
    annulation: boolean,
  ) =>
    apiClient.put<ApiResponse<CompteGM>>(
      `/api/comptes/gm/${societe}/${compte}`,
      {
        montant,
        annulation,
      },
    ),

  mettreAJourHebergement: (
    societe: string,
    compte: string,
    statut: "actif" | "libere" | "bloque" | "termine",
  ) =>
    apiClient.put<ApiResponse<Hebergement>>(
      `/api/hebergements/${societe}/${compte}`,
      {
        statut,
      },
    ),

  mettreAJourComplementsBiking: (
    venteId: number,
    complements: Omit<ComplementBiking, "id" | "venteId">[],
  ) =>
    apiClient.put<ApiResponse<ComplementBiking[]>>(
      `/api/ventes/${venteId}/complements-biking`,
      {
        complements,
      },
    ),

  verifierEtEnvoyerMail: (venteId: number) =>
    apiClient.post<ApiResponse<{ success: boolean; mailEnvoye: boolean }>>(
      `/api/ventes/${venteId}/verifier-mail`,
      {},
    ),

  chargerCompteGM: (societe: string, compte: string) =>
    apiClient.get<ApiResponse<CompteGM>>(
      `/api/comptes/gm/${societe}/${compte}`,
    ),

  chargerOperationsDiverses: (venteId: number) =>
    apiClient.get<ApiResponse<OperationDiverse[]>>(
      `/api/ventes/${venteId}/od`,
    ),

  chargerHebergement: (societe: string, compte: string) =>
    apiClient.get<ApiResponse<Hebergement | null>>(
      `/api/hebergements/${societe}/${compte}`,
    ),

  chargerTransfertAffectation: (venteId: number) =>
    apiClient.get<ApiResponse<TransfertAffectation | null>>(
      `/api/ventes/${venteId}/transfert-affectation`,
    ),

  chargerComplementsBiking: (venteId: number) =>
    apiClient.get<ApiResponse<ComplementBiking[]>>(
      `/api/ventes/${venteId}/complements-biking`,
    ),
};