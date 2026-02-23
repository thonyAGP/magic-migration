import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useSessionTimestampStore } from '@/stores/sessionTimestampStore';
import { useAuthStore } from '@/stores';

export function SessionTimestampPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const sessionDate = useSessionTimestampStore((s) => s.sessionDate);
  const sessionTime = useSessionTimestampStore((s) => s.sessionTime);
  const timestamp = useSessionTimestampStore((s) => s.timestamp);
  const isLoading = useSessionTimestampStore((s) => s.isLoading);
  const error = useSessionTimestampStore((s) => s.error);
  const getSessionTimestamp = useSessionTimestampStore((s) => s.getSessionTimestamp);
  const resetState = useSessionTimestampStore((s) => s.resetState);

  useEffect(() => {
    getSessionTimestamp();
    return () => resetState();
  }, [getSessionTimestamp, resetState]);

  const formatDate = (date: Date | null) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const handleBack = () => {
    navigate('/caisse/menu');
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Timestamp Session</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Horodatage de la session en cours
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && sessionDate && (
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-on-surface-muted uppercase tracking-wide">
                  Date Session
                </label>
                <p className="mt-1 text-lg font-medium">{formatDate(sessionDate)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-on-surface-muted uppercase tracking-wide">
                  Heure Session
                </label>
                <p className="mt-1 text-lg font-medium">{sessionTime || '—'}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <label className="text-xs font-medium text-on-surface-muted uppercase tracking-wide">
                Timestamp
              </label>
              <p className="mt-1 text-2xl font-mono font-semibold text-primary">
                {timestamp || '—'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !sessionDate && !error && (
          <div className="text-center py-12 text-on-surface-muted">
            Aucune session active
          </div>
        )}

        <div className="flex justify-start">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
          >
            Retour au menu
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}

export default SessionTimestampPage;
