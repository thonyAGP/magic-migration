// Separation de comptes types (IDE 27)

export type SeparationStatus = 'en_attente' | 'validation' | 'en_cours' | 'termine' | 'erreur';

export type SeparationStep =
  | 'selection'
  | 'preview'
  | 'confirmation'
  | 'processing'
  | 'result';

export interface SeparationAccount {
  codeAdherent: number;
  filiation: number;
  nom: string;
  prenom: string;
  societe: string;
  solde: number;
  nbTransactions: number;
}

export interface SeparationPreview {
  compteSource: SeparationAccount;
  compteDestination: SeparationAccount;
  nbOperationsADeplacer: number;
  montantADeplacer: number;
  garantiesImpactees: number;
  avertissements: string[];
}

export interface SeparationResult {
  success: boolean;
  compteSource: SeparationAccount;
  compteDestination: SeparationAccount;
  nbOperationsDeplacees: number;
  montantDeplace: number;
  message: string;
  dateExecution: string;
}

export interface SeparationProgress {
  etape: string;
  progression: number;
  message: string;
}
