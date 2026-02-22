import type { SessionDetail } from '@/types/sessionHistory';
import { cn } from '@/lib/utils';

interface SessionSummaryPanelProps {
  sessionDetails: SessionDetail | null;
  className?: string;
}

export const SessionSummaryPanel = ({
  sessionDetails,
  className,
}: SessionSummaryPanelProps) => {
  if (!sessionDetails) {
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-white p-6', className)}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Résumé de session</h3>
        <p className="text-sm text-gray-500">Aucune session sélectionnée</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6', className)}>
      <h3 className="mb-6 text-lg font-semibold text-gray-900">Résumé de session</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Session ID
            </label>
            <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
              {sessionDetails.sessionId}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Montant total
            </label>
            <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
              {formatCurrency(sessionDetails.totalAmount)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-blue-900">
              {sessionDetails.hasDetails ? 'Détails disponibles' : 'Pas de détails'}
            </p>
            <p className="text-xs text-blue-700">
              {sessionDetails.isEndOfHistory
                ? 'Fin de l\'historique atteinte'
                : 'Plus de données disponibles'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};