import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { telecollecteSchema } from './schemas';
import type { TelecollecteResult } from '@/types/caisseOps';

const MOCK_TERMINALS = [
  { id: 'TPE-01', label: 'TPE Principal' },
  { id: 'TPE-02', label: 'TPE Secondaire' },
  { id: 'TPE-03', label: 'TPE Mobile' },
];

interface TelecollectePanelProps {
  onExecute: (terminalId: string) => void;
  result: TelecollecteResult | null;
  isExecuting: boolean;
  deviseCode?: string;
}

export function TelecollectePanel({ onExecute, result, isExecuting, deviseCode = 'EUR' }: TelecollectePanelProps) {
  const [terminalId, setTerminalId] = useState('');
  const [error, setError] = useState('');

  const handleExecute = () => {
    setError('');
    const parsed = telecollecteSchema.safeParse({ terminalId });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Erreur de validation');
      return;
    }
    onExecute(parsed.data.terminalId);
  };

  return (
    <div className="space-y-4 bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium">Telecollecte</h3>

      <div className="space-y-2">
        <Label htmlFor="telecollecte-terminal" required>Terminal</Label>
        <select
          id="telecollecte-terminal"
          value={terminalId}
          onChange={(e) => setTerminalId(e.target.value)}
          className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <option value="">Selectionner un terminal...</option>
          {MOCK_TERMINALS.map((t) => (
            <option key={t.id} value={t.id}>{t.label} ({t.id})</option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleExecute} disabled={isExecuting || !terminalId}>
          {isExecuting ? 'Collecte en cours...' : 'Lancer telecollecte'}
        </Button>
      </div>

      {result && (
        <div className={`mt-4 rounded-md border p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.success
              ? <CheckCircle className="h-5 w-5 text-green-600" />
              : <AlertTriangle className="h-5 w-5 text-red-600" />}
            <span className="font-medium">
              {result.success ? 'Telecollecte reussie' : 'Erreur telecollecte'}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-on-surface-muted">Montant collecte</dt>
            <dd className="font-medium">{result.montantCollecte.toFixed(2)} {deviseCode}</dd>
            <dt className="text-on-surface-muted">Transactions traitees</dt>
            <dd className="font-medium">{result.nbTransactionsTraitees}</dd>
          </dl>
          {result.erreurs && result.erreurs.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
              {result.erreurs.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
