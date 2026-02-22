import type { Title } from '@/types/titleLookup';

interface NoVisibleUIPanelProps {
  titles: Title[];
  isLoading: boolean;
  error: string | null;
}

export const NoVisibleUIPanel = ({ titles, isLoading, error }: NoVisibleUIPanelProps) => {
  return (
    <div className="bg-surface border border-border rounded-md p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="font-medium">Service actif</span>
        </div>

        <p className="text-on-surface-muted text-sm">
          Ce service fournit la recherche de titres (M., Mme, Dr, etc.) pour les autres
          composants de l'application. Il n'a pas d'interface utilisateur dédiée.
        </p>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-on-surface-muted">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Chargement des titres...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && titles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Titres disponibles:</p>
            <div className="flex flex-wrap gap-2">
              {titles.slice(0, 10).map((title) => (
                <span
                  key={title.code}
                  className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs rounded"
                >
                  {title.code} - {title.label}
                </span>
              ))}
              {titles.length > 10 && (
                <span className="px-2 py-1 text-on-surface-muted text-xs">
                  +{titles.length - 10} autres
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};