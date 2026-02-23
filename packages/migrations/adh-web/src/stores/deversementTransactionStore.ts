import { create } from 'zustand';
import type {
  Vente,
  OperationDiverse,
  CompteGM,
  Hebergement,
  TransfertAffectation,
  ComplementBiking,
  DeversementResult,
  DeverserVenteRequest,
  DeverserVenteResponse,
  AffecterTransfertRequest,
  AffecterTransfertResponse,
  RazAffectationResponse,
  IncrementNumeroTicketRequest,
  IncrementNumeroTicketResponse,
  GetCompteGMResponse,
  GetOperationsDiversesResponse,
  DeversementState,
  DeversementActions,
} from '@/types/deversementTransaction';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

type DeversementStore = DeversementState & DeversementActions;

const MOCK_VENTES: Vente[] = [
  {
    id: 1,
    societe: 'SOC1',
    compte: 'C1001',
    filiation: 0,
    dateEncaissement: new Date('2026-02-20T10:30:00'),
    montant: 150.00,
    annulation: false,
    typeVente: 'standard',
    modePaiement: 'CB',
    operateur: 'MARTIN S.',
  },
  {
    id: 2,
    societe: 'SOC1',
    compte: 'C1002',
    filiation: 1,
    dateEncaissement: new Date('2026-02-20T11:15:00'),
    montant: 75.50,
    annulation: true,
    typeVente: 'standard',
    modePaiement: 'Especes',
    operateur: 'DUPONT J.',
  },
  {
    id: 3,
    societe: 'SOC1',
    compte: 'C1003',
    filiation: 0,
    dateEncaissement: new Date('2026-02-20T14:00:00'),
    montant: 220.00,
    annulation: false,
    typeVente: 'VRL',
    modePaiement: 'CB',
    operateur: 'BERNARD L.',
  },
  {
    id: 4,
    societe: 'SOC2',
    compte: 'C2001',
    filiation: 2,
    dateEncaissement: new Date('2026-02-20T16:45:00'),
    montant: 185.75,
    annulation: false,
    typeVente: 'VSL',
    modePaiement: 'Virement',
    operateur: 'MARTIN S.',
  },
  {
    id: 5,
    societe: 'SOC2',
    compte: 'C2002',
    filiation: 0,
    dateEncaissement: new Date('2026-02-21T09:20:00'),
    montant: 95.00,
    annulation: false,
    typeVente: 'OD',
    modePaiement: 'Cheque',
    operateur: 'LAURENT M.',
  },
];

const MOCK_COMPTES_GM: CompteGM[] = [
  { societe: 'SOC1', compte: 'C1001', solde: 450.00, dateMAJ: new Date('2026-02-20T10:00:00') },
  { societe: 'SOC1', compte: 'C1002', solde: 320.50, dateMAJ: new Date('2026-02-19T15:30:00') },
  { societe: 'SOC1', compte: 'C1003', solde: 180.00, dateMAJ: new Date('2026-02-20T13:45:00') },
  { societe: 'SOC2', compte: 'C2001', solde: 575.25, dateMAJ: new Date('2026-02-20T16:00:00') },
  { societe: 'SOC2', compte: 'C2002', solde: 210.00, dateMAJ: new Date('2026-02-21T09:00:00') },
];

const MOCK_HEBERGEMENTS: Hebergement[] = [
  { societe: 'SOC1', compte: 'C1001', chambre: 'A101', dateDebut: new Date('2026-02-15'), dateFin: new Date('2026-02-25'), statut: 'actif' },
  { societe: 'SOC1', compte: 'C1002', chambre: 'B205', dateDebut: new Date('2026-02-18'), dateFin: new Date('2026-02-22'), statut: 'actif' },
  { societe: 'SOC1', compte: 'C1003', chambre: 'C312', dateDebut: new Date('2026-02-20'), dateFin: new Date('2026-02-28'), statut: 'actif' },
  { societe: 'SOC2', compte: 'C2001', chambre: null, dateDebut: null, dateFin: null, statut: null },
  { societe: 'SOC2', compte: 'C2002', chambre: 'D410', dateDebut: new Date('2026-02-19'), dateFin: new Date('2026-02-23'), statut: 'bloque' },
];

