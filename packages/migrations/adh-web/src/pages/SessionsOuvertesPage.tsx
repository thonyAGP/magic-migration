import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useSessionsOuvertesStore } from '@/stores/sessionsOuvertesStore';
import { useAuthStore } from '@/stores';
import type { SessionOuverte } from '@/types/sessionsOuvertes';
import { cn } from '@/lib/utils';

export const SessionsOuvertesPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const sessions = useSessionsOuvertesStore((s) => s.sessions);
  const isLoading = useSessionsOuvertesStore((s) => s.isLoading);
  const error = useSessionsOuvertesStore((s) => s.error);
  const selectedSession = useSessionsOuvertesStore((s) => s.selectedSession);
  const filtreSociete = useSessionsOuvertesStore((s) => s.filtreSociete);
  const filtreOperateur = useSessionsOuvertesStore((s) => s.filtreOperateur);
  const chargerSessionsOuvertes = useSessionsOuvertesStore((s) => s.chargerSessionsOuvertes);
  const selectionnerSession = useSessionsOuvertesStore((s) => s.selectionnerSession);
  const _verifierExistenceSession = useSessionsOuvertesStore((s) => s.verifierExistenceSession);
  const rafraichir = useSessionsOuvertesStore((s) => s.rafraichir);
  const appliquerFiltres = useSessionsOuvertesStore((s) => s.appliquerFiltres);
  const reset = useSessionsOuvertesStore((s) => s.reset);

  useEffect(() => {
    chargerSessionsOuvertes();
    return () => reset();
  }, [chargerSessionsOuvertes, reset]);

  const handleSelectSession = useCallback(
    (session: SessionOuverte) => {
      selectionnerSession(session);
    },
    [selectionnerSession],
  );

  const handleRefresh = useCallback(() => {
    rafraichir();
  }, [rafraichir]);

  const handleFilterChange = useCallback(
    (societe: string, operateur: string) => {
      appliquerFiltres(societe, operateur);
    },
    [appliquerFiltres],
  );

  const handleBack = () => {
    navigate('/caisse/menu');
  };

  const groupedSessions = sessions.reduce((acc, session) => {
    const key = `${session.societe}-${session.operateur}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(session);
    return acc;
  }, {} as Record<string, SessionOuverte[]>);

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sessions ouvertes</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {sessions.length} session{sessions.length > 1 ? 's' : ''} active{sessions.length > 1 ? 's' : ''}
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

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Société</label>
              <input
                type="text"
                value={filtreSociete}
                onChange={(e) => handleFilterChange(e.target.value, filtreOperateur)}
                placeholder="Filtrer par société"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Opérateur</label>
              <input
                type="text"
                value={filtreOperateur}
                onChange={(e) => handleFilterChange(filtreSociete, e.target.value)}
                placeholder="Filtrer par opérateur"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-on-surface-muted">Aucune session ouverte</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSessions).map(([key, sessionGroup]) => {
              const [societe, operateur] = key.split('-');
              return (
                <div key={key} className="bg-surface border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface-hover px-4 py-3 border-b border-border">
                    <h3 className="font-semibold">
                      {societe} - {operateur}
                    </h3>
                    <p className="text-xs text-on-surface-muted mt-1">
                      {sessionGroup.length} session{sessionGroup.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {sessionGroup.map((session) => (
                      <button
                        key={session.numeroSession}
                        onClick={() => handleSelectSession(session)}
                        className={cn(
                          'w-full px-4 py-3 text-left hover:bg-surface-hover transition-colors',
                          selectedSession?.numeroSession === session.numeroSession &&
                            'bg-primary-light',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">#{session.numeroSession}</span>
                              <span className="text-sm text-on-surface-muted">
                                {session.compte}
                                {session.filiation > 0 && ` (F${session.filiation})`}
                              </span>
                              <span className="text-sm font-medium">{session.deviseLocale}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-on-surface-muted">
                              <span>
                                {session.dateOuverture.toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </span>
                              <span>{session.heureOuverture}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              {session.montantCoffre.toLocaleString('fr-FR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-xs text-on-surface-muted">Coffre</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
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
};

export default SessionsOuvertesPage;
