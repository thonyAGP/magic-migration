import type { SoldeOuverture } from '@/types/soldeOuverture';
import { cn } from '@/lib/utils';

interface SoldeDetailsPanelProps {
  solde: SoldeOuverture;
  className?: string;
}

const formatEuro = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const SoldeDetailsPanel = ({ solde, className }: SoldeDetailsPanelProps) => {
  const details = [
    { label: 'Solde ouverture monnaie', value: solde.soldeOuvertureMonnaie },
    { label: 'Solde ouverture produits', value: solde.soldeOuvertureProduits },
    { label: 'Solde ouverture cartes', value: solde.soldeOuvertureCartes },
    { label: 'Solde ouverture chèques', value: solde.soldeOuvertureCheques },
    { label: 'Solde ouverture ordre de dépôt', value: solde.soldeOuvertureOd },
  ];

  const total = details.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Détail des soldes</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
          >
            <span className="text-sm text-gray-700">{detail.label}</span>
            <span
              className={cn(
                'text-sm font-medium tabular-nums',
                detail.value < 0 ? 'text-red-600' : 'text-gray-900',
              )}
            >
              {formatEuro(detail.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-gray-300 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span
            className={cn(
              'text-base font-bold tabular-nums',
              total < 0 ? 'text-red-600' : 'text-gray-900',
            )}
          >
            {formatEuro(total)}
          </span>
        </div>
      </div>
    </div>
  );
};