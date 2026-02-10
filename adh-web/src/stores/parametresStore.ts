import { create } from 'zustand';
import type {
  AdminSettings,
  UserProfile,
  CaisseConfig,
  PrinterConfig,
  AuditLogEntry,
  AuditLogFilter,
  NetworkConfig,
  NetworkTestResult,
} from '@/types/admin';
import { parametresApi } from '@/services/api/endpoints-lot7';
import { useDataSourceStore } from './dataSourceStore';

const MOCK_SETTINGS: AdminSettings = {
  userId: 'USR001',
  userName: 'Jean Dupont',
  caisseId: 'CAI001',
  caisseName: 'Caisse 1 - Boutique',
  devise: 'EUR',
  modeOffline: false,
  autoLogoutMinutes: 30,
  language: 'fr',
};

const MOCK_PROFILE: UserProfile = {
  id: 'USR001',
  login: 'jdupont',
  nom: 'Dupont',
  prenom: 'Jean',
  role: 'caissier',
  lastLogin: '2026-02-10T08:30:00Z',
  passwordExpiry: '2026-05-10',
};

const MOCK_CAISSE_CONFIG: CaisseConfig = {
  id: 'CAI001',
  nom: 'Caisse 1 - Boutique',
  deviseDefaut: 'EUR',
  modeOffline: false,
  autoLogoutMinutes: 30,
  imprimanteDefaut: 'PRT001',
  formatTicket: 'standard',
};

const MOCK_PRINTERS: PrinterConfig[] = [
  { id: 'PRT001', nom: 'Imprimante Caisse 1', type: 'escpos', adresse: '192.168.1.100', port: 9100, estDefaut: true, status: 'online' },
  { id: 'PRT002', nom: 'Imprimante Bureau', type: 'pdf', adresse: 'localhost', port: 0, estDefaut: false, status: 'online' },
  { id: 'PRT003', nom: 'Imprimante Reseau', type: 'network', adresse: '192.168.1.101', port: 9100, estDefaut: false, status: 'offline' },
];

const MOCK_NETWORK_CONFIG: NetworkConfig = {
  apiUrl: 'http://localhost:5287',
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000,
  websocketUrl: 'ws://localhost:5287/ws',
  heartbeatInterval: 30000,
};

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'AUD001', timestamp: '2026-02-10T09:15:00Z', userId: 'USR001', userName: 'Jean Dupont', action: 'Ouverture session', module: 'Session', details: 'Session ouverte caisse 1', ipAddress: '192.168.1.50', severity: 'info' },
  { id: 'AUD002', timestamp: '2026-02-10T09:20:00Z', userId: 'USR001', userName: 'Jean Dupont', action: 'Vente GP', module: 'Transaction', details: 'Vente forfait GP #1234', ipAddress: '192.168.1.50', severity: 'info' },
  { id: 'AUD003', timestamp: '2026-02-10T09:45:00Z', userId: 'USR001', userName: 'Jean Dupont', action: 'Erreur impression', module: 'Imprimante', details: 'Timeout imprimante PRT003', ipAddress: '192.168.1.50', severity: 'warning' },
  { id: 'AUD004', timestamp: '2026-02-10T10:00:00Z', userId: 'USR002', userName: 'Marie Martin', action: 'Tentative connexion echouee', module: 'Auth', details: 'Mot de passe incorrect (3/5)', ipAddress: '192.168.1.51', severity: 'error' },
];

const MOCK_NETWORK_TEST: NetworkTestResult = {
  apiReachable: true,
  apiLatencyMs: 45,
  websocketReachable: true,
  websocketLatencyMs: 12,
  timestamp: new Date().toISOString(),
};

interface ParametresState {
  settings: AdminSettings | null;
  profile: UserProfile | null;
  caisseConfig: CaisseConfig | null;
  printers: PrinterConfig[];
  auditLogs: AuditLogEntry[];
  auditTotal: number;
  networkConfig: NetworkConfig | null;
  networkTestResult: NetworkTestResult | null;
  isLoading: boolean;
  isLoadingAudit: boolean;
  isTestingPrinter: boolean;
  isTestingNetwork: boolean;
  isSaving: boolean;
  error: string | null;
}

interface ParametresActions {
  loadSettings: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updatePassword: (current: string, newPwd: string, confirm: string) => Promise<boolean>;
  loadCaisseConfig: () => Promise<void>;
  saveCaisseConfig: (config: Partial<CaisseConfig>) => Promise<boolean>;
  loadPrinters: () => Promise<void>;
  testPrinter: (printerId: string) => Promise<boolean>;
  loadAuditLogs: (filter: AuditLogFilter) => Promise<void>;
  loadNetworkConfig: () => Promise<void>;
  saveNetworkConfig: (config: Partial<NetworkConfig>) => Promise<boolean>;
  testNetwork: () => Promise<void>;
  reset: () => void;
}

