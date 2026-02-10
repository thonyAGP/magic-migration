import { Button } from '@/components/ui';
import { Check, X } from 'lucide-react';
import type { DataCatchReviewProps } from './types';

const CIVILITE_LABELS: Record<string, string> = {
  M: 'Monsieur',
  Mme: 'Madame',
  Autre: 'Autre',
};

const TYPE_IDENTITE_LABELS: Record<string, string> = {
  passeport: 'Passeport',
  carte_identite: "Carte d'identite",
  permis: 'Permis de conduire',
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="rounded-md border border-border">
      <div className="bg-surface-dim px-3 py-2 text-sm font-semibold">
        {title}
      </div>
      <div className="p-3 text-sm space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-on-surface-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function BoolField({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-on-surface-muted">{label}</span>
      {value ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <X className="h-4 w-4 text-danger" />
      )}
    </div>
  );
}

export function DataCatchReview({
  personalInfo,
  address,
  preferences,
  onConfirm,
  onBack,
  isSubmitting = false,
}: DataCatchReviewProps) {
  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <Section title="Informations personnelles">
        {personalInfo ? (
          <>
            <Field
              label="Civilite"
              value={CIVILITE_LABELS[personalInfo.civilite] ?? personalInfo.civilite}
            />
            <Field label="Nom" value={personalInfo.nom} />
            <Field label="Prenom" value={personalInfo.prenom} />
            <Field label="Date de naissance" value={personalInfo.dateNaissance} />
            <Field label="Nationalite" value={personalInfo.nationalite} />
            <Field
              label="Type identite"
              value={
                TYPE_IDENTITE_LABELS[personalInfo.typeIdentite] ??
                personalInfo.typeIdentite
              }
            />
            <Field label="Numero identite" value={personalInfo.numeroIdentite} />
          </>
        ) : (
          <p className="text-on-surface-muted">Non renseigne</p>
        )}
      </Section>

      {/* Address */}
      <Section title="Adresse et contact">
        {address ? (
          <>
            <Field label="Adresse" value={address.adresse} />
            {address.complement && (
              <Field label="Complement" value={address.complement} />
            )}
            <Field
              label="Ville"
              value={`${address.codePostal} ${address.ville}`}
            />
            <Field label="Pays" value={address.pays} />
            <Field label="Telephone" value={address.telephone} />
            <Field label="Email" value={address.email} />
          </>
        ) : (
          <p className="text-on-surface-muted">Non renseigne</p>
        )}
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        {preferences ? (
          <>
            <Field label="Langue" value={preferences.languePreferee} />
            <BoolField
              label="Marketing"
              value={preferences.consentementMarketing}
            />
            <BoolField label="Newsletter" value={preferences.newsletter} />
            <BoolField
              label="Communication"
              value={preferences.consentementCommunication}
            />
            {preferences.activitesPreferees.length > 0 && (
              <Field
                label="Activites"
                value={preferences.activitesPreferees.join(', ')}
              />
            )}
          </>
        ) : (
          <p className="text-on-surface-muted">Non renseigne</p>
        )}
      </Section>

      {/* Buttons */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Retour
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="bg-success hover:bg-success/90"
        >
          {isSubmitting
            ? 'Enregistrement en cours...'
            : 'Confirmer et enregistrer'}
        </Button>
      </div>
    </div>
  );
}
