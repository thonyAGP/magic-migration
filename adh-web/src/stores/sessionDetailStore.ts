import { create } from 'zustand';
import type {
  LogSessionDetailRequest,
  LogSessionDetailResponse,
  SessionDetailState,
  SessionDetailActions,
  SessionDetailStore,
} from '@/types/sessionDetail';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

const initialState: SessionDetailState = {
  isLoading: false,
  error: null,
};

export const useSessionDetailStore = create<SessionDetailStore>()((set) => ({
  ...initialState,

  logSessionDetail: async (request: LogSessionDetailRequest) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      const payload = {
        societe: request.societe,
        deviseLocale: request.deviseLocale,
        uniBi: request.uniBi,
        chronoSession: request.chronoSession,
        quand: request.quand,
        quoi: request.quoi,
        type: request.type,
        montant: request.montant,
        montantMonnaie: request.montantMonnaie,
        montantProduits: request.montantProduits,
        montantCartes: request.montantCartes,
        montantCheques: request.montantCheques,
        montantOd: request.montantOd,
        nbreDevises: request.nbreDevises,
        commentaireEcart: request.commentaireEcart,
        commentaireEcartDevise: request.commentaireEcartDevise,
        ouvertureAuto: request.ouvertureAuto ? 'O' : '',
      };

      const response = await apiClient.post<LogSessionDetailResponse>(
        '/api/session-detail/log',
        payload,
      );

      if (!response.data.success) {
        throw new Error(response.data.error ?? 'Erreur lors de la journalisation du détail');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur journalisation détail session';
      set({ error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => set({ ...initialState }),
}));