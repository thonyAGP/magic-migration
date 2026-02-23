import type { RecapMOP, ValidationResult } from '@/types/saisieContenuCaisse';
import { cn } from '@/lib/utils';

interface RecapitulatifPanelProps {
  recapMOP: RecapMOP[];
  validationResult: ValidationResult | null;
  validationError: string | null;
  isValidating: boolean;
  className?: string;
}

export const RecapitulatifPanel = ({
  recapMOP,
  validationResult,
  validationError,
  isValidating,
  className,
}: RecapitulatifPanelProps) => {
  const formatMontant = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getEcartStyle = (ecart: number): string => {
    if (ecart === 0) return 'text-green-600';
    return Math.abs(ecart) > 0 ? 'text-red-600 font-semibold' : 'text-gray-900';
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Récapitulatif par Moyen de Paiement
        </h2>

        {recapMOP.length === 0 && !isValidating && (
          <p className="text-sm text-gray-500">
            Aucune donnée de récapitulatif disponible.
          </p>
        )}

        {recapMOP.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Moyen de Paiement
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Attendu
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Compté
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    Écart
                  </th>
                </tr>
              </thead>
              <tbody>
                {recapMOP.map((item, index) => (
                  <tr
                    key={`${item.moyenPaiement}-${index}`}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.moyenPaiementLibelle}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatMontant(item.attendu)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatMontant(item.compte)}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right text-sm',
                        getEcartStyle(item.ecart),
                      )}
                    >
                      {formatMontant(item.ecart)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {validationResult && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-4 text-base font-semibold text-blue-900">
            Validation du Comptage
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between">
              <span className="text-sm text-blue-800">Total Caisse:</span>
              <span className="text-sm font-semibold text-blue-900">
                {formatMontant(validationResult.totalCaisse)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-800">Total Monnaie:</span>
              <span className="text-sm font-semibold text-blue-900">
                {formatMontant(validationResult.totalMonnaie)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-800">Total Produits:</span>
              <span className="text-sm font-semibold text-blue-900">
                {formatMontant(validationResult.totalProduits)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-800">Total Cartes:</span>
              <span className="text-sm font-semibold text-blue-900">
                {formatMontant(validationResult.totalCartes)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-800">Total Chèques:</span>
              <span className="text-sm font-semibold text-blue-900">
                {formatMontant(validationResult.totalCheques)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-blue-800">Total O.D.:</span>
              <span className="text-sm font-semibold text-blue-900">
                {formatMontant(validationResult.totalOD)}
              </span>
            </div>
            <div className="col-span-2 mt-2 flex justify-between border-t border-blue-300 pt-3">
              <span className="text-sm font-semibold text-blue-800">
                Traitement requis:
              </span>
              <span
                className={cn(
                  'text-sm font-bold',
                  validationResult.shouldProcess
                    ? 'text-green-700'
                    : 'text-gray-600',
                )}
              >
                {validationResult.shouldProcess ? 'OUI' : 'NON'}
              </span>
            </div>
          </div>
        </div>
      )}

      {validationError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900">
                Erreur de validation
              </h4>
              <p className="mt-1 text-sm text-red-800">{validationError}</p>
            </div>
          </div>
        </div>
      )}

      {isValidating && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <span className="text-sm text-gray-600">
            Validation en cours...
          </span>
        </div>
      )}
    </div>
  );
};