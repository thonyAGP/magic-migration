import { create } from 'zustand';
import type {
  HistoriqueAppel,
  CoefTelephone,
  ReseauCloture,
  FacturationRequest,
  GetHistoriqueAppelsResponse,
  GetCoefficientResponse,
  FacturerAppelResponse,
  GetClotureStatusResponse,
  DebloquerClotureResponse,
  MarquerGratuitResponse,
  AnnulerFacturationResponse,
} from '@/types/facturationAppel';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface FacturationAppelState {
  historiqueAppels: HistoriqueAppel[];
  coefficientTelephone: number | null;
  cloture: ReseauCloture | null;
  isLoading: boolean;
  error: string | null;
  filterSociete: string;
  filterDateDebut: Date | null;
  filterDateFin: Date | null;
}

interface FacturationAppelActions {
  chargerHistoriqueAppels: (
    societe: string,
    prefixe: string,
    dateDebut?: Date,
    dateFin?: Date
  ) => Promise<void>;
  recupererCoefficient: () => Promise<void>;
  facturerAppel: (request: FacturationRequest) => Promise<void>;
  verifierCloture: () => Promise<boolean>;
  debloquerCloture: () => Promise<void>;
  marquerGratuit: (appelId: number, raison: string) => Promise<void>;
  annulerFacturation: (appelId: number) => Promise<void>;
  setFilterSociete: (societe: string) => void;
  setFilterDateDebut: (date: Date | null) => void;
  setFilterDateFin: (date: Date | null) => void;
  resetFilters: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type FacturationAppelStore = FacturationAppelState & FacturationAppelActions;

const MOCK_HISTORIQUE: HistoriqueAppel[] = [
  {
    id: 1,
    societe: 'SOC1',
    prefixe: 'CAI01',
    dateAppel: new Date('2026-02-20T09:15:00'),
    heureAppel: '09:15:23',
    numeroTel: '+33612345678',
    duree: '00:12:35',
    montant: 1.89,
    qualite: 'OK',
    gratuite: false,
    raisonGratuite: null,
    facture: false,
  },
  {
    id: 2,
    societe: 'SOC1',
    prefixe: 'CAI01',
    dateAppel: new Date('2026-02-19T14:22:00'),
    heureAppel: '14:22:11',
    numeroTel: '+34912567890',
    duree: '00:05:18',
    montant: 0.80,
    qualite: 'OK',
    gratuite: false,
    raisonGratuite: null,
    facture: true,
    operationId: 10234,
  },
  {
    id: 3,
    societe: 'SOC1',
    prefixe: 'CAI01',
    dateAppel: new Date('2026-02-19T11:05:00'),
    heureAppel: '11:05:47',
    numeroTel: '+1514555XXXX',
    duree: '00:45:12',
    montant: 35.80,
    qualite: 'Mauvaise',
    gratuite: false,
    raisonGratuite: null,
    facture: false,
  },
  {
    id: 4,
    societe: 'SOC1',
    prefixe: 'CAI02',
    dateAppel: new Date('2026-02-18T16:30:00'),
    heureAppel: '16:30:05',
    numeroTel: '+33145678901',
    duree: '00:02:15',
    montant: 0.34,
    qualite: 'OK',
    gratuite: true,
    raisonGratuite: 'Appel urgence medicale',
    facture: false,
  },
  {
    id: 5,
    societe: 'SOC1',
    prefixe: 'CAI01',
    dateAppel: new Date('2026-02-17T10:12:00'),
    heureAppel: '10:12:33',
    numeroTel: '+447890123456',
    duree: '00:18:42',
    montant: 2.81,
    qualite: 'OK',
    gratuite: false,
    raisonGratuite: null,
    facture: true,
    operationId: 10198,
  },
  {
    id: 6,
    societe: 'SOC1',
    prefixe: 'CAI01',
    dateAppel: new Date('2026-02-16T08:45:00'),
    heureAppel: '08:45:12',
    numeroTel: '+33987654321',
    duree: '00:07:22',
    montant: 1.11,
    qualite: 'Interruption',
    gratuite: true,
    raisonGratuite: 'Erreur ligne technique',
    facture: false,
  },
  {
    id: 7,
    societe: 'SOC1',
    prefixe: 'CAI02',
    dateAppel: new Date('2026-02-15T13:20:00'),
    heureAppel: '13:20:50',
    numeroTel: '+49301234567',
    duree: '00:25:08',
    montant: 3.77,
    qualite: 'OK',
    gratuite: false,
    raisonGratuite: null,
    facture: false,
  },
  {
    id: 8,
    societe: 'SOC1',
    prefixe: 'CAI01',
    dateAppel: new Date('2026-02-14T17:55:00'),
    heureAppel: '17:55:28',
    numeroTel: '+33612349876',
    duree: '00:09:45',
    montant: 1.46,
    qualite: 'OK',
    gratuite: false,
    raisonGratuite: null,
    facture: true,
    operationId: 10102,
  },
];

const MOCK_COEFFICIENT: CoefTelephone = {
  coefficient: 0.15,
};

const MOCK_CLOTURE: ReseauCloture = {
  cloture_enCours: false,
  testReseau: 'OK',
};

const initialState: FacturationAppelState = {
  historiqueAppels: [],
  coefficientTelephone: null,
  cloture: null,
  isLoading: false,
  error: null,
  filterSociete: '',
  filterDateDebut: null,
  filterDateFin: null,
};

export const useFacturationAppelStore = create<FacturationAppelStore>()((set, get) => ({
  ...initialState,

  chargerHistoriqueAppels: async (societe, prefixe, dateDebut, dateFin) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      let filtered = MOCK_HISTORIQUE.filter(
        (appel) => appel.societe === societe && appel.prefixe === prefixe
      );

      if (dateDebut) {
        filtered = filtered.filter((appel) => appel.dateAppel >= dateDebut);
      }
      if (dateFin) {
        filtered = filtered.filter((appel) => appel.dateAppel <= dateFin);
      }

      const sorted = filtered.sort((a, b) => {
        const dateCompare = b.dateAppel.getTime() - a.dateAppel.getTime();
        if (dateCompare !== 0) return dateCompare;
        return b.heureAppel.localeCompare(a.heureAppel);
      });

      set({ historiqueAppels: sorted, isLoading: false });
      return;
    }

    try {
      const params = new URLSearchParams({
        societe,
        prefixe,
        ...(dateDebut && { dateDebut: dateDebut.toISOString().split('T')[0] }),
        ...(dateFin && { dateFin: dateFin.toISOString().split('T')[0] }),
      });

      const response = await apiClient.get<GetHistoriqueAppelsResponse>(
        `/api/facturation-appel/historique?${params}`
      );

      set({ historiqueAppels: response.data.data ?? [] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement historique';
      set({ historiqueAppels: [], error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  recupererCoefficient: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ coefficientTelephone: MOCK_COEFFICIENT.coefficient, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get<GetCoefficientResponse>(
        '/api/facturation-appel/coefficient'
      );
      set({ coefficientTelephone: response.data.data?.coefficient ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur récupération coefficient';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  facturerAppel: async (request) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    const { appel, numeroCompte: _numeroCompte, filiation: _filiation, typeCompte: _typeCompte } = request;

    if (appel.gratuite) {
      set({ error: 'Appel gratuit - facturation non autorisée', isLoading: false });
      return;
    }

    const clotureActive = await get().verifierCloture();
    if (clotureActive) {
      set({ error: 'Opération bloquée - clôture en cours', isLoading: false });
      return;
    }

    if (!isRealApi) {
      const mockOperationId = Math.floor(Math.random() * 10000) + 20000;
      
      set((state) => ({
        historiqueAppels: state.historiqueAppels.map((a) =>
          a.id === appel.id
            ? { ...a, facture: true, operationId: mockOperationId }
            : a
        ),
        isLoading: false,
      }));
      return;
    }

    try {
      const response = await apiClient.post<FacturerAppelResponse>(
        '/api/facturation-appel/facturer',
        request
      );

      const { success, operationId } = response.data.data ?? {};

      if (success && operationId) {
        set((state) => ({
          historiqueAppels: state.historiqueAppels.map((a) =>
            a.id === appel.id
              ? { ...a, facture: true, operationId }
              : a
          ),
        }));
      } else {
        set({ error: 'Échec facturation' });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur facturation appel';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  verifierCloture: async () => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      set({ cloture: MOCK_CLOTURE });
      return MOCK_CLOTURE.cloture_enCours;
    }

    try {
      const response = await apiClient.get<GetClotureStatusResponse>(
        '/api/facturation-appel/cloture-status'
      );
      const clotureData = response.data.data;
      set({ cloture: clotureData ?? null });
      return clotureData?.cloture_enCours ?? false;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur vérification clôture';
      set({ error: message, cloture: null });
      return false;
    }
  },

  debloquerCloture: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        cloture: state.cloture ? { ...state.cloture, cloture_enCours: false } : null,
        isLoading: false,
      }));
      return;
    }

    try {
      await apiClient.post<DebloquerClotureResponse>(
        '/api/facturation-appel/debloquer-cloture'
      );
      
      set((state) => ({
        cloture: state.cloture ? { ...state.cloture, cloture_enCours: false } : null,
      }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur déblocage clôture';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  marquerGratuit: async (appelId, raison) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        historiqueAppels: state.historiqueAppels.map((appel) =>
          appel.id === appelId
            ? { ...appel, gratuite: true, raisonGratuite: raison }
            : appel
        ),
        isLoading: false,
      }));
      return;
    }

    try {
      await apiClient.put<MarquerGratuitResponse>(
        `/api/facturation-appel/marquer-gratuit/${appelId}`,
        { raison }
      );

      set((state) => ({
        historiqueAppels: state.historiqueAppels.map((appel) =>
          appel.id === appelId
            ? { ...appel, gratuite: true, raisonGratuite: raison }
            : appel
        ),
      }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur marquage gratuit';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  annulerFacturation: async (appelId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        historiqueAppels: state.historiqueAppels.map((appel) =>
          appel.id === appelId
            ? { ...appel, facture: false, operationId: undefined }
            : appel
        ),
        isLoading: false,
      }));
      return;
    }

    try {
      await apiClient.delete<AnnulerFacturationResponse>(
        `/api/facturation-appel/annuler/${appelId}`
      );

      set((state) => ({
        historiqueAppels: state.historiqueAppels.map((appel) =>
          appel.id === appelId
            ? { ...appel, facture: false, operationId: undefined }
            : appel
        ),
      }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur annulation facturation';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilterSociete: (societe) => set({ filterSociete: societe }),

  setFilterDateDebut: (date) => set({ filterDateDebut: date }),

  setFilterDateFin: (date) => set({ filterDateFin: date }),

  resetFilters: () =>
    set({
      filterSociete: '',
      filterDateDebut: null,
      filterDateFin: null,
    }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState }),
}));