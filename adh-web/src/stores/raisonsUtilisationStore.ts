import { create } from 'zustand';
import type {
  RaisonUtilisation,
  RaisonsUtilisationState,
  GetRaisonsUtilisationResponse,
  ValiderSelectionResponse,
} from '@/types/raisonsUtilisation';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { RAISON_UTILISATION_MOCK } from '@/types/raisonsUtilisation';

type RaisonsUtilisationStore = RaisonsUtilisationState;

const initialState: Omit<
  RaisonsUtilisationState,
  | 'loadRaisonsUtilisation'
  | 'selectRaisonPrimaire'
  | 'selectRaisonSecondaire'
  | 'validerSelection'
  | 'abandonner'
  | 'updateCommentaire'
  | 'reset'
> = {
  raisons: [],
  selectedRaisonPrimaire: null,
  selectedRaisonSecondaire: null,
  commentaireSaisi: '',
  confirmation: false,
  retourRaison: false,
  isLoading: false,
  error: null,
};

export const useRaisonsUtilisationStore = create<RaisonsUtilisationStore>()(
  (set, get) => ({
    ...initialState,

    loadRaisonsUtilisation: async (serviceCode) => {
      const { isRealApi } = useDataSourceStore.getState();
      set({ isLoading: true, error: null });

      if (!isRealApi) {
        let filtered = [...RAISON_UTILISATION_MOCK];
        if (serviceCode !== undefined) {
          filtered = filtered.filter((r) => r.idPrimaire === serviceCode);
        }
        const sorted = filtered.sort((a, b) => a.idPrimaire - b.idPrimaire);
        set({ raisons: sorted, isLoading: false });
        return;
      }

      try {
        const params = serviceCode !== undefined ? { serviceCode } : undefined;
        const response = await apiClient.get<GetRaisonsUtilisationResponse>(
          '/api/raisons-utilisation',
          { params },
        );
        const raisons = response.data.data ?? [];
        const sorted = raisons.sort((a, b) => a.idPrimaire - b.idPrimaire);
        set({ raisons: sorted });
      } catch (e: unknown) {
        const message =
          e instanceof Error
            ? e.message
            : 'Erreur chargement raisons utilisation';
        set({ raisons: [], error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    selectRaisonPrimaire: async (idPrimaire) => {
      const { raisons } = get();
      const raison = raisons.find((r) => r.idPrimaire === idPrimaire);

      if (!raison) {
        set({ error: 'Raison primaire introuvable' });
        return;
      }

      const hasSecondary = raison.existeRaisonSecondaire;

      set({
        selectedRaisonPrimaire: idPrimaire,
        selectedRaisonSecondaire: hasSecondary ? null : raison.idSecondaire,
        error: null,
      });
    },

    selectRaisonSecondaire: async (idSecondaire) => {
      const { raisons, selectedRaisonPrimaire } = get();

      if (selectedRaisonPrimaire === null) {
        set({ error: 'Aucune raison primaire sélectionnée' });
        return;
      }

      const primaryRaison = raisons.find(
        (r) => r.idPrimaire === selectedRaisonPrimaire,
      );

      if (!primaryRaison || !primaryRaison.existeRaisonSecondaire) {
        set({ error: 'Cette raison primaire ne possède pas de raisons secondaires' });
        return;
      }

      set({ selectedRaisonSecondaire: idSecondaire, error: null });
    },

    validerSelection: async () => {
      const {
        commentaireSaisi,
        selectedRaisonPrimaire,
        selectedRaisonSecondaire,
        confirmation,
      } = get();

      const trimmedComment = commentaireSaisi.trim();

      if (trimmedComment === '' || !confirmation) {
        set({
          error:
            'Commentaire requis et confirmation nécessaire avant validation',
        });
        return;
      }

      if (selectedRaisonPrimaire === null || selectedRaisonPrimaire === 0) {
        set({ error: 'Aucune raison primaire sélectionnée' });
        return;
      }

      const { isRealApi } = useDataSourceStore.getState();

      if (!isRealApi) {
        set({
          confirmation: true,
          retourRaison: true,
          error: null,
        });
        return;
      }

      try {
        const response = await apiClient.post<ValiderSelectionResponse>(
          '/api/raisons-utilisation/valider',
          {
            commentaire: trimmedComment,
            selectedRaisonPrimaire,
            selectedRaisonSecondaire,
          },
        );

        if (response.data.success) {
          set({ confirmation: true, retourRaison: true, error: null });
        } else {
          set({ error: response.data.message ?? 'Erreur validation' });
        }
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : 'Erreur validation sélection';
        set({ error: message });
      }
    },

    abandonner: async () => {
      set({
        confirmation: false,
        retourRaison: false,
        selectedRaisonPrimaire: null,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        error: null,
      });
    },

    updateCommentaire: (commentaire) => {
      set({ commentaireSaisi: commentaire.trim(), error: null });
    },

    reset: () => set({ ...initialState }),
  }),
);