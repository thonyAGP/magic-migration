// Garantie/Caution types (IDE 111)

export type GarantieType = 'depot' | 'versement' | 'retrait' | 'annulation';

export type GarantieStatus = 'active' | 'versee' | 'restituee' | 'annulee';

export interface Garantie {
  id: number;
  societe: string;
  codeAdherent: number;
  filiation: number;
  nomAdherent: string;
  type: GarantieType;
  statut: GarantieStatus;
  montant: number;
  devise: string;
  dateCreation: string;
  dateExpiration: string | null;
  description: string;
  operateur: string;
  articles: GarantieArticle[];
}

export interface GarantieArticle {
  id: number;
  garantieId: number;
  code: string;
  libelle: string;
  description: string;
  valeurEstimee: number;
  etat: 'depose' | 'restitue';
}

export interface GarantieOperation {
  id: number;
  garantieId: number;
  type: GarantieType;
  montant: number;
  date: string;
  heure: string;
  operateur: string;
  motif: string;
}

export interface GarantieSummaryData {
  nbActives: number;
  montantTotalBloque: number;
  nbVersees: number;
  nbRestituees: number;
}

export interface GarantieSearchResult {
  garanties: Garantie[];
  total: number;
}
