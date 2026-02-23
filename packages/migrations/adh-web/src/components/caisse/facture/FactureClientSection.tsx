import { useCallback } from 'react';
import { Input, Label, Checkbox } from '@/components/ui';
import { User } from 'lucide-react';

export interface FactureClient {
  nom: string;
  prenom: string;
  adresse1: string;
  adresse2?: string;
  codePostal: string;
  ville: string;
  pays: string;
  email?: string;
}

export interface FactureClientSectionProps {
  client: FactureClient;
  onChange: (client: FactureClient) => void;
  sansNom: boolean;
  sansAdresse: boolean;
  onSansNomChange: (val: boolean) => void;
  onSansAdresseChange: (val: boolean) => void;
  errors?: Record<string, string>;
}

const _EMPTY_CLIENT: FactureClient = {
  nom: '',
  prenom: '',
  adresse1: '',
  adresse2: '',
  codePostal: '',
  ville: '',
  pays: 'FR',
  email: '',
};

export function FactureClientSection({
  client,
  onChange,
  sansNom,
  sansAdresse,
  onSansNomChange,
  onSansAdresseChange,
  errors = {},
}: FactureClientSectionProps) {
  const handleField = useCallback(
    (field: keyof FactureClient, value: string) => {
      onChange({ ...client, [field]: value });
    },
    [client, onChange],
  );

  const handleSansNom = useCallback(
    (checked: boolean) => {
      onSansNomChange(checked);
      if (checked) {
        onChange({ ...client, nom: '', prenom: '' });
      }
    },
    [client, onChange, onSansNomChange],
  );

  const handleSansAdresse = useCallback(
    (checked: boolean) => {
      onSansAdresseChange(checked);
      if (checked) {
        onChange({ ...client, adresse1: '', adresse2: '', codePostal: '', ville: '', pays: '' });
      }
    },
    [client, onChange, onSansAdresseChange],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <User className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Identite client</span>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="sans-nom"
            checked={sansNom}
            onChange={(e) => handleSansNom(e.target.checked)}
          />
          <Label htmlFor="sans-nom" className="text-sm cursor-pointer">
            Sans Nom
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="sans-adresse"
            checked={sansAdresse}
            onChange={(e) => handleSansAdresse(e.target.checked)}
          />
          <Label htmlFor="sans-adresse" className="text-sm cursor-pointer">
            Sans Adresse
          </Label>
        </div>
      </div>

      {/* Nom / Prenom */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Nom</Label>
          <Input
            value={sansNom ? '' : client.nom}
            onChange={(e) => handleField('nom', e.target.value)}
            disabled={sansNom}
            placeholder={sansNom ? 'ANONYME' : 'Nom'}
          />
          {errors.nom && <p className="text-xs text-danger">{errors.nom}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Prenom</Label>
          <Input
            value={sansNom ? '' : client.prenom}
            onChange={(e) => handleField('prenom', e.target.value)}
            disabled={sansNom}
            placeholder={sansNom ? '' : 'Prenom'}
          />
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Adresse</Label>
          <Input
            value={sansAdresse ? '' : client.adresse1}
            onChange={(e) => handleField('adresse1', e.target.value)}
            disabled={sansAdresse}
            placeholder={sansAdresse ? '' : 'Adresse ligne 1'}
          />
          {errors.adresse1 && <p className="text-xs text-danger">{errors.adresse1}</p>}
        </div>
        <Input
          value={sansAdresse ? '' : (client.adresse2 ?? '')}
          onChange={(e) => handleField('adresse2', e.target.value)}
          disabled={sansAdresse}
          placeholder={sansAdresse ? '' : 'Adresse ligne 2 (optionnel)'}
        />
      </div>

      {/* CP / Ville / Pays */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Code postal</Label>
          <Input
            value={sansAdresse ? '' : client.codePostal}
            onChange={(e) => handleField('codePostal', e.target.value)}
            disabled={sansAdresse}
            placeholder={sansAdresse ? '' : 'CP'}
          />
          {errors.codePostal && <p className="text-xs text-danger">{errors.codePostal}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Ville</Label>
          <Input
            value={sansAdresse ? '' : client.ville}
            onChange={(e) => handleField('ville', e.target.value)}
            disabled={sansAdresse}
            placeholder={sansAdresse ? '' : 'Ville'}
          />
          {errors.ville && <p className="text-xs text-danger">{errors.ville}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Pays</Label>
          <Input
            value={sansAdresse ? '' : client.pays}
            onChange={(e) => handleField('pays', e.target.value)}
            disabled={sansAdresse}
            placeholder={sansAdresse ? '' : 'FR'}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label className="text-sm">Email</Label>
        <Input
          type="email"
          value={client.email ?? ''}
          onChange={(e) => handleField('email', e.target.value)}
          placeholder="email@exemple.com (optionnel)"
        />
      </div>
    </div>
  );
}
