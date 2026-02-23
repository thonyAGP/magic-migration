import { create } from 'zustand';
import type {
  MoyenPaiement,
  MOPInfo,
  TypeDevise,
  ClasseMOP,
} from '@/types/moyenPaiement';
import { useDataSourceStore } from './dataSourceStore';

interface MoyenPaiementState {
  moyensPaiement: MoyenPaiement[];
  selectedMOP: MoyenPaiement | null;
  isLoading: boolean;
  error: string | null;
}

interface MoyenPaiementActions {
  getMOPInfo: (
    codeMOP: string,
    typeDevise: TypeDevise,
  ) => Promise<{ classe: ClasseMOP; libelle: string; existe: boolean }>;
  checkMOPExists: (codeMOP: string, societe: string) => Promise<boolean>;
  getMOPByCode: (codeMOP: string) => Promise<MoyenPaiement | null>;
  setMoyensPaiement: (moyens: MoyenPaiement[]) => void;
  setSelectedMOP: (mop: MoyenPaiement | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type MoyenPaiementStore = MoyenPaiementState & MoyenPaiementActions;

const MOCK_MOYENS_PAIEMENT: MoyenPaiement[] = [
  {
    code: 'CB',
    libelle: 'Carte Bancaire',
    classe: 'UNI',
    typeDevise: 'UNI',
  },
  {
    code: 'ESP',
    libelle: 'Espèces',
    classe: 'UNI',
    typeDevise: 'UNI',
  },
  {
    code: 'CHQ',
    libelle: 'Chèque',
    classe: 'CHQ',
    typeDevise: 'UNI',
  },
  {
    code: 'VIR',
    libelle: 'Virement',
    classe: 'TRANSF',
    typeDevise: 'UNI',
  },
  {
    code: 'CHG',
    libelle: 'Change',
    classe: 'BI',
    typeDevise: 'BI',
  },
  {
    code: 'CBE',
    libelle: 'CB Étranger',
    classe: 'BI',
    typeDevise: 'BI',
  },
  {
    code: 'TRV',
    libelle: 'Chèques Voyage',
    classe: 'BI',
    typeDevise: 'BI',
  },
  {
    code: 'VAC',
    libelle: 'Chèques Vacances',
    classe: 'UNI',
    typeDevise: 'UNI',
  },
  {
    code: 'PRE',
    libelle: 'Prélèvement',
    classe: 'TRANSF',
    typeDevise: 'UNI',
  },
  {
    code: 'AVO',
    libelle: 'Avoir',
    classe: 'UNI',
    typeDevise: 'UNI',
  },
];

const initialState: MoyenPaiementState = {
  moyensPaiement: [],
  selectedMOP: null,
  isLoading: false,
  error: null,
};

export const useMoyenPaiementStore = create<MoyenPaiementStore>()((set) => ({
  ...initialState,

  getMOPInfo: async (codeMOP, typeDevise) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const mop = MOCK_MOYENS_PAIEMENT.find((m) => m.code === codeMOP);
      const result: MOPInfo = mop
        ? {
            classe: mop.classe,
            libelle: mop.libelle,
            existe: true,
          }
        : {
            classe: 'UNI',
            libelle: '',
            existe: false,
          };
      set({ isLoading: false });
      return result;
    }

    try {
      const params = new URLSearchParams({ code: codeMOP });
      if (typeDevise) {
        params.append('typeDevise', typeDevise);
      }

      const response = await fetch(
        `/api/moyenpaiement/info?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Erreur récupération info MOP');
      }

      const data = (await response.json()) as {
        data: MOPInfo;
      };
      set({ isLoading: false });
      return data.data;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur récupération info MOP';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  checkMOPExists: async (codeMOP, societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const exists = MOCK_MOYENS_PAIEMENT.some((m) => m.code === codeMOP);
      set({ isLoading: false });
      return exists;
    }

    try {
      const params = new URLSearchParams({ code: codeMOP, societe });
      const response = await fetch(
        `/api/moyenpaiement/exists?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Erreur vérification existence MOP');
      }

      const data = (await response.json()) as {
        data: { existe: boolean };
      };
      set({ isLoading: false });
      return data.data.existe;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur vérification existence MOP';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  getMOPByCode: async (codeMOP) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const mop = MOCK_MOYENS_PAIEMENT.find((m) => m.code === codeMOP) ?? null;
      set({ isLoading: false });
      return mop;
    }

    try {
      const response = await fetch(`/api/moyenpaiement/${codeMOP}`);
      if (!response.ok) {
        throw new Error('Erreur récupération MOP');
      }

      const data = (await response.json()) as {
        data: MoyenPaiement | null;
      };
      set({ isLoading: false });
      return data.data;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur récupération MOP';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  setMoyensPaiement: (moyens) => set({ moyensPaiement: moyens }),
  setSelectedMOP: (mop) => set({ selectedMOP: mop }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}));