import { useState, useCallback, useEffect } from 'react';
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

interface GarantieModificationDialogProps {
  open: boolean;
  onClose: () => void;
  article: GarantieArticle | null;
  onValidate: (updated: GarantieArticle) => void;
}

const modifSchema = z.object({
  code: z.string().min(1, 'Code article requis'),
  libelle: z.string().min(1, 'Description requise'),
  description: z.string().optional().default(''),
  valeurEstimee: z.number().min(0, 'Valeur doit etre >= 0'),
});

export function GarantieModificationDialog({
  open,
  onClose,
  article,
  onValidate,
}: GarantieModificationDialogProps) {
  const [code, setCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [description, setDescription] = useState('');
  const [valeurEstimee, setValeurEstimee] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!article || !open) return;

    setCode(article.code);
    setLibelle(article.libelle);
    setDescription(article.description);
    setValeurEstimee(article.valeurEstimee);
    setErrors({});
  }, [article, open]);

  const handleClose = useCallback(() => {
    setErrors({});
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!article) return;

    const result = modifSchema.safeParse({
      code,
      libelle,
      description,
      valeurEstimee,
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
      ...article,
      code: result.data.code,
      libelle: result.data.libelle,
      description: result.data.description ?? '',
      valeurEstimee: result.data.valeurEstimee,
    });
  }, [article, code, libelle, description, valeurEstimee, onValidate]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'article</DialogTitle>
          <DialogDescription>
            Modifier les informations de l'article en garantie
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

          <div className="space-y-1.5">
            <Label className="text-sm">Commentaire</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { GarantieModificationDialogProps };
