export interface Denomination {
  id: number;
  deviseCode: string;
  valeur: number;
  type: 'billet' | 'piece';
  libelle: string;
}

export interface DenominationCount {
  denominationId: number;
  quantite: number;
  total: number;
}

export interface CaisseConfig {
  id: number;
  numero: string;
  societe: string;
  libelle: string;
  devisePrincipale: string;
  devisesAutorisees: string[];
}

export type CaisseMenuAction =
  | 'ouverture'
  | 'fermeture'
  | 'comptage'
  | 'historique'
  | 'reimpression'
  | 'consultation'
  | 'parametres'
  | 'vente_gp'
  | 'vente_boutique'
  | 'extrait'
  | 'change'
  | 'garantie'
  | 'facture'
  | 'clubmedpass'
  | 'datacatch'
  | 'separation'
  | 'fusion'
  | 'changement_compte'
  | 'solde_compte'
  | 'telephone';

export interface CaisseMenuItem {
  action: CaisseMenuAction;
  label: string;
  icon: string;
  description: string;
  enabled: boolean;
  requiresOpenSession: boolean;
}
