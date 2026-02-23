import { useState } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';

interface BarLimitConfigProps {
  passId: string;
  currentLimit: number;
  maxLimit: number;
  onUpdate: (newLimit: number) => void;
  isUpdating?: boolean;
}

const PRESETS = [50, 100, 200, 500];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function BarLimitConfig({
  currentLimit,
  maxLimit,
  onUpdate,
  isUpdating = false,
}: BarLimitConfigProps) {
  const [draft, setDraft] = useState(currentLimit);
  const hasChanged = draft !== currentLimit;
  const progressPct = maxLimit > 0 ? Math.round((draft / maxLimit) * 100) : 0;

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <h4 className="text-sm font-semibold">Plafond Bar</h4>

      {/* Progress bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-on-surface-muted">
          <span>Plafond actuel : {formatCurrency(currentLimit)}</span>
          <span>Max : {formatCurrency(maxLimit)}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-dim">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(progressPct, 100)}%` }}
            role="progressbar"
            aria-valuenow={draft}
            aria-valuemin={0}
            aria-valuemax={maxLimit}
          />
        </div>
      </div>

      {/* Slider */}
      <div>
        <label htmlFor="bar-limit-range" className="text-xs text-on-surface-muted">
          Modifier le plafond
        </label>
        <input
          id="bar-limit-range"
          type="range"
          min={0}
          max={maxLimit}
          step={10}
          value={draft}
          onChange={(e) => setDraft(Number(e.target.value))}
          className="mt-1 w-full"
          aria-label="Plafond bar"
        />
        <div className="mt-1 text-center text-sm font-medium">{formatCurrency(draft)}</div>
      </div>

      {/* Presets */}
      <div className="flex gap-2">
        {PRESETS.filter((p) => p <= maxLimit).map((preset) => (
          <Button
            key={preset}
            variant={draft === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDraft(preset)}
          >
            {preset}
          </Button>
        ))}
      </div>

      {/* Warning if 0 */}
      {draft === 0 && (
        <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Le bar sera bloque pour ce pass
        </div>
      )}

      {/* Apply */}
      <Button
        className="w-full"
        disabled={!hasChanged || isUpdating}
        onClick={() => onUpdate(draft)}
      >
        {isUpdating ? 'Mise a jour...' : 'Appliquer'}
      </Button>
    </div>
  );
}
