import { create } from 'zustand';
import type {
  RecapWorksheetEntry,
  RecapWorksheetSummary,
  RecapWorksheetFilters,
  RecapWorksheetExportFormat,
} from '@/types/recapWorksheet';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';

interface RecapWorksheetState {
  entries: RecapWorksheetEntry[];
  summary: RecapWorksheetSummary | null;
  isGenerating: boolean;
  error: string | null;
  filters: RecapWorksheetFilters;
}

interface RecapWorksheetActions {
  generateRecapWorksheet: (
    numeroSession: number,
    dateComptable: Date,
  ) => Promise<RecapWorksheetSummary>;
  exportRecapWorksheet: (
    summary: RecapWorksheetSummary,
    format: RecapWorksheetExportFormat,
  ) => Promise<Blob>;
  fetchRecapEntries: (numeroSession: number) => Promise<RecapWorksheetEntry[]>;
  calculateSummary: (entries: RecapWorksheetEntry[]) => RecapWorksheetSummary;
  setEntries: (entries: RecapWorksheetEntry[]) => void;
  setSummary: (summary: RecapWorksheetSummary | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: RecapWorksheetFilters) => void;
  clearRecapWorksheet: () => void;
  reset: () => void;
}

type RecapWorksheetStore = RecapWorksheetState & RecapWorksheetActions;

const MOCK_ENTRIES: RecapWorksheetEntry[] = [
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'vente',
    typeApproVersCoffre: null,
    modePaiement: 'especes',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 1250.0,
    montantMonnaie: 1250.0,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 101,
    sousImputation: 1,
    libelle: 'Ventes espèces session matinale',
    libelleComplementaire: null,
    nomGm: 'MARTIN Sophie',
    quantiteArticle: 15,
    prixArticle: 83.33,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'vente',
    typeApproVersCoffre: null,
    modePaiement: 'carte',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 3450.0,
    montantMonnaie: null,
    montantProduits: null,
    montantCartes: 3450.0,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 102,
    sousImputation: 1,
    libelle: 'Ventes carte session matinale',
    libelleComplementaire: 'CB/Visa',
    nomGm: 'MARTIN Sophie',
    quantiteArticle: 28,
    prixArticle: 123.21,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'change',
    typeApproVersCoffre: null,
    modePaiement: 'especes',
    avecChange: 'O',
    codeDevise: 'USD',
    quantiteDevise: 500.0,
    tauxDevise: 1.12,
    montant: 446.43,
    montantMonnaie: 446.43,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 201,
    sousImputation: 1,
    libelle: 'Opération change USD',
    libelleComplementaire: 'Achat USD contre EUR',
    nomGm: 'MARTIN Sophie',
    quantiteArticle: null,
    prixArticle: null,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'change',
    typeApproVersCoffre: null,
    modePaiement: 'especes',
    avecChange: 'O',
    codeDevise: 'GBP',
    quantiteDevise: 200.0,
    tauxDevise: 0.86,
    montant: 232.56,
    montantMonnaie: 232.56,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 202,
    sousImputation: 1,
    libelle: 'Opération change GBP',
    libelleComplementaire: 'Vente GBP contre EUR',
    nomGm: 'MARTIN Sophie',
    quantiteArticle: null,
    prixArticle: null,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'approvisionnement',
    typeApproVersCoffre: 'coffre_vers_caisse',
    modePaiement: 'especes',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 5000.0,
    montantMonnaie: 5000.0,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 301,
    sousImputation: 1,
    libelle: 'Approvisionnement coffre vers caisse',
    libelleComplementaire: 'Fond de caisse matinal',
    nomGm: 'DUPONT Jean',
    quantiteArticle: null,
    prixArticle: null,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1002,
    type: 'vente',
    typeApproVersCoffre: null,
    modePaiement: 'cheque',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 780.0,
    montantMonnaie: null,
    montantProduits: null,
    montantCartes: null,
    montantCheque: 780.0,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 103,
    sousImputation: 1,
    libelle: 'Ventes chèque session après-midi',
    libelleComplementaire: null,
    nomGm: 'DURAND Pierre',
    quantiteArticle: 5,
    prixArticle: 156.0,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1002,
    type: 'vente',
    typeApproVersCoffre: null,
    modePaiement: 'od',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 125.0,
    montantMonnaie: null,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: 125.0,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 104,
    sousImputation: 1,
    libelle: 'Ordre de débit',
    libelleComplementaire: 'Régularisation compte',
    nomGm: 'DURAND Pierre',
    quantiteArticle: null,
    prixArticle: null,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1002,
    type: 'remboursement',
    typeApproVersCoffre: null,
    modePaiement: 'especes',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: -350.0,
    montantMonnaie: -350.0,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 401,
    sousImputation: 1,
    libelle: 'Remboursement client',
    libelleComplementaire: 'Annulation vente',
    nomGm: 'DURAND Pierre',
    quantiteArticle: null,
    prixArticle: null,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1002,
    type: 'ajustement',
    typeApproVersCoffre: null,
    modePaiement: 'especes',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 15.5,
    montantMonnaie: 15.5,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 501,
    sousImputation: 1,
    libelle: 'Ajustement écart caisse',
    libelleComplementaire: 'Surplus constaté',
    nomGm: 'ADMIN',
    quantiteArticle: null,
    prixArticle: null,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1002,
    type: 'approvisionnement',
    typeApproVersCoffre: 'caisse_vers_coffre',
    modePaiement: 'especes',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: -3000.0,
    montantMonnaie: -3000.0,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 302,
    sousImputation: 1,
    libelle: 'Déversement caisse vers coffre',
    libelleComplementaire: 'Fermeture session',
    nomGm: 'DURAND Pierre',
    quantiteArticle: null,
    prixArticle: null,
  },
];

