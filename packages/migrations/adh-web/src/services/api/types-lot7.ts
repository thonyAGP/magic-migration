// API request types for Lot 7 (Admin / Parametres)

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateCaisseConfigRequest {
  deviseDefaut?: string;
  modeOffline?: boolean;
  autoLogoutMinutes?: number;
  imprimanteDefaut?: string;
  formatTicket?: string;
}

export interface TestPrinterRequest {
  printerId: string;
  testType: 'page' | 'ticket';
}

export interface UpdateNetworkConfigRequest {
  apiUrl?: string;
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  websocketUrl?: string;
  heartbeatInterval?: number;
}
