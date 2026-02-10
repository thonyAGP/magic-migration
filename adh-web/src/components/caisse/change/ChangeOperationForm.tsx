import { useState, useMemo, useCallback } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import { changeOperationSchema } from './schemas';
import { DeviseSelector } from './DeviseSelector';
import type { ChangeOperationFormProps, ChangeFormData } from './types';
import type { ChangeOperationType } from '@/types/change';

const MODES_PAIEMENT = [
  { value: 'especes', label: 'Especes' },
  { value: 'carte', label: 'Carte' },
  { value: 'cheque', label: 'Cheque' },
];

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function ChangeOperationForm({
  devises,
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: ChangeOperationFormProps) {
  const [type, setType] = useState<ChangeOperationType>('achat');
  const [deviseCode, setDeviseCode] = useState<string | null>(null);
  const [montant, setMontant] = useState<number>(0);
  const [taux, setTaux] = useState<number>(0);
  const [modePaiement, setModePaiement] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedDevise = useMemo(
    () => devises.find((d) => d.code === deviseCode),
    [devises, deviseCode],
  );

  const contreValeur = useMemo(() => montant * taux, [montant, taux]);

  const handleDeviseSelect = useCallback(
    (code: string) => {
      setDeviseCode(code);
      const devise = devises.find((d) => d.code === code);
      if (devise) setTaux(devise.tauxActuel);
    },
    [devises],
  );

  const handleSubmit = useCallback(() => {
    if (!deviseCode) {
      setErrors({ deviseCode: 'Devise requise' });
      return;
    }

    const data: ChangeFormData = {
      type,
      deviseCode,
      montant,
      taux,
      modePaiement,
    };

    const result = changeOperationSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(data);
  }, [type, deviseCode, montant, taux, modePaiement, onSubmit]);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Nouvelle operation</h3>

      {/* Type toggle */}
      <div className="space-y-1.5">
        <Label className="text-sm">Type d'operation</Label>
        <div className="flex rounded-md border border-border">
          <button
            type="button"
            onClick={() => setType('achat')}
            disabled={disabled}
            className={cn(
              'flex-1 px-3 py-1.5 text-sm rounded-l-md transition-colors',
              type === 'achat'
                ? 'bg-success text-white'
                : 'bg-surface text-on-surface hover:bg-surface-dim',
            )}
          >
            Achat
          </button>
          <button
            type="button"
            onClick={() => setType('vente')}
            disabled={disabled}
            className={cn(
              'flex-1 px-3 py-1.5 text-sm rounded-r-md transition-colors',
              type === 'vente'
                ? 'bg-primary text-white'
                : 'bg-surface text-on-surface hover:bg-surface-dim',
            )}
          >
            Vente
          </button>
        </div>
      </div>

      {/* Devise selector */}
      <div className="space-y-1.5">
        <Label className="text-sm">Devise</Label>
        <DeviseSelector
          devises={devises}
          selected={deviseCode}
          onSelect={handleDeviseSelect}
          disabled={disabled}
        />
        {errors.deviseCode && (
          <p className="text-xs text-danger">{errors.deviseCode}</p>
        )}
      </div>

      {/* Montant */}
      <div className="space-y-1.5">
        <Label className="text-sm">Montant {selectedDevise ? `(${selectedDevise.code})` : ''}</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={montant || ''}
          onChange={(e) => setMontant(Number(e.target.value) || 0)}
          disabled={disabled}
          placeholder="0,00"
          className="text-right"
        />
        {errors.montant && (
          <p className="text-xs text-danger">{errors.montant}</p>
        )}
      </div>

      {/* Taux */}
      <div className="space-y-1.5">
        <Label className="text-sm">Taux de change</Label>
        <Input
          type="number"
          min={0}
          step={0.0001}
          value={taux || ''}
          onChange={(e) => setTaux(Number(e.target.value) || 0)}
          disabled={disabled}
          placeholder="0,0000"
          className="text-right"
        />
        {errors.taux && (
          <p className="text-xs text-danger">{errors.taux}</p>
        )}
      </div>

      {/* Contre-valeur (read-only) */}
      <div className="space-y-1.5">
        <Label className="text-sm">Contre-valeur (EUR)</Label>
        <div className="h-9 rounded-md border border-border bg-surface-dim px-3 py-2 text-right text-sm font-medium">
          {formatCurrency(contreValeur)}
        </div>
      </div>

      {/* Mode de paiement */}
      <div className="space-y-1.5">
        <Label className="text-sm">Mode de paiement</Label>
        <select
          value={modePaiement}
          onChange={(e) => setModePaiement(e.target.value)}
          disabled={disabled}
          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
        >
          <option value="">Choisir...</option>
          {MODES_PAIEMENT.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        {errors.modePaiement && (
          <p className="text-xs text-danger">{errors.modePaiement}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Validation en cours...' : "Valider l'operation"}
      </Button>
    </div>
  );
}
