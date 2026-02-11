import { useState, useCallback } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { CreditCard } from 'lucide-react';
import { passCreationSchema } from './schemas-creation';
import type { PassCreationData } from '@/types/clubmedpass';

interface PassCreationFormProps {
  onValidate: (data: PassCreationData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const VILLAGES = [
  { code: 'OPE', label: 'Opio' },
  { code: 'GRE', label: 'Gregolimano' },
  { code: 'PAL', label: 'Palmiye' },
  { code: 'CER', label: 'Cefalù' },
  { code: 'MAR', label: 'Marrakech' },
] as const;

const PASS_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'enfant', label: 'Enfant' },
] as const;

export function PassCreationForm({
  onValidate,
  onCancel,
  isSubmitting = false,
}: PassCreationFormProps) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    villageCode: '',
    typePass: 'standard',
    plafondJournalier: 500,
    dateDebut: '',
    dateFin: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (field: string, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const result = passCreationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onValidate(result.data);
  }, [form, onValidate]);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Nouvelle carte Club Med Pass</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Nom */}
        <div className="space-y-1.5">
          <Label className="text-sm">Nom</Label>
          <Input
            value={form.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            disabled={isSubmitting}
            placeholder="Dupont"
          />
          {errors.nom && <p className="text-xs text-danger">{errors.nom}</p>}
        </div>

        {/* Prenom */}
        <div className="space-y-1.5">
          <Label className="text-sm">Prenom</Label>
          <Input
            value={form.prenom}
            onChange={(e) => handleChange('prenom', e.target.value)}
            disabled={isSubmitting}
            placeholder="Jean"
          />
          {errors.prenom && <p className="text-xs text-danger">{errors.prenom}</p>}
        </div>

        {/* Date naissance */}
        <div className="space-y-1.5">
          <Label className="text-sm">Date de naissance</Label>
          <Input
            type="date"
            value={form.dateNaissance}
            onChange={(e) => handleChange('dateNaissance', e.target.value)}
            disabled={isSubmitting}
          />
          {errors.dateNaissance && (
            <p className="text-xs text-danger">{errors.dateNaissance}</p>
          )}
        </div>

        {/* Village */}
        <div className="space-y-1.5">
          <Label className="text-sm">Village</Label>
          <select
            value={form.villageCode}
            onChange={(e) => handleChange('villageCode', e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="">Selectionner un village</option>
            {VILLAGES.map((v) => (
              <option key={v.code} value={v.code}>
                {v.label}
              </option>
            ))}
          </select>
          {errors.villageCode && (
            <p className="text-xs text-danger">{errors.villageCode}</p>
          )}
        </div>
      </div>

      {/* Type de pass */}
      <div className="space-y-1.5">
        <Label className="text-sm">Type de pass</Label>
        <div className="flex gap-4">
          {PASS_TYPES.map((pt) => (
            <label
              key={pt.value}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="radio"
                name="typePass"
                value={pt.value}
                checked={form.typePass === pt.value}
                onChange={(e) => handleChange('typePass', e.target.value)}
                disabled={isSubmitting}
                className="accent-primary"
              />
              {pt.label}
            </label>
          ))}
        </div>
        {errors.typePass && (
          <p className="text-xs text-danger">{errors.typePass}</p>
        )}
      </div>

      {/* Plafond journalier */}
      <div className="space-y-1.5">
        <Label className="text-sm">Plafond journalier (EUR)</Label>
        <Input
          type="number"
          min={1}
          step={10}
          value={form.plafondJournalier || ''}
          onChange={(e) =>
            handleChange('plafondJournalier', Number(e.target.value) || 0)
          }
          disabled={isSubmitting}
          placeholder="500"
          className="max-w-48 text-right"
        />
        {errors.plafondJournalier && (
          <p className="text-xs text-danger">{errors.plafondJournalier}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Date de debut</Label>
          <Input
            type="date"
            value={form.dateDebut}
            onChange={(e) => handleChange('dateDebut', e.target.value)}
            disabled={isSubmitting}
          />
          {errors.dateDebut && (
            <p className="text-xs text-danger">{errors.dateDebut}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Date de fin</Label>
          <Input
            type="date"
            value={form.dateFin}
            onChange={(e) => handleChange('dateFin', e.target.value)}
            disabled={isSubmitting}
          />
          {errors.dateFin && (
            <p className="text-xs text-danger">{errors.dateFin}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            'Creation en cours...'
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Creer la carte
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
