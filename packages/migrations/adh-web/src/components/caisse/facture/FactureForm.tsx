import { useState, useCallback } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import { factureCreateSchema } from './schemas';
import { FactureHebergementSection } from './FactureHebergementSection';
import { FactureClientSection } from './FactureClientSection';
import type { FactureFormProps } from './types';
import type { FactureType, FactureClient } from '@/types/facture';
import type { HebergementData } from '@/types/hebergement';

const DEFAULT_CLIENT: FactureClient = {
  nom: '',
  prenom: '',
  adresse1: '',
  adresse2: '',
  codePostal: '',
  ville: '',
  pays: 'FR',
  email: '',
};

export function FactureForm({
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: FactureFormProps) {
  const [codeAdherent, setCodeAdherent] = useState<number>(0);
  const [filiation, setFiliation] = useState<number>(0);
  const [type, setType] = useState<FactureType>('facture');
  const [commentaire, setCommentaire] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Client state
  const [client, setClient] = useState<FactureClient>(DEFAULT_CLIENT);
  const [sansNom, setSansNom] = useState(false);
  const [sansAdresse, setSansAdresse] = useState(false);

  // Hebergement state
  const [hebergementEnabled, setHebergementEnabled] = useState(false);
  const [hebergement, setHebergement] = useState<HebergementData | null>(null);

  const handleSubmit = useCallback(() => {
    const data = {
      codeAdherent,
      filiation,
      type,
      commentaire: commentaire || undefined,
    };

    const result = factureCreateSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    // Validate client fields
    const clientErrors: Record<string, string> = {};
    if (!sansNom && !client.nom.trim()) {
      clientErrors.nom = 'Nom requis';
    }
    if (!sansAdresse) {
      if (!client.adresse1.trim()) clientErrors.adresse1 = 'Adresse requise';
      if (!client.codePostal.trim()) clientErrors.codePostal = 'Code postal requis';
      if (!client.ville.trim()) clientErrors.ville = 'Ville requise';
    }
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  }, [codeAdherent, filiation, type, commentaire, onSubmit, sansNom, sansAdresse, client]);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Nouvelle facture</h3>

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
          placeholder="Filiation"
        />
        {errors.filiation && (
          <p className="text-xs text-danger">{errors.filiation}</p>
        )}
      </div>

      {/* Type toggle */}
      <div className="space-y-1.5">
        <Label className="text-sm">Type</Label>
        <div className="flex rounded-md border border-border">
          <button
            type="button"
            onClick={() => setType('facture')}
            disabled={disabled}
            className={cn(
              'flex-1 px-3 py-1.5 text-sm rounded-l-md transition-colors',
              type === 'facture'
                ? 'bg-primary text-white'
                : 'bg-surface text-on-surface hover:bg-surface-dim',
            )}
          >
            Facture
          </button>
          <button
            type="button"
            onClick={() => setType('avoir')}
            disabled={disabled}
            className={cn(
              'flex-1 px-3 py-1.5 text-sm rounded-r-md transition-colors',
              type === 'avoir'
                ? 'bg-warning text-white'
                : 'bg-surface text-on-surface hover:bg-surface-dim',
            )}
          >
            Avoir
          </button>
        </div>
      </div>

      {/* Client section */}
      <div className="border-t border-border pt-4">
        <FactureClientSection
          client={client}
          onChange={setClient}
          sansNom={sansNom}
          sansAdresse={sansAdresse}
          onSansNomChange={setSansNom}
          onSansAdresseChange={setSansAdresse}
          errors={errors}
        />
      </div>

      {/* Hebergement section */}
      <div className="border-t border-border pt-4">
        <FactureHebergementSection
          data={hebergement}
          onChange={setHebergement}
          onToggle={setHebergementEnabled}
          enabled={hebergementEnabled}
        />
      </div>

      {/* Commentaire */}
      <div className="space-y-1.5">
        <Label className="text-sm">Commentaire</Label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          disabled={disabled}
          placeholder="Commentaire (optionnel)"
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.commentaire && (
          <p className="text-xs text-danger">{errors.commentaire}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creation...' : 'Creer la facture'}
      </Button>
    </div>
  );
}
