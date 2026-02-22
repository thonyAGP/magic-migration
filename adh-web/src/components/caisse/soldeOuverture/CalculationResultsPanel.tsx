import type { SoldeCalculationResult, CoherenceValidationResult } from '@/types/soldeOuverture';
import { cn } from '@/lib/utils';

interface CalculationResultsPanelProps {
  result: SoldeCalculationResult | null;
  validation: CoherenceValidationResult | null;
  isCalculating?: boolean;
  className?: string;
}

interface Alert {
  type: 'MISSING_RATE' | 'INVALID_RATE' | 'NEGATIVE_AMOUNT' | 'ZERO_AMOUNT';
  devise: string;
  message: string;
}

const detectAnomalies = (result: SoldeCalculationResult | null): Alert[] => {
  if (!result) return [];
  
  const alerts: Alert[] = [];
  
  result.details.forEach((d) => {
    if (d.tauxChange <= 0) {
      alerts.push({
        type: 'INVALID_RATE',
        devise: d.devise,
        message: `Taux de change invalide pour ${d.devise}`,
      });
    }
    if (d.montant < 0) {
      alerts.push({
        type: 'NEGATIVE_AMOUNT',
        devise: d.devise,
        message: `Montant négatif pour ${d.devise}`,
      });
    }
    if (d.montant === 0) {
      alerts.push({
        type: 'ZERO_AMOUNT',
        devise: d.devise,
        message: `Montant nul pour ${d.devise}`,
      });
    }
  });
  
  return alerts;
};

export const CalculationResultsPanel = ({
  result,
  validation,
  isCalculating = false,
  className,
}: CalculationResultsPanelProps) => {
  const alerts = detectAnomalies(result);

  if (isCalculating) {
    return (
      <div className={cn('rounded-lg border bg-white p-6', className)}>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <span className="ml-3 text-gray-600">Calcul en cours...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={cn('rounded-lg border bg-gray-50 p-6', className)}>
        <p className="text-center text-gray-500">
          Aucun calcul effectué. Cliquez sur "Calculer" pour démarrer.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-white', className)}>
      <div className="border-b bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Résultats du calcul
        </h3>
      </div>

      <div className="p-6 space-y-6">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-sm font-medium text-blue-900">
            Total consolidé EUR
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-900">
            {result.totalEur.toFixed(2)} €
          </div>
        </div>

        {validation && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Indicateurs de cohérence
            </div>
            <div
              className={cn(
                'rounded-lg border p-4',
                validation.coherent
                  ? 'border-green-200 bg-green-50'
                  : 'border-orange-200 bg-orange-50',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-sm font-medium',
                    validation.coherent ? 'text-green-900' : 'text-orange-900',
                  )}
                >
                  {validation.coherent ? '✓ Cohérent' : '⚠ Écart détecté'}
                </span>
                {validation.ecart !== null && (
                  <span
                    className={cn(
                      'text-sm',
                      validation.coherent ? 'text-green-700' : 'text-orange-700',
                    )}
                  >
                    Écart: {validation.ecart.toFixed(2)} €
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              Alertes d'anomalie
            </div>
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <span className="text-red-600">⚠</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-900">
                      {alert.devise}
                    </div>
                    <div className="text-sm text-red-700">{alert.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Liste détaillée des conversions par devise
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Devise
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">
                    Montant
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">
                    Taux de change
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">
                    Montant EUR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.details.map((detail, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {detail.devise}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {detail.montant.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      {detail.tauxChange.toFixed(4)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">
                      {detail.montantEur.toFixed(2)} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};