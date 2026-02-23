import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';
import type { FusionAccountSelectionProps } from './types';
import type { FusionAccount } from '@/types/fusion';

function AccountCard({ account, label, variant }: { account: FusionAccount; label: string; variant: 'primary' | 'destructive' }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-2',
        variant === 'primary' ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5',
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-on-surface-muted">{label}</div>
      <div className="text-lg font-bold">{account.nom} {account.prenom}</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-on-surface-muted">Code: </span>
          <span className="font-mono font-medium">{account.codeAdherent}</span>
        </div>
        <div>
          <span className="text-on-surface-muted">Filiation: </span>
          <span className="font-mono">{account.filiation}</span>
        </div>
        <div>
          <span className="text-on-surface-muted">Solde: </span>
          <span className="font-medium">{account.solde.toFixed(2)} EUR</span>
        </div>
        <div>
          <span className="text-on-surface-muted">Transactions: </span>
          <span>{account.nbTransactions}</span>
        </div>
        {account.nbGaranties > 0 && (
          <div>
            <span className="text-on-surface-muted">Garanties: </span>
            <span>{account.nbGaranties}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function FusionAccountSelection({
  principal,
  secondaire,
  onPreview,
  onBack,
  className,
}: FusionAccountSelectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-on-surface">Comptes selectionnes pour la fusion</h3>

      <div className="flex items-center gap-4">
        <AccountCard account={principal} label="Compte principal (conserve)" variant="primary" />
        <ArrowRight className="h-8 w-8 shrink-0 text-on-surface-muted" />
        <AccountCard account={secondaire} label="Compte secondaire (absorbe)" variant="destructive" />
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onPreview}>Previsualiser la fusion</Button>
      </div>
    </div>
  );
}
