import { create } from 'zustand';
import type {
  SessionEcart,
  DeviseSession,
  EcartValidation,
  SaveEcartRequest,
  SaveEcartResponse,
  UpdateDeviseSessionRequest,
  UpdateDeviseSessionResponse,
} from '@/types/sessionEcart';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface SessionEcartState {
  sessionId: number | null;
  deviseCode: string | null;
  caisseComptee: number;
  soldePrecedent: number;
  montantEcart: number;
  commentaire: string;
  commentaireDevise: string;
  isLoading: boolean;
  error: string | null;
  ecartSaved: boolean;
  seuilAlerte: number;
}

interface SessionEcartActions {
  calculerEcart: (caisseComptee: number, soldePrecedent: number) => number;
  validerSeuilEcart: (ecart: number, seuilAlerte: number) => EcartValidation;
  sauvegarderEcart: (ecart: SessionEcart) => Promise<void>;
  setSessionId: (sessionId: number | null) => void;
  setDeviseCode: (deviseCode: string | null) => void;
  setCaisseComptee: (caisseComptee: number) => void;
  setSoldePrecedent: (soldePrecedent: number) => void;
  setCommentaire: (commentaire: string) => void;
  setCommentaireDevise: (commentaireDevise: string) => void;
  setSeuilAlerte: (seuilAlerte: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type SessionEcartStore = SessionEcartState & SessionEcartActions;

const _MOCK_DEVISE_SESSIONS: Record<string, DeviseSession> = {
  EUR: { deviseCode: 'EUR', soldePrecedent: 1250.75, unibi: 'UNI' },
  USD: { deviseCode: 'USD', soldePrecedent: 850.00, unibi: 'BI' },
  GBP: { deviseCode: 'GBP', soldePrecedent: 320.50, unibi: 'BI' },
};

const DEFAULT_SEUIL_ALERTE = 50;

const initialState: SessionEcartState = {
  sessionId: null,
  deviseCode: null,
  caisseComptee: 0,
  soldePrecedent: 0,
  montantEcart: 0,
  commentaire: '',
  commentaireDevise: '',
  isLoading: false,
  error: null,
  ecartSaved: false,
  seuilAlerte: DEFAULT_SEUIL_ALERTE,
};

export const useSessionEcartStore = create<SessionEcartStore>()((set, get) => ({
  ...initialState,

  calculerEcart: (caisseComptee, soldePrecedent) => {
    const ecart = caisseComptee - soldePrecedent;
    set({ montantEcart: ecart, caisseComptee, soldePrecedent });
    return ecart;
  },

  validerSeuilEcart: (ecart, seuilAlerte) => {
    const absEcart = Math.abs(ecart);
    const exceeded = absEcart > seuilAlerte;
    const blocking = exceeded && absEcart > seuilAlerte * 2;
    return { exceeded, blocking };
  },

  sauvegarderEcart: async (ecart) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null, ecartSaved: false });

    if (!isRealApi) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const validation = get().validerSeuilEcart(ecart.montantEcart, get().seuilAlerte);
      
      if (validation.blocking && !ecart.commentaire) {
        set({ 
          isLoading: false, 
          error: 'Commentaire obligatoire pour un écart bloquant' 
        });
        return;
      }

      set({ 
        isLoading: false, 
        ecartSaved: true,
        sessionId: ecart.sessionId,
        deviseCode: ecart.deviseCode,
        montantEcart: ecart.montantEcart,
        commentaire: ecart.commentaire ?? '',
        commentaireDevise: ecart.commentaireDevise ?? '',
      });
      return;
    }

    try {
      if (!ecart.sessionId || !ecart.deviseCode || !ecart.quand) {
        throw new Error('Session, devise et quand sont obligatoires');
      }

      const saveRequest: SaveEcartRequest = {
        sessionId: ecart.sessionId,
        deviseCode: ecart.deviseCode,
        quand: ecart.quand,
        caisseComptee: ecart.caisseComptee,
        montantEcart: ecart.montantEcart,
        commentaire: ecart.commentaire,
        commentaireDevise: ecart.commentaireDevise,
      };

      const saveResponse = await apiClient.post<ApiResponse<SaveEcartResponse>>(
        '/api/session/ecart',
        saveRequest,
      );

      if (!saveResponse.data.success || !saveResponse.data.data?.success) {
        throw new Error('Échec de sauvegarde de l\'écart');
      }

      const updateRequest: UpdateDeviseSessionRequest = {
        sessionId: ecart.sessionId,
        deviseCode: ecart.deviseCode,
        soldePrecedent: ecart.caisseComptee,
        unibi: 'UNI',
      };

      await apiClient.put<ApiResponse<UpdateDeviseSessionResponse>>(
        `/api/session/${ecart.sessionId}/devise/${ecart.deviseCode}`,
        updateRequest,
      );

      set({ ecartSaved: true });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur sauvegarde écart';
      set({ error: message, ecartSaved: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setSessionId: (sessionId) => set({ sessionId }),
  setDeviseCode: (deviseCode) => set({ deviseCode }),
  setCaisseComptee: (caisseComptee) => {
    const { soldePrecedent } = get();
    get().calculerEcart(caisseComptee, soldePrecedent);
  },
  setSoldePrecedent: (soldePrecedent) => {
    const { caisseComptee } = get();
    get().calculerEcart(caisseComptee, soldePrecedent);
  },
  setCommentaire: (commentaire) => set({ commentaire }),
  setCommentaireDevise: (commentaireDevise) => set({ commentaireDevise }),
  setSeuilAlerte: (seuilAlerte) => set({ seuilAlerte }),
  setError: (error) => set({ error }),

  reset: () => set({ ...initialState }),
}));