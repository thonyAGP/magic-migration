import type { RecapMOP } from '@/types/saisieContenuCaisse';
import { cn } from '@/lib/utils';

interface EcartsPanelProps {
  recapMOP: RecapMOP[];
  className?: string;
}

export const EcartsPanel = ({ recapMOP, className }: EcartsPanelProps) => {
  const hasEcarts = recapMOP.some((r) => r.ecart !== 0);

  if (!hasEcarts) {
    return null;
  }

  const ecartsData = recapMOP.filter((r) => r.ecart !== 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900">
          Écarts détectés
        </h3>
        <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 border border-amber-200">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Anomalies détectées</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Type paiement
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Montant compté
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Montant versé
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Écart
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {ecartsData.map((recap) => {
              const ecartNeg = recap.ecart < 0;
              return (
                <tr
                  key={recap.moyenPaiement}
                  className="hover:bg-amber-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {recap.moyenPaiementLibelle}
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                    {recap.compte.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                    {recap.attendu.toFixed(2)}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3 text-sm text-right tabular-nums font-semibold',
                      ecartNeg ? 'text-red-700' : 'text-orange-700',
                    )}
                  >
                    {recap.ecart.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
        <div className="flex gap-2">
          <svg
            className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900">
              Vérification requise
            </h4>
            <p className="mt-1 text-sm text-amber-800">
              Des écarts ont été détectés entre les montants comptés et les
              montants attendus. Veuillez vérifier votre comptage avant de
              continuer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};