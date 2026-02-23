import type { DenominationCatalog, CountingResult } from '@/types/denomination';
import type { SessionEcart } from '@/types/session';

export interface DenominationGridProps {
  deviseCode: string;
  denominations: DenominationCatalog[];
  counting: Map<number, number>;
  onCountChange: (denominationId: number, quantite: number) => void;
  readOnly?: boolean;
}

export interface DenominationRowProps {
  denomination: DenominationCatalog;
  count: number;
  onChange: (quantite: number) => void;
  readOnly?: boolean;
}

export interface DenominationSummaryProps {
  results: CountingResult[];
}

export interface EcartDisplayProps {
  ecart: SessionEcart;
  seuilAlerte?: number;
  onJustify?: () => void;
}
