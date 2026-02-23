import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionEcartStore } from '@/stores/sessionEcartStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { SaveEcartRequest, UpdateDeviseSessionRequest } from '@/types/sessionEcart';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const MOCK_SESSION_ID = 123;
const MOCK_DEVISE_CODE = 'EUR';
const MOCK_CAISSE_COMPTEE = 1300.50;
const MOCK_SOLDE_PRECEDENT = 1250.75;
const MOCK_ECART = MOCK_CAISSE_COMPTEE - MOCK_SOLDE_PRECEDENT;
const DEFAULT_SEUIL_ALERTE = 50;

describe('sessionEcartStore', () => {
  beforeEach(() => {
    useSessionEcartStore.getState().reset();
    useDataSourceStore.setState({ isRealApi: false });
    vi.clearAllMocks();
  });

  describe('calculerEcart', () => {
    it('should compute ecart as difference between caisseComptee and soldePrecedent', () => {
      const { calculerEcart } = useSessionEcartStore.getState();

      const ecart = calculerEcart(MOCK_CAISSE_COMPTEE, MOCK_SOLDE_PRECEDENT);

      expect(ecart).toBe(MOCK_ECART);
      expect(useSessionEcartStore.getState().montantEcart).toBe(MOCK_ECART);
      expect(useSessionEcartStore.getState().caisseComptee).toBe(MOCK_CAISSE_COMPTEE);
      expect(useSessionEcartStore.getState().soldePrecedent).toBe(MOCK_SOLDE_PRECEDENT);
    });

    it('should compute negative ecart when caisseComptee is less than soldePrecedent', () => {
      const { calculerEcart } = useSessionEcartStore.getState();

      const ecart = calculerEcart(1000, 1200);

      expect(ecart).toBe(-200);
      expect(useSessionEcartStore.getState().montantEcart).toBe(-200);
    });

    it('should compute zero ecart when amounts are equal', () => {
      const { calculerEcart } = useSessionEcartStore.getState();

      const ecart = calculerEcart(1250.75, 1250.75);

      expect(ecart).toBe(0);
      expect(useSessionEcartStore.getState().montantEcart).toBe(0);
    });
  });

  describe('validerSeuilEcart', () => {
    it('should return exceeded=false and blocking=false when ecart is below threshold', () => {
      const { validerSeuilEcart } = useSessionEcartStore.getState();

      const result = validerSeuilEcart(30, DEFAULT_SEUIL_ALERTE);

      expect(result.exceeded).toBe(false);
      expect(result.blocking).toBe(false);
    });

    it('should return exceeded=true when ecart exceeds threshold', () => {
      const { validerSeuilEcart } = useSessionEcartStore.getState();

      const result = validerSeuilEcart(60, DEFAULT_SEUIL_ALERTE);

      expect(result.exceeded).toBe(true);
      expect(result.blocking).toBe(false);
    });

    it('should return blocking=true when ecart exceeds double threshold', () => {
      const { validerSeuilEcart } = useSessionEcartStore.getState();

      const result = validerSeuilEcart(120, DEFAULT_SEUIL_ALERTE);

      expect(result.exceeded).toBe(true);
      expect(result.blocking).toBe(true);
    });

    it('should handle negative ecart values using absolute value', () => {
      const { validerSeuilEcart } = useSessionEcartStore.getState();

      const result = validerSeuilEcart(-120, DEFAULT_SEUIL_ALERTE);

      expect(result.exceeded).toBe(true);
      expect(result.blocking).toBe(true);
    });
  });

  describe('sauvegarderEcart - mock mode', () => {
    it('should save ecart successfully in mock mode', async () => {
      const { sauvegarderEcart } = useSessionEcartStore.getState();

      await sauvegarderEcart({
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'F',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: MOCK_ECART,
        commentaire: 'Test comment',
        commentaireDevise: null,
      });

      const state = useSessionEcartStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.ecartSaved).toBe(true);
      expect(state.error).toBe(null);
      expect(state.sessionId).toBe(MOCK_SESSION_ID);
      expect(state.deviseCode).toBe(MOCK_DEVISE_CODE);
      expect(state.montantEcart).toBe(MOCK_ECART);
    });

    it('should set loading state during save operation', async () => {
      const { sauvegarderEcart } = useSessionEcartStore.getState();

      const promise = sauvegarderEcart({
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'O',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: MOCK_ECART,
        commentaire: null,
        commentaireDevise: null,
      });

      expect(useSessionEcartStore.getState().isLoading).toBe(true);
      await promise;
      expect(useSessionEcartStore.getState().isLoading).toBe(false);
    });

    it('should require commentaire for blocking ecart in mock mode', async () => {
      const { sauvegarderEcart, setSeuilAlerte } = useSessionEcartStore.getState();
      setSeuilAlerte(10);

      await sauvegarderEcart({
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'F',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: 50,
        commentaire: null,
        commentaireDevise: null,
      });

      const state = useSessionEcartStore.getState();
      expect(state.ecartSaved).toBe(false);
      expect(state.error).toBe('Commentaire obligatoire pour un écart bloquant');
    });

    it('should save blocking ecart with commentaire in mock mode', async () => {
      const { sauvegarderEcart, setSeuilAlerte } = useSessionEcartStore.getState();
      setSeuilAlerte(10);

      await sauvegarderEcart({
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'F',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: 50,
        commentaire: 'Large ecart justified',
        commentaireDevise: null,
      });

      const state = useSessionEcartStore.getState();
      expect(state.ecartSaved).toBe(true);
      expect(state.error).toBe(null);
    });
  });

  describe('sauvegarderEcart - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API endpoints and save ecart successfully', async () => {
      const mockPostResponse = { data: { success: true, data: { success: true, ecartId: 456 } } };
      const mockPutResponse = { data: { success: true, data: { success: true } } };
      
      vi.mocked(apiClient.post).mockResolvedValue(mockPostResponse);
      vi.mocked(apiClient.put).mockResolvedValue(mockPutResponse);

      const { sauvegarderEcart } = useSessionEcartStore.getState();

      await sauvegarderEcart({
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'F',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: MOCK_ECART,
        commentaire: 'API test',
        commentaireDevise: 'Devise note',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/api/session/ecart', {
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'F',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: MOCK_ECART,
        commentaire: 'API test',
        commentaireDevise: 'Devise note',
      } satisfies SaveEcartRequest);

      expect(apiClient.put).toHaveBeenCalledWith(
        `/api/session/${MOCK_SESSION_ID}/devise/${MOCK_DEVISE_CODE}`,
        {
          sessionId: MOCK_SESSION_ID,
          deviseCode: MOCK_DEVISE_CODE,
          soldePrecedent: MOCK_CAISSE_COMPTEE,
          unibi: 'UNI',
        } satisfies UpdateDeviseSessionRequest,
      );

      const state = useSessionEcartStore.getState();
      expect(state.ecartSaved).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle missing required fields', async () => {
      const { sauvegarderEcart } = useSessionEcartStore.getState();

      await sauvegarderEcart({
        sessionId: 0,
        deviseCode: '',
        quand: 'F',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: MOCK_ECART,
        commentaire: null,
        commentaireDevise: null,
      });

      const state = useSessionEcartStore.getState();
      expect(state.ecartSaved).toBe(false);
      expect(state.error).toBe('Session, devise et quand sont obligatoires');
    });

    it('should handle API save failure', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { success: false } });

      const { sauvegarderEcart } = useSessionEcartStore.getState();

      await sauvegarderEcart({
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'O',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: MOCK_ECART,
        commentaire: null,
        commentaireDevise: null,
      });

      const state = useSessionEcartStore.getState();
      expect(state.ecartSaved).toBe(false);
      expect(state.error).toBe('Échec de sauvegarde de l\'écart');
    });

    it('should handle network error', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      const { sauvegarderEcart } = useSessionEcartStore.getState();

      await sauvegarderEcart({
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'F',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: MOCK_ECART,
        commentaire: null,
        commentaireDevise: null,
      });

      const state = useSessionEcartStore.getState();
      expect(state.ecartSaved).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('should handle unknown error', async () => {
      vi.mocked(apiClient.post).mockRejectedValue('Unknown error');

      const { sauvegarderEcart } = useSessionEcartStore.getState();

      await sauvegarderEcart({
        sessionId: MOCK_SESSION_ID,
        deviseCode: MOCK_DEVISE_CODE,
        quand: 'F',
        caisseComptee: MOCK_CAISSE_COMPTEE,
        montantEcart: MOCK_ECART,
        commentaire: null,
        commentaireDevise: null,
      });

      const state = useSessionEcartStore.getState();
      expect(state.ecartSaved).toBe(false);
      expect(state.error).toBe('Erreur sauvegarde écart');
    });
  });

  describe('state setters', () => {
    it('setSessionId should update sessionId', () => {
      const { setSessionId } = useSessionEcartStore.getState();

      setSessionId(999);

      expect(useSessionEcartStore.getState().sessionId).toBe(999);
    });

    it('setDeviseCode should update deviseCode', () => {
      const { setDeviseCode } = useSessionEcartStore.getState();

      setDeviseCode('USD');

      expect(useSessionEcartStore.getState().deviseCode).toBe('USD');
    });

    it('setCaisseComptee should update caisseComptee and recalculate ecart', () => {
      const { setCaisseComptee, setSoldePrecedent } = useSessionEcartStore.getState();
      setSoldePrecedent(1000);

      setCaisseComptee(1200);

      expect(useSessionEcartStore.getState().caisseComptee).toBe(1200);
      expect(useSessionEcartStore.getState().montantEcart).toBe(200);
    });

    it('setSoldePrecedent should update soldePrecedent and recalculate ecart', () => {
      const { setCaisseComptee, setSoldePrecedent } = useSessionEcartStore.getState();
      setCaisseComptee(1200);

      setSoldePrecedent(1000);

      expect(useSessionEcartStore.getState().soldePrecedent).toBe(1000);
      expect(useSessionEcartStore.getState().montantEcart).toBe(200);
    });

    it('setCommentaire should update commentaire', () => {
      const { setCommentaire } = useSessionEcartStore.getState();

      setCommentaire('Test comment');

      expect(useSessionEcartStore.getState().commentaire).toBe('Test comment');
    });

    it('setCommentaireDevise should update commentaireDevise', () => {
      const { setCommentaireDevise } = useSessionEcartStore.getState();

      setCommentaireDevise('Devise note');

      expect(useSessionEcartStore.getState().commentaireDevise).toBe('Devise note');
    });

    it('setSeuilAlerte should update seuilAlerte', () => {
      const { setSeuilAlerte } = useSessionEcartStore.getState();

      setSeuilAlerte(100);

      expect(useSessionEcartStore.getState().seuilAlerte).toBe(100);
    });

    it('setError should update error', () => {
      const { setError } = useSessionEcartStore.getState();

      setError('Custom error');

      expect(useSessionEcartStore.getState().error).toBe('Custom error');
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      const { setSessionId, setDeviseCode, setCaisseComptee, setCommentaire, reset } = useSessionEcartStore.getState();
      
      setSessionId(123);
      setDeviseCode('EUR');
      setCaisseComptee(1500);
      setCommentaire('Test');

      reset();

      const state = useSessionEcartStore.getState();
      expect(state.sessionId).toBe(null);
      expect(state.deviseCode).toBe(null);
      expect(state.caisseComptee).toBe(0);
      expect(state.soldePrecedent).toBe(0);
      expect(state.montantEcart).toBe(0);
      expect(state.commentaire).toBe('');
      expect(state.commentaireDevise).toBe('');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.ecartSaved).toBe(false);
      expect(state.seuilAlerte).toBe(DEFAULT_SEUIL_ALERTE);
    });
  });
});