const initialState: RecapWorksheetState = {
  entries: [],
  summary: null,
  isGenerating: false,
  error: null,
  filters: {},
};

export const useRecapWorksheetStore = create<RecapWorksheetStore>()((set, get) => ({
  ...initialState,

  generateRecapWorksheet: async (numeroSession, dateComptable) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isGenerating: true, error: null });

    if (!isRealApi) {
      const sessionEntries = MOCK_ENTRIES.filter((e) => e.numeroSession === numeroSession);
      const summary = get().calculateSummary(sessionEntries);
      set({
        entries: sessionEntries,
        summary,
        isGenerating: false,
      });
      return summary;
    }

    try {
      const response = await apiClient.post<
        ApiResponse<RecapWorksheetSummary>,
        { numeroSession: number; dateComptable: string }
      >('/api/recapWorksheet/generate', {
        numeroSession,
        dateComptable: dateComptable.toISOString(),
      });

      const summary = response.data.data;
      if (!summary) {
        throw new Error('Aucun récapitulatif généré');
      }

      const entries = await get().fetchRecapEntries(numeroSession);
      set({ summary, entries, isGenerating: false });
      return summary;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur génération récapitulatif';
      set({ error: message, isGenerating: false });
      throw e;
    }
  },

  exportRecapWorksheet: async (summary, format) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      let content = '';
      if (format === 'txt') {
        content = `=== RECAP WORKSHEET SESSION ${summary.numeroSession} ===\n`;
        content += `Date comptable: ${summary.dateComptable.toLocaleDateString()}\n\n`;
        content += `TOTAUX PAR DEVISE:\n`;
        Object.entries(summary.totalParDevise).forEach(([devise, montant]) => {
          content += `  ${devise}: ${montant.toFixed(2)}\n`;
        });
        content += `\nTOTAUX PAR TYPE:\n`;
        Object.entries(summary.totalParType).forEach(([type, montant]) => {
          content += `  ${type}: ${montant.toFixed(2)}\n`;
        });
        content += `\nTOTAUX PAR MODE PAIEMENT:\n`;
        Object.entries(summary.totalParModePaiement).forEach(([mode, montant]) => {
          content += `  ${mode}: ${montant.toFixed(2)}\n`;
        });
        content += `\nTOTAL GENERAL: ${summary.totalGeneral.toFixed(2)} EUR\n`;
      } else if (format === 'csv') {
        content = 'Type,Devise,Montant\n';
        Object.entries(summary.totalParDevise).forEach(([devise, montant]) => {
          content += `Devise,${devise},${montant.toFixed(2)}\n`;
        });
        Object.entries(summary.totalParType).forEach(([type, montant]) => {
          content += `Type,${type},${montant.toFixed(2)}\n`;
        });
        Object.entries(summary.totalParModePaiement).forEach(([mode, montant]) => {
          content += `ModePaiement,${mode},${montant.toFixed(2)}\n`;
        });
      } else {
        content = JSON.stringify(summary, null, 2);
      }

      return new Blob([content], { type: 'text/plain' });
    }

    try {
      const response = await apiClient.post<Blob, { summary: RecapWorksheetSummary; format: RecapWorksheetExportFormat }>(
        '/api/recapWorksheet/export',
        { summary, format },
        { responseType: 'blob' },
      );
      return response.data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur export récapitulatif';
      set({ error: message });
      throw e;
    }
  },

  fetchRecapEntries: async (numeroSession) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const entries = MOCK_ENTRIES.filter((e) => e.numeroSession === numeroSession);
      return entries;
    }

    try {
      const response = await apiClient.get<ApiResponse<RecapWorksheetEntry[]>>(
        `/api/recapWorksheet/entries/${numeroSession}`,
      );
      return response.data.data ?? [];
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur chargement entrées récapitulatif';
      set({ error: message });
      throw e;
    }
  },

  calculateSummary: (entries) => {
    const totalParDevise: Record<string, number> = {};
    const totalParType: Record<string, number> = {};
    const totalParModePaiement: Record<string, number> = {};
    let totalGeneral = 0;

    entries.forEach((entry) => {
      totalParDevise[entry.codeDevise] =
        (totalParDevise[entry.codeDevise] ?? 0) + entry.montant;

      totalParType[entry.type] = (totalParType[entry.type] ?? 0) + entry.montant;

      if (entry.modePaiement) {
        totalParModePaiement[entry.modePaiement] =
          (totalParModePaiement[entry.modePaiement] ?? 0) + entry.montant;
      }

      totalGeneral += entry.montant;
    });

    return {
      numeroSession: entries[0]?.numeroSession ?? 0,
      dateComptable: entries[0]?.dateComptable ?? new Date(),
      totalParDevise,
      totalParType,
      totalParModePaiement,
      totalGeneral,
    };
  },

  setEntries: (entries) => set({ entries }),

  setSummary: (summary) => set({ summary }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setError: (error) => set({ error }),

  setFilters: (filters) => set({ filters }),

  clearRecapWorksheet: () =>
    set({
      entries: [],
      summary: null,
      error: null,
    }),

  reset: () => set({ ...initialState }),
}));