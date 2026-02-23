import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDeversementTransactionStore } from '@/stores/deversementTransactionStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type {
  Vente,
  OperationDiverse,
  CompteGM,
  Hebergement,
  // TransfertAffectation,
  DeversementResult,
  ComplementBiking,
} from '@/types/deversementTransaction';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const MOCK_VENTE_STANDARD: Vente = {
  id: 1,
  societe: 'SOC1',
  compte: 'C1001',
  filiation: 0,
  dateEncaissement: new Date('2026-02-20T10:30:00'),
  montant: 150.0,
  annulation: false,
  typeVente: 'standard',
  modePaiement: 'CB',
  operateur: 'MARTIN S.',
};

const _MOCK_VENTE_VRL: Vente = {
  id: 3,
  societe: 'SOC1',
  compte: 'C1003',
  filiation: 0,
  dateEncaissement: new Date('2026-02-20T14:00:00'),
  montant: 220.0,
  annulation: false,
  typeVente: 'VRL',
  modePaiement: 'CB',
  operateur: 'BERNARD L.',
};

const _MOCK_VENTE_ANNULATION: Vente = {
  id: 2,
  societe: 'SOC1',
  compte: 'C1002',
  filiation: 1,
  dateEncaissement: new Date('2026-02-20T11:15:00'),
  montant: 75.5,
  annulation: true,
  typeVente: 'standard',
  modePaiement: 'Especes',
  operateur: 'DUPONT J.',
};

const MOCK_COMPTE_GM: CompteGM = {
  societe: 'SOC1',
  compte: 'C1001',
  solde: 450.0,
  dateMAJ: new Date('2026-02-20T10:00:00'),
};

const MOCK_HEBERGEMENT: Hebergement = {
  societe: 'SOC1',
  compte: 'C1001',
  chambre: 'A101',
  dateDebut: new Date('2026-02-15'),
  dateFin: new Date('2026-02-25'),
  statut: 'actif',
};

const MOCK_OPERATIONS_DIVERSES: OperationDiverse[] = [
  { id: 1, societe: 'SOC1', compte: 'C1001', typeOD: 'compte', montant: -150.0, dateOperation: new Date('2026-02-20T10:30:00'), description: 'OD Compte principal' },
  { id: 2, societe: 'SOC1', compte: 'C1001_SRV1', typeOD: 'service', montant: -45.0, dateOperation: new Date('2026-02-20T10:30:00'), description: 'OD Service 1' },
];

const MOCK_COMPLEMENT_BIKING: ComplementBiking = {
  id: 1,
  venteId: 1,
  typeVelo: 'VTT',
  quantite: 2,
  dateRetour: new Date('2026-02-22T18:00:00'),
};

