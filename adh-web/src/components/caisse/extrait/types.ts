import type {
  ExtraitAccountInfo,
  ExtraitTransaction,
  ExtraitSummary,
  ExtraitPrintFormat,
} from '@/types/extrait';

export interface ExtraitAccountSelectorProps {
  onSelect: (account: ExtraitAccountInfo) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface ExtraitTransactionGridProps {
  transactions: ExtraitTransaction[];
  summary: ExtraitSummary | null;
  isLoading?: boolean;
}

export interface ExtraitFormatDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectFormat: (format: ExtraitPrintFormat) => void;
  isPrinting?: boolean;
}
