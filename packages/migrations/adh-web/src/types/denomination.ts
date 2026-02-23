import type { MOPCategory, SoldeParMOP } from './session';

export interface DenominationCatalog {
  id: number;
  deviseCode: string;
  valeur: number;
  type: 'billet' | 'piece';
  libelle: string;
  ordre: number;
  // MOP category for grouping (IDE 120: monnaie/produits/cartes/cheques/od)
  mopCategory?: MOPCategory;
}

export interface DenominationCounting {
  denominationId: number;
  quantite: number;
  total: number;
}

export interface CountingResult {
  deviseCode: string;
  totalCompte: number;
  totalAttendu: number;
  ecart: number;
  details: DenominationCounting[];
  // MOP breakdown of counted amounts (IDE 120: EW-FA, IDE 122: FP-FU)
  mopBreakdown?: SoldeParMOP;
}

export interface CountingSession {
  sessionId: number;
  type: 'ouverture' | 'fermeture';
  deviseResults: CountingResult[];
  timestamp: string;
}
