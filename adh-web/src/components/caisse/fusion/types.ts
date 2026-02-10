import type { FusionAccount, FusionPreview, FusionResult, FusionProgress } from '@/types/fusion';

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
}

export interface FusionResultDialogProps extends FusionComponentProps {
  result: FusionResult;
  onRetry: () => void;
  onClose: () => void;
}
