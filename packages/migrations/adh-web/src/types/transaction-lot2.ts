import type { ArticleType, PaymentSide } from './transaction';

// Catalogue MOP (Moyen de Paiement) - enriched from IDE 152
export interface MoyenPaiementCatalog {
  code: string;
  libelle: string;
  type: 'especes' | 'carte' | 'cheque' | 'virement' | 'autre';
  classe: string; // from IDE 152 (RECUP_CLASSE_MOP)
  estTPE: boolean;
  maxMontant?: number;
}

// Donnees forfait
export interface ForfaitData {
  code: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  articleType: ArticleType;
  prixParJour: number;
  prixForfait: number;
}

// Identite VRL
export interface VRLIdentity {
  nom: string;
  prenom: string;
  typeDocument: string;
  numeroDocument: string;
}

// Pre-check reseau/cloture
export interface PreCheckResult {
  canSell: boolean;
  reason?: string;
}

// Config edition par terminal
export interface EditionConfig {
  format: 'PMS28' | 'PMS584' | 'LEX';
  printerId: number;
  printerName: string;
}

// Resultat GiftPass (IDE 241)
export interface GiftPassResult {
  balance: number;
  available: boolean;
  devise: string;
}

// Resultat Resort Credit (IDE 254)
export interface ResortCreditResult {
  balance: number;
  available: boolean;
  devise: string;
}

// Donnees recovery TPE
export interface TPERecoveryData {
  transactionId: number;
  montant: number;
  mopCode: string;
  erreurTPE: string;
}

// Selection MOP
export interface SelectedMOP {
  code: string;
  montant: number;
}

// Ligne de transaction pour la creation (request payload)
export interface TransactionLinePayload {
  description: string;
  quantite: number;
  prixUnitaire: number;
  devise: string;
  codeProduit?: string;
}

// Draft transaction Lot 2
export interface TransactionDraft {
  compteId: number;
  compteNom: string;
  articleType: ArticleType;
  lignes: TransactionLinePayload[];
  mop: SelectedMOP[];
  paymentSide: PaymentSide;
  giftPass?: GiftPassResult;
  resortCredit?: ResortCreditResult;
  forfait?: ForfaitData;
  vrlIdentity?: VRLIdentity;
  commentaire?: string;
  devise: string;
  montantTotal: number;
}
