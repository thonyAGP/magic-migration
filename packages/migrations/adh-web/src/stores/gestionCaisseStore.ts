import { create } from 'zustand';
import type {
  SessionCaisse,
  ParametresCaisse,
  SessionConcurrente,
  MouvementCaisse,
  DateComptable,
  GestionCaisseState,
} from '@/types/gestionCaisse';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

const MOCK_PARAMETRES: ParametresCaisse = {
  caisseId: 1,
  seuilAlerte: 100,
  deviseLocale: 'EUR',
  impressionAuto: true,
};

const MOCK_SESSION_ACTIVE: SessionCaisse = {
  sessionId: 1001,
  dateOuverture: '2026-02-22T08:00:00',
  dateFermeture: null,
  operateurId: 5,
  operateurNom: 'DUPONT Jean',
  statut: 'ouverte',
  montantOuverture: 500,
  montantFermeture: null,
  ecart: null,
};

const MOCK_SESSIONS_CONCURRENTES: SessionConcurrente[] = [
  {
    sessionId: 1002,
    posteId: 'CAISSE-02',
    operateurNom: 'MARTIN Sophie',
    dateOuverture: '2026-02-22T08:15:00',
  },
  {
    sessionId: 1003,
    posteId: 'CAISSE-03',
    operateurNom: 'DURAND Pierre',
    dateOuverture: '2026-02-22T08:30:00',
  },
];

const MOCK_MOUVEMENTS: MouvementCaisse[] = [
  {
    mouvementId: 1,
    sessionId: 1001,
    type: 'apport_coffre',
    deviseCode: 'EUR',
    montant: 200,
    dateHeure: '2026-02-22T09:00:00',
  },
  {
    mouvementId: 2,
    sessionId: 1001,
    type: 'apport_coffre',
    deviseCode: 'USD',
    montant: 150,
    dateHeure: '2026-02-22T10:30:00',
  },
  {
    mouvementId: 3,
    sessionId: 1001,
    type: 'remise_coffre',
    deviseCode: 'EUR',
    montant: 100,
    dateHeure: '2026-02-22T14:00:00',
  },
];

const MOCK_HISTORIQUE: SessionCaisse[] = [
  {
    sessionId: 995,
    dateOuverture: '2026-02-21T08:00:00',
    dateFermeture: '2026-02-21T18:00:00',
    operateurId: 5,
    operateurNom: 'DUPONT Jean',
    statut: 'fermee',
    montantOuverture: 500,
    montantFermeture: 1245.5,
    ecart: 2.5,
  },
  {
    sessionId: 996,
    dateOuverture: '2026-02-20T08:00:00',
    dateFermeture: '2026-02-20T18:30:00',
    operateurId: 7,
    operateurNom: 'BERNARD Claire',
    statut: 'fermee',
    montantOuverture: 500,
    montantFermeture: 982,
    ecart: -5,
  },
  {
    sessionId: 997,
    dateOuverture: '2026-02-19T08:00:00',
    dateFermeture: '2026-02-19T17:45:00',
    operateurId: 5,
    operateurNom: 'DUPONT Jean',
    statut: 'fermee',
    montantOuverture: 500,
    montantFermeture: 1567.75,
    ecart: 0,
  },
  {
    sessionId: 998,
    dateOuverture: '2026-02-18T08:00:00',
    dateFermeture: '2026-02-18T18:15:00',
    operateurId: 9,
    operateurNom: 'PETIT Laurent',
    statut: 'fermee',
    montantOuverture: 500,
    montantFermeture: 734.25,
    ecart: 12.5,
  },
  {
    sessionId: 999,
    dateOuverture: '2026-02-17T08:00:00',
    dateFermeture: '2026-02-17T18:00:00',
    operateurId: 7,
    operateurNom: 'BERNARD Claire',
    statut: 'fermee',
    montantOuverture: 500,
    montantFermeture: 1123,
    ecart: -3,
  },
];

const MOCK_DATE_COMPTABLE: DateComptable = {
  date: '2026-02-22',
  valide: true,
};

const initialState: Omit<
  GestionCaisseState,
  | 'chargerParametres'
  | 'chargerSessionActive'
  | 'verifierDateComptable'
  | 'controlerCoffre'
  | 'detecterSessionsConcurrentes'
  | 'ouvrirSession'
  | 'apportCoffre'
  | 'apportProduit'
  | 'remiseCoffre'
  | 'fermerSession'
  | 'consulterHistorique'
  | 'consulterSession'
  | 'reimprimerTickets'
  | 'setShowHistoriqueDialog'
  | 'setShowConsultationDialog'
  | 'setSelectedSessionId'
  | 'setError'
  | 'reset'
> = {
  sessionActive: null,
  parametres: null,
  sessionsConcurrentes: [],
  mouvements: [],
  historique: [],
  dateComptable: null,
  isLoading: false,
  error: null,
  showHistoriqueDialog: false,
  showConsultationDialog: false,
  selectedSessionId: null,
};

