import { create } from 'zustand';
import type {
  RecapFermetureSession,
  MontantComptable,
  LoadRecapDataRequest,
  LoadMontantsRequest,
  GenerateTicketRequest,
  PrinterOption,
} from '@/types/ticketFermetureSession';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from './dataSourceStore';

interface TicketFermetureSessionState {
  recapData: RecapFermetureSession | null;
  montantsComptables: MontantComptable[];
  isLoading: boolean;
  error: string | null;
  finTache: string;
  printerNum: PrinterOption;
}

interface TicketFermetureSessionActions {
  loadRecapData: (societe: string, session: number) => Promise<void>;
  loadMontantsComptables: (societe: string, session: number) => Promise<void>;
  generateTicketFermeture: (
    societe: string,
    session: number,
    dateComptable: Date,
  ) => Promise<void>;
  validateFinTache: (finTache: string) => boolean;
  selectPrinter: (printerNum: PrinterOption) => void;
  reset: () => void;
}

type TicketFermetureSessionStore = TicketFermetureSessionState &
  TicketFermetureSessionActions;

const MOCK_RECAP: RecapFermetureSession = {
  societe: 'SOC1',
  session: 142,
  dateComptable: new Date('2026-02-08'),
  heureDebutSession: '08:00',
  caisseDepart: 500,
  apportCoffre: 2000,
  versement: 1500,
  retrait: 300,
  soldeCash: 3200,
  soldeCarte: 1850,
  change: 450,
  fraisChange: 15,
  deviseLocale: 'EUR',
  nomVillage: 'Club Med Peisey-Vallandry',
  editionDetaillee: true,
};

const MOCK_MONTANTS: MontantComptable[] = [
  {
    cumulQuantite: 12,
    cumulMontant: 540,
    totalMontant: 540,
    equivalent: 540,
  },
  {
    cumulQuantite: 8,
    cumulMontant: 320,
    totalMontant: 320,
    equivalent: 320,
  },
  {
    cumulQuantite: 5,
    cumulMontant: 175,
    totalMontant: 175,
    equivalent: 175,
  },
];

const initialState: TicketFermetureSessionState = {
  recapData: null,
  montantsComptables: [],
  isLoading: false,
  error: null,
  finTache: '',
  printerNum: 1,
};

export const useTicketFermetureSessionStore = create<TicketFermetureSessionStore>()(
  (set, get) => ({
    ...initialState,

    loadRecapData: async (societe, session) => {
      const { isRealApi } = useDataSourceStore.getState();
      set({ isLoading: true, error: null });

      if (!isRealApi) {
        set({
          recapData: { ...MOCK_RECAP, societe, session },
          isLoading: false,
        });
        return;
      }

      try {
        const response = await apiClient.get<
          ApiResponse<RecapFermetureSession>
        >('/api/ticketFermetureSession/recap', {
          params: { societe, session },
        });
        set({ recapData: response.data.data ?? null });
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : 'Erreur chargement récapitulatif';
        set({ recapData: null, error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    loadMontantsComptables: async (societe, session) => {
      const { isRealApi } = useDataSourceStore.getState();
      set({ isLoading: true, error: null });

      if (!isRealApi) {
        set({
          montantsComptables: MOCK_MONTANTS,
          isLoading: false,
        });
        return;
      }

      try {
        const response = await apiClient.get<ApiResponse<MontantComptable[]>>(
          '/api/ticketFermetureSession/montants',
          {
            params: { societe, session },
          },
        );
        set({ montantsComptables: response.data.data ?? [] });
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : 'Erreur chargement montants';
        set({ montantsComptables: [], error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    generateTicketFermeture: async (societe, session, dateComptable) => {
      const { isRealApi } = useDataSourceStore.getState();
      const { finTache, printerNum } = get();

      if (!get().validateFinTache(finTache)) {
        set({
          error:
            'La tâche doit être marquée comme terminée (finTache = "F") avant de générer le ticket',
        });
        return;
      }

      set({ isLoading: true, error: null });

      if (!isRealApi) {
        set({ isLoading: false });
        return;
      }

      try {
        await apiClient.post<ApiResponse<void>>(
          '/api/ticketFermetureSession/generate',
          {
            societe,
            session,
            dateComptable,
            printerNum,
          },
        );
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : 'Erreur génération ticket';
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },

    validateFinTache: (finTache) => {
      return finTache === 'F';
    },

    selectPrinter: (printerNum) => {
      set({ printerNum });
    },

    reset: () => set({ ...initialState }),
  }),
);