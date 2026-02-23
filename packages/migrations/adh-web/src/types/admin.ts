// Admin / Parametres types (Lot 7)

export interface AdminSettings {
  userId: string;
  userName: string;
  caisseId: string;
  caisseName: string;
  devise: string;
  modeOffline: boolean;
  autoLogoutMinutes: number;
  language: string;
}

export interface UserProfile {
  id: string;
  login: string;
  nom: string;
  prenom: string;
  role: 'caissier' | 'superviseur' | 'admin';
  lastLogin: string;
  passwordExpiry: string;
}

export interface AdminCaisseConfig {
  id: string;
  nom: string;
  deviseDefaut: string;
  modeOffline: boolean;
  autoLogoutMinutes: number;
  imprimanteDefaut: string;
  formatTicket: string;
}

export interface PrinterConfig {
  id: string;
  nom: string;
  type: 'pdf' | 'escpos' | 'network';
  adresse: string;
  port: number;
  estDefaut: boolean;
  status: 'online' | 'offline' | 'error';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'error';
}

export interface AuditLogFilter {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  module?: string;
  severity?: string;
  page: number;
  pageSize: number;
}

export interface NetworkConfig {
  apiUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  websocketUrl: string;
  heartbeatInterval: number;
}

export interface NetworkTestResult {
  apiReachable: boolean;
  apiLatencyMs: number;
  websocketReachable: boolean;
  websocketLatencyMs: number;
  timestamp: string;
}
