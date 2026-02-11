import { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
} from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import type { GarantieArticle } from '@/types/garantie';

interface GarantieRetraitDialogProps {
  open: boolean;
  onClose: () => void;
  article: GarantieArticle | null;
  onConfirm: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function GarantieRetraitDialog({
  open,
  onClose,
  article,
  onConfirm,
}: GarantieRetraitDialogProps) {
  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Retrait d'article
          </DialogTitle>
          <DialogDescription>
            Confirmer le retrait de cet article de la garantie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-md bg-surface-dim px-4 py-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Code</span>
                <span className="font-medium">{article.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Description</span>
                <span className="font-medium">{article.libelle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Valeur estimee</span>
                <span className="font-medium">{formatCurrency(article.valeurEstimee)}</span>
              </div>
              {article.description && (
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Commentaire</span>
                  <span className="font-medium">{article.description}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-warning">
            Confirmer le retrait de {article.libelle} ?
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirmer retrait
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { GarantieRetraitDialogProps };
