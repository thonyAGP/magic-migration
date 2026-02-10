import { useState, useCallback } from 'react';
import { Button, Label, Checkbox } from '@/components/ui';
import { preferencesSchema } from './schemas';
import type { PreferencesFormProps } from './types';

const LANGUE_OPTIONS = [
  { value: 'Francais', label: 'Francais' },
  { value: 'Anglais', label: 'Anglais' },
  { value: 'Espagnol', label: 'Espagnol' },
  { value: 'Allemand', label: 'Allemand' },
  { value: 'Italien', label: 'Italien' },
] as const;

const ACTIVITES_OPTIONS = [
  'Sport',
  'Bien-etre',
  'Culture',
  'Gastronomie',
  'Aventure',
  'Detente',
] as const;

export function PreferencesForm({
  initialData,
  onSave,
  onBack,
  isSaving = false,
}: PreferencesFormProps) {
  const [languePreferee, setLanguePreferee] = useState(
    initialData?.languePreferee ?? 'Francais',
  );
  const [consentementMarketing, setConsentementMarketing] = useState(
    initialData?.consentementMarketing ?? false,
  );
  const [newsletter, setNewsletter] = useState(
    initialData?.newsletter ?? false,
  );
  const [consentementCommunication, setConsentementCommunication] = useState(
    initialData?.consentementCommunication ?? false,
  );
  const [activitesPreferees, setActivitesPreferees] = useState<string[]>(
    initialData?.activitesPreferees ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleActivite = useCallback((activite: string) => {
    setActivitesPreferees((prev) =>
      prev.includes(activite)
        ? prev.filter((a) => a !== activite)
        : [...prev, activite],
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const data = {
      languePreferee,
      consentementMarketing,
      newsletter,
      consentementCommunication,
      activitesPreferees,
    };

    const result = preferencesSchema.safeParse(data);
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
    onSave(result.data);
  }, [
    languePreferee,
    consentementMarketing,
    newsletter,
    consentementCommunication,
    activitesPreferees,
    onSave,
  ]);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Preferences et consentements</h3>

      {/* Langue preferee */}
      <div className="space-y-1.5">
        <Label className="text-sm">Langue preferee</Label>
        <select
          value={languePreferee}
          onChange={(e) => setLanguePreferee(e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
        >
          {LANGUE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.languePreferee && (
          <p className="text-xs text-danger">{errors.languePreferee}</p>
        )}
      </div>

      {/* Consentements */}
      <div className="space-y-3">
        <Label className="text-sm">Consentements</Label>
        <Checkbox
          id="consentementMarketing"
          label="Consentement marketing"
          checked={consentementMarketing}
          onChange={(e) => setConsentementMarketing(e.target.checked)}
        />
        <Checkbox
          id="newsletter"
          label="Newsletter"
          checked={newsletter}
          onChange={(e) => setNewsletter(e.target.checked)}
        />
        <Checkbox
          id="consentementCommunication"
          label="Consentement communication"
          checked={consentementCommunication}
          onChange={(e) => setConsentementCommunication(e.target.checked)}
        />
      </div>

      {/* Activites preferees */}
      <div className="space-y-3">
        <Label className="text-sm">Activites preferees</Label>
        {ACTIVITES_OPTIONS.map((activite) => (
          <Checkbox
            key={activite}
            id={`activite-${activite}`}
            label={activite}
            checked={activitesPreferees.includes(activite)}
            onChange={() => toggleActivite(activite)}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Enregistrement...' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
}
