import { create } from 'zustand';
import type {
  GestionChequeState,
  Cheque,
  EnregistrerDepotRequest,
  EnregistrerRetraitRequest,
  ValiderChequeRequest,
} from '@/types/gestionCheque';
import type { ApiResponse } from '@/services/api/apiClient';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from './dataSourceStore';

const MOCK_CHEQUES: Cheque[] = [
  {
    numeroCheque: 'CHQ-245781',
    montant: 1250.0,
    dateEmission: new Date('2025-12-15'),
    banque: 'BNP Paribas',
    titulaire: 'DUPONT Jean',
    estPostdate: false,
  },
  {
    numeroCheque: 'CHQ-389042',
    montant: 3500.0,
    dateEmission: new Date('2026-01-22'),
    banque: 'Société Générale',
    titulaire: 'MARTIN Sophie',
    estPostdate: false,
  },
  {
    numeroCheque: 'CHQ-567123',
    montant: 850.5,
    dateEmission: new Date('2026-02-01'),
    banque: 'Crédit Agricole',
    titulaire: 'BERNARD Pierre',
    estPostdate: false,
  },
  {
    numeroCheque: 'CHQ-892456',
    montant: 2100.0,
    dateEmission: new Date('2026-02-28'),
    banque: 'BNP Paribas',
    titulaire: 'DUBOIS Marie',
    estPostdate: true,
  },
  {
    numeroCheque: 'CHQ-134567',
    montant: 450.0,
    dateEmission: new Date('2026-01-18'),
    banque: 'Crédit Mutuel',
    titulaire: 'PETIT Luc',
    estPostdate: false,
  },
  {
    numeroCheque: 'CHQ-678901',
    montant: 5000.0,
    dateEmission: new Date('2026-02-10'),
    banque: 'Société Générale',
    titulaire: 'ROUX Claire',
    estPostdate: false,
  },
  {
    numeroCheque: 'CHQ-445566',
    montant: 175.0,
    dateEmission: new Date('2026-01-28'),
    banque: 'Crédit Agricole',
    titulaire: 'LEROY Paul',
    estPostdate: false,
  },
  {
    numeroCheque: 'CHQ-998877',
    montant: 3200.0,
    dateEmission: new Date('2026-03-05'),
    banque: 'BNP Paribas',
    titulaire: 'MOREAU Anne',
    estPostdate: true,
  },
  {
    numeroCheque: 'CHQ-223344',
    montant: 950.0,
    dateEmission: new Date('2026-02-05'),
    banque: 'Crédit Mutuel',
    titulaire: 'SIMON Marc',
    estPostdate: false,
  },
  {
    numeroCheque: 'CHQ-556677',
    montant: 1800.0,
    dateEmission: new Date('2026-02-25'),
    banque: 'Société Générale',
    titulaire: 'LAURENT Julie',
    estPostdate: true,
  },
];

const initialState: Omit<
  GestionChequeState,
  | 'setCheques'
  | 'setSelectedCheque'
  | 'setIsLoading'
  | 'setError'
  | 'setFilters'
  | 'setTotalDepots'
  | 'setTotalRetraits'
  | 'enregistrerDepot'
  | 'enregistrerRetrait'
  | 'validerCheque'
  | 'listerChequesCompte'
  | 'calculerTotaux'
  | 'reset'
> = {
  cheques: [],
  selectedCheque: null,
  isLoading: false,
  error: null,
  filters: {},
  totalDepots: 0,
  totalRetraits: 0,
};

