import type { FusionAccount, FusionPreview, FusionResult, FusionProgress, GarantieItem } from '@/types/fusion';

export type { GarantieItem } from '@/types/fusion';

export interface FusionComponentProps {
  className?: string;
}

export type FusionPhase = 'selection' | 'preview' | 'processing' | 'result';

export interface FusionAccountSearchProps extends FusionComponentProps {
  onSelect: (principal: FusionAccount, secondaire: FusionAccount) => void;
}

export interface FusionAccountSelectionProps extends FusionComponentProps {
  principal: FusionAccount;
  secondaire: FusionAccount;
  onPreview: () => void;
  onBack: () => void;
}

export interface FusionPreviewCardProps extends FusionComponentProps {
  preview: FusionPreview;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface FusionProcessingProps extends FusionComponentProps {
  progress: FusionProgress;
  onStepError?: (stepName: string, errorMessage: string) => void;
}

export interface FusionResultDialogProps extends FusionComponentProps {
  result: FusionResult;
  onRetry: () => void;
  onClose: () => void;
}

export interface FusionGarantieChoiceProps {
  open: boolean;
  onClose: () => void;
  garantiesSource: GarantieItem[];
  garantiesDestination: GarantieItem[];
  onValidate: (selectedIds: string[]) => void;
}

export interface FusionRetryDialogProps {
  open: boolean;
  onClose: () => void;
  operationName: string;
  errorMessage?: string;
  onRetry: () => void;
  onMarkDone: () => void;
  onSkip: () => void;
}
