import type { Garantie, GarantieOperation, GarantieSummaryData } from '@/types/garantie';

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

// Re-export schema types for convenience
export type { GarantieDepotFormData, GarantieVersementFormData } from './schemas';