export const useGestionChequeStore = create<GestionChequeState>()((set) => ({
  ...initialState,

  setCheques: (cheques) => set({ cheques }),
  setSelectedCheque: (cheque) => set({ selectedCheque: cheque }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),
  setTotalDepots: (total) => set({ totalDepots: total }),
  setTotalRetraits: (total) => set({ totalRetraits: total }),

  enregistrerDepot: async (cheque, societe, compte, filiation) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        cheques: [...state.cheques, cheque],
        totalDepots: state.totalDepots + cheque.montant,
        isLoading: false,
      }));
      return;
    }

    try {
      const request: EnregistrerDepotRequest = {
        numeroCheque: cheque.numeroCheque,
        montant: cheque.montant,
        dateEmission: cheque.dateEmission,
        banque: cheque.banque,
        titulaire: cheque.titulaire,
        societe,
        compte,
        filiation,
      };

      const response = await apiClient.post<ApiResponse<{ success: boolean; message?: string }>>(
        '/api/gestion-cheque/depot',
        request,
      );

      if (response.data.success && response.data.data?.success) {
        set((state) => ({
          cheques: [...state.cheques, cheque],
          totalDepots: state.totalDepots + cheque.montant,
        }));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement du dépôt';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  enregistrerRetrait: async (cheque, societe, compte, filiation) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        cheques: [...state.cheques, cheque],
        totalRetraits: state.totalRetraits + cheque.montant,
        isLoading: false,
      }));
      return;
    }

    try {
      const request: EnregistrerRetraitRequest = {
        numeroCheque: cheque.numeroCheque,
        montant: cheque.montant,
        dateEmission: cheque.dateEmission,
        banque: cheque.banque,
        titulaire: cheque.titulaire,
        societe,
        compte,
        filiation,
      };

      const response = await apiClient.post<ApiResponse<{ success: boolean; message?: string }>>(
        '/api/gestion-cheque/retrait',
        request,
      );

      if (response.data.success && response.data.data?.success) {
        set((state) => ({
          cheques: [...state.cheques, cheque],
          totalRetraits: state.totalRetraits + cheque.montant,
        }));
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement du retrait';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  validerCheque: async (numeroCheque, dateEmission) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const existant = MOCK_CHEQUES.find((c) => c.numeroCheque === numeroCheque);
      if (existant) {
        return {
          valide: false,
          estPostdate: false,
          erreur: 'Numéro de chèque déjà utilisé',
        };
      }

      const today = new Date();
      const estPostdate = dateEmission > today;

      return {
        valide: true,
        estPostdate,
      };
    }

    try {
      const request: ValiderChequeRequest = {
        numeroCheque,
        dateEmission,
      };

      const response = await apiClient.post<
        ApiResponse<{ valide: boolean; estPostdate: boolean; erreur?: string }>
      >('/api/gestion-cheque/valider', request);

      return (
        response.data.data ?? {
          valide: false,
          estPostdate: false,
          erreur: 'Erreur de validation',
        }
      );
    } catch (e: unknown) {
      return {
        valide: false,
        estPostdate: false,
        erreur: e instanceof Error ? e.message : 'Erreur lors de la validation du chèque',
      };
    }
  },

  listerChequesCompte: async (societe, compte, filiation, filters) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      let filtered = [...MOCK_CHEQUES];

      if (filters?.dateDebut) {
        filtered = filtered.filter((c) => c.dateEmission >= filters.dateDebut!);
      }

      if (filters?.dateFin) {
        filtered = filtered.filter((c) => c.dateEmission <= filters.dateFin!);
      }

      if (filters?.estPostdate !== undefined) {
        filtered = filtered.filter((c) => c.estPostdate === filters.estPostdate);
      }

      filtered.sort((a, b) => b.dateEmission.getTime() - a.dateEmission.getTime());

      set({ cheques: filtered, isLoading: false });
      return filtered;
    }

    try {
      const params: Record<string, string> = {};
      if (filters?.dateDebut) {
        params.dateDebut = filters.dateDebut.toISOString();
      }
      if (filters?.dateFin) {
        params.dateFin = filters.dateFin.toISOString();
      }
      if (filters?.estPostdate !== undefined) {
        params.estPostdate = String(filters.estPostdate);
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `/api/gestion-cheque/liste/${societe}/${compte}/${filiation}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<Cheque[]>>(url);

      const cheques = response.data.data ?? [];
      set({ cheques });
      return cheques;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors de la récupération des chèques';
      set({ error: message, cheques: [] });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  calculerTotaux: async (societe, compte, filiation) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const totalDepots = 12075.5;
      const totalRetraits = 4850.0;

      set({ totalDepots, totalRetraits, isLoading: false });
      return { totalDepots, totalRetraits };
    }

    try {
      const response = await apiClient.get<
        ApiResponse<{ totalDepots: number; totalRetraits: number }>
      >(`/api/gestion-cheque/totaux/${societe}/${compte}/${filiation}`);

      const data = response.data.data ?? { totalDepots: 0, totalRetraits: 0 };
      set({ totalDepots: data.totalDepots, totalRetraits: data.totalRetraits });
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors du calcul des totaux';
      set({ error: message, totalDepots: 0, totalRetraits: 0 });
      return { totalDepots: 0, totalRetraits: 0 };
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));