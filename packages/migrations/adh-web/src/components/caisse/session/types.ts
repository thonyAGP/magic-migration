import type {
  Session,
  SessionStatus,
  SessionEcart,
  SessionHistoryItem,
  CaisseMenuItem,
} from '@/types';

export interface SessionCardProps {
  session: Session;
  ecart?: SessionEcart;
}

export interface SessionStatusBadgeProps {
  status: SessionStatus;
  size?: 'sm' | 'md';
}

export interface SessionHistoryGridProps {
  sessions: SessionHistoryItem[];
  onSelect?: (session: SessionHistoryItem) => void;
  isLoading?: boolean;
}

export interface CaisseMenuGridProps {
  items: CaisseMenuItem[];
  onAction: (action: string) => void;
  currentStatus: SessionStatus;
}

export interface EcartJustificationDialogProps {
  ecart: SessionEcart;
  open: boolean;
  onClose: () => void;
  onSubmit: (justification: string) => void;
}
