export type TransactionMode = 'GP' | 'Boutique';

export interface TransactionLineFormData {
  id: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
  devise: string;
  codeProduit?: string;
}

export interface TransactionFormData {
  compteNumero: string;
  compteNom: string;
  devise: string;
  dateTransaction: string;
  lignes: TransactionLineFormData[];
  commentaire: string;
  mode: TransactionMode;
}

export interface TransactionFormProps {
  mode: TransactionMode;
  initialData?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  readOnly?: boolean;
}

export interface ReglementLine {
  moyenCode: string;
  moyenLibelle: string;
  montant: number;
}

export interface ReglementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalTransaction: number;
  devise: string;
  onValidate: (reglements: ReglementLine[]) => void;
}

export interface CommentaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSave: (commentaire: string) => void;
}

export interface BilateraleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalRestant: number;
  devise: string;
  mopLibelle: string;
  onValidate: (partie1: number, partie2: number) => void;
}

export interface TransferData {
  compteSource: string;
  compteDestination: string;
  montant: number;
  motif: string;
}

export interface LiberationData {
  compte: string;
  montant: number;
  referenceOrigine: string;
}
