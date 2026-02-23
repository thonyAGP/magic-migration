import { Badge } from '@/components/ui';
import type { ForfaitTAI } from '@/types/clubmedpass';

interface ForfaitTAIPanelProps {
  passId: string;
  forfaits: ForfaitTAI[];
  onActivate: (forfaitId: string) => void;
  onDeactivate: (forfaitId: string) => void;
  isLoading?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function ForfaitTAIPanel({
  forfaits,
  onActivate,
  onDeactivate,
  isLoading = false,
}: ForfaitTAIPanelProps) {
  const totalActifs = forfaits
    .filter((f) => f.isActive)
    .reduce((sum, f) => sum + f.montant, 0);

  if (isLoading) {
    return (
      <div className="space-y-2 rounded-md border border-border p-4">
        <div className="h-5 w-40 animate-pulse rounded bg-surface-dim" />
        <div className="h-16 w-full animate-pulse rounded bg-surface-dim" />
        <div className="h-16 w-full animate-pulse rounded bg-surface-dim" />
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Forfaits TAI</h4>
        <span className="text-xs text-on-surface-muted">
          Total actifs : <span className="font-medium text-primary">{formatCurrency(totalActifs)}</span>
        </span>
      </div>

      {forfaits.length === 0 && (
        <p className="text-sm text-on-surface-muted">Aucun forfait disponible</p>
      )}

      {forfaits.map((forfait) => (
        <div
          key={forfait.id}
          className="flex items-center justify-between rounded-md border border-border px-3 py-2"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={forfait.isActive}
              onChange={() =>
                forfait.isActive
                  ? onDeactivate(forfait.id)
                  : onActivate(forfait.id)
              }
              className="h-4 w-4 rounded border-border"
              aria-label={`Activer ${forfait.libelle}`}
            />
            <div>
              <p className="text-sm font-medium">{forfait.libelle}</p>
              <p className="text-xs text-on-surface-muted">
                {forfait.dateDebut} → {forfait.dateFin}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatCurrency(forfait.montant)}</span>
            <Badge variant={forfait.isActive ? 'success' : 'secondary'}>
              {forfait.isActive ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
