import { useEffect, useState } from 'react';
import { ScreenLayout } from '@/components/layout';
import { SessionHistoryGrid, SessionCard } from '@/components/caisse/session';
import { useSessionStore } from '@/stores';
import type { SessionHistoryItem, Session } from '@/types';

export function SessionHistoriquePage() {
  const history = useSessionStore((s) => s.history);
  const isLoading = useSessionStore((s) => s.isLoadingHistory);
  const loadHistory = useSessionStore((s) => s.loadHistory);

  const [selectedSession, setSelectedSession] = useState<SessionHistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSelect = (session: SessionHistoryItem) => {
    setSelectedSession(session);
  };

  const selectedAsSession: Session | null = selectedSession
    ? {
        id: selectedSession.id,
        caisseId: selectedSession.caisseId,
        userId: selectedSession.userId,
        dateOuverture: selectedSession.dateOuverture,
        dateFermeture: selectedSession.dateFermeture,
        status: selectedSession.status,
        devises: [],
      }
    : null;

  return (
    <ScreenLayout>
      <div className="flex gap-6 h-full">
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Historique des sessions</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Consultez les sessions de caisse precedentes
            </p>
          </div>

          <SessionHistoryGrid
            sessions={history}
            onSelect={handleSelect}
            isLoading={isLoading}
          />
        </div>

        {selectedAsSession && (
          <div className="w-80 shrink-0 border-l border-border pl-6">
            <h3 className="text-lg font-medium mb-4">Details session</h3>
            <SessionCard
              session={selectedAsSession}
              ecart={selectedSession?.ecart}
            />
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
