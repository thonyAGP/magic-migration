import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from '@/components/ui';
import { useApportArticlesStore } from '@/stores/apportArticlesStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { ArticleApport } from '@/types/apportArticles';

export const ApportArticlesPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const articles = useApportArticlesStore((s) => s.articles);
  const total = useApportArticlesStore((s) => s.total);
  const deviseCode = useApportArticlesStore((s) => s.deviseCode);
  const isExecuting = useApportArticlesStore((s) => s.isExecuting);
  const error = useApportArticlesStore((s) => s.error);
  const editingIndex = useApportArticlesStore((s) => s.editingIndex);
  const addArticle = useApportArticlesStore((s) => s.addArticle);
  const updateArticle = useApportArticlesStore((s) => s.updateArticle);
  const removeArticle = useApportArticlesStore((s) => s.removeArticle);
  const submitApport = useApportArticlesStore((s) => s.submitApport);
  const reset = useApportArticlesStore((s) => s.reset);
  const setEditingIndex = useApportArticlesStore((s) => s.setEditingIndex);
  const _setDeviseCode = useApportArticlesStore((s) => s.setDeviseCode);
  const setError = useApportArticlesStore((s) => s.setError);

  const [articleCode, setArticleCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const clearForm = useCallback(() => {
    setArticleCode('');
    setLibelle('');
    setQuantite('');
    setPrixUnitaire('');
    setEditingIndex(null);
    setError(null);
  }, [setEditingIndex, setError]);

  const handleAddOrUpdate = useCallback(() => {
    if (!articleCode.trim() || !libelle.trim() || !quantite || !prixUnitaire) {
      setError('Tous les champs sont obligatoires');
      return;
    }

    const qty = parseFloat(quantite);
    const prix = parseFloat(prixUnitaire);

    if (isNaN(qty) || qty <= 0) {
      setError('Quantité invalide');
      return;
    }

    if (isNaN(prix) || prix < 0) {
      setError('Prix unitaire invalide');
      return;
    }

    const article: Omit<ArticleApport, 'montant'> = {
      articleCode: articleCode.trim(),
      libelle: libelle.trim(),
      quantite: qty,
      prixUnitaire: prix,
    };

    if (editingIndex !== null) {
      updateArticle(editingIndex, article);
    } else {
      addArticle(article);
    }

    clearForm();
  }, [
    articleCode,
    libelle,
    quantite,
    prixUnitaire,
    editingIndex,
    addArticle,
    updateArticle,
    clearForm,
    setError,
  ]);

  const handleEdit = useCallback(
    (index: number) => {
      const article = articles[index];
      setArticleCode(article.articleCode);
      setLibelle(article.libelle);
      setQuantite(String(article.quantite));
      setPrixUnitaire(String(article.prixUnitaire));
      setEditingIndex(index);
    },
    [articles, setEditingIndex],
  );

  const handleDeleteClick = useCallback((index: number) => {
    setDeleteIndex(index);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteIndex !== null) {
      removeArticle(deleteIndex);
      setDeleteIndex(null);
    }
    setShowDeleteDialog(false);
  }, [deleteIndex, removeArticle]);

  const handleSubmit = useCallback(async () => {
    if (articles.length === 0) {
      setError('Aucun article saisi');
      return;
    }

    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    const sessionId = user.sessionId || 'SESSION-001';
    const operateur = `${user.prenom} ${user.nom}`;

    await submitApport(sessionId, operateur);

    if (!useApportArticlesStore.getState().error) {
      navigate('/caisse/menu');
    }
  }, [articles.length, user, submitApport, navigate, setError]);

  const handleCancel = useCallback(() => {
    navigate('/caisse/menu');
  }, [navigate]);

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Apport Articles</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Saisie des articles vendus à la caisse
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-surface-container border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-base font-medium">Saisie article</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Code article
              </label>
              <Input
                value={articleCode}
                onChange={(e) => setArticleCode(e.target.value)}
                placeholder="ART-001"
                disabled={isExecuting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Libellé</label>
              <Input
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                placeholder="Description article"
                disabled={isExecuting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantité
              </label>
              <Input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                placeholder="1"
                min="0.01"
                step="0.01"
                disabled={isExecuting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Prix unitaire
              </label>
              <Input
                type="number"
                value={prixUnitaire}
                onChange={(e) => setPrixUnitaire(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={isExecuting}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddOrUpdate} disabled={isExecuting}>
              {editingIndex !== null ? 'Modifier' : 'Ajouter'}
            </Button>
            {editingIndex !== null && (
              <Button onClick={clearForm} variant="outline" disabled={isExecuting}>
                Annuler modification
              </Button>
            )}
          </div>
        </div>

        <div className="bg-surface-container border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-hover border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Libellé
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Quantité
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Prix unit.
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-on-surface-muted text-sm"
                    >
                      Aucun article saisi
                    </td>
                  </tr>
                ) : (
                  articles.map((article, index) => (
                    <tr
                      key={index}
                      className={cn(
                        'hover:bg-surface-hover',
                        editingIndex === index && 'bg-blue-50',
                      )}
                    >
                      <td className="px-4 py-3 text-sm">
                        {article.articleCode}
                      </td>
                      <td className="px-4 py-3 text-sm">{article.libelle}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {article.quantite.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {article.prixUnitaire.toFixed(2)} {deviseCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {article.montant.toFixed(2)} {deviseCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(index)}
                            disabled={isExecuting}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteClick(index)}
                            disabled={isExecuting}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-container border border-border rounded-lg p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total général</span>
            <span className="text-2xl font-bold text-primary">
              {total.toFixed(2)} {deviseCode}
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-between">
          <Button onClick={handleCancel} variant="outline" disabled={isExecuting}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isExecuting || articles.length === 0}
          >
            {isExecuting ? 'Enregistrement...' : 'Valider l\'apport'}
          </Button>
        </div>

        {showDeleteDialog && (
          <Dialog open={true} onOpenChange={(open) => !open && setShowDeleteDialog(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-on-surface-muted">
                  Voulez-vous vraiment supprimer cet article ?
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={() => setShowDeleteDialog(false)}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleConfirmDelete} variant="primary">
                    Supprimer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ScreenLayout>
  );
};