const createMockOperationsDiverses = (vente: Vente, isAnnulation: boolean): OperationDiverse[] => {
  const baseDate = vente.dateEncaissement ?? new Date();
  const montantSigne = isAnnulation ? Math.abs(vente.montant) : -Math.abs(vente.montant);
  
  return [
    { id: 1, societe: vente.societe, compte: vente.compte, typeOD: 'compte', montant: montantSigne, dateOperation: baseDate, description: 'OD Compte principal' },
    { id: 2, societe: vente.societe, compte: `${vente.compte}_SRV1`, typeOD: 'service', montant: montantSigne * 0.3, dateOperation: baseDate, description: 'OD Service 1' },
    { id: 3, societe: vente.societe, compte: `${vente.compte}_SRV2`, typeOD: 'service', montant: montantSigne * 0.2, dateOperation: baseDate, description: 'OD Service 2' },
    { id: 4, societe: vente.societe, compte: `${vente.compte}_STAT1`, typeOD: 'statistiques', montant: montantSigne * 0.1, dateOperation: baseDate, description: 'OD Statistiques 1' },
    { id: 5, societe: vente.societe, compte: `${vente.compte}_STAT2`, typeOD: 'statistiques', montant: montantSigne * 0.1, dateOperation: baseDate, description: 'OD Statistiques 2' },
    { id: 6, societe: vente.societe, compte: `${vente.compte}_STAT3`, typeOD: 'statistiques', montant: montantSigne * 0.1, dateOperation: baseDate, description: 'OD Statistiques 3' },
    { id: 7, societe: vente.societe, compte: `${vente.compte}_BIKING`, typeOD: 'biking', montant: montantSigne * 0.1, dateOperation: baseDate, description: 'OD Biking' },
    { id: 8, societe: vente.societe, compte: `${vente.compte}_LCO`, typeOD: 'lco', montant: montantSigne * 0.05, dateOperation: baseDate, description: 'OD LCO' },
    { id: 9, societe: vente.societe, compte: `${vente.compte}_MISC`, typeOD: 'compte', montant: montantSigne * 0.05, dateOperation: baseDate, description: 'OD Divers' },
  ];
};

const MOCK_COMPLEMENTS_BIKING: ComplementBiking[] = [
  { id: 1, venteId: 1, typeVelo: 'VTT', quantite: 2, dateRetour: new Date('2026-02-22T18:00:00') },
  { id: 2, venteId: 3, typeVelo: 'Route', quantite: 1, dateRetour: null },
];

const initialState: DeversementState = {
  vente: null,
  operationsDiverses: [],
  compteGM: null,
  hebergement: null,
  transfertAffectation: null,
  isProcessing: false,
  error: null,
  affectationTransfert: '',
  showAffectationModal: false,
  numeroTicket: null,
  venteVrlVsl: false,
  complementsBiking: [],
  deversementHistory: [],
};

