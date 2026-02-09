import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TransactionDraft, SelectedMOP } from '@/types/transaction-lot2';

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

interface TransactionSummaryProps {
  draft: TransactionDraft;
  selectedMOP: SelectedMOP[];
  className?: string;
}

export function TransactionSummary({
  draft,
  selectedMOP,
  className,
}: TransactionSummaryProps) {
  const totalMOP = selectedMOP.reduce((sum, m) => sum + m.montant, 0);
  const isBalanced = Math.abs(totalMOP - draft.montantTotal) < 0.01;

  return (
    <div className={cn('space-y-3 rounded-md border border-border p-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Resume transaction</h3>
        <Badge variant={isBalanced ? 'default' : 'secondary'}>
          {isBalanced ? 'Equilibree' : 'En attente'}
        </Badge>
      </div>

      {/* Account */}
      <div className="text-sm">
        <span className="text-on-surface-muted">Compte : </span>
        <span className="font-medium">{draft.compteNom}</span>
      </div>

      {/* Lines summary */}
      <div className="space-y-1">
        {draft.lignes.map((ligne, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-on-surface-muted truncate mr-2">
              {ligne.description || 'Ligne ' + (idx + 1)}
              {ligne.quantite > 1 && ` x${ligne.quantite}`}
            </span>
            <span className="font-medium whitespace-nowrap">
              {formatCurrency(ligne.quantite * ligne.prixUnitaire, draft.devise)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-border pt-2 flex justify-between text-base font-bold">
        <span>Total</span>
        <span>{formatCurrency(draft.montantTotal, draft.devise)}</span>
      </div>

      {/* MOP summary */}
      {selectedMOP.length > 0 && (
        <div className="space-y-1 border-t border-border pt-2">
          <div className="text-xs font-medium text-on-surface-muted">Reglements</div>
          {selectedMOP.map((mop) => (
            <div key={mop.code} className="flex justify-between text-sm">
              <span>{mop.code}</span>
              <span className="font-medium">{formatCurrency(mop.montant, draft.devise)}</span>
            </div>
          ))}
        </div>
      )}

      {/* GiftPass / Resort Credit */}
      {draft.giftPass?.available && (
        <div className="text-xs text-success">
          GiftPass : {formatCurrency(draft.giftPass.balance, draft.giftPass.devise)}
        </div>
      )}
      {draft.resortCredit?.available && (
        <div className="text-xs text-success">
          Resort Credit : {formatCurrency(draft.resortCredit.balance, draft.resortCredit.devise)}
        </div>
      )}

      {/* Commentaire */}
      {draft.commentaire && (
        <div className="text-xs text-on-surface-muted italic border-t border-border pt-2">
          {draft.commentaire}
        </div>
      )}
    </div>
  );
}
