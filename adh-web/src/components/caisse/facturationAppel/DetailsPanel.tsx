import type { HistoriqueAppel } from '@/types/facturationAppel';
import { cn } from '@/lib/utils';

export interface DetailsPanelProps {
  appel: HistoriqueAppel | null;
  societe: string;
  compte: number;
  filiation: number;
  nomClient: string;
  prenomClient: string;
  soldeCompte: number;
  coefficientApplique: number;
  className?: string;
}

export const DetailsPanel = ({
  appel,
  societe,
  compte,
  filiation,
  nomClient,
  prenomClient,
  soldeCompte,
  coefficientApplique,
  className,
}: DetailsPanelProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (!appel) {
    return (
      <div className={cn('rounded-md border border-neutral-200 bg-neutral-50 p-6', className)}>
        <p className="text-sm text-neutral-500">
          Sélectionnez un appel pour afficher les détails
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border border-neutral-200 bg-white p-6', className)}>
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">Détails de l'appel</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Société
            </label>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              {societe}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Compte
            </label>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              {compte}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Filiation
            </label>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              {filiation}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Nom
            </label>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              {nomClient}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Prénom
            </label>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              {prenomClient}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Solde compte
            </label>
            <div className={cn(
              'rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium',
              soldeCompte < 0 ? 'text-red-600' : 'text-green-600'
            )}>
              {formatCurrency(soldeCompte)}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Coefficient appliqué
            </label>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              {coefficientApplique.toFixed(4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};