import type { Facture, FactureLigne, FactureSummary } from '@/types/facture';
import type { FactureLigneFormData, FactureCreateFormData } from './schemas';

export interface FactureFormProps {
  onSubmit: (data: FactureCreateFormData) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export interface FactureLigneGridProps {
  lignes: FactureLigne[];
  onAddLigne: (ligne: FactureLigneFormData) => void;
  onRemoveLigne: (index: number) => void;
  isEditable?: boolean;
}

export interface FactureTVABreakdownProps {
  summary: FactureSummary | null;
  isLoading?: boolean;
}

export interface FacturePreviewProps {
  open: boolean;
  facture: Facture | null;
  onClose: () => void;
  onPrint: () => void;
  isPrinting?: boolean;
}

export interface FactureSearchPanelProps {
  onSelectFacture: (facture: Facture) => void;
  onSearch: (query?: string, dateDebut?: string, dateFin?: string) => void;
  searchResults?: Facture[];
  isSearching?: boolean;
  isLoading?: boolean;
}

export type { FactureLigneFormData, FactureCreateFormData };
