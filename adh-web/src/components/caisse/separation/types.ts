import type { SeparationAccount, SeparationPreview, SeparationResult, SeparationProgress } from '@/types/separation';

export interface Filiation {
  id: string;
  nom: string;
  prenom: string;
  typeRelation: string; // 'parent' | 'enfant' | 'conjoint'
  compteId: string;
}

export interface SeparationAccountSelectorProps {
  label: string;
  onSelect: (account: SeparationAccount) => void;
  onSearch: (query: string) => void;
  searchResults?: SeparationAccount[];
  selectedAccount: SeparationAccount | null;
  excludeAccount?: SeparationAccount | null;
  isLoading?: boolean;
  isSearching?: boolean;
  disabled?: boolean;
  filiations?: Filiation[];
  onSelectFiliation?: (filiationId: string) => void;
}

export interface SeparationPreviewCardProps {
  preview: SeparationPreview | null;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
}

export interface SeparationProcessingProps {
  progress: SeparationProgress | null;
  isProcessing: boolean;
  failedStep?: { name: string; error: string } | null;
  onRetry?: () => void;
  onMarkDone?: () => void;
  onSkip?: () => void;
}

export interface SeparationResultDialogProps {
  open: boolean;
  result: SeparationResult | null;
  onClose: () => void;
}

export interface FiliationListProps {
  accountId: string;
  filiations: Filiation[];
  onSelectFiliation?: (filiationId: string) => void;
}

export interface OperationRetryDialogProps {
  open: boolean;
  onClose: () => void;
  operationName: string;
  errorMessage?: string;
  onRetry: () => void;
  onMarkDone: () => void;
  onSkip: () => void;
}
