import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { remiseCoffreSchema } from './schemas';
import type { RemiseCoffreData } from '@/types/caisseOps';

interface RemiseCoffreFormProps {
  onSubmit: (data: RemiseCoffreData) => void;
  devises: string[];
  isSubmitting: boolean;
}

export function RemiseCoffreForm({ onSubmit, devises, isSubmitting }: RemiseCoffreFormProps) {
  const [montant, setMontant] = useState('');
  const [deviseCode, setDeviseCode] = useState(devises[0] ?? 'EUR');
  const [motif, setMotif] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    setErrors({});
    const parsed = remiseCoffreSchema.safeParse({
      montant: Number(montant),
      deviseCode,
      motif,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    onSubmit(parsed.data);
  };

  return (
    <div className="space-y-4 bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium">Remise au coffre</h3>

      <div className="space-y-2">
        <Label htmlFor="remise-montant" required>Montant</Label>
        <Input
          id="remise-montant"
          type="number"
          min="0"
          step="0.01"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="0.00"
          error={errors.montant}
        />
        {errors.montant && <p className="text-xs text-danger">{errors.montant}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="remise-devise" required>Devise</Label>
        <select
          id="remise-devise"
          value={deviseCode}
          onChange={(e) => setDeviseCode(e.target.value)}
          className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {devises.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remise-motif" required>Motif</Label>
        <textarea
          id="remise-motif"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Motif de la remise"
          rows={3}
          className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        {errors.motif && <p className="text-xs text-danger">{errors.motif}</p>}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Validation...' : 'Valider la remise'}
        </Button>
      </div>
    </div>
  );
}
