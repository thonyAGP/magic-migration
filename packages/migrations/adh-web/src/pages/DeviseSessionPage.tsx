import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useDeviseSessionStore } from '@/stores/deviseSessionStore';
import { useAuthStore } from '@/stores';

export function DeviseSessionPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const isLoading = useDeviseSessionStore((s) => s.isLoading);
  const error = useDeviseSessionStore((s) => s.error);
  const reset = useDeviseSessionStore((s) => s.reset);

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
            <h2 className="text-xl font-semibold">Mise à jour Session Devise</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Service Web sans interface - Synchronisation gestion_devise_session
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-on-surface-muted">
                Programme backend actif
              </span>
            </div>

            <div className="bg-surface-variant rounded-md p-4 space-y-2">
              <p className="text-sm font-medium text-on-surface">
                Fonctionnalité
              </p>
              <p className="text-sm text-on-surface-muted">
                Ce service Web synchronise automatiquement la table
                gestion_devise_session après chaque opération significative sur
                les devises. Il est appelé par 11 programmes du système caisse.
              </p>
            </div>

            <div className="bg-surface-variant rounded-md p-4 space-y-2">
              <p className="text-sm font-medium text-on-surface">
                Programmes appelants (11)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-muted">
                <div>• Contrôle fermeture caisse WS (155)</div>
                <div>• Fermeture caisse (131)</div>
                <div>• Calcul solde initial WS (126)</div>
                <div>• Gestion caisse 142 (298)</div>
                <div>• Saisie contenu caisse (120)</div>
                <div>• Ouverture caisse (122)</div>
                <div>• Calcul solde ouverture WS (127)</div>
                <div>• Écart ouverture caisse (129)</div>
                <div>• Écart fermeture caisse (130)</div>
                <div>• Fermeture caisse 144 (299)</div>
                <div>• Remise en caisse (125)</div>
              </div>
            </div>

            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                Mise à jour en cours...
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
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

export default DeviseSessionPage;
