import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import type { GarantieArticle } from '@/types/garantie';

interface GarantieDepotArticleDialogProps {
  open: boolean;
  onClose: () => void;
  compteId: string;
  onValidate: (article: Omit<GarantieArticle, 'id' | 'garantieId' | 'etat'>) => void;
}

const articleSchema = z.object({
  code: z.string().min(1, 'Code article requis'),
  libelle: z.string().min(1, 'Description requise'),
  description: z.string().optional().default(''),
  quantite: z.number().positive('Quantite doit etre > 0'),
  valeurEstimee: z.number().min(0, 'Valeur doit etre >= 0'),
  commentaire: z.string().optional(),
});

export function GarantieDepotArticleDialog({
  open,
  onClose,
  compteId,
  onValidate,
}: GarantieDepotArticleDialogProps) {
  const [code, setCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [quantite, setQuantite] = useState<number>(1);
  const [valeurEstimee, setValeurEstimee] = useState<number>(0);
  const [commentaire, setCommentaire] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setCode('');
    setLibelle('');
    setQuantite(1);
    setValeurEstimee(0);
    setCommentaire('');
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(() => {
    const result = articleSchema.safeParse({
      code,
      libelle,
      quantite,
      valeurEstimee,
      commentaire: commentaire || undefined,
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
    onValidate({
      code: result.data.code,
      libelle: result.data.libelle,
      description: result.data.commentaire ?? '',
      valeurEstimee: result.data.valeurEstimee,
    });
    resetForm();
  }, [code, libelle, quantite, valeurEstimee, commentaire, onValidate, resetForm]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deposer un article</DialogTitle>
          <DialogDescription>
            Ajouter un article en garantie pour le compte {compteId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm">Code article</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: SKI01"
            />
            {errors.code && <p className="text-xs text-danger">{errors.code}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Description</Label>
            <Input
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Description de l'article"
            />
            {errors.libelle && <p className="text-xs text-danger">{errors.libelle}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Quantite</Label>
              <Input
                type="number"
                min={1}
                value={quantite || ''}
                onChange={(e) => setQuantite(Number(e.target.value) || 0)}
                placeholder="1"
              />
              {errors.quantite && <p className="text-xs text-danger">{errors.quantite}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Valeur estimee</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={valeurEstimee || ''}
                onChange={(e) => setValeurEstimee(Number(e.target.value) || 0)}
                placeholder="0,00"
                className="text-right"
              />
              {errors.valeurEstimee && <p className="text-xs text-danger">{errors.valeurEstimee}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Commentaire (optionnel)</Label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaire..."
              rows={2}
              className={cn(
                'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm',
                'placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary',
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Deposer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { GarantieDepotArticleDialogProps };
