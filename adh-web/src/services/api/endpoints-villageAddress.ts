import { apiClient, type ApiResponse } from "@/services/api/apiClient";
import type {
  VillageAddress,
  GetVillageAddressResponse,
  SetVillageAddressRequest,
  SetVillageAddressResponse,
} from "@/types/villageAddress";

export const villageAddressApi = {
  getVillageAddress: () =>
    apiClient.get<ApiResponse<GetVillageAddressResponse>>(
      "/api/village-address",
    ),

  setVillageAddress: (data: SetVillageAddressRequest) =>
    apiClient.put<ApiResponse<SetVillageAddressResponse>>(
      "/api/village-address",
      data,
    ),
};