import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ArticleApport } from '@/types/apportArticles';

interface ArticleEntryPanelProps {
  className?: string;
  editingArticle?: ArticleApport | null;
  editingIndex?: number | null;
  onAdd: (article: Omit<ArticleApport, 'montant'>) => void;
  onUpdate?: (index: number, article: Omit<ArticleApport, 'montant'>) => void;
  onCancelEdit?: () => void;
}

export const ArticleEntryPanel = ({
  className,
  editingArticle,
  editingIndex,
  onAdd,
  onUpdate,
  onCancelEdit
}: ArticleEntryPanelProps) => {
  const [articleCode, setArticleCode] = useState(editingArticle?.articleCode ?? '');
  const [libelle, setLibelle] = useState(editingArticle?.libelle ?? '');
  const [quantite, setQuantite] = useState(editingArticle?.quantite?.toString() ?? '');
  const [prixUnitaire, setPrixUnitaire] = useState(editingArticle?.prixUnitaire?.toString() ?? '');

  const clearForm = () => {
    setArticleCode('');
    setLibelle('');
    setQuantite('');
    setPrixUnitaire('');
  };

  const handleSubmit = () => {
    const qte = parseFloat(quantite);
    const prix = parseFloat(prixUnitaire);

    if (!articleCode.trim() || !libelle.trim() || isNaN(qte) || isNaN(prix) || qte <= 0 || prix < 0) {
      return;
    }

    const article = {
      articleCode: articleCode.trim(),
      libelle: libelle.trim(),
      quantite: qte,
      prixUnitaire: prix
    };

    if (editingIndex !== null && editingIndex !== undefined && onUpdate) {
      onUpdate(editingIndex, article);
    } else {
      onAdd(article);
    }

    clearForm();
  };

  const handleCancel = () => {
    clearForm();
    onCancelEdit?.();
  };

  const isEditing = editingIndex !== null && editingIndex !== undefined;

  return (
    <div className={cn('bg-white border border-gray-300 rounded p-4', className)}>
      <h3 className="text-sm font-semibold mb-3">
        {isEditing ? 'Modifier Article' : 'Ajouter Article'}
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input
          label="Code Article"
          value={articleCode}
          onChange={(e) => setArticleCode(e.target.value)}
          placeholder="Code..."
          className="text-sm"
        />
        
        <Input
          label="Libellé"
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          placeholder="Libellé..."
          className="text-sm"
        />
        
        <Input
          label="Quantité"
          type="number"
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          placeholder="0"
          min="0"
          step="1"
          className="text-sm"
        />
        
        <Input
          label="Prix Unitaire"
          type="number"
          value={prixUnitaire}
          onChange={(e) => setPrixUnitaire(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          variant="primary"
          className="flex-1"
        >
          {isEditing ? 'Modifier' : 'Ajouter'}
        </Button>
        
        {isEditing && (
          <Button
            onClick={handleCancel}
            variant="secondary"
            className="flex-1"
          >
            Annuler
          </Button>
        )}
      </div>
    </div>
  );
};