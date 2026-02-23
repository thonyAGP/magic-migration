import type {
  Devise,
  DeviseStock,
  ChangeOperation,
  ChangeOperationSummary,
  ChangeOperationType,
} from '@/types/change';

export interface ChangeOperationGridProps {
  operations: ChangeOperation[];
  summary: ChangeOperationSummary | null;
  onCancel: (operationId: number) => void;
  isLoading?: boolean;
}

export interface DeviseStockPanelProps {
  stock: DeviseStock[];
  isLoading?: boolean;
}

export interface DeviseSelectorProps {
  devises: Devise[];
  selected: string | null;
  onSelect: (deviseCode: string) => void;
  disabled?: boolean;
}

export interface ChangeOperationFormProps {
  devises: Devise[];
  onSubmit: (data: ChangeFormData) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export interface ChangeCancellationDialogProps {
  open: boolean;
  operationId: number | null;
  onClose: () => void;
  onConfirm: (motif: string) => void;
  isCancelling?: boolean;
}

export interface ChangeFormData {
  type: ChangeOperationType;
  deviseCode: string;
  montant: number;
  taux: number;
  modePaiement: string;
}