describe('deversementTransactionStore', () => {
  beforeEach(() => {
    useDeversementTransactionStore.getState().resetState();
    vi.clearAllMocks();
    useDataSourceStore.setState({ isRealApi: false });
  });

  describe('setters', () => {
    it('should set vente', () => {
      const { setVente } = useDeversementTransactionStore.getState();
      
      setVente(MOCK_VENTE_STANDARD);
      
      expect(useDeversementTransactionStore.getState().vente).toEqual(MOCK_VENTE_STANDARD);
    });

    it('should set operations diverses', () => {
      const { setOperationsDiverses } = useDeversementTransactionStore.getState();
      
      setOperationsDiverses(MOCK_OPERATIONS_DIVERSES);
      
      expect(useDeversementTransactionStore.getState().operationsDiverses).toEqual(MOCK_OPERATIONS_DIVERSES);
    });

    it('should set compte GM', () => {
      const { setCompteGM } = useDeversementTransactionStore.getState();
      
      setCompteGM(MOCK_COMPTE_GM);
      
      expect(useDeversementTransactionStore.getState().compteGM).toEqual(MOCK_COMPTE_GM);
    });

    it('should set hebergement', () => {
      const { setHebergement } = useDeversementTransactionStore.getState();
      
      setHebergement(MOCK_HEBERGEMENT);
      
      expect(useDeversementTransactionStore.getState().hebergement).toEqual(MOCK_HEBERGEMENT);
    });

    it('should set affectation transfert', () => {
      const { setAffectationTransfert } = useDeversementTransactionStore.getState();
      
      setAffectationTransfert('ROOM-101');
      
      expect(useDeversementTransactionStore.getState().affectationTransfert).toBe('ROOM-101');
    });

    it('should set show affectation modal', () => {
      const { setShowAffectationModal } = useDeversementTransactionStore.getState();
      
      setShowAffectationModal(true);
      
      expect(useDeversementTransactionStore.getState().showAffectationModal).toBe(true);
    });

    it('should set numero ticket', () => {
      const { setNumeroTicket } = useDeversementTransactionStore.getState();
      
      setNumeroTicket(1234);
      
      expect(useDeversementTransactionStore.getState().numeroTicket).toBe(1234);
    });

    it('should set vente VRL VSL flag', () => {
      const { setVenteVrlVsl } = useDeversementTransactionStore.getState();
      
      setVenteVrlVsl(true);
      
      expect(useDeversementTransactionStore.getState().venteVrlVsl).toBe(true);
    });

    it('should set complements biking', () => {
      const { setComplementsBiking } = useDeversementTransactionStore.getState();
      
      setComplementsBiking([MOCK_COMPLEMENT_BIKING]);
      
      expect(useDeversementTransactionStore.getState().complementsBiking).toEqual([MOCK_COMPLEMENT_BIKING]);
    });
  });

  describe('deverserVente - mock mode', () => {
    it('should create 9 operations diverses for standard vente', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.operationsDiverses).toHaveLength(9);
      expect(state.operationsDiverses[0].typeOD).toBe('compte');
      expect(state.operationsDiverses[1].typeOD).toBe('service');
      expect(state.operationsDiverses[6].typeOD).toBe('biking');
      expect(state.operationsDiverses[7].typeOD).toBe('lco');
    });

    it('should apply RM-002 when annulation is false - subtract montant from solde', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.compteGM?.solde).toBe(300.0);
      expect(state.deversementHistory[0].compteGMAncienSolde).toBe(450.0);
      expect(state.deversementHistory[0].compteGMNouveauSolde).toBe(300.0);
    });

    it('should apply RM-002 when annulation is true - add montant to solde', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(2, true);

      const state = useDeversementTransactionStore.getState();
      expect(state.compteGM?.solde).toBe(396.0);
      expect(state.deversementHistory[0].compteGMAncienSolde).toBe(320.5);
      expect(state.deversementHistory[0].compteGMNouveauSolde).toBe(396.0);
    });

    it('should handle VRL vente and generate numero ticket', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(3, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.venteVrlVsl).toBe(true);
      expect(state.numeroTicket).toBeGreaterThanOrEqual(1000);
      expect(state.numeroTicket).toBeLessThanOrEqual(9999);
      expect(state.deversementHistory[0].numeroTicket).toBeDefined();
    });

    it('should handle VSL vente and generate numero ticket', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(4, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.venteVrlVsl).toBe(true);
      expect(state.numeroTicket).toBeGreaterThanOrEqual(1000);
      expect(state.deversementHistory[0].numeroTicket).toBeDefined();
    });

    it('should not generate ticket for standard vente', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.venteVrlVsl).toBe(false);
      expect(state.numeroTicket).toBeNull();
      expect(state.deversementHistory[0].numeroTicket).toBeUndefined();
    });

    it('should create transfert affectation when affectation provided', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false, 'ROOM-A101');

      const state = useDeversementTransactionStore.getState();
      expect(state.transfertAffectation).toBeDefined();
      expect(state.transfertAffectation?.affectation).toBe('ROOM-A101');
      expect(state.transfertAffectation?.venteId).toBe(1);
      expect(state.deversementHistory[0].transfertAffectationId).toBeDefined();
    });

    it('should not create transfert when affectation not provided', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.transfertAffectation).toBeNull();
      expect(state.deversementHistory[0].transfertAffectationId).toBeUndefined();
    });

    it('should set error when vente not found', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(999, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.error).toBe('Vente introuvable');
      expect(state.isProcessing).toBe(false);
    });

    it('should add deversement to history', async () => {
      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false);
      await deverserVente(2, true);

      const state = useDeversementTransactionStore.getState();
      expect(state.deversementHistory).toHaveLength(2);
      expect(state.deversementHistory[0].venteId).toBe(1);
      expect(state.deversementHistory[1].venteId).toBe(2);
    });
  });

  describe('deverserVente - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API with correct parameters', async () => {
      const mockResult: DeversementResult = {
        success: true,
        venteId: 1,
        operationsDiverses: MOCK_OPERATIONS_DIVERSES,
        compteGMAncienSolde: 450.0,
        compteGMNouveauSolde: 300.0,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: mockResult } });

      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false, 'ROOM-101');

      expect(apiClient.post).toHaveBeenCalledWith('/api/ventes/deversement', {
        venteId: 1,
        annulation: false,
        affectation: 'ROOM-101',
      });
    });

    it('should update state with API response', async () => {
      const mockResult: DeversementResult = {
        success: true,
        venteId: 1,
        operationsDiverses: MOCK_OPERATIONS_DIVERSES,
        numeroTicket: 1234,
        compteGMAncienSolde: 450.0,
        compteGMNouveauSolde: 300.0,
        transfertAffectationId: 999,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: mockResult } });

      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false, 'ROOM-101');

      const state = useDeversementTransactionStore.getState();
      expect(state.operationsDiverses).toEqual(MOCK_OPERATIONS_DIVERSES);
      expect(state.numeroTicket).toBe(1234);
      expect(state.venteVrlVsl).toBe(true);
      expect(state.transfertAffectation?.id).toBe(999);
      expect(state.transfertAffectation?.affectation).toBe('ROOM-101');
    });

    it('should handle API error', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isProcessing).toBe(false);
    });

    it('should handle invalid API response', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: null } });

      const { deverserVente } = useDeversementTransactionStore.getState();

      await deverserVente(1, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.error).toBe('Réponse API invalide');
      expect(state.isProcessing).toBe(false);
    });
  });

  describe('creerOperationDiverse - mock mode', () => {
    it('should create operation diverse with correct type and montant', async () => {
      const { creerOperationDiverse } = useDeversementTransactionStore.getState();

      const od = await creerOperationDiverse(MOCK_VENTE_STANDARD, 'service', -45.0);

      expect(od.societe).toBe('SOC1');
      expect(od.compte).toBe('C1001');
      expect(od.typeOD).toBe('service');
      expect(od.montant).toBe(-45.0);
      expect(od.dateOperation).toEqual(MOCK_VENTE_STANDARD.dateEncaissement);
    });

    it('should add operation diverse to state', async () => {
      const { creerOperationDiverse } = useDeversementTransactionStore.getState();

      await creerOperationDiverse(MOCK_VENTE_STANDARD, 'compte', -150.0);
      await creerOperationDiverse(MOCK_VENTE_STANDARD, 'biking', -15.0);

      const state = useDeversementTransactionStore.getState();
      expect(state.operationsDiverses).toHaveLength(2);
      expect(state.operationsDiverses[0].typeOD).toBe('compte');
      expect(state.operationsDiverses[1].typeOD).toBe('biking');
    });
  });

  describe('creerOperationDiverse - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and add OD to state', async () => {
      const mockOD: OperationDiverse = {
        id: 1,
        societe: 'SOC1',
        compte: 'C1001',
        typeOD: 'service',
        montant: -45.0,
        dateOperation: new Date('2026-02-20T10:30:00'),
        description: 'OD service',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: mockOD } });

      const { creerOperationDiverse } = useDeversementTransactionStore.getState();

      const od = await creerOperationDiverse(MOCK_VENTE_STANDARD, 'service', -45.0);

      expect(apiClient.post).toHaveBeenCalledWith('/api/operations-diverses', {
        societe: 'SOC1',
        compte: 'C1001',
        typeOD: 'service',
        montant: -45.0,
        dateOperation: MOCK_VENTE_STANDARD.dateEncaissement,
      });
      expect(od).toEqual(mockOD);
      expect(useDeversementTransactionStore.getState().operationsDiverses).toContain(mockOD);
    });

    it('should handle API error', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('API error'));

      const { creerOperationDiverse } = useDeversementTransactionStore.getState();

      await expect(creerOperationDiverse(MOCK_VENTE_STANDARD, 'service', -45.0)).rejects.toThrow();
      expect(useDeversementTransactionStore.getState().error).toBe('API error');
    });
  });

  describe('mettreAJourCompteGM - mock mode', () => {
    it('should subtract montant when annulation is false', async () => {
      const { mettreAJourCompteGM } = useDeversementTransactionStore.getState();

      await mettreAJourCompteGM('SOC1', 'C1001', 150.0, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.compteGM?.solde).toBe(300.0);
    });

    it('should add montant when annulation is true', async () => {
      const { mettreAJourCompteGM } = useDeversementTransactionStore.getState();

      await mettreAJourCompteGM('SOC1', 'C1001', 150.0, true);

      const state = useDeversementTransactionStore.getState();
      expect(state.compteGM?.solde).toBe(600.0);
    });

    it('should update dateMAJ to current time', async () => {
      const beforeTime = Date.now();
      const { mettreAJourCompteGM } = useDeversementTransactionStore.getState();

      await mettreAJourCompteGM('SOC1', 'C1001', 100.0, false);

      const state = useDeversementTransactionStore.getState();
      expect(state.compteGM?.dateMAJ.getTime()).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('mettreAJourCompteGM - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and update state', async () => {
      const mockCompteGM: CompteGM = {
        societe: 'SOC1',
        compte: 'C1001',
        solde: 300.0,
        dateMAJ: new Date('2026-02-20T11:00:00'),
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: { data: mockCompteGM } });

      const { mettreAJourCompteGM } = useDeversementTransactionStore.getState();

      await mettreAJourCompteGM('SOC1', 'C1001', 150.0, false);

      expect(apiClient.put).toHaveBeenCalledWith('/api/comptes/gm/SOC1/C1001', {
        montant: 150.0,
        annulation: false,
      });
      expect(useDeversementTransactionStore.getState().compteGM).toEqual(mockCompteGM);
    });

    it('should handle API error', async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new Error('MAJ error'));

      const { mettreAJourCompteGM } = useDeversementTransactionStore.getState();

      await expect(mettreAJourCompteGM('SOC1', 'C1001', 150.0, false)).rejects.toThrow();
      expect(useDeversementTransactionStore.getState().error).toBe('MAJ error');
    });
  });

  describe('mettreAJourHebergement - mock mode', () => {
    it('should update hebergement statut', async () => {
      const { mettreAJourHebergement } = useDeversementTransactionStore.getState();

      await mettreAJourHebergement('SOC1', 'C1001', 'libere');

      const state = useDeversementTransactionStore.getState();
      expect(state.hebergement?.statut).toBe('libere');
    });

    it('should preserve other hebergement fields', async () => {
      const { mettreAJourHebergement } = useDeversementTransactionStore.getState();

      await mettreAJourHebergement('SOC1', 'C1001', 'bloque');

      const state = useDeversementTransactionStore.getState();
      expect(state.hebergement?.chambre).toBe('A101');
      expect(state.hebergement?.dateDebut).toEqual(new Date('2026-02-15'));
    });
  });

  describe('mettreAJourHebergement - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and update state', async () => {
      const mockHebergement: Hebergement = {
        ...MOCK_HEBERGEMENT,
        statut: 'libere',
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: { data: mockHebergement } });

      const { mettreAJourHebergement } = useDeversementTransactionStore.getState();

      await mettreAJourHebergement('SOC1', 'C1001', 'libere');

      expect(apiClient.put).toHaveBeenCalledWith('/api/hebergements/SOC1/C1001', {
        statut: 'libere',
      });
      expect(useDeversementTransactionStore.getState().hebergement).toEqual(mockHebergement);
    });
  });

  describe('affecterTransfert - mock mode', () => {
    it('should create transfert affectation', async () => {
      const { affecterTransfert } = useDeversementTransactionStore.getState();

      await affecterTransfert(1, 'ROOM-B205');

      const state = useDeversementTransactionStore.getState();
      expect(state.transfertAffectation?.venteId).toBe(1);
      expect(state.transfertAffectation?.affectation).toBe('ROOM-B205');
    });

    it('should close modal after affectation', async () => {
      useDeversementTransactionStore.setState({ showAffectationModal: true });
      const { affecterTransfert } = useDeversementTransactionStore.getState();

      await affecterTransfert(1, 'ROOM-C312');

      expect(useDeversementTransactionStore.getState().showAffectationModal).toBe(false);
    });
  });

  describe('affecterTransfert - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and create transfert', async () => {
      const mockResponse = { success: true, transfertId: 999 };
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: mockResponse } });

      const { affecterTransfert } = useDeversementTransactionStore.getState();

      await affecterTransfert(1, 'ROOM-A101');

      expect(apiClient.post).toHaveBeenCalledWith('/api/ventes/1/affectation', {
        affectation: 'ROOM-A101',
      });
      const state = useDeversementTransactionStore.getState();
      expect(state.transfertAffectation?.id).toBe(999);
      expect(state.transfertAffectation?.affectation).toBe('ROOM-A101');
    });
  });

  describe('razAffectationTransfert - mock mode', () => {
    it('should reset transfert affectation', async () => {
      useDeversementTransactionStore.setState({
        transfertAffectation: { id: 1, venteId: 1, affectation: 'ROOM-A101', dateTransfert: new Date() },
        affectationTransfert: 'ROOM-A101',
      });

      const { razAffectationTransfert } = useDeversementTransactionStore.getState();

      await razAffectationTransfert(1);

      const state = useDeversementTransactionStore.getState();
      expect(state.transfertAffectation).toBeNull();
      expect(state.affectationTransfert).toBe('');
    });
  });

  describe('razAffectationTransfert - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and reset state', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: { data: { success: true } } });

      const { razAffectationTransfert } = useDeversementTransactionStore.getState();

      await razAffectationTransfert(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/ventes/1/affectation');
      const state = useDeversementTransactionStore.getState();
      expect(state.transfertAffectation).toBeNull();
      expect(state.affectationTransfert).toBe('');
    });
  });

  describe('incrementerNumeroTicket - mock mode', () => {
    it('should generate numero ticket for VRL', async () => {
      const { incrementerNumeroTicket } = useDeversementTransactionStore.getState();

      const numero = await incrementerNumeroTicket('VRL');

      expect(numero).toBeGreaterThanOrEqual(1000);
      expect(numero).toBeLessThanOrEqual(9999);
      expect(useDeversementTransactionStore.getState().numeroTicket).toBe(numero);
    });

    it('should generate numero ticket for VSL', async () => {
      const { incrementerNumeroTicket } = useDeversementTransactionStore.getState();

      const numero = await incrementerNumeroTicket('VSL');

      expect(numero).toBeGreaterThanOrEqual(1000);
      expect(numero).toBeLessThanOrEqual(9999);
    });
  });

  describe('incrementerNumeroTicket - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and return numero ticket', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { data: { numeroTicket: 5678 } } });

      const { incrementerNumeroTicket } = useDeversementTransactionStore.getState();

      const numero = await incrementerNumeroTicket('VRL');

      expect(apiClient.post).toHaveBeenCalledWith('/api/tickets/increment', { typeVente: 'VRL' });
      expect(numero).toBe(5678);
      expect(useDeversementTransactionStore.getState().numeroTicket).toBe(5678);
    });
  });

  describe('mettreAJourComplementsBiking - mock mode', () => {
    it('should load complements biking for vente', async () => {
      const { mettreAJourComplementsBiking } = useDeversementTransactionStore.getState();

      await mettreAJourComplementsBiking(1);

      const state = useDeversementTransactionStore.getState();
      expect(state.complementsBiking).toHaveLength(1);
      expect(state.complementsBiking[0].typeVelo).toBe('VTT');
      expect(state.complementsBiking[0].quantite).toBe(2);
    });

    it('should return empty array when no complements', async () => {
      const { mettreAJourComplementsBiking } = useDeversementTransactionStore.getState();

      await mettreAJourComplementsBiking(999);

      expect(useDeversementTransactionStore.getState().complementsBiking).toHaveLength(0);
    });
  });

  describe('mettreAJourComplementsBiking - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and update state', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [MOCK_COMPLEMENT_BIKING] } });

      const { mettreAJourComplementsBiking } = useDeversementTransactionStore.getState();

      await mettreAJourComplementsBiking(1);

      expect(apiClient.get).toHaveBeenCalledWith('/api/ventes/1/complements-biking');
      expect(useDeversementTransactionStore.getState().complementsBiking).toEqual([MOCK_COMPLEMENT_BIKING]);
    });
  });

  describe('verifierEtEnvoyerMail - mock mode', () => {
    it('should not call API in mock mode', async () => {
      const { verifierEtEnvoyerMail } = useDeversementTransactionStore.getState();

      await verifierEtEnvoyerMail(1);

      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe('verifierEtEnvoyerMail - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API to send mail', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

      const { verifierEtEnvoyerMail } = useDeversementTransactionStore.getState();

      await verifierEtEnvoyerMail(1);

      expect(apiClient.post).toHaveBeenCalledWith('/api/ventes/1/send-mail');
    });

    it('should handle API error', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Mail error'));

      const { verifierEtEnvoyerMail } = useDeversementTransactionStore.getState();

      await expect(verifierEtEnvoyerMail(1)).rejects.toThrow();
      expect(useDeversementTransactionStore.getState().error).toBe('Mail error');
    });
  });

  describe('chargerCompteGM - mock mode', () => {
    it('should load compte GM', async () => {
      const { chargerCompteGM } = useDeversementTransactionStore.getState();

      await chargerCompteGM('SOC1', 'C1001');

      const state = useDeversementTransactionStore.getState();
      expect(state.compteGM?.solde).toBe(450.0);
      expect(state.isProcessing).toBe(false);
    });

    it('should set null when compte not found', async () => {
      const { chargerCompteGM } = useDeversementTransactionStore.getState();

      await chargerCompteGM('SOC999', 'C9999');

      expect(useDeversementTransactionStore.getState().compteGM).toBeNull();
    });
  });

  describe('chargerCompteGM - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and update state', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: MOCK_COMPTE_GM } });

      const { chargerCompteGM } = useDeversementTransactionStore.getState();

      await chargerCompteGM('SOC1', 'C1001');

      expect(apiClient.get).toHaveBeenCalledWith('/api/comptes/gm/SOC1/C1001');
      expect(useDeversementTransactionStore.getState().compteGM).toEqual(MOCK_COMPTE_GM);
    });
  });

  describe('chargerOperationsDiverses - mock mode', () => {
    it('should load operations diverses for vente', async () => {
      const { chargerOperationsDiverses } = useDeversementTransactionStore.getState();

      await chargerOperationsDiverses(1);

      const state = useDeversementTransactionStore.getState();
      expect(state.operationsDiverses).toHaveLength(9);
      expect(state.isProcessing).toBe(false);
    });

    it('should return empty when vente not found', async () => {
      const { chargerOperationsDiverses } = useDeversementTransactionStore.getState();

      await chargerOperationsDiverses(999);

      expect(useDeversementTransactionStore.getState().operationsDiverses).toHaveLength(0);
    });
  });

  describe('chargerOperationsDiverses - real API mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and update state', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { data: MOCK_OPERATIONS_DIVERSES } });

      const { chargerOperationsDiverses } = useDeversementTransactionStore.getState();

      await chargerOperationsDiverses(1);

      expect(apiClient.get).toHaveBeenCalledWith('/api/ventes/1/od');
      expect(useDeversementTransactionStore.getState().operationsDiverses).toEqual(MOCK_OPERATIONS_DIVERSES);
    });
  });

  describe('resetState', () => {
    it('should reset all state to initial values', () => {
      useDeversementTransactionStore.setState({
        vente: MOCK_VENTE_STANDARD,
        operationsDiverses: MOCK_OPERATIONS_DIVERSES,
        compteGM: MOCK_COMPTE_GM,
        numeroTicket: 1234,
        venteVrlVsl: true,
        error: 'Some error',
      });

      const { resetState } = useDeversementTransactionStore.getState();
      resetState();

      const state = useDeversementTransactionStore.getState();
      expect(state.vente).toBeNull();
      expect(state.operationsDiverses).toHaveLength(0);
      expect(state.compteGM).toBeNull();
      expect(state.numeroTicket).toBeNull();
      expect(state.venteVrlVsl).toBe(false);
      expect(state.error).toBeNull();
      expect(state.deversementHistory).toHaveLength(0);
    });
  });
});