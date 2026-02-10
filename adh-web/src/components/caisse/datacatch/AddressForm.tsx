import { useState, useCallback } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { addressSchema } from './schemas';
import type { AddressFormProps } from './types';

export function AddressForm({
  initialData,
  onSave,
  onBack,
  isSaving = false,
}: AddressFormProps) {
  const [adresse, setAdresse] = useState(initialData?.adresse ?? '');
  const [complement, setComplement] = useState(initialData?.complement ?? '');
  const [codePostal, setCodePostal] = useState(initialData?.codePostal ?? '');
  const [ville, setVille] = useState(initialData?.ville ?? '');
  const [pays, setPays] = useState(initialData?.pays ?? 'France');
  const [telephone, setTelephone] = useState(initialData?.telephone ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(() => {
    const data = {
      adresse,
      complement,
      codePostal,
      ville,
      pays,
      telephone,
      email,
    };

    const result = addressSchema.safeParse(data);
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
  }, [adresse, complement, codePostal, ville, pays, telephone, email, onSave]);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Adresse et contact</h3>

      {/* Adresse */}
      <div className="space-y-1.5">
        <Label className="text-sm">Adresse</Label>
        <Input
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Adresse"
        />
        {errors.adresse && (
          <p className="text-xs text-danger">{errors.adresse}</p>
        )}
      </div>

      {/* Complement */}
      <div className="space-y-1.5">
        <Label className="text-sm">Complement</Label>
        <Input
          value={complement}
          onChange={(e) => setComplement(e.target.value)}
          placeholder="Complement d'adresse"
        />
      </div>

      {/* Code postal + Ville */}
      <div className="flex gap-3">
        <div className="w-1/3 space-y-1.5">
          <Label className="text-sm">Code postal</Label>
          <Input
            value={codePostal}
            onChange={(e) => setCodePostal(e.target.value)}
            placeholder="Code postal"
          />
          {errors.codePostal && (
            <p className="text-xs text-danger">{errors.codePostal}</p>
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <Label className="text-sm">Ville</Label>
          <Input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Ville"
          />
          {errors.ville && (
            <p className="text-xs text-danger">{errors.ville}</p>
          )}
        </div>
      </div>

      {/* Pays */}
      <div className="space-y-1.5">
        <Label className="text-sm">Pays</Label>
        <Input
          value={pays}
          onChange={(e) => setPays(e.target.value)}
          placeholder="Pays"
        />
        {errors.pays && <p className="text-xs text-danger">{errors.pays}</p>}
      </div>

      {/* Telephone */}
      <div className="space-y-1.5">
        <Label className="text-sm">Telephone</Label>
        <Input
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Telephone"
        />
        {errors.telephone && (
          <p className="text-xs text-danger">{errors.telephone}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label className="text-sm">Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        {errors.email && (
          <p className="text-xs text-danger">{errors.email}</p>
        )}
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
