import { FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Badge,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ExtraitTransaction } from '@/types/extrait';

export interface ExtraitTransactionDetailProps {
  open: boolean;
  onClose: () => void;
  transaction: ExtraitTransaction | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const statusLabel: Record<string, string> = {
  normal: 'Normal',
  annule: 'Annule',
  regularise: 'Regularise',
  credit: 'Credit',
  debit: 'Debit',
};

const statusVariant: Record<string, 'default' | 'destructive' | 'secondary'> = {
  normal: 'default',
  annule: 'destructive',
  regularise: 'secondary',
  credit: 'default',
  debit: 'destructive',
};

export function ExtraitTransactionDetail({
  open,
  onClose,
  transaction,
}: ExtraitTransactionDetailProps) {
  if (!transaction) return null;

  const tx = transaction;
  const isDebit = tx.debit > 0;
  const montant = isDebit ? tx.debit : tx.credit;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Detail transaction #{tx.id}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <span className="text-on-surface-muted">Date</span>
            <p className="font-medium">{formatDate(tx.date)}</p>
          </div>
          <div>
            <span className="text-on-surface-muted">Heure</span>
            <p className="font-medium">{tx.heure || '-'}</p>
          </div>

          <div>
            <span className="text-on-surface-muted">Type operation</span>
            <div className="mt-0.5">
              <Badge variant={statusVariant[tx.status ?? 'normal'] ?? 'default'}>
                {statusLabel[tx.status ?? 'normal'] ?? 'Normal'}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-on-surface-muted">Montant</span>
            <p
              className={cn(
                'font-bold font-mono',
                isDebit ? 'text-error' : 'text-success',
              )}
            >
              {isDebit ? '-' : '+'}{formatCurrency(montant)}
            </p>
          </div>

          <div className="col-span-2">
            <span className="text-on-surface-muted">Libelle</span>
            <p className="font-medium">{tx.libelle}</p>
            {tx.libelleSupplementaire && (
              <p className="text-on-surface-muted text-xs mt-0.5">{tx.libelleSupplementaire}</p>
            )}
          </div>

          {tx.numeroPiece && (
            <div>
              <span className="text-on-surface-muted">Numero piece</span>
              <p className="font-medium">{tx.numeroPiece}</p>
            </div>
          )}
          {tx.modePaiement && (
            <div>
              <span className="text-on-surface-muted">Mode paiement</span>
              <p className="font-medium">{tx.modePaiement}</p>
            </div>
          )}

          <div>
            <span className="text-on-surface-muted">Service</span>
            <p className="font-medium">{tx.codeService}</p>
          </div>
          <div>
            <span className="text-on-surface-muted">Imputation</span>
            <p className="font-medium">{tx.codeImputation}</p>
          </div>

          {tx.caissier && (
            <div>
              <span className="text-on-surface-muted">Caissier</span>
              <p className="font-medium">{tx.caissier}</p>
            </div>
          )}
          <div>
            <span className="text-on-surface-muted">Solde apres</span>
            <p className="font-medium font-mono">{formatCurrency(tx.solde)}</p>
          </div>

          {tx.commentaire && (
            <div className="col-span-2 rounded-md bg-surface-hover p-2">
              <span className="text-on-surface-muted">Commentaire</span>
              <p className="mt-0.5">{tx.commentaire}</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
          >
            Fermer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
