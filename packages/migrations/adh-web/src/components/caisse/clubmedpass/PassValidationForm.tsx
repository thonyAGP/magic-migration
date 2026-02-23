import { useState, useCallback } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { passValidationSchema, passScanSchema } from './schemas';
import type { PassValidationFormProps } from './types';

export function PassValidationForm({
  onValidate,
  onScan,
  isValidating = false,
  isScanning = false,
  disabled = false,
}: PassValidationFormProps) {
  const [numeroPass, setNumeroPass] = useState('');
  const [montantTransaction, setMontantTransaction] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValidate = useCallback(() => {
    const result = passValidationSchema.safeParse({
      numeroPass,
      montantTransaction,
    });
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
    onValidate({ numeroPass, montantTransaction });
  }, [numeroPass, montantTransaction, onValidate]);

  const handleScan = useCallback(() => {
    const result = passScanSchema.safeParse({ numeroPass });
    if (!result.success) {
      setErrors({ numeroPass: result.error.issues[0].message });
      return;
    }
    setErrors({});
    onScan(numeroPass);
  }, [numeroPass, onScan]);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="text-sm font-semibold">Validation Club Med Pass</h3>

      {/* Numero de pass */}
      <div className="space-y-1.5">
        <Label className="text-sm">Numero de pass</Label>
        <Input
          type="text"
          value={numeroPass}
          onChange={(e) => setNumeroPass(e.target.value)}
          disabled={disabled}
          placeholder="CM-2026-XXXXXX"
        />
        {errors.numeroPass && (
          <p className="text-xs text-danger">{errors.numeroPass}</p>
        )}
      </div>

      {/* Montant transaction */}
      <div className="space-y-1.5">
        <Label className="text-sm">Montant transaction (EUR)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={montantTransaction || ''}
          onChange={(e) => setMontantTransaction(Number(e.target.value) || 0)}
          disabled={disabled}
          placeholder="0,00"
          className="text-right"
        />
        {errors.montantTransaction && (
          <p className="text-xs text-danger">{errors.montantTransaction}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleScan}
          disabled={disabled || isScanning}
          className="flex-1"
        >
          {isScanning ? 'Scan en cours...' : 'Scanner'}
        </Button>
        <Button
          onClick={handleValidate}
          disabled={disabled || isValidating}
          className="flex-1"
        >
          {isValidating ? 'Validation...' : 'Valider'}
        </Button>
      </div>
    </div>
  );
}
