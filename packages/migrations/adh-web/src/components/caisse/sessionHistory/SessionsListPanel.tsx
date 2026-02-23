import { useMemo } from 'react';
import type { SessionHistoryItem } from '@/types/sessionHistory';
import { cn } from '@/lib/utils';

interface SessionsListPanelProps {
  sessions: SessionHistoryItem[];
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  className?: string;
}

interface Column {
  key: keyof SessionHistoryItem;
  label: string;
  width: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: SessionHistoryItem) => React.ReactNode;
}

export const SessionsListPanel = ({
  sessions,
  selectedSessionId,
  onSessionSelect,
  className,
}: SessionsListPanelProps) => {
  const columns = useMemo<Column[]>(
    () => [
      {
        key: 'sessionId',
        label: 'Session ID',
        width: 'w-[120px]',
        align: 'left' as const,
      },
      {
        key: 'openedDate',
        label: 'Date ouverture',
        width: 'w-[140px]',
        align: 'center' as const,
        render: (value: unknown) => {
          const date = value as Date;
          return date.toLocaleDateString('fr-FR');
        },
      },
      {
        key: 'openedTime',
        label: 'Heure ouverture',
        width: 'w-[140px]',
        align: 'center' as const,
      },
      {
        key: 'closedDate',
        label: 'Date fermeture',
        width: 'w-[140px]',
        align: 'center' as const,
        render: (value: unknown) => {
          const date = value as Date | null;
          return date ? date.toLocaleDateString('fr-FR') : '-';
        },
      },
      {
        key: 'closedTime',
        label: 'Heure fermeture',
        width: 'w-[140px]',
        align: 'center' as const,
        render: (value: unknown) => {
          const time = value as string | null;
          return time ?? '-';
        },
      },
      {
        key: 'operatorId',
        label: 'Opérateur',
        width: 'w-[120px]',
        align: 'left' as const,
      },
      {
        key: 'status',
        label: 'Statut',
        width: 'w-[120px]',
        align: 'center' as const,
        render: (value: unknown) => {
          const status = value as string;
          return (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                status === 'OUVERTE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              )}
            >
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  if (sessions.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <p className="text-sm text-gray-500">Aucune session trouvée</p>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'border-b border-gray-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-700',
                    col.width,
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.align === 'left' && 'text-left'
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sessions.map((session) => (
              <tr
                key={session.sessionId}
                onClick={() => onSessionSelect(session.sessionId)}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-blue-50',
                  selectedSessionId === session.sessionId &&
                    'bg-blue-100 hover:bg-blue-100'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-sm text-gray-900',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.align === 'left' && 'text-left'
                    )}
                  >
                    {col.render
                      ? col.render(session[col.key], session)
                      : String(session[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};