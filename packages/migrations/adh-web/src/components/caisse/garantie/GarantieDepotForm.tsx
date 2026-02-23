import { useState, useCallback } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import { garantieDepotSchema } from './schemas';
import type { GarantieDepotFormProps, GarantieDepotFormData } from './types';

const DEVISES = [
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'USD', label: 'USD - Dollar US' },
  { value: 'GBP', label: 'GBP - Livre Sterling' },
  { value: 'CHF', label: 'CHF - Franc Suisse' },
];

export function GarantieDepotForm({
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: GarantieDepotFormProps) {
  const [codeAdherent, setCodeAdherent] = useState<number>(0);
  const [filiation, setFiliation] = useState<number>(0);
  const [montant, setMontant] = useState<number>(0);
  const [devise, setDevise] = useState('EUR');
  const [description, setDescription] = useState('');
  const [dateExpiration, setDateExpiration] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(() => {
    const data: GarantieDepotFormData = {
      codeAdherent,
      filiation,
      montant,
      devise,
      description,
      ...(dateExpiration ? { dateExpiration } : {}),
    };

    const result = garantieDepotSchema.safeParse(data);
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
  }, [codeAdherent, filiation, montant, devise, description, dateExpiration, onSubmit]);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Nouveau depot de garantie</h3>

      {/* Code adherent */}
      <div className="space-y-1.5">
        <Label className="text-sm">Code adherent</Label>
        <Input
          type="number"
          min={1}
          value={codeAdherent || ''}
          onChange={(e) => setCodeAdherent(Number(e.target.value) || 0)}
          disabled={disabled}
          placeholder="Code adherent"
        />
        {errors.codeAdherent && (
          <p className="text-xs text-danger">{errors.codeAdherent}</p>
        )}
      </div>

      {/* Filiation */}
      <div className="space-y-1.5">
        <Label className="text-sm">Filiation</Label>
        <Input
          type="number"
          min={0}
          value={filiation || ''}
          onChange={(e) => setFiliation(Number(e.target.value) || 0)}
          disabled={disabled}
          placeholder="0"
        />
        {errors.filiation && (
          <p className="text-xs text-danger">{errors.filiation}</p>
        )}
      </div>

      {/* Montant + Devise */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 space-y-1.5">
          <Label className="text-sm">Montant</Label>
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
        <div className="space-y-1.5">
          <Label className="text-sm">Devise</Label>
          <select
            value={devise}
            onChange={(e) => setDevise(e.target.value)}
            disabled={disabled}
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
          >
            {DEVISES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.value}
              </option>
            ))}
          </select>
          {errors.devise && (
            <p className="text-xs text-danger">{errors.devise}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-sm">Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
          placeholder="Description du depot..."
          rows={3}
          className={cn(
            'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm',
            'placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary',
          )}
        />
        {errors.description && (
          <p className="text-xs text-danger">{errors.description}</p>
        )}
      </div>

      {/* Date expiration */}
      <div className="space-y-1.5">
        <Label className="text-sm">Date d'expiration (optionnel)</Label>
        <Input
          type="date"
          value={dateExpiration}
          onChange={(e) => setDateExpiration(e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Enregistrement...' : 'Enregistrer le depot'}
      </Button>
    </div>
  );
}
