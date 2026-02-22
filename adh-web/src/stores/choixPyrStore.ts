import { create } from 'zustand';
import type {
  Hebergement,
  ClientGm,
  ChoixPyrState,
  FetchHebergementsResponse,
  SelectChambreResponse,
} from '@/types/choixPyr';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface ChoixPyrActions {
  fetchHebergements: (
    societe: number,
    compte: number,
    filiation: number
  ) => Promise<void>;
  selectChambre: (hebergement: Hebergement) => Promise<void>;
  cancelSelection: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type ChoixPyrStore = ChoixPyrState & ChoixPyrActions;

const MOCK_CLIENT: ClientGm = {
  societe: 1,
  compte: 1001,
  filiation: 0,
  nom: 'DUBOIS',
  prenom: 'Marc',
};

const MOCK_HEBERGEMENTS: Hebergement[] = [
  {
    societe: 1,
    compte: 1001,
    filiation: 0,
    chambre: '101',
    dateDebut: new Date('2026-02-15'),
    dateFin: new Date('2026-02-28'),
    statut: 'ACTIF',
  },
  {
    societe: 1,
    compte: 1001,
    filiation: 0,
    chambre: '203',
    dateDebut: new Date('2026-02-18'),
    dateFin: null,
    statut: 'ACTIF',
  },
  {
    societe: 1,
    compte: 1001,
    filiation: 0,
    chambre: '305',
    dateDebut: new Date('2026-02-10'),
    dateFin: new Date('2026-03-05'),
    statut: 'ACTIF',
  },
];

const initialState: ChoixPyrState = {
  hebergements: [],
  selectedHebergement: null,
  clientInfo: null,
  isLoading: false,
  error: null,
};

export const useChoixPyrStore = create<ChoixPyrStore>()((set, get) => ({
  ...initialState,

  fetchHebergements: async (societe, compte, filiation) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const today = new Date();
      const validHebergements = MOCK_HEBERGEMENTS.filter(
        (h) => h.dateDebut <= today && (h.dateFin === null || h.dateFin >= today)
      );
      set({
        hebergements: validHebergements,
        clientInfo: MOCK_CLIENT,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.get<FetchHebergementsResponse>(
        `/api/choixPyr/hebergements?societe=${societe}&compte=${compte}&filiation=${filiation}`
      );
      const data = response.data.data;
      set({
        hebergements: data?.hebergements ?? [],
        clientInfo: data?.clientInfo ?? null,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement hebergements';
      set({ hebergements: [], clientInfo: null, error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  selectChambre: async (hebergement) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { clientInfo } = get();

    if (!clientInfo) {
      set({ error: 'Aucune information client disponible' });
      return;
    }

    if (
      hebergement.societe !== clientInfo.societe ||
      hebergement.compte !== clientInfo.compte ||
      hebergement.filiation !== clientInfo.filiation
    ) {
      set({ error: 'Hebergement non valide pour ce client' });
      return;
    }

    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        selectedHebergement: hebergement,
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.post<SelectChambreResponse>(
        '/api/choixPyr/select',
        {
          societe: hebergement.societe,
          compte: hebergement.compte,
          filiation: hebergement.filiation,
          chambre: hebergement.chambre,
        }
      );
      if (response.data.data?.success) {
        set({ selectedHebergement: hebergement });
      } else {
        set({ error: 'Echec selection chambre' });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur selection chambre';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelSelection: () => {
    set({ selectedHebergement: null, error: null });
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => set({ ...initialState }),
}));