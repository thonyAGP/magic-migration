import { CreditCard, PlusCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';

export type GiftPassAction = 'V' | 'C' | 'D';

interface GiftPassConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: GiftPassAction) => void;
  balance: number;
}

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export function GiftPassConfirmDialog({
  open,
  onClose,
  onSelect,
  balance,
}: GiftPassConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>GiftPass - Action</DialogTitle>
          <DialogDescription>
            Choisissez l'operation a effectuer sur le GiftPass
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 text-center">
          <div className="text-sm text-on-surface-muted mb-1">Solde actuel</div>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(balance)}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => onSelect('V')}
            className="justify-start gap-3 h-12"
          >
            <CreditCard className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Vente (V)</div>
              <div className="text-xs opacity-80">Debiter le GiftPass</div>
            </div>
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => onSelect('C')}
            className="justify-start gap-3 h-12"
          >
            <PlusCircle className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Credit (C)</div>
              <div className="text-xs opacity-80">Crediter le GiftPass</div>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onSelect('D')}
            className="justify-start gap-3 h-12"
          >
            <Eye className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Consulter solde (D)</div>
              <div className="text-xs opacity-80">Afficher le solde uniquement</div>
            </div>
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
