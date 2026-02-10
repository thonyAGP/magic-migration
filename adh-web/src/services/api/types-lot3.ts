import type { ExtraitPrintFormat } from '@/types/extrait';
import type { ChangeOperationType } from '@/types/change';

// Request: Search adherent account
export interface SearchAccountRequest {
  societe: string;
  query: string;
}

// Request: Print extrait de compte
export interface PrintExtraitRequest {
  societe: string;
  codeAdherent: number;
  filiation: number;
  format: ExtraitPrintFormat;
  dateDebut?: string;
  dateFin?: string;
}

// Request: Create change operation
export interface CreateChangeOperationRequest {
  societe: string;
  type: ChangeOperationType;
  deviseCode: string;
  montant: number;
  taux: number;
  modePaiement: string;
  operateur: string;
}

// Request: Cancel change operation
export interface CancelChangeOperationRequest {
  motif: string;
}
