import type { Session } from "@/types";

export interface RecapWorksheetEntry {
  dateComptable: Date;
  numeroSession: number;
  type: string;
  typeApproVersCoffre: string | null;
  modePaiement: string | null;
  avecChange: string | null;
  codeDevise: string;
  quantiteDevise: number | null;
  tauxDevise: number | null;
  montant: number;
  montantMonnaie: number | null;
  montantProduits: number | null;
  montantCartes: number | null;
  montantCheque: number | null;
  montantOd: number | null;
  societe: string;
  compteVillage: number;
  filiation: number;
  imputation: number | null;
  sousImputation: number | null;
  libelle: string | null;
  libelleComplementaire: string | null;
  nomGm: string | null;
  quantiteArticle: number | null;
  prixArticle: number | null;
}

export interface RecapWorksheetSummary {
  numeroSession: number;
  dateComptable: Date;
  totalParDevise: Record<string, number>;
  totalParType: Record<string, number>;
  totalParModePaiement: Record<string, number>;
  totalGeneral: number;
}

export interface RecapWorksheetFilters {
  dateDebut?: Date;
  dateFin?: Date;
  numeroSession?: number;
}

export interface RecapWorksheetState {
  entries: RecapWorksheetEntry[];
  summary: RecapWorksheetSummary | null;
  isGenerating: boolean;
  error: string | null;
  filters: RecapWorksheetFilters;
  generateRecapWorksheet: (
    numeroSession: number,
    dateComptable: Date
  ) => Promise<RecapWorksheetSummary>;
  exportRecapWorksheet: (
    summary: RecapWorksheetSummary,
    format: "txt" | "csv" | "json"
  ) => Promise<Blob>;
  fetchRecapEntries: (numeroSession: number) => Promise<RecapWorksheetEntry[]>;
  calculateSummary: (entries: RecapWorksheetEntry[]) => RecapWorksheetSummary;
  setEntries: (entries: RecapWorksheetEntry[]) => void;
  setSummary: (summary: RecapWorksheetSummary | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: RecapWorksheetFilters) => void;
  clearRecapWorksheet: () => void;
}

export interface GenerateRecapWorksheetRequest {
  numeroSession: number;
  dateComptable: Date;
}

export interface ExportRecapWorksheetRequest {
  summary: RecapWorksheetSummary;
  format: "txt" | "csv" | "json";
}

export interface FetchRecapEntriesRequest {
  numeroSession: number;
}

export interface CalculateSummaryRequest {
  entries: RecapWorksheetEntry[];
}

export type RecapWorksheetApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

const RECAP_WORKSHEET_EXPORT_FORMATS = ["txt", "csv", "json"] as const;
export type RecapWorksheetExportFormat =
  (typeof RECAP_WORKSHEET_EXPORT_FORMATS)[number];

const RECAP_WORKSHEET_TYPES = [
  "vente",
  "change",
  "approvisionnement",
  "remboursement",
  "ajustement",
] as const;
export type RecapWorksheetType = (typeof RECAP_WORKSHEET_TYPES)[number];

const RECAP_WORKSHEET_PAIEMENT_MODES = [
  "especes",
  "carte",
  "cheque",
  "virement",
  "prelevement",
  "od",
] as const;
export type RecapWorksheetPaiementMode =
  (typeof RECAP_WORKSHEET_PAIEMENT_MODES)[number];