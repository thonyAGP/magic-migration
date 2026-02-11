import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { Button } from '@/components/ui';

interface GratuitConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  articleDescription: string;
  montant: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function GratuitConfirmDialog({
  open,
  onClose,
  onConfirm,
  articleDescription,
  montant,
}: GratuitConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Article gratuit
          </DialogTitle>
          <DialogDescription>
            Verification du montant a zero
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">
            L&apos;article &laquo;{articleDescription}&raquo; a un montant de{' '}
            <span className="font-semibold">{formatCurrency(montant)}</span> (gratuit).
            Souhaitez-vous confirmer ?
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Modifier le montant
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-warning text-white hover:bg-warning/90"
          >
            <AlertTriangle className="mr-1 h-4 w-4" />
            Confirmer gratuit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { GratuitConfirmDialogProps };
