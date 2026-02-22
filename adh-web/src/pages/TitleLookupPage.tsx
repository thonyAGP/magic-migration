import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useTitleLookupStore } from '@/stores/titleLookupStore';
import { useAuthStore } from '@/stores';

export function TitleLookupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const titles = useTitleLookupStore((s) => s.titles);
  const isLoading = useTitleLookupStore((s) => s.isLoading);
  const error = useTitleLookupStore((s) => s.error);
  const loadTitles = useTitleLookupStore((s) => s.loadTitles);
  const reset = useTitleLookupStore((s) => s.reset);

  useEffect(() => {
    loadTitles();
    return () => reset();
  }, [loadTitles, reset]);

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Service de recherche de titres</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Service backend - Pas d'interface utilisateur
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">Service actif</span>
            </div>

            <p className="text-on-surface-muted text-sm">
              Ce service fournit la recherche de titres (M., Mme, Dr, etc.) pour les autres
              composants de l'application. Il n'a pas d'interface utilisateur directe.
            </p>

            {isLoading ? (
              <div className="text-on-surface-muted text-sm">Chargement des titres...</div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium">Titres chargés: {titles.length}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-muted">
                  {titles.slice(0, 8).map((title) => (
                    <div key={`${title.code}-${title.type}`} className="flex gap-2">
                      <span className="font-mono">{title.code}</span>
                      <span>→</span>
                      <span>{title.label}</span>
                      <span className="text-on-surface-muted">({title.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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