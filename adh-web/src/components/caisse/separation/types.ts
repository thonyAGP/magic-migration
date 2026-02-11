import type { SeparationAccount, SeparationPreview, SeparationResult, SeparationProgress } from '@/types/separation';

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
}

export interface SeparationResultDialogProps {
  open: boolean;
  result: SeparationResult | null;
  onClose: () => void;
}
