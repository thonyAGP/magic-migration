import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Plus, Trash2 } from 'lucide-react';
import { apportProduitsSchema } from './schemas';
import type { ApportProduitsData } from '@/types/caisseOps';

interface ProduitLine {
  codeProduit: string;
  libelle: string;
  quantite: string;
  prixUnitaire: string;
}

interface ApproProduitsFormProps {
  onSubmit: (data: ApportProduitsData) => void;
  isSubmitting: boolean;
}

const emptyLine = (): ProduitLine => ({
  codeProduit: '',
  libelle: '',
  quantite: '1',
  prixUnitaire: '',
});

export function ApproProduitsForm({ onSubmit, isSubmitting }: ApproProduitsFormProps) {
  const [lignes, setLignes] = useState<ProduitLine[]>([emptyLine()]);
  const [error, setError] = useState('');

  const updateLine = (index: number, field: keyof ProduitLine, value: string) => {
    setLignes((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const addLine = () => setLignes((prev) => [...prev, emptyLine()]);

  const removeLine = (index: number) => {
    if (lignes.length <= 1) return;
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const total = lignes.reduce((sum, l) => {
    const qty = Number(l.quantite) || 0;
    const price = Number(l.prixUnitaire) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = () => {
    setError('');
    const produits = lignes.map((l) => ({
      codeProduit: l.codeProduit,
      libelle: l.libelle,
      quantite: Number(l.quantite),
      prixUnitaire: Number(l.prixUnitaire),
    }));

    const parsed = apportProduitsSchema.safeParse({ produits });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Erreur de validation');
      return;
    }

    onSubmit({ produits: parsed.data.produits, montantTotal: total });
  };

  return (
    <div className="space-y-4 bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium">Apport produits</h3>

      <div className="space-y-3">
        {lignes.map((ligne, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-3 space-y-1">
              {idx === 0 && <Label>Code</Label>}
              <Input
                value={ligne.codeProduit}
                onChange={(e) => updateLine(idx, 'codeProduit', e.target.value)}
                placeholder="Code"
              />
            </div>
            <div className="col-span-4 space-y-1">
              {idx === 0 && <Label>Libelle</Label>}
              <Input
                value={ligne.libelle}
                onChange={(e) => updateLine(idx, 'libelle', e.target.value)}
                placeholder="Libelle"
              />
            </div>
            <div className="col-span-2 space-y-1">
              {idx === 0 && <Label>Qte</Label>}
              <Input
                type="number"
                min="1"
                value={ligne.quantite}
                onChange={(e) => updateLine(idx, 'quantite', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              {idx === 0 && <Label>PU</Label>}
              <Input
                type="number"
                min="0"
                step="0.01"
                value={ligne.prixUnitaire}
                onChange={(e) => updateLine(idx, 'prixUnitaire', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="col-span-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLine(idx)}
                disabled={lignes.length <= 1}
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addLine}>
        <Plus className="h-4 w-4 mr-1" /> Ajouter un produit
      </Button>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-medium">
          Total: <span className="text-lg font-bold">{total.toFixed(2)} EUR</span>
        </span>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Validation...' : 'Valider'}
        </Button>
      </div>
    </div>
  );
}
