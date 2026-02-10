import type { GarantieType } from '@/types/garantie';
import type { FactureType } from '@/types/facture';

// Garantie requests
export interface CreateGarantieRequest {
  societe: string;
  codeAdherent: number;
  filiation: number;
  montant: number;
  devise: string;
  description: string;
  dateExpiration?: string;
  articles?: Array<{
    code: string;
    libelle: string;
    description: string;
    valeurEstimee: number;
  }>;
}

export interface GarantieVersementRequest {
  montant: number;
  motif: string;
}

export interface GarantieRetraitRequest {
  montant: number;
  motif: string;
}

export interface CancelGarantieRequest {
  motif: string;
}

// Facture requests
export interface CreateFactureRequest {
  societe: string;
  codeAdherent: number;
  filiation: number;
  type: FactureType;
  commentaire?: string;
}

export interface UpdateFactureLigneRequest {
  lignes: Array<{
    codeArticle: string;
    libelle: string;
    quantite: number;
    prixUnitaireHT: number;
    tauxTVA: number;
  }>;
}

export interface ValidateFactureRequest {
  commentaire?: string;
}
