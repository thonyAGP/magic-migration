// Fusion de comptes types (IDE 28)

export type FusionStatus = 'en_attente' | 'validation' | 'en_cours' | 'termine' | 'erreur';

export type FusionStep =
  | 'selection_principal'
  | 'selection_secondaire'
  | 'preview'
  | 'confirmation'
  | 'processing'
  | 'result';

export interface FusionAccount {
  codeAdherent: number;
  filiation: number;
  nom: string;
  prenom: string;
  societe: string;
  solde: number;
  nbTransactions: number;
  nbGaranties: number;
}

export interface GarantieItem {
  id: string;
  article: string;
  description: string;
  montant: number;
  dateDepot: string;
  compteOrigine: 'source' | 'destination';
}

export interface FusionPreview {
  comptePrincipal: FusionAccount;
  compteSecondaire: FusionAccount;
  nbOperationsAFusionner: number;
  montantTotal: number;
  garantiesATransferer: number;
  garantiesSource: GarantieItem[];
  garantiesDestination: GarantieItem[];
  conflits: FusionConflict[];
  avertissements: string[];
}

export interface FusionConflict {
  type: 'garantie' | 'pointage' | 'transaction';
  description: string;
  resolution: 'auto' | 'manuel';
}

export interface FusionResult {
  success: boolean;
  compteFinal: FusionAccount;
  nbOperationsFusionnees: number;
  nbGarantiesTransferees: number;
  message: string;
  dateExecution: string;
}

export interface FusionProgress {
  etape: string;
  progression: number;
  message: string;
}

export interface FusionPrerequisites {
  canProceed: boolean;
  warnings: string[];
}
