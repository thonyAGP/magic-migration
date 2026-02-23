import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Dialog } from '@/components/ui';
import { useSessionConcurrencyStore } from '@/stores/sessionConcurrencyStore';
import { useAuthStore } from '@/stores';

export function SessionConcurrencyPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const activeSessions = useSessionConcurrencyStore((s) => s.activeSessions);
  const isLoading = useSessionConcurrencyStore((s) => s.isLoading);
  const error = useSessionConcurrencyStore((s) => s.error);
  const conflictDetected = useSessionConcurrencyStore((s) => s.conflictDetected);
  const conflictingSession = useSessionConcurrencyStore((s) => s.conflictingSession);
  const forceOpenSession = useSessionConcurrencyStore((s) => s.forceOpenSession);
  const setError = useSessionConcurrencyStore((s) => s.setError);
  const clearConflict = useSessionConcurrencyStore((s) => s.clearConflict);
  const reset = useSessionConcurrencyStore((s) => s.reset);

  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [forceReason, setForceReason] = useState('');

  useEffect(() => {
    setShowConflictDialog(conflictDetected && !!conflictingSession);
  }, [conflictDetected, conflictingSession]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleCloseConflict = useCallback(() => {
    setShowConflictDialog(false);
    clearConflict();
    setForceReason('');
    navigate('/caisse/menu');
  }, [clearConflict, navigate]);

  const handleForceOpen = useCallback(async () => {
    if (!conflictingSession || !forceReason.trim()) {
      setError('Veuillez saisir une raison pour forcer l\'ouverture');
      return;
    }

    try {
      await forceOpenSession(
        conflictingSession.societe,
        conflictingSession.compte,
        conflictingSession.filiation,
        'CURRENT_TERMINAL',
        forceReason,
      );
      setShowConflictDialog(false);
      clearConflict();
      setForceReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du forçage d\'ouverture');
    }
  }, [conflictingSession, forceReason, forceOpenSession, setError, clearConflict]);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Contrôle de concurrence</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Gestion des sessions actives
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
            <div className="text-on-surface-muted">Vérification en cours...</div>
          </div>
        )}

        {!isLoading && activeSessions.length === 0 && !conflictDetected && (
          <div className="text-center py-12 text-on-surface-muted">
            Aucune session active détectée
          </div>
        )}

        {!isLoading && activeSessions.length > 0 && (
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                    Société
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                    Compte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                    Terminal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                    Ouvert le
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                    Coffre
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeSessions.map((session, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover">
                    <td className="px-4 py-3 text-sm">{session.societe}</td>
                    <td className="px-4 py-3 text-sm">
                      {session.compte} / {session.filiation}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {session.terminalId}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatTimestamp(session.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {session.codeCalcul || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {session.coffreEnCoursComptage ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium">
                          En comptage
                        </span>
                      ) : (
                        <span className="text-on-surface-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog
          open={showConflictDialog}
          onClose={handleCloseConflict}
          title="Session déjà ouverte"
          maxWidth="md"
        >
          <div className="space-y-4">
            {conflictingSession && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-900 font-medium mb-2">
                    Une session est déjà ouverte pour ce compte
                  </p>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-on-surface-muted">Société:</dt>
                    <dd className="font-medium">{conflictingSession.societe}</dd>
                    <dt className="text-on-surface-muted">Compte:</dt>
                    <dd className="font-medium">
                      {conflictingSession.compte} / {conflictingSession.filiation}
                    </dd>
                    <dt className="text-on-surface-muted">Terminal:</dt>
                    <dd className="font-medium">{conflictingSession.terminalId}</dd>
                    <dt className="text-on-surface-muted">Ouvert le:</dt>
                    <dd className="font-medium">
                      {formatTimestamp(conflictingSession.timestamp)}
                    </dd>
                    {conflictingSession.codeCalcul && (
                      <>
                        <dt className="text-on-surface-muted">Code calcul:</dt>
                        <dd className="font-medium">{conflictingSession.codeCalcul}</dd>
                      </>
                    )}
                  </dl>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="force-reason"
                    className="block text-sm font-medium text-on-surface"
                  >
                    Raison du forçage (obligatoire):
                  </label>
                  <textarea
                    id="force-reason"
                    value={forceReason}
                    onChange={(e) => setForceReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ex: Session bloquée suite à coupure réseau..."
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={handleCloseConflict}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Annuler
              </button>
              <button
                onClick={handleForceOpen}
                disabled={!forceReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Forcer l'ouverture
              </button>
            </div>
          </div>
        </Dialog>

        <div className="flex justify-start">
          <button
            onClick={() => navigate('/caisse/menu')}
            className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
          >
            Retour au menu
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}

export default SessionConcurrencyPage;