export const useDeversementTransactionStore = create<DeversementStore>()((set, get) => ({
  ...initialState,

  setVente: (vente) => set({ vente }),
  
  setOperationsDiverses: (operations) => set({ operationsDiverses: operations }),
  
  setCompteGM: (compte) => set({ compteGM: compte }),
  
  setHebergement: (hebergement) => set({ hebergement }),
  
  setTransfertAffectation: (transfert) => set({ transfertAffectation: transfert }),
  
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  
  setError: (error) => set({ error }),
  
  setAffectationTransfert: (affectation) => set({ affectationTransfert: affectation }),
  
  setShowAffectationModal: (show) => set({ showAffectationModal: show }),
  
  setNumeroTicket: (numero) => set({ numeroTicket: numero }),
  
  setVenteVrlVsl: (vrlvsl) => set({ venteVrlVsl: vrlvsl }),
  
  setComplementsBiking: (complements) => set({ complementsBiking: complements }),

  deverserVente: async (venteId, annulation, affectation) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isProcessing: true, error: null });

    if (!isRealApi) {
      const vente = MOCK_VENTES.find((v) => v.id === venteId);
      if (!vente) {
        set({ error: 'Vente introuvable', isProcessing: false });
        return;
      }

      const operations = createMockOperationsDiverses(vente, annulation);
      const compteGM = MOCK_COMPTES_GM.find((c) => c.societe === vente.societe && c.compte === vente.compte);
      const hebergement = MOCK_HEBERGEMENTS.find((h) => h.societe === vente.societe && h.compte === vente.compte);

      const nouveauSolde = (compteGM?.solde ?? 0) + (annulation ? Math.abs(vente.montant) : -Math.abs(vente.montant));
      const compteGMMAJ: CompteGM = {
        societe: vente.societe,
        compte: vente.compte,
        solde: nouveauSolde,
        dateMAJ: new Date(),
      };

      let numeroTicket: number | null = null;
      if (vente.typeVente === 'VRL' || vente.typeVente === 'VSL') {
        numeroTicket = Math.floor(Math.random() * 9000) + 1000;
        set({ numeroTicket, venteVrlVsl: true });
      }

      const result: DeversementResult = {
        success: true,
        venteId,
        operationsDiverses: operations,
        numeroTicket: numeroTicket ?? undefined,
        compteGMAncienSolde: compteGM?.solde ?? 0,
        compteGMNouveauSolde: nouveauSolde,
      };

      if (affectation) {
        const transfertId = Math.floor(Math.random() * 10000);
        set({
          transfertAffectation: {
            id: transfertId,
            venteId,
            affectation,
            dateTransfert: new Date(),
          },
        });
        result.transfertAffectationId = transfertId;
      }

      set({
        vente,
        operationsDiverses: operations,
        compteGM: compteGMMAJ,
        hebergement: hebergement ?? null,
        isProcessing: false,
        deversementHistory: [...get().deversementHistory, result],
      });
      return;
    }

    try {
      const response = await apiClient.post<DeverserVenteResponse>('/api/ventes/deversement', {
        venteId,
        annulation,
        affectation,
      } satisfies DeverserVenteRequest);

      const result = response.data.data;
      if (!result) {
        throw new Error('Réponse API invalide');
      }

      set({
        operationsDiverses: result.operationsDiverses,
        numeroTicket: result.numeroTicket ?? null,
        venteVrlVsl: result.numeroTicket !== undefined,
        deversementHistory: [...get().deversementHistory, result],
      });

      if (result.transfertAffectationId && affectation) {
        set({
          transfertAffectation: {
            id: result.transfertAffectationId,
            venteId,
            affectation,
            dateTransfert: new Date(),
          },
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors du déversement';
      set({ error: message });
    } finally {
      set({ isProcessing: false });
    }
  },

  creerOperationDiverse: async (vente, typeOD, montant) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const od: OperationDiverse = {
        id: Math.floor(Math.random() * 10000),
        societe: vente.societe,
        compte: vente.compte,
        typeOD,
        montant,
        dateOperation: vente.dateEncaissement ?? new Date(),
        description: `OD ${typeOD}`,
      };
      set({ operationsDiverses: [...get().operationsDiverses, od] });
      return od;
    }

    try {
      const response = await apiClient.post<ApiResponse<OperationDiverse>>('/api/operations-diverses', {
        societe: vente.societe,
        compte: vente.compte,
        typeOD,
        montant,
        dateOperation: vente.dateEncaissement ?? new Date(),
      });
      const od = response.data.data;
      if (!od) {
        throw new Error('Réponse API invalide');
      }
      set({ operationsDiverses: [...get().operationsDiverses, od] });
      return od;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur création OD';
      set({ error: message });
      throw e;
    }
  },

  mettreAJourCompteGM: async (societe, compte, montant, annulation) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const compteGM = MOCK_COMPTES_GM.find((c) => c.societe === societe && c.compte === compte);
      const ancienSolde = compteGM?.solde ?? 0;
      const nouveauSolde = ancienSolde + (annulation ? Math.abs(montant) : -Math.abs(montant));
      
      const compteGMMAJ: CompteGM = {
        societe,
        compte,
        solde: nouveauSolde,
        dateMAJ: new Date(),
      };
      set({ compteGM: compteGMMAJ });
      return;
    }

    try {
      const response = await apiClient.put<ApiResponse<CompteGM>>(`/api/comptes/gm/${societe}/${compte}`, {
        montant,
        annulation,
      });
      const compteGMMAJ = response.data.data;
      if (!compteGMMAJ) {
        throw new Error('Réponse API invalide');
      }
      set({ compteGM: compteGMMAJ });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur MAJ compte GM';
      set({ error: message });
      throw e;
    }
  },

  mettreAJourHebergement: async (societe, compte, statut) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const hebergement = MOCK_HEBERGEMENTS.find((h) => h.societe === societe && h.compte === compte);
      if (hebergement) {
        const hebergementMAJ: Hebergement = { ...hebergement, statut };
        set({ hebergement: hebergementMAJ });
      }
      return;
    }

    try {
      const response = await apiClient.put<ApiResponse<Hebergement>>(`/api/hebergements/${societe}/${compte}`, {
        statut,
      });
      const hebergementMAJ = response.data.data;
      if (!hebergementMAJ) {
        throw new Error('Réponse API invalide');
      }
      set({ hebergement: hebergementMAJ });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur MAJ hébergement';
      set({ error: message });
      throw e;
    }
  },

  affecterTransfert: async (venteId, affectation) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isProcessing: true, error: null });

    if (!isRealApi) {
      const transfert: TransfertAffectation = {
        id: Math.floor(Math.random() * 10000),
        venteId,
        affectation,
        dateTransfert: new Date(),
      };
      set({ transfertAffectation: transfert, isProcessing: false, showAffectationModal: false });
      return;
    }

    try {
      const response = await apiClient.post<AffecterTransfertResponse>(`/api/ventes/${venteId}/affectation`, {
        affectation,
      } satisfies AffecterTransfertRequest);
      const result = response.data.data;
      if (!result) {
        throw new Error('Réponse API invalide');
      }
      const transfert: TransfertAffectation = {
        id: result.transfertId,
        venteId,
        affectation,
        dateTransfert: new Date(),
      };
      set({ transfertAffectation: transfert, showAffectationModal: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur affectation transfert';
      set({ error: message });
    } finally {
      set({ isProcessing: false });
    }
  },

  razAffectationTransfert: async (venteId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isProcessing: true, error: null });

    if (!isRealApi) {
      set({ transfertAffectation: null, affectationTransfert: '', isProcessing: false });
      return;
    }

    try {
      await apiClient.delete<RazAffectationResponse>(`/api/ventes/${venteId}/affectation`);
      set({ transfertAffectation: null, affectationTransfert: '' });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur RAZ affectation';
      set({ error: message });
    } finally {
      set({ isProcessing: false });
    }
  },

  incrementerNumeroTicket: async (typeVente) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const numero = Math.floor(Math.random() * 9000) + 1000;
      set({ numeroTicket: numero });
      return numero;
    }

    try {
      const response = await apiClient.post<IncrementNumeroTicketResponse>('/api/tickets/increment', {
        typeVente,
      } satisfies IncrementNumeroTicketRequest);
      const numero = response.data.data?.numeroTicket;
      if (numero === undefined) {
        throw new Error('Réponse API invalide');
      }
      set({ numeroTicket: numero });
      return numero;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur incrémentation ticket';
      set({ error: message });
      throw e;
    }
  },

  mettreAJourComplementsBiking: async (venteId) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const complements = MOCK_COMPLEMENTS_BIKING.filter((c) => c.venteId === venteId);
      set({ complementsBiking: complements });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<ComplementBiking[]>>(`/api/ventes/${venteId}/complements-biking`);
      const complements = response.data.data ?? [];
      set({ complementsBiking: complements });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur MAJ compléments biking';
      set({ error: message });
      throw e;
    }
  },

  verifierEtEnvoyerMail: async (venteId) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      return;
    }

    try {
      await apiClient.post(`/api/ventes/${venteId}/send-mail`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur envoi mail';
      set({ error: message });
      throw e;
    }
  },

  chargerCompteGM: async (societe, compte) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isProcessing: true, error: null });

    if (!isRealApi) {
      const compteGM = MOCK_COMPTES_GM.find((c) => c.societe === societe && c.compte === compte);
      set({ compteGM: compteGM ?? null, isProcessing: false });
      return;
    }

    try {
      const response = await apiClient.get<GetCompteGMResponse>(`/api/comptes/gm/${societe}/${compte}`);
      const compteGM = response.data.data;
      set({ compteGM: compteGM ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement compte GM';
      set({ error: message, compteGM: null });
    } finally {
      set({ isProcessing: false });
    }
  },

  chargerOperationsDiverses: async (venteId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isProcessing: true, error: null });

    if (!isRealApi) {
      const vente = MOCK_VENTES.find((v) => v.id === venteId);
      if (vente) {
        const operations = createMockOperationsDiverses(vente, vente.annulation);
        set({ operationsDiverses: operations, isProcessing: false });
      } else {
        set({ operationsDiverses: [], isProcessing: false });
      }
      return;
    }

    try {
      const response = await apiClient.get<GetOperationsDiversesResponse>(`/api/ventes/${venteId}/od`);
      const operations = response.data.data ?? [];
      set({ operationsDiverses: operations });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement OD';
      set({ error: message, operationsDiverses: [] });
    } finally {
      set({ isProcessing: false });
    }
  },

  resetState: () => set({ ...initialState }),
}));