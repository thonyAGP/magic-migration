// Facture TVA types (IDE 97)

export type FactureType = 'facture' | 'avoir';

export type FactureStatus = 'brouillon' | 'emise' | 'payee' | 'annulee';

export interface Facture {
  id: number;
  reference: string;
  societe: string;
  codeAdherent: number;
  filiation: number;
  nomAdherent: string;
  type: FactureType;
  statut: FactureStatus;
  dateEmission: string;
  dateEcheance: string | null;
  lignes: FactureLigne[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  devise: string;
  commentaire: string;
  operateur: string;
}

export interface FactureLigne {
  id: number;
  factureId: number;
  codeArticle: string;
  libelle: string;
  quantite: number;
  prixUnitaireHT: number;
  tauxTVA: number;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
}

export interface FactureTVALine {
  tauxTVA: number;
  baseHT: number;
  montantTVA: number;
}

export interface FactureSummary {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  ventilationTVA: FactureTVALine[];
}

export interface FactureSearchResult {
  factures: Facture[];
  total: number;
}
