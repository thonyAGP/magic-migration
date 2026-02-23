import { create } from 'zustand';
import { accountOpsApi } from '@/services/api/endpoints-lot6';
import { useDataSourceStore } from './dataSourceStore';

type AccountOpType = 'changement' | 'solde' | 'telephone';

interface AccountOpsForm {
  codeAdherent: string;
  filiation: string;
  telephone: string;
  portable: string;
}

interface AccountOpsState {
  opType: AccountOpType;
  form: AccountOpsForm;
  resultMessage: string | null;
  error: string | null;
  isLoading: boolean;
}

interface AccountOpsActions {
  setOpType: (type: AccountOpType) => void;
  setForm: (field: keyof AccountOpsForm, value: string) => void;
  executeOperation: (societe: string) => Promise<void>;
  reset: () => void;
}

type AccountOpsStore = AccountOpsState & AccountOpsActions;

const initialState: AccountOpsState = {
  opType: 'changement',
  form: { codeAdherent: '', filiation: '0', telephone: '', portable: '' },
  resultMessage: null,
  error: null,
  isLoading: false,
};

export const useAccountOpsStore = create<AccountOpsStore>()((set, get) => ({
  ...initialState,

  setOpType: (type) => set({ opType: type, resultMessage: null, error: null }),

  setForm: (field, value) => {
    set((state) => ({
      form: { ...state.form, [field]: value },
      error: null,
      resultMessage: null,
    }));
  },

  executeOperation: async (societe) => {
    const { opType, form } = get();
    const code = parseInt(form.codeAdherent, 10);
    const filiation = parseInt(form.filiation, 10);

    if (isNaN(code)) {
      set({ error: 'Code adherent invalide' });
      return;
    }

    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null, resultMessage: null });

    if (!isRealApi) {
      if (opType === 'solde') {
        set({ resultMessage: `Solde: ${(Math.random() * 2000).toFixed(2)} EUR`, isLoading: false });
      } else if (opType === 'telephone') {
        if (form.telephone || form.portable) {
          set({ resultMessage: 'Telephone mis a jour avec succes (mock)', isLoading: false });
        } else {
          set({
            form: { ...form, telephone: '01 23 45 67 89', portable: '06 12 34 56 78' },
            resultMessage: 'Informations telephone chargees (mock)',
            isLoading: false,
          });
        }
      } else {
        set({ resultMessage: 'Changement de compte effectue avec succes (mock)', isLoading: false });
      }
      return;
    }

    try {
      if (opType === 'changement') {
        const response = await accountOpsApi.changeAccount(societe, code, filiation);
        set({
          resultMessage: response.data.data?.success
            ? 'Changement de compte effectue avec succes'
            : 'Erreur lors du changement de compte',
          isLoading: false,
        });
      } else if (opType === 'solde') {
        const response = await accountOpsApi.getSolde(societe, code, filiation);
        const data = response.data.data;
        set({
          resultMessage: data ? `Solde: ${data.solde.toFixed(2)} ${data.devise}` : 'Impossible de recuperer le solde',
          isLoading: false,
        });
      } else if (opType === 'telephone') {
        if (form.telephone || form.portable) {
          await accountOpsApi.updatePhone(societe, code, filiation, form.telephone, form.portable);
          set({ resultMessage: 'Telephone mis a jour avec succes', isLoading: false });
        } else {
          const response = await accountOpsApi.getPhoneInfo(societe, code, filiation);
          const data = response.data.data;
          if (data) {
            set({
              form: { ...get().form, telephone: data.telephone, portable: data.portable },
              resultMessage: 'Informations telephone chargees',
              isLoading: false,
            });
          } else {
            set({ resultMessage: 'Aucune information telephone trouvee', isLoading: false });
          }
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur operation';
      set({ error: message, isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
