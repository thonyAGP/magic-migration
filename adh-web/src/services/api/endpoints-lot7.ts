import { apiClient, type ApiResponse } from './apiClient';
import type {
  AdminSettings,
  UserProfile,
  AdminCaisseConfig,
  PrinterConfig,
  AuditLogEntry,
  AuditLogFilter,
  NetworkConfig,
  NetworkTestResult,
} from '@/types/admin';
import type { DashboardStats, DailyActivity } from '@/types/notification';
import type {
  UpdatePasswordRequest,
  UpdateCaisseConfigRequest,
  TestPrinterRequest,
  UpdateNetworkConfigRequest,
} from './types-lot7';

// Parametres endpoints (Lot 7)
export const parametresApi = {
  getSettings: () =>
    apiClient.get<ApiResponse<AdminSettings>>('/parametres/settings'),

  getUserProfile: () =>
    apiClient.get<ApiResponse<UserProfile>>('/parametres/profile'),

  updatePassword: (data: UpdatePasswordRequest) =>
    apiClient.post<ApiResponse<{ success: boolean }>>(
      '/parametres/password',
      data,
    ),

  getCaisseConfig: () =>
    apiClient.get<ApiResponse<AdminCaisseConfig>>('/parametres/caisse'),

  updateCaisseConfig: (data: UpdateCaisseConfigRequest) =>
    apiClient.put<ApiResponse<AdminCaisseConfig>>('/parametres/caisse', data),

  getPrinters: () =>
    apiClient.get<ApiResponse<PrinterConfig[]>>('/parametres/printers'),

  testPrinter: (data: TestPrinterRequest) =>
    apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      '/parametres/printers/test',
      data,
    ),

  getAuditLogs: (filter: AuditLogFilter) =>
    apiClient.get<ApiResponse<{ entries: AuditLogEntry[]; total: number }>>(
      '/parametres/audit',
      { params: filter },
    ),

  getNetworkConfig: () =>
    apiClient.get<ApiResponse<NetworkConfig>>('/parametres/network'),

  updateNetworkConfig: (data: UpdateNetworkConfigRequest) =>
    apiClient.put<ApiResponse<NetworkConfig>>('/parametres/network', data),

  testNetwork: () =>
    apiClient.post<ApiResponse<NetworkTestResult>>('/parametres/network/test'),
};

// Dashboard endpoints (Lot 7)
export const dashboardApi = {
  getStats: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  getDailyActivity: () =>
    apiClient.get<ApiResponse<DailyActivity[]>>('/dashboard/activity'),
};
