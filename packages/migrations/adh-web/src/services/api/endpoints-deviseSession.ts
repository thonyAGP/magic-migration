import { apiClient, type ApiResponse } from "@/services/api/apiClient";
import type {
  UpdateDeviseSessionRequest,
  UpdateDeviseSessionResponse,
} from "@/types/deviseSession";

export const deviseSessionApi = {
  updateDeviseSession: (data: UpdateDeviseSessionRequest) =>
    apiClient.put<ApiResponse<UpdateDeviseSessionResponse>>(
      "/api/caisse/devise-session",
      data,
    ),
};