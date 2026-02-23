import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FusionGarantieChoiceProps, GarantieItem } from './types';

function GarantieRow({
  garantie,
  checked,
  onToggle,
}: {
  garantie: GarantieItem;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 rounded-md border p-3 text-sm cursor-pointer transition-colors',
        checked ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-surface-dim',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(garantie.id)}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <Shield className="h-4 w-4 shrink-0 text-on-surface-muted" />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{garantie.article}</div>
        <div className="text-xs text-on-surface-muted truncate">{garantie.description}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-medium">{garantie.montant.toFixed(2)} EUR</div>
        <div className="text-xs text-on-surface-muted">{garantie.dateDepot}</div>
      </div>
    </label>
  );
}

export function FusionGarantieChoice({
  open,
  onClose,
  garantiesSource,
  garantiesDestination,
  onValidate,
}: FusionGarantieChoiceProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    // By default all destination garanties are selected
    return new Set(garantiesDestination.map((g) => g.id));
  });

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allGaranties = useMemo(
    () => [...garantiesSource, ...garantiesDestination],
    [garantiesSource, garantiesDestination],
  );

  const totalSelected = useMemo(
    () =>
      allGaranties
        .filter((g) => selectedIds.has(g.id))
        .reduce((sum, g) => sum + g.montant, 0),
    [allGaranties, selectedIds],
  );

  const handleValidate = () => {
    onValidate(Array.from(selectedIds));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choix des garanties a conserver</DialogTitle>
          <DialogDescription>
            Les deux comptes possedent des garanties. Selectionnez celles a conserver apres la fusion.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Source garanties */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-on-surface">
              Compte source ({garantiesSource.length})
            </h4>
            {garantiesSource.length === 0 ? (
              <p className="text-sm text-on-surface-muted py-2">Aucune garantie</p>
            ) : (
              <div className="space-y-2">
                {garantiesSource.map((g) => (
                  <GarantieRow
                    key={g.id}
                    garantie={g}
                    checked={selectedIds.has(g.id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Destination garanties */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-on-surface">
              Compte destination ({garantiesDestination.length})
            </h4>
            {garantiesDestination.length === 0 ? (
              <p className="text-sm text-on-surface-muted py-2">Aucune garantie</p>
            ) : (
              <div className="space-y-2">
                {garantiesDestination.map((g) => (
                  <GarantieRow
                    key={g.id}
                    garantie={g}
                    checked={selectedIds.has(g.id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-md bg-surface-dim px-4 py-2 text-sm">
          <span className="text-on-surface-muted">
            Total garanties selectionnees ({selectedIds.size})
          </span>
          <span className="font-bold">{totalSelected.toFixed(2)} EUR</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleValidate}>Valider selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