export const useGestionCaisseStore = create<GestionCaisseState>()((set) => ({
  ...initialState,

  chargerParametres: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ parametres: MOCK_PARAMETRES, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<ParametresCaisse>>(
        '/api/gestion-caisse/parametres',
      );
      set({ parametres: response.data.data ?? null });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur chargement paramètres';
      set({ parametres: null, error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  chargerSessionActive: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ sessionActive: MOCK_SESSION_ACTIVE, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<SessionCaisse | null>>(
        '/api/gestion-caisse/session-active',
      );
      set({ sessionActive: response.data.data ?? null });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur chargement session active';
      set({ sessionActive: null, error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  verifierDateComptable: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ dateComptable: MOCK_DATE_COMPTABLE, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<DateComptable>>(
        '/api/gestion-caisse/date-comptable',
      );
      set({ dateComptable: response.data.data ?? null });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur vérification date comptable';
      set({ dateComptable: null, error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  controlerCoffre: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      await apiClient.post<ApiResponse<void>>(
        '/api/gestion-caisse/controler-coffre',
      );
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur contrôle coffre';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  detecterSessionsConcurrentes: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        sessionsConcurrentes: MOCK_SESSIONS_CONCURRENTES,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<SessionConcurrente[]>>(
        '/api/gestion-caisse/sessions-concurrentes',
      );
      set({ sessionsConcurrentes: response.data.data ?? [] });
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : 'Erreur détection sessions concurrentes';
      set({ sessionsConcurrentes: [], error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  ouvrirSession: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        sessionActive: MOCK_SESSION_ACTIVE,
        mouvements: [],
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.post<ApiResponse<SessionCaisse>>(
        '/api/gestion-caisse/ouvrir-session',
      );
      set({ sessionActive: response.data.data ?? null });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur ouverture session';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  apportCoffre: async (montant, deviseCode) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const newMouvement: MouvementCaisse = {
        mouvementId: Math.floor(Math.random() * 10000),
        sessionId: MOCK_SESSION_ACTIVE.sessionId,
        type: 'apport_coffre',
        deviseCode,
        montant,
        dateHeure: new Date().toISOString(),
      };
      set((state) => ({
        mouvements: [...state.mouvements, newMouvement],
        isLoading: false,
      }));
      return;
    }

    try {
      const response = await apiClient.post<ApiResponse<MouvementCaisse>>(
        '/api/gestion-caisse/apport-coffre',
        { montant, deviseCode },
      );
      const newMouvement = response.data.data;
      if (newMouvement) {
        set((state) => ({
          mouvements: [...state.mouvements, newMouvement],
        }));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur apport coffre';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  apportProduit: async (produitId, quantite) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const newMouvement: MouvementCaisse = {
        mouvementId: Math.floor(Math.random() * 10000),
        sessionId: MOCK_SESSION_ACTIVE.sessionId,
        type: 'apport_produit',
        deviseCode: 'EUR',
        montant: quantite * 10,
        dateHeure: new Date().toISOString(),
      };
      set((state) => ({
        mouvements: [...state.mouvements, newMouvement],
        isLoading: false,
      }));
      return;
    }

    try {
      const response = await apiClient.post<ApiResponse<MouvementCaisse>>(
        '/api/gestion-caisse/apport-produit',
        { produitId, quantite },
      );
      const newMouvement = response.data.data;
      if (newMouvement) {
        set((state) => ({
          mouvements: [...state.mouvements, newMouvement],
        }));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur apport produit';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  remiseCoffre: async (montant, deviseCode) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const newMouvement: MouvementCaisse = {
        mouvementId: Math.floor(Math.random() * 10000),
        sessionId: MOCK_SESSION_ACTIVE.sessionId,
        type: 'remise_coffre',
        deviseCode,
        montant,
        dateHeure: new Date().toISOString(),
      };
      set((state) => ({
        mouvements: [...state.mouvements, newMouvement],
        isLoading: false,
      }));
      return;
    }

    try {
      const response = await apiClient.post<ApiResponse<MouvementCaisse>>(
        '/api/gestion-caisse/remise-coffre',
        { montant, deviseCode },
      );
      const newMouvement = response.data.data;
      if (newMouvement) {
        set((state) => ({
          mouvements: [...state.mouvements, newMouvement],
        }));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur remise coffre';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fermerSession: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const sessionFermee: SessionCaisse = {
        ...MOCK_SESSION_ACTIVE,
        statut: 'fermee',
        dateFermeture: new Date().toISOString(),
        montantFermeture: 1250,
        ecart: 3.5,
      };
      set({ sessionActive: sessionFermee, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.post<ApiResponse<SessionCaisse>>(
        '/api/gestion-caisse/fermer-session',
      );
      set({ sessionActive: response.data.data ?? null });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur fermeture session';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  consulterHistorique: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        historique: MOCK_HISTORIQUE,
        showHistoriqueDialog: true,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<SessionCaisse[]>>(
        '/api/gestion-caisse/historique',
      );
      set({
        historique: response.data.data ?? [],
        showHistoriqueDialog: true,
      });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur consultation historique';
      set({ historique: [], error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  consulterSession: async (sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null, selectedSessionId: sessionId });

    if (!isRealApi) {
      const session =
        MOCK_HISTORIQUE.find((s) => s.sessionId === sessionId) ?? null;
      set({
        sessionActive: session,
        mouvements: MOCK_MOUVEMENTS,
        showConsultationDialog: true,
        isLoading: false,
      });
      return;
    }

    try {
      const [sessionResponse, mouvementsResponse] = await Promise.all([
        apiClient.get<ApiResponse<SessionCaisse>>(
          `/api/gestion-caisse/session/${sessionId}`,
        ),
        apiClient.get<ApiResponse<MouvementCaisse[]>>(
          `/api/gestion-caisse/mouvements/${sessionId}`,
        ),
      ]);
      set({
        sessionActive: sessionResponse.data.data ?? null,
        mouvements: mouvementsResponse.data.data ?? [],
        showConsultationDialog: true,
      });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur consultation session';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  reimprimerTickets: async (sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      await apiClient.post<ApiResponse<void>>(
        `/api/gestion-caisse/reimprimer-tickets/${sessionId}`,
      );
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur réimpression tickets';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setShowHistoriqueDialog: (show) => set({ showHistoriqueDialog: show }),

  setShowConsultationDialog: (show) => set({ showConsultationDialog: show }),

  setSelectedSessionId: (sessionId) => set({ selectedSessionId: sessionId }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState }),
}));