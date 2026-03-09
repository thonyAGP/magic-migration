import { useEffect, useCallback } from "react"
import { ScreenLayout } from "@/components/layout"
import { Button, Dialog } from "@/components/ui"
import { useSessionConcurrencyStore } from "@/stores/sessionConcurrencyStore"
import { cn } from "@/lib/utils"

export const SessionConcurrencyPage = () => {
  const {
    activeSessions,
    isLoading,
    error,
    conflictDetected,
    conflictingSession,
    forceOpenSession,
    reset
  } = useSessionConcurrencyStore()

  const {
    sessions,
    loadingSessions,
    errorSessions,
    conflictWarning,
    warningMessage,
    sessionDetails,
    terminalInfo,
    timestampInfo,
    dialogOpen
  } = {
    sessions: activeSessions,
    loadingSessions: isLoading,
    errorSessions: error,
    conflictWarning: conflictDetected,
    warningMessage: "Une session est déjà active pour ce compte",
    sessionDetails: conflictingSession,
    terminalInfo: conflictingSession?.terminalId || "",
    timestampInfo: conflictingSession?.timestamp || new Date(),
    dialogOpen: conflictDetected
  }

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const handleCancel = useCallback(() => {
    reset()
  }, [reset])

  const handleForceOpen = useCallback(async () => {
    if (!conflictingSession) return

    try {
      await forceOpenSession({
        societe: conflictingSession.societe,
        compte: conflictingSession.compte,
        filiation: conflictingSession.filiation,
        terminalId: conflictingSession.terminalId,
        reason: "Force open by user"
      })
      reset()
    } catch (err) {
      console.error("Failed to force open session:", err)
    }
  }, [conflictingSession, forceOpenSession, reset])

  const formatTimestamp = useCallback((timestamp: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(timestamp)
  }, [])

  if (loadingSessions && !conflictWarning) {
    return (
      <ScreenLayout className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Vérification de la concurrence...</div>
        </div>
      </ScreenLayout>
    )
  }

  if (errorSessions) {
    return (
      <ScreenLayout className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Erreur lors de la vérification</div>
          <div className="text-gray-600 mb-4">{errorSessions}</div>
          <Button onClick={() => reset()}>Réessayer</Button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion de la Concurrence</h1>
          <p className="text-gray-600">Contrôle des sessions actives et résolution des conflits</p>
        </div>

        {sessions.length === 0 && !conflictWarning ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Aucune session active détectée</div>
            <div className="text-gray-400 mt-2">Le système fonctionne normalement</div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessions Actives</h2>
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div
                    key={`${session.societe}-${session.compte}-${session.filiation}-${index}`}
                    className="border border-gray-200 rounded-md p-4"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Société</div>
                        <div className="font-medium">{session.societe}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Compte</div>
                        <div className="font-medium">{session.compte}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Terminal</div>
                        <div className="font-medium">{session.terminalId}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Statut</div>
                        <div className={cn(
                          "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                          session.coffreEnCoursComptage 
                            ? "bg-red-100 text-red-800" 
                            : "bg-green-100 text-green-800"
                        )}>
                          {session.coffreEnCoursComptage ? "En cours" : "Inactive"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Dernière activité: {formatTimestamp(session.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={() => {}}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Conflit de Session Détecté</h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">{warningMessage}</p>
                
                {sessionDetails && (
                  <div className="bg-gray-50 rounded-md p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Terminal:</span>
                      <span className="text-sm font-medium">{terminalInfo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Société:</span>
                      <span className="text-sm font-medium">{sessionDetails.societe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Compte:</span>
                      <span className="text-sm font-medium">{sessionDetails.compte}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Heure:</span>
                      <span className="text-sm font-medium">{formatTimestamp(timestampInfo)}</span>
                    </div>
                    {sessionDetails.codeCalcul && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Code:</span>
                        <span className="text-sm font-medium">{sessionDetails.codeCalcul}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loadingSessions}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleForceOpen}
                  disabled={loadingSessions}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {loadingSessions ? "..." : "Forcer l'Ouverture"}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  )
}