import type { Garantie, GarantieArticle, GarantieOperation, GarantieSummaryData } from '@/types/garantie';

export interface GarantieDepotFormProps {
  onSubmit: (data: GarantieDepotFormData) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export interface GarantieOperationGridProps {
  operations: GarantieOperation[];
  onCancel?: (operationId: number) => void;
  isLoading?: boolean;
}

export interface GarantieVersementDialogProps {
  open: boolean;
  garantie: Garantie | null;
  onClose: () => void;
  onConfirm: (montant: number, motif: string) => void;
  isSubmitting?: boolean;
  mode: 'versement' | 'retrait';
}

export interface GarantieSummaryProps {
  summary: GarantieSummaryData | null;
  isLoading?: boolean;
}

export interface GarantieDepotArticleDialogProps {
  open: boolean;
  onClose: () => void;
  compteId: string;
  onValidate: (article: Omit<GarantieArticle, 'id' | 'garantieId' | 'etat'>) => void;
}

export interface GarantieModificationDialogProps {
  open: boolean;
  onClose: () => void;
  article: GarantieArticle | null;
  onValidate: (updated: GarantieArticle) => void;
}

export interface GarantieRetraitDialogProps {
  open: boolean;
  onClose: () => void;
  article: GarantieArticle | null;
  onConfirm: () => void;
}

// Re-export schema types for convenience
export type { GarantieDepotFormData, GarantieVersementFormData } from './schemas';
