import type {
  ArticleType,
  TransactionType,
  PaymentSide,
} from '@/types/transaction';
import type {
  SelectedMOP,
  VRLIdentity,
  TransactionLinePayload,
} from '@/types/transaction-lot2';

export type { TransactionMode } from '@/components/caisse/transaction/types';

// Request: Create a new Lot 2 transaction
export interface CreateTransactionLot2Request {
  sessionId: number;
  type: TransactionType;
  mode: 'GP' | 'Boutique';
  compteId: number;
  articleType: ArticleType;
  lignes: TransactionLinePayload[];
  commentaire?: string;
}

// Request: Check GiftPass balance (IDE 241)
export interface GiftPassCheckRequest {
  societe: string;
  compte: number;
  filiation: number;
}

// Request: Check Resort Credit balance (IDE 254)
export interface ResortCreditCheckRequest {
  societe: string;
  compte: number;
  filiation: number;
}

// Request: Complete a transaction with payment
export interface CompleteTransactionRequest {
  mop: SelectedMOP[];
  paymentSide: PaymentSide;
  bilateral?: {
    compteSource: number;
    compteDestination: number;
    montantSource: number;
    montantDestination: number;
  };
  giftPassAmount?: number;
  resortCreditAmount?: number;
  forfait?: {
    dateDebut: string;
    dateFin: string;
  };
  vrlIdentity?: VRLIdentity;
}

// Request: Recover from TPE failure
export interface TPERecoverRequest {
  newMOP: SelectedMOP[];
}
