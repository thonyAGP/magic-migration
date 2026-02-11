import { useState, useCallback } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { personalInfoSchema } from './schemas';
import { t } from '@/i18n';
import type { PersonalInfoFormProps } from './types';

const CIVILITE_OPTIONS = ['M', 'Mme', 'Autre'] as const;

const TYPE_IDENTITE_OPTIONS = [
  { value: 'passeport', label: 'Passeport' },
  { value: 'carte_identite', label: "Carte d'identite" },
  { value: 'permis', label: 'Permis de conduire' },
] as const;

export function PersonalInfoForm({
  initialData,
  onSave,
  onBack,
  isSaving = false,
}: PersonalInfoFormProps) {
  const [civilite, setCivilite] = useState<'M' | 'Mme' | 'Autre'>(
    initialData?.civilite ?? 'M',
  );
  const [nom, setNom] = useState(initialData?.nom ?? '');
  const [prenom, setPrenom] = useState(initialData?.prenom ?? '');
  const [dateNaissance, setDateNaissance] = useState(
    initialData?.dateNaissance ?? '',
  );
  const [nationalite, setNationalite] = useState(
    initialData?.nationalite ?? '',
  );
  const [typeIdentite, setTypeIdentite] = useState<
    'passeport' | 'carte_identite' | 'permis'
  >(initialData?.typeIdentite ?? 'passeport');
  const [numeroIdentite, setNumeroIdentite] = useState(
    initialData?.numeroIdentite ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(() => {
    const data = {
      civilite,
      nom,
      prenom,
      dateNaissance,
      nationalite,
      typeIdentite,
      numeroIdentite,
    };

    const result = personalInfoSchema.safeParse(data);
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
    civilite,
    nom,
    prenom,
    dateNaissance,
    nationalite,
    typeIdentite,
    numeroIdentite,
    onSave,
  ]);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">{t('datacatch.personalInfo.title')}</h3>

      {/* Civilite */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t('datacatch.personalInfo.civilite')}</Label>
        <div className="flex gap-3">
          {CIVILITE_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="civilite"
                value={option}
                checked={civilite === option}
                onChange={() => setCivilite(option)}
              />
              {option}
            </label>
          ))}
        </div>
        {errors.civilite && (
          <p className="text-xs text-danger">{errors.civilite}</p>
        )}
      </div>

      {/* Nom */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t('datacatch.personalInfo.nom')}</Label>
        <Input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder={t('datacatch.personalInfo.placeholderNom')}
        />
        {errors.nom && <p className="text-xs text-danger">{errors.nom}</p>}
      </div>

      {/* Prenom */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t('datacatch.personalInfo.prenom')}</Label>
        <Input
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder={t('datacatch.personalInfo.placeholderPrenom')}
        />
        {errors.prenom && (
          <p className="text-xs text-danger">{errors.prenom}</p>
        )}
      </div>

      {/* Date de naissance */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t('datacatch.personalInfo.dateNaissance')}</Label>
        <Input
          type="date"
          value={dateNaissance}
          onChange={(e) => setDateNaissance(e.target.value)}
        />
        {errors.dateNaissance && (
          <p className="text-xs text-danger">{errors.dateNaissance}</p>
        )}
      </div>

      {/* Nationalite */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t('datacatch.personalInfo.nationalite')}</Label>
        <Input
          value={nationalite}
          onChange={(e) => setNationalite(e.target.value)}
          placeholder={t('datacatch.personalInfo.placeholderNationalite')}
        />
        {errors.nationalite && (
          <p className="text-xs text-danger">{errors.nationalite}</p>
        )}
      </div>

      {/* Type identite */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t('datacatch.personalInfo.typeIdentite')}</Label>
        <select
          value={typeIdentite}
          onChange={(e) =>
            setTypeIdentite(
              e.target.value as 'passeport' | 'carte_identite' | 'permis',
            )
          }
          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm"
        >
          {TYPE_IDENTITE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.typeIdentite && (
          <p className="text-xs text-danger">{errors.typeIdentite}</p>
        )}
      </div>

      {/* Numero identite */}
      <div className="space-y-1.5">
        <Label className="text-sm">{t('datacatch.personalInfo.numeroIdentite')}</Label>
        <Input
          value={numeroIdentite}
          onChange={(e) => setNumeroIdentite(e.target.value)}
          placeholder={t('datacatch.personalInfo.placeholderNumeroIdentite')}
        />
        {errors.numeroIdentite && (
          <p className="text-xs text-danger">{errors.numeroIdentite}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          {t('datacatch.common.back')}
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? t('datacatch.common.saving') : t('datacatch.common.next')}
        </Button>
      </div>
    </div>
  );
}
