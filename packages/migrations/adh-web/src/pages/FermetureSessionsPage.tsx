import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useFermetureSessionsStore } from '@/stores/fermetureSessionsStore';
import { useAuthStore } from '@/stores';
import type { Session } from '@/types/fermetureSessions';
import { cn } from '@/lib/utils';

type Phase = 'list' | 'confirm' | 'result';

export const FermetureSessionsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const sessions = useFermetureSessionsStore((s) => s.sessions);
  const currentSession = useFermetureSessionsStore((s) => s.currentSession);
  const _unilateralBilateralTypes = useFermetureSessionsStore((s) => s.unilateralBilateralTypes);
  const isLoading = useFermetureSessionsStore((s) => s.isLoading);
  const error = useFermetureSessionsStore((s) => s.error);
  const isClosing = useFermetureSessionsStore((s) => s.isClosing);
  const loadSessions = useFermetureSessionsStore((s) => s.loadSessions);
  const loadUnilateralBilateralTypes = useFermetureSessionsStore((s) => s.loadUnilateralBilateralTypes);
  const fermerSession = useFermetureSessionsStore((s) => s.fermerSession);
  const generateClosureCode = useFermetureSessionsStore((s) => s.generateClosureCode);
  const validateSessionClosure = useFermetureSessionsStore((s) => s.validateSessionClosure);
  const setCurrentSession = useFermetureSessionsStore((s) => s.setCurrentSession);
  const clearError = useFermetureSessionsStore((s) => s.clearError);
  const reset = useFermetureSessionsStore((s) => s.reset);

  const [phase, setPhase] = useState<Phase>('list');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [closureCode, setClosureCode] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [closureSuccess, setClosureSuccess] = useState(false);

  useEffect(() => {
    loadSessions({ statut: 'O' });
    loadUnilateralBilateralTypes();
    return () => reset();
  }, [loadSessions, loadUnilateralBilateralTypes, reset]);

  const handleSessionSelect = useCallback((session: Session) => {
    setSelectedSessionId(session.id);
    setCurrentSession(session);
  }, [setCurrentSession]);

  const handleInitiateClosure = useCallback(async () => {
    if (!selectedSessionId) return;

    const isValid = await validateSessionClosure(selectedSessionId);
    if (!isValid) {
      setValidationErrors(['La session ne peut pas être fermée. Vérifiez les conditions.']);
      return;
    }

    const code = generateClosureCode(selectedSessionId);
    setClosureCode(code);
    setValidationErrors([]);
    setPhase('confirm');
  }, [selectedSessionId, validateSessionClosure, generateClosureCode]);

  const handleConfirmClosure = useCallback(async () => {
    if (!selectedSessionId) return;

    try {
      await fermerSession(selectedSessionId);
      setClosureSuccess(true);
      setPhase('result');
    } catch {
      setClosureSuccess(false);
      setPhase('result');
    }
  }, [selectedSessionId, fermerSession]);

  const handleCancelClosure = useCallback(() => {
    setPhase('list');
    setClosureCode('');
    setValidationErrors([]);
    clearError();
  }, [clearError]);

  const handleRestart = useCallback(() => {
    setPhase('list');
    setSelectedSessionId(null);
    setCurrentSession(null);
    setClosureCode('');
    setValidationErrors([]);
    setClosureSuccess(false);
    clearError();
    loadSessions({ statut: 'O' });
  }, [setCurrentSession, clearError, loadSessions]);

  const handleBack = () => {
    navigate('/caisse/menu');
  };

  const openSessions = sessions.filter((s) => s.statut === 'O');

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Fermeture de sessions</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {phase === 'list' && 'Sélectionner une session à fermer'}
              {phase === 'confirm' && 'Confirmer la fermeture de session'}
              {phase === 'result' && 'Résultat de la fermeture'}
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

        {validationErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {phase === 'list' && (
          <>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-on-surface-muted">
                  Chargement des sessions...
                </div>
              ) : openSessions.length === 0 ? (
                <div className="p-8 text-center text-on-surface-muted">
                  Aucune session ouverte
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-surface-hover border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Sélection</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">ID Session</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date ouverture</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {openSessions.map((session) => (
                      <tr
                        key={session.id}
                        className={cn(
                          'hover:bg-surface-hover transition-colors cursor-pointer',
                          selectedSessionId === session.id && 'bg-primary/10',
                        )}
                        onClick={() => handleSessionSelect(session)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="session"
                            checked={selectedSessionId === session.id}
                            onChange={() => handleSessionSelect(session)}
                            className="w-4 h-4 text-primary"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">{session.id}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(session.dateOuverture).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ouverte
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="secondary" onClick={handleBack}>
                Retour au menu
              </Button>
              <Button
                onClick={handleInitiateClosure}
                disabled={!selectedSessionId || isLoading}
              >
                Fermer la session sélectionnée
              </Button>
            </div>
          </>
        )}

        {phase === 'confirm' && (
          <>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium">Confirmation de fermeture</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Session ID:</span> {currentSession?.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Date ouverture:</span>{' '}
                  {currentSession?.dateOuverture &&
                    new Date(currentSession.dateOuverture).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-2">Code de fermeture généré:</p>
                  <div className="bg-surface-hover px-4 py-3 rounded-md font-mono text-lg tracking-wider">
                    {closureCode}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="secondary" onClick={handleCancelClosure} disabled={isClosing}>
                Annuler
              </Button>
              <Button onClick={handleConfirmClosure} disabled={isClosing}>
                {isClosing ? 'Fermeture en cours...' : 'Confirmer la fermeture'}
              </Button>
            </div>
          </>
        )}

        {phase === 'result' && (
          <>
            <div
              className={cn(
                'border rounded-lg p-6 space-y-4',
                closureSuccess
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200',
              )}
            >
              <h3 className="text-lg font-medium">
                {closureSuccess ? 'Fermeture réussie' : 'Échec de la fermeture'}
              </h3>
              {closureSuccess ? (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Session ID:</span> {currentSession?.id}
                  </p>
                  <p>
                    <span className="font-medium">Code de fermeture:</span> {closureCode}
                  </p>
                  <p>
                    <span className="font-medium">Date de fermeture:</span>{' '}
                    {new Date().toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-700">
                  Une erreur est survenue lors de la fermeture de la session. Veuillez réessayer.
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="secondary" onClick={handleBack}>
                Retour au menu
              </Button>
              <div className="flex gap-3">
                {closureSuccess && (
                  <Button variant="secondary" onClick={() => window.print()}>
                    Imprimer le rapport
                  </Button>
                )}
                <Button onClick={handleRestart}>Fermer une autre session</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  );
};

export default FermetureSessionsPage;
