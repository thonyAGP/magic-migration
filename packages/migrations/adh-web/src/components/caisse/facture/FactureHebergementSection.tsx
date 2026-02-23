import { useCallback, useEffect, useMemo } from 'react';
import { Input, Label, Checkbox } from '@/components/ui';
import { Building2 } from 'lucide-react';
import type { HebergementData } from '@/types/hebergement';
import { HEBERGEMENT_TYPES, PENSION_TYPES } from '@/types/hebergement';

export interface FactureHebergementSectionProps {
  data: HebergementData | null;
  onChange: (data: HebergementData) => void;
  onToggle: (enabled: boolean) => void;
  enabled: boolean;
}

const DEFAULT_DATA: HebergementData = {
  numeroChambre: '',
  typeHebergement: 'chambre',
  dateArrivee: '',
  dateDepart: '',
  nbNuits: 0,
  prixNuit: 0,
  totalHebergement: 0,
};

function computeNuits(dateArrivee: string, dateDepart: string): number {
  if (!dateArrivee || !dateDepart) return 0;
  const start = new Date(dateArrivee);
  const end = new Date(dateDepart);
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function FactureHebergementSection({
  data,
  onChange,
  onToggle,
  enabled,
}: FactureHebergementSectionProps) {
  const current = data ?? DEFAULT_DATA;

  const nbNuits = useMemo(
    () => computeNuits(current.dateArrivee, current.dateDepart),
    [current.dateArrivee, current.dateDepart],
  );

  const totalHebergement = useMemo(
    () => Math.round(nbNuits * current.prixNuit * 100) / 100,
    [nbNuits, current.prixNuit],
  );

  // Auto-update computed fields
  useEffect(() => {
    if (!enabled) return;
    if (nbNuits !== current.nbNuits || totalHebergement !== current.totalHebergement) {
      onChange({ ...current, nbNuits, totalHebergement });
    }
  }, [enabled, nbNuits, totalHebergement, current, onChange]);

  const handleField = useCallback(
    (field: keyof HebergementData, value: string | number) => {
      onChange({ ...current, [field]: value, nbNuits, totalHebergement });
    },
    [current, onChange, nbNuits, totalHebergement],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="hebergement-toggle"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <Label htmlFor="hebergement-toggle" className="flex items-center gap-1.5 text-sm font-medium cursor-pointer">
          <Building2 className="h-4 w-4 text-primary" />
          Inclure hebergement
        </Label>
      </div>

      {enabled && (
        <div className="border-l-2 border-primary pl-4 space-y-3">
          {/* Row 1: Chambre + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Numero chambre</Label>
              <Input
                value={current.numeroChambre}
                onChange={(e) => handleField('numeroChambre', e.target.value)}
                placeholder="Ex: 301"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Type</Label>
              <select
                value={current.typeHebergement}
                onChange={(e) => handleField('typeHebergement', e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
              >
                {HEBERGEMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Date arrivee</Label>
              <Input
                type="date"
                value={current.dateArrivee}
                onChange={(e) => handleField('dateArrivee', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Date depart</Label>
              <Input
                type="date"
                value={current.dateDepart}
                onChange={(e) => handleField('dateDepart', e.target.value)}
              />
            </div>
          </div>

          {/* Row 3: Nuits + Prix/nuit + Pension */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Nb nuits</Label>
              <Input
                type="number"
                value={nbNuits}
                readOnly
                className="bg-surface-dim"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Prix / nuit</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={current.prixNuit || ''}
                onChange={(e) => handleField('prixNuit', Number(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Pension</Label>
              <select
                value={current.pensionType ?? ''}
                onChange={(e) => handleField('pensionType', e.target.value || '')}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
              >
                <option value="">-- Aucune --</option>
                {PENSION_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Total hebergement */}
          <div className="flex justify-between items-center rounded-md bg-primary/10 px-3 py-2">
            <span className="text-sm font-medium text-primary">Total hebergement</span>
            <span className="text-sm font-bold text-primary">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalHebergement)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