type ParametresStore = ParametresState & ParametresActions;

const initialState: ParametresState = {
  settings: null,
  profile: null,
  caisseConfig: null,
  printers: [],
  auditLogs: [],
  auditTotal: 0,
  networkConfig: null,
  networkTestResult: null,
  isLoading: false,
  isLoadingAudit: false,
  isTestingPrinter: false,
  isTestingNetwork: false,
  isSaving: false,
  error: null,
};

export const useParametresStore = create<ParametresStore>()((set) => ({
  ...initialState,

  loadSettings: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ settings: MOCK_SETTINGS, isLoading: false });
      return;
    }

    try {
      const response = await parametresApi.getSettings();
      set({ settings: response.data.data ?? null, isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement parametres';
      set({ error: message, isLoading: false });
    }
  },

  loadProfile: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ profile: MOCK_PROFILE, isLoading: false });
      return;
    }

    try {
      const response = await parametresApi.getUserProfile();
      set({ profile: response.data.data ?? null, isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement profil';
      set({ error: message, isLoading: false });
    }
  },

  updatePassword: async (current, newPwd, confirm) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set({ isSaving: false });
      return true;
    }

    try {
      const response = await parametresApi.updatePassword({
        currentPassword: current,
        newPassword: newPwd,
        confirmPassword: confirm,
      });
      set({ isSaving: false });
      return response.data.data?.success ?? false;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur changement mot de passe';
      set({ error: message, isSaving: false });
      return false;
    }
  },

  loadCaisseConfig: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ caisseConfig: MOCK_CAISSE_CONFIG, isLoading: false });
      return;
    }

    try {
      const response = await parametresApi.getCaisseConfig();
      set({ caisseConfig: response.data.data ?? null, isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement config caisse';
      set({ error: message, isLoading: false });
    }
  },

  saveCaisseConfig: async (config) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        caisseConfig: state.caisseConfig ? { ...state.caisseConfig, ...config } : null,
        isSaving: false,
      }));
      return true;
    }

    try {
      const response = await parametresApi.updateCaisseConfig(config);
      set({ caisseConfig: response.data.data ?? null, isSaving: false });
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur sauvegarde config caisse';
      set({ error: message, isSaving: false });
      return false;
    }
  },

  loadPrinters: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ printers: MOCK_PRINTERS, isLoading: false });
      return;
    }

    try {
      const response = await parametresApi.getPrinters();
      set({ printers: response.data.data ?? [], isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement imprimantes';
      set({ error: message, isLoading: false });
    }
  },

  testPrinter: async (printerId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isTestingPrinter: true, error: null });

    if (!isRealApi) {
      set({ isTestingPrinter: false });
      return true;
    }

    try {
      const response = await parametresApi.testPrinter({
        printerId,
        testType: 'ticket',
      });
      set({ isTestingPrinter: false });
      return response.data.data?.success ?? false;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur test imprimante';
      set({ error: message, isTestingPrinter: false });
      return false;
    }
  },

  loadAuditLogs: async (filter) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingAudit: true, error: null });

    if (!isRealApi) {
      set({ auditLogs: MOCK_AUDIT_LOGS, auditTotal: MOCK_AUDIT_LOGS.length, isLoadingAudit: false });
      return;
    }

    try {
      const response = await parametresApi.getAuditLogs(filter);
      const data = response.data.data;
      set({
        auditLogs: data?.entries ?? [],
        auditTotal: data?.total ?? 0,
        isLoadingAudit: false,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement logs audit';
      set({ error: message, isLoadingAudit: false });
    }
  },

  loadNetworkConfig: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ networkConfig: MOCK_NETWORK_CONFIG, isLoading: false });
      return;
    }

    try {
      const response = await parametresApi.getNetworkConfig();
      set({ networkConfig: response.data.data ?? null, isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement config reseau';
      set({ error: message, isLoading: false });
    }
  },

  saveNetworkConfig: async (config) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        networkConfig: state.networkConfig ? { ...state.networkConfig, ...config } : null,
        isSaving: false,
      }));
      return true;
    }

    try {
      const response = await parametresApi.updateNetworkConfig(config);
      set({ networkConfig: response.data.data ?? null, isSaving: false });
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur sauvegarde config reseau';
      set({ error: message, isSaving: false });
      return false;
    }
  },

  testNetwork: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isTestingNetwork: true, error: null, networkTestResult: null });

    if (!isRealApi) {
      set({ networkTestResult: MOCK_NETWORK_TEST, isTestingNetwork: false });
      return;
    }

    try {
      const response = await parametresApi.testNetwork();
      set({ networkTestResult: response.data.data ?? null, isTestingNetwork: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur test reseau';
      set({ error: message, isTestingNetwork: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
