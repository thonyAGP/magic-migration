import type { ClubMedPass, PassTransaction, PassValidationResult } from '@/types/clubmedpass';

export interface PassValidationFormProps {
  onValidate: (data: PassValidationFormData) => void;
  onScan: (numeroPass: string) => void;
  isValidating?: boolean;
  isScanning?: boolean;
  disabled?: boolean;
}

export interface PassDetailCardProps {
  pass: ClubMedPass | null;
  validationResult: PassValidationResult | null;
  isLoading?: boolean;
}

export interface PassTransactionGridProps {
  transactions: PassTransaction[];
  isLoading?: boolean;
}

export interface PassLimitDialogProps {
  open: boolean;
  validationResult: PassValidationResult | null;
  onClose: () => void;
  onForce?: () => void;
}

export type { PassValidationFormData, PassScanFormData } from './schemas';
