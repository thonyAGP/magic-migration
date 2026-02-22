import type { Session } from '@/types/fermetureSessions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface SessionListPanelProps {
  sessions: Session[];
  selectedSessionId: number | null;
  onSessionSelect: (sessionId: number | null) => void;
  onClosureRequest: () => void;
  isLoading: boolean;
  disabled?: boolean;
  className?: string;
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getStatusLabel = (status: Session['statut']): string => {
  const labels = {
    O: 'Ouverte',
    C: 'Fermée',
    B: 'Bloquée',
  } as const;
  return labels[status] || status;
};

const getStatusColor = (status: Session['statut']): string => {
  const colors = {
    O: 'text-green-600 bg-green-50',
    C: 'text-gray-600 bg-gray-50',
    B: 'text-red-600 bg-red-50',
  } as const;
  return colors[status] || 'text-gray-600 bg-gray-50';
};

export const SessionListPanel = ({
  sessions,
  selectedSessionId,
  onSessionSelect,
  onClosureRequest,
  isLoading,
  disabled = false,
  className,
}: SessionListPanelProps) => {
  const openSessions = sessions.filter((s) => s.statut === 'O');

  const handleRowClick = (sessionId: number) => {
    if (disabled) return;
    onSessionSelect(selectedSessionId === sessionId ? null : sessionId);
  };

  const handleClosureClick = () => {
    if (selectedSessionId === null || disabled) return;
    onClosureRequest();
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sessions ouvertes</h2>
        <Button
          onClick={handleClosureClick}
          disabled={selectedSessionId === null || disabled || isLoading}
          variant="primary"
        >
          Fermer la session
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          Chargement des sessions...
        </div>
      ) : openSessions.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          Aucune session ouverte
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <span className="sr-only">Sélection</span>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Date d'ouverture
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {openSessions.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => handleRowClick(session.id)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    selectedSessionId === session.id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-50',
                    disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSessionId === session.id}
                      onChange={() => handleRowClick(session.id)}
                      disabled={disabled}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {session.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(session.dateOuverture)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(session.statut)
                      )}
                    >
                      {getStatusLabel(session.statut)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSessionId !== null && (
        <div className="text-sm text-gray-600">
          Session sélectionnée : <span className="font-medium">#{selectedSessionId}</span>
        </div>
      )}
    </div>
  );
};