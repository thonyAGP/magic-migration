// Hebergement types for facture section (IDE 97.3)

export interface HebergementData {
  numeroChambre: string;
  typeHebergement: string; // 'chambre' | 'suite' | 'bungalow' | 'villa'
  dateArrivee: string;
  dateDepart: string;
  nbNuits: number;
  prixNuit: number;
  totalHebergement: number;
  pensionType?: string; // 'BB' | 'HB' | 'FB' | 'AI'
}

export const HEBERGEMENT_TYPES = [
  { value: 'chambre', label: 'Chambre' },
  { value: 'suite', label: 'Suite' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'villa', label: 'Villa' },
] as const;

export const PENSION_TYPES = [
  { value: 'BB', label: 'BB - Bed & Breakfast' },
  { value: 'HB', label: 'HB - Demi-pension' },
  { value: 'FB', label: 'FB - Pension complete' },
  { value: 'AI', label: 'AI - All Inclusive' },
] as const;
