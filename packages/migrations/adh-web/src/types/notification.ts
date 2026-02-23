// Notification & Dashboard types (Lot 7)

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface DashboardStats {
  sessionsAujourdhui: number;
  transactionsAujourdhui: number;
  caTotal: number;
  devise: string;
  derniereSynchro: string;
  statusConnexion: 'connected' | 'disconnected' | 'reconnecting';
  caissesActives: number;
}

export interface DailyActivity {
  heure: string;
  transactions: number;
  montant: number;
}
