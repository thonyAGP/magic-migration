import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useSessionDetailStore } from '@/stores/sessionDetailStore';
import { useAuthStore } from '@/stores';

export function SessionDetailPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const isLoading = useSessionDetailStore((s) => s.isLoading);
  const error = useSessionDetailStore((s) => s.error);
  const reset = useSessionDetailStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleBack = () => {
    navigate('/caisse/menu');
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Détail session</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Programme backend de journalisation (aucune interface visible)
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

        <div className="bg-surface border border-border rounded-md p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">Programme de journalisation</h3>
              <p className="text-on-surface-muted text-sm">
                ADH IDE 125 - DETAIL_SESSION
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-on-surface-muted">
                Ce programme est appelé automatiquement lors des opérations d'ouverture (IDE 122, 143) et de fermeture (IDE 131, 144) de session caisse.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-on-surface-muted">
                Il crée un audit trail complet de toutes les actions effectuées sur les sessions (entrées monnaie, versements, écarts, corrections).
              </p>
            </div>

            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-on-surface-muted">
                Les données sont directement enregistrées dans les tables <code className="bg-surface-hover px-1 py-0.5 rounded text-xs">session_detail</code> et <code className="bg-surface-hover px-1 py-0.5 rounded text-xs">session_detail_devises</code>.
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-muted">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Traitement en cours...</span>
            </div>
          )}
        </div>

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