import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGestionCaisseStore } from '@/stores/gestionCaisseStore';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

import type {
  ParametresCaisse,
  SessionCaisse,
  DateComptable,
  SessionConcurrente,
  MouvementCaisse,
} from '@/types/gestionCaisse';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(),
  },
}));

const getState = () => useGestionCaisseStore.getState();

describe('gestionCaisseStore', () => {
  beforeEach(() => {
    getState().reset();
    vi.clearAllMocks();
  });

  describe('chargerParametres', () => {
    it('should load mock parameters when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().chargerParametres();

      const state = getState();
      expect(state.parametres).not.toBeNull();
      expect(state.parametres?.deviseLocale).toBe('EUR');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should load parameters from API when isRealApi is true', async () => {
      const mockParams: ParametresCaisse = {
        caisseId: 1,
        seuilAlerte: 500,
        deviseLocale: 'EUR',
        impressionAuto: true,
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockParams },
      });

      await getState().chargerParametres();

      expect(apiClient.get).toHaveBeenCalledWith('/api/gestion-caisse/parametres');
      expect(getState().parametres).toEqual(mockParams);
      expect(getState().isLoading).toBe(false);
      expect(getState().error).toBeNull();
    });

    it('should set error when API call fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await getState().chargerParametres();

      expect(getState().parametres).toBeNull();
      expect(getState().error).toBe('Network error');
      expect(getState().isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      let sawLoading = false;
      const unsubscribe = useGestionCaisseStore.subscribe((state) => {
        if (state.isLoading) sawLoading = true;
      });

      await getState().chargerParametres();
      unsubscribe();

      expect(sawLoading).toBe(true);
      expect(getState().isLoading).toBe(false);
    });
  });

  describe('chargerSessionActive', () => {
    it('should load mock session when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().chargerSessionActive();

      const state = getState();
      expect(state.sessionActive).not.toBeNull();
      expect(state.sessionActive?.statut).toBe('ouverte');
      expect(state.error).toBeNull();
    });

    it('should load session from API when isRealApi is true', async () => {
      const mockSession: SessionCaisse = {
        sessionId: 123,
        dateOuverture: '2026-02-22T08:00:00',
        dateFermeture: null,
        operateurId: 5,
        operateurNom: 'DUPONT',
        statut: 'ouverte',
        montantOuverture: 500,
        montantFermeture: null,
        ecart: null,
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockSession },
      });

      await getState().chargerSessionActive();

      expect(apiClient.get).toHaveBeenCalledWith('/api/gestion-caisse/session-active');
      expect(getState().sessionActive).toEqual(mockSession);
    });

    it('should handle error when loading session', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Session error'));

      await getState().chargerSessionActive();

      expect(getState().sessionActive).toBeNull();
      expect(getState().error).toBe('Session error');
    });
  });

  describe('verifierDateComptable', () => {
    it('should load mock date when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().verifierDateComptable();

      const state = getState();
      expect(state.dateComptable).not.toBeNull();
      expect(state.dateComptable?.valide).toBe(true);
    });

    it('should load date from API when isRealApi is true', async () => {
      const mockDate: DateComptable = {
        date: '2026-02-22',
        valide: true,
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockDate },
      });

      await getState().verifierDateComptable();

      expect(apiClient.get).toHaveBeenCalledWith('/api/gestion-caisse/date-comptable');
      expect(getState().dateComptable).toEqual(mockDate);
    });

    it('should handle error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Date error'));

      await getState().verifierDateComptable();

      expect(getState().dateComptable).toBeNull();
      expect(getState().error).toBe('Date error');
    });
  });

  describe('controlerCoffre', () => {
    it('should do nothing in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().controlerCoffre();

      expect(apiClient.post).not.toHaveBeenCalled();
      expect(getState().isLoading).toBe(false);
    });

    it('should call API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

      await getState().controlerCoffre();

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-caisse/controler-coffre');
      expect(getState().isLoading).toBe(false);
    });

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Coffre error'));

      await getState().controlerCoffre();

      expect(getState().error).toBe('Coffre error');
      expect(getState().isLoading).toBe(false);
    });
  });

  describe('detecterSessionsConcurrentes', () => {
    it('should load mock concurrent sessions when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().detecterSessionsConcurrentes();

      expect(getState().sessionsConcurrentes.length).toBeGreaterThan(0);
      expect(getState().isLoading).toBe(false);
    });

    it('should load from API when isRealApi is true', async () => {
      const mockConcurrentes: SessionConcurrente[] = [
        { sessionId: 2, posteId: 'C2', operateurNom: 'TEST', dateOuverture: '2026-02-22T09:00:00' },
      ];

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockConcurrentes },
      });

      await getState().detecterSessionsConcurrentes();

      expect(apiClient.get).toHaveBeenCalledWith('/api/gestion-caisse/sessions-concurrentes');
      expect(getState().sessionsConcurrentes).toEqual(mockConcurrentes);
    });

    it('should handle no concurrent sessions', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [] },
      });

      await getState().detecterSessionsConcurrentes();

      expect(getState().sessionsConcurrentes).toHaveLength(0);
    });
  });

  describe('ouvrirSession', () => {
    it('should open mock session when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().ouvrirSession();

      expect(getState().sessionActive).not.toBeNull();
      expect(getState().sessionActive?.statut).toBe('ouverte');
      expect(getState().error).toBeNull();
    });

    it('should open session via API when isRealApi is true', async () => {
      const mockSession: SessionCaisse = {
        sessionId: 123,
        dateOuverture: '2026-02-22T08:00:00',
        dateFermeture: null,
        operateurId: 5,
        operateurNom: 'DUPONT',
        statut: 'ouverte',
        montantOuverture: 500,
        montantFermeture: null,
        ecart: null,
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockSession },
      });

      await getState().ouvrirSession();

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-caisse/ouvrir-session');
      expect(getState().sessionActive).toEqual(mockSession);
      expect(getState().error).toBeNull();
    });

    it('should handle error when opening session fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Session error'));

      await getState().ouvrirSession();

      expect(getState().error).toBe('Session error');
    });
  });

  describe('apportCoffre', () => {
    it('should add mock movement when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().apportCoffre(200, 'EUR');

      expect(getState().mouvements).toHaveLength(1);
      expect(getState().mouvements[0].type).toBe('apport_coffre');
      expect(getState().mouvements[0].montant).toBe(200);
      expect(getState().error).toBeNull();
    });

    it('should call API when isRealApi is true', async () => {
      const mockMouvement: MouvementCaisse = {
        mouvementId: 1,
        sessionId: 1001,
        type: 'apport_coffre',
        deviseCode: 'EUR',
        montant: 200,
        dateHeure: '2026-02-22T09:00:00',
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockMouvement },
      });

      await getState().apportCoffre(200, 'EUR');

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-caisse/apport-coffre', {
        montant: 200,
        deviseCode: 'EUR',
      });
      expect(getState().error).toBeNull();
    });

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Apport error'));

      await getState().apportCoffre(200, 'EUR');

      expect(getState().error).toBe('Apport error');
    });
  });

  describe('apportProduit', () => {
    it('should add mock product movement when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().apportProduit(101, 50);

      expect(getState().mouvements).toHaveLength(1);
      expect(getState().mouvements[0].type).toBe('apport_produit');
      expect(getState().error).toBeNull();
    });

    it('should call API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { mouvementId: 1, sessionId: 1, type: 'apport_produit', deviseCode: 'EUR', montant: 500, dateHeure: '' } },
      });

      await getState().apportProduit(101, 50);

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-caisse/apport-produit', {
        produitId: 101,
        quantite: 50,
      });
      expect(getState().error).toBeNull();
    });
  });

  describe('remiseCoffre', () => {
    it('should add mock withdrawal when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().remiseCoffre(300, 'EUR');

      expect(getState().mouvements).toHaveLength(1);
      expect(getState().mouvements[0].type).toBe('remise_coffre');
      expect(getState().mouvements[0].montant).toBe(300);
      expect(getState().error).toBeNull();
    });
  });

  describe('fermerSession', () => {
    it('should close mock session when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().fermerSession();

      expect(getState().sessionActive?.statut).toBe('fermee');
      expect(getState().error).toBeNull();
    });

    it('should close session via API when isRealApi is true', async () => {
      const closedSession: SessionCaisse = {
        sessionId: 123,
        dateOuverture: '2026-02-22T08:00:00',
        dateFermeture: '2026-02-22T17:00:00',
        operateurId: 5,
        operateurNom: 'DUPONT',
        statut: 'fermee',
        montantOuverture: 500,
        montantFermeture: 1250,
        ecart: 3.5,
      };

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: closedSession },
      });

      await getState().fermerSession();

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-caisse/fermer-session');
      expect(getState().sessionActive?.statut).toBe('fermee');
      expect(getState().error).toBeNull();
    });

    it('should handle error on close', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Close error'));

      await getState().fermerSession();

      expect(getState().error).toBe('Close error');
    });
  });

  describe('consulterHistorique', () => {
    it('should load mock history when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().consulterHistorique();

      expect(getState().historique.length).toBeGreaterThan(0);
      expect(getState().showHistoriqueDialog).toBe(true);
      expect(getState().error).toBeNull();
    });

    it('should load history from API when isRealApi is true', async () => {
      const mockHistory: SessionCaisse[] = [
        {
          sessionId: 1, dateOuverture: '2026-02-21T08:00:00', dateFermeture: '2026-02-21T18:00:00',
          operateurId: 5, operateurNom: 'DUPONT', statut: 'fermee',
          montantOuverture: 500, montantFermeture: 1245.5, ecart: 2.5,
        },
      ];

      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockHistory },
      });

      await getState().consulterHistorique();

      expect(apiClient.get).toHaveBeenCalledWith('/api/gestion-caisse/historique');
      expect(getState().historique).toEqual(mockHistory);
      expect(getState().showHistoriqueDialog).toBe(true);
      expect(getState().error).toBeNull();
    });
  });

  describe('consulterSession', () => {
    it('should load mock session details when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().consulterSession(995);

      expect(getState().showConsultationDialog).toBe(true);
      expect(getState().mouvements.length).toBeGreaterThan(0);
      expect(getState().error).toBeNull();
    });

    it('should handle session not found in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().consulterSession(999999);

      expect(getState().sessionActive).toBeNull();
      expect(getState().showConsultationDialog).toBe(true);
    });

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Session not found'));

      await getState().consulterSession(999);

      expect(getState().error).toBe('Session not found');
    });
  });

  describe('reimprimerTickets', () => {
    it('should do nothing in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await getState().reimprimerTickets(123);

      expect(apiClient.post).not.toHaveBeenCalled();
      expect(getState().isLoading).toBe(false);
      expect(getState().error).toBeNull();
    });

    it('should call API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

      await getState().reimprimerTickets(123);

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-caisse/reimprimer-tickets/123');
      expect(getState().error).toBeNull();
    });

    it('should handle printer errors', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Printer error'));

      await getState().reimprimerTickets(123);

      expect(getState().error).toBe('Printer error');
    });
  });

  describe('setters and reset', () => {
    it('should set showHistoriqueDialog', () => {
      getState().setShowHistoriqueDialog(true);
      expect(getState().showHistoriqueDialog).toBe(true);
    });

    it('should set showConsultationDialog', () => {
      getState().setShowConsultationDialog(true);
      expect(getState().showConsultationDialog).toBe(true);
    });

    it('should set selectedSessionId', () => {
      getState().setSelectedSessionId(123);
      expect(getState().selectedSessionId).toBe(123);
    });

    it('should set error', () => {
      getState().setError('Test error');
      expect(getState().error).toBe('Test error');
    });

    it('should reset all state', () => {
      useGestionCaisseStore.setState({
        error: 'Some error',
        isLoading: true,
        showHistoriqueDialog: true,
      });

      getState().reset();

      const state = getState();
      expect(state.sessionActive).toBeNull();
      expect(state.parametres).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.showHistoriqueDialog).toBe(false);
    });
  });
});
