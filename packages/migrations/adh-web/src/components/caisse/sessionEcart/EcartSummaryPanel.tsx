import { cn } from '@/lib/utils';

interface EcartSummaryPanelProps {
  deviseCode: string | null;
  caisseComptee: number;
  soldePrecedent: number;
  montantEcart: number;
  seuilAlerte: number;
  className?: string;
}

export const EcartSummaryPanel = ({
  deviseCode,
  caisseComptee,
  soldePrecedent,
  montantEcart,
  seuilAlerte,
  className,
}: EcartSummaryPanelProps) => {
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const exceedsThreshold = Math.abs(montantEcart) > seuilAlerte;

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6 shadow-sm', className)}>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Résumé de l'écart</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-sm font-medium text-gray-600">Devise</span>
          <span className="text-base font-semibold text-gray-900">
            {deviseCode || '—'}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-sm font-medium text-gray-600">Caisse comptée</span>
          <span className="font-mono text-base text-gray-900">
            {formatAmount(caisseComptee)}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-sm font-medium text-gray-600">Solde précédent</span>
          <span className="font-mono text-base text-gray-900">
            {formatAmount(soldePrecedent)}
          </span>
        </div>

        <div
          className={cn(
            'flex items-center justify-between rounded-md p-3 transition-colors',
            exceedsThreshold
              ? 'bg-red-50 border border-red-200'
              : 'bg-green-50 border border-green-200'
          )}
        >
          <span
            className={cn(
              'text-sm font-semibold',
              exceedsThreshold ? 'text-red-700' : 'text-green-700'
            )}
          >
            Montant écart
          </span>
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                'font-mono text-lg font-bold',
                exceedsThreshold ? 'text-red-700' : 'text-green-700'
              )}
            >
              {formatAmount(montantEcart)}
            </span>
            {exceedsThreshold && (
              <span className="text-xs text-red-600">
                Seuil dépassé ({formatAmount(seuilAlerte)})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};