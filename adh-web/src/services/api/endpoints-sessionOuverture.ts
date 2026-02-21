import { apiClient, type ApiResponse } from "@/services/api/apiClient";
import type {
  OuvertureTicketData,
} from "@/types/sessionOuverture";

export const sessionOuvertureApi = {
  getOuvertureTicket: (sessionId: string) =>
    apiClient.get<ApiResponse<OuvertureTicketData>>(
      `/api/session/ouverture/ticket/${sessionId}`,
    ),
};