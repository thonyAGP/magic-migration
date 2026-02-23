import { create } from 'zustand';
import type { UpdateDeviseSessionRequest, DeviseSessionState } from '@/types/deviseSession';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface DeviseSessionActions {
  updateDeviseSession: (
    codeDevise: string,
    modePaiement: string,
    quand: string,
    type: string,
    quantite: number,
    cumulOpChange: boolean,
  ) => Promise<void>;
  reset: () => void;
}

type DeviseSessionStore = DeviseSessionState & DeviseSessionActions;

const initialState: Omit<DeviseSessionState, 'updateDeviseSession'> = {
  isLoading: false,
  error: null,
};

export const useDeviseSessionStore = create<DeviseSessionStore>()((set) => ({
  ...initialState,

  updateDeviseSession: async (
    codeDevise,
    modePaiement,
    quand,
    type,
    quantite,
    cumulOpChange,
  ) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      const payload: UpdateDeviseSessionRequest = {
        codeDevise,
        modePaiement,
        quand,
        type,
        quantite,
        cumulOpChange,
      };

      await apiClient.put('/api/caisse/devise-session', payload);
      set({ isLoading: false });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur mise à jour session devise';
      set({ error: message, isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));