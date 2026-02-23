import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';

interface AnnulationReferenceDialogProps {
  open: boolean;
  onClose: () => void;
  onValidate: (reference: string) => void;
}

interface MockTransactionResult {
  reference: string;
  montant: number;
  devise: string;
  date: string;
  compteNom: string;
}

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function AnnulationReferenceDialog({
  open,
  onClose,
  onValidate,
}: AnnulationReferenceDialogProps) {
  const [reference, setReference] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<MockTransactionResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!reference.trim()) {
      setError('Veuillez saisir une reference');
      return;
    }
    setIsSearching(true);
    setError('');
    setResult(null);

    // Mock: simulate API search delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock: always find a transaction
    setResult({
      reference: reference.trim(),
      montant: 280.0,
      devise: 'EUR',
      date: new Date().toISOString().slice(0, 10),
      compteNom: 'DUPONT Jean',
    });
    setIsSearching(false);
  }, [reference]);

  const handleValidate = useCallback(() => {
    if (result) {
      onValidate(result.reference);
      setReference('');
      setResult(null);
      setError('');
    }
  }, [result, onValidate]);

  const handleClose = useCallback(() => {
    setReference('');
    setResult(null);
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annulation de transaction</DialogTitle>
          <DialogDescription>
            Saisissez la reference de la transaction a annuler
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label required>Reference transaction</Label>
            <div className="flex gap-2">
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: TXN-2026-001"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSearch}
                disabled={isSearching || !reference.trim()}
              >
                <Search className="h-4 w-4" />
                {isSearching ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
            {error && (
              <span className="text-xs text-danger">{error}</span>
            )}
          </div>

          {result && (
            <div className="rounded-lg border border-border bg-surface-dim p-4 space-y-2">
              <div className="text-sm font-medium">Transaction trouvee</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-on-surface-muted">Reference</div>
                <div className="font-medium">{result.reference}</div>
                <div className="text-on-surface-muted">Compte</div>
                <div>{result.compteNom}</div>
                <div className="text-on-surface-muted">Date</div>
                <div>{result.date}</div>
                <div className="text-on-surface-muted">Montant</div>
                <div className="font-bold text-danger">
                  {formatCurrency(result.montant, result.devise)}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Fermer
          </Button>
          {result && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleValidate}
            >
              Annuler cette transaction
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
