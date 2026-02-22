import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useRecapFermetureStore } from '@/stores/recapFermetureStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { RemiseEnCaisse } from '@/types/recapFermeture';

type Tab = 'recap' | 'remises' | 'articles' | 'exports';

export function RecapFermeturePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';
  const sessionId = 42;

  const recap = useRecapFermetureStore((s) => s.recap);
  const lignesRecap = useRecapFermetureStore((s) => s.lignesRecap);
  const remises = useRecapFermetureStore((s) => s.remises);
  const articles = useRecapFermetureStore((s) => s.articles);
  const isLoading = useRecapFermetureStore((s) => s.isLoading);
  const error = useRecapFermetureStore((s) => s.error);
  const isPrinting = useRecapFermetureStore((s) => s.isPrinting);
  const modeReimpression = useRecapFermetureStore((s) => s.modeReimpression);
  const printerCourant = useRecapFermetureStore((s) => s.printerCourant);
  const finTache = useRecapFermetureStore((s) => s.finTache);

  const loadRecapFermeture = useRecapFermetureStore((s) => s.loadRecapFermeture);
  const genererTableau = useRecapFermetureStore((s) => s.genererTableau);
  const saveRemise = useRecapFermetureStore((s) => s.saveRemise);
  const setModeReimpression = useRecapFermetureStore((s) => s.setModeReimpression);
  const checkPrinter = useRecapFermetureStore((s) => s.checkPrinter);
  const exportRecap = useRecapFermetureStore((s) => s.exportRecap);
  const reset = useRecapFermetureStore((s) => s.reset);

  const [activeTab, setActiveTab] = useState<Tab>('recap');
  const [editingRemise, setEditingRemise] = useState<RemiseEnCaisse | null>(null);

  useEffect(() => {
    loadRecapFermeture(societe, sessionId);
    return () => reset();
  }, [loadRecapFermeture, reset, societe, sessionId]);

  const handleGenererTableau = useCallback(async () => {
    await genererTableau(societe, sessionId);
  }, [genererTableau, societe, sessionId]);

  const handleSaveRemise = useCallback(async () => {
    if (!editingRemise) return;
    await saveRemise(editingRemise);
    setEditingRemise(null);
  }, [editingRemise, saveRemise]);

  const handlePrint = useCallback(async () => {
    const available = await checkPrinter(printerCourant ?? 1);
    if (!available) {
      alert('Imprimante non disponible');
      return;
    }
    await handleGenererTableau();
  }, [checkPrinter, printerCourant, handleGenererTableau]);

  const handleExport = useCallback(async (format: 'PDF' | 'EXCEL') => {
    const blob = await exportRecap(format);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recap-fermeture-${sessionId}.${format.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [exportRecap, sessionId]);

  const handleSetModeReimpression = useCallback(async (mode: 'D' | 'G' | null) => {
    await setModeReimpression(mode);
  }, [setModeReimpression]);

  const totalGeneral = lignesRecap.reduce((sum, l) => sum + l.montantEquivalent, 0);
  const totalEcarts = lignesRecap.reduce((sum, l) => sum + (l.ecart ?? 0), 0);
  const hasEcarts = lignesRecap.some((l) => l.ecart !== null && Math.abs(l.ecart) > 0.01);

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Récapitulatif de fermeture</h2>
            {recap && (
              <p className="text-on-surface-muted text-sm mt-1">
                Session {recap.session} - {recap.dateDebut.toLocaleDateString('fr-FR')} {recap.heureDebut} - Devise locale: {recap.deviseLocale}
              </p>
            )}
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

        {isLoading ? (
          <div className="text-center py-12 text-on-surface-muted">
            Chargement du récapitulatif...
          </div>
        ) : !recap ? (
          <div className="text-center py-12 text-on-surface-muted">
            Aucune donnée disponible
          </div>
        ) : (
          <>
            <div className="flex gap-2 border-b border-border">
              {(['recap', 'remises', 'articles', 'exports'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 border-b-2 transition-colors',
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-muted hover:text-on-surface'
                  )}
                >
                  {tab === 'recap' && 'Récapitulatif'}
                  {tab === 'remises' && 'Remises en caisse'}
                  {tab === 'articles' && 'Articles'}
                  {tab === 'exports' && 'Exports'}
                </button>
              ))}
            </div>

            {activeTab === 'recap' && (
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-surface-variant">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Type opération
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Montant
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Devise
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Taux
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Équivalent {recap.deviseLocale}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Écart
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-border">
                        {lignesRecap.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-on-surface-muted">
                              Aucune ligne de récapitulatif
                            </td>
                          </tr>
                        ) : (
                          lignesRecap.map((ligne, idx) => (
                            <tr key={idx} className="hover:bg-surface-hover">
                              <td className="px-4 py-3 text-sm text-on-surface">{ligne.typeOperation}</td>
                              <td className="px-4 py-3 text-sm text-right font-mono text-on-surface">
                                {ligne.montantDevise.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-center font-medium text-on-surface">
                                {ligne.codeDevise}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-mono text-on-surface">
                                {ligne.tauxChange !== null ? ligne.tauxChange.toFixed(4) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-mono text-on-surface">
                                {ligne.montantEquivalent.toFixed(2)}
                              </td>
                              <td
                                className={cn(
                                  'px-4 py-3 text-sm text-right font-mono',
                                  ligne.ecart !== null && Math.abs(ligne.ecart) > 0.01
                                    ? 'text-red-600 font-semibold'
                                    : 'text-on-surface-muted'
                                )}
                              >
                                {ligne.ecart !== null ? ligne.ecart.toFixed(2) : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot className="bg-surface-variant font-semibold">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm text-right text-on-surface">
                            Total général:
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-on-surface">
                            {totalGeneral.toFixed(2)}
                          </td>
                          <td
                            className={cn(
                              'px-4 py-3 text-sm text-right font-mono',
                              hasEcarts ? 'text-red-600' : 'text-on-surface-muted'
                            )}
                          >
                            {totalEcarts.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {hasEcarts && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
                    ⚠️ Des écarts ont été détectés. Veuillez vérifier les montants.
                  </div>
                )}

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="bg-surface-variant px-4 py-3 rounded-lg">
                    <div className="text-on-surface-muted text-xs">Devises ouverture</div>
                    <div className="text-lg font-semibold text-on-surface mt-1">{recap.nbreDeviseOuverture}</div>
                  </div>
                  <div className="bg-surface-variant px-4 py-3 rounded-lg">
                    <div className="text-on-surface-muted text-xs">Devises fermeture</div>
                    <div className="text-lg font-semibold text-on-surface mt-1">{recap.nbreDeviseFermeture}</div>
                  </div>
                  <div className="bg-surface-variant px-4 py-3 rounded-lg">
                    <div className="text-on-surface-muted text-xs">Devises calculées</div>
                    <div className="text-lg font-semibold text-on-surface mt-1">{recap.nbreDevisesCalcule}</div>
                  </div>
                  <div className="bg-surface-variant px-4 py-3 rounded-lg">
                    <div className="text-on-surface-muted text-xs">Devises compte</div>
                    <div className="text-lg font-semibold text-on-surface mt-1">{recap.nbreDevisesCompte}</div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => handleSetModeReimpression(modeReimpression === 'D' ? null : 'D')}
                    className={cn(
                      'px-4 py-2 border rounded-md text-sm transition-colors',
                      modeReimpression === 'D'
                        ? 'border-primary bg-primary text-white'
                        : 'border-border text-on-surface hover:bg-surface-hover'
                    )}
                  >
                    Mode détaillé
                  </button>
                  <button
                    onClick={() => handleSetModeReimpression(modeReimpression === 'G' ? null : 'G')}
                    className={cn(
                      'px-4 py-2 border rounded-md text-sm transition-colors',
                      modeReimpression === 'G'
                        ? 'border-primary bg-primary text-white'
                        : 'border-border text-on-surface hover:bg-surface-hover'
                    )}
                  >
                    Mode global
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPrinting ? 'Impression...' : 'Imprimer'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'remises' && (
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-surface-variant">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Détail produit édité
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Montant remise monnaie
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Détail finale édité
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-border">
                        {remises.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-on-surface-muted">
                              Aucune remise en caisse
                            </td>
                          </tr>
                        ) : (
                          remises.map((remise, idx) => (
                            <tr key={idx} className="hover:bg-surface-hover">
                              <td className="px-4 py-3 text-sm text-on-surface">
                                {remise.detailProduitRemiseEdite ? '✓ Oui' : '✗ Non'}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-mono text-on-surface">
                                {remise.montantRemiseMonnaie.toFixed(2)} {recap.deviseLocale}
                              </td>
                              <td className="px-4 py-3 text-sm text-on-surface">
                                {remise.detailRemiseFinaleEdite ? '✓ Oui' : '✗ Non'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => setEditingRemise(remise)}
                                  className="text-primary hover:text-primary-dark text-sm"
                                >
                                  Éditer
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {editingRemise && (
                  <div className="bg-surface-variant p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-on-surface">Éditer la remise</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingRemise.detailProduitRemiseEdite}
                          onChange={(e) =>
                            setEditingRemise({ ...editingRemise, detailProduitRemiseEdite: e.target.checked })
                          }
                          className="rounded border-border"
                        />
                        <span className="text-sm text-on-surface">Détail produit édité</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingRemise.detailRemiseFinaleEdite}
                          onChange={(e) =>
                            setEditingRemise({ ...editingRemise, detailRemiseFinaleEdite: e.target.checked })
                          }
                          className="rounded border-border"
                        />
                        <span className="text-sm text-on-surface">Détail finale édité</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">
                        Montant remise monnaie
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRemise.montantRemiseMonnaie}
                        onChange={(e) =>
                          setEditingRemise({ ...editingRemise, montantRemiseMonnaie: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-surface text-on-surface"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setEditingRemise(null)}
                        className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveRemise}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-surface-variant">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                          Code article
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                          Libellé
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                          Chrono histo
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-on-surface-muted uppercase tracking-wider">
                          Total articles
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-border">
                      {articles.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-on-surface-muted">
                            Aucun article trouvé
                          </td>
                        </tr>
                      ) : (
                        articles.map((article) => (
                          <tr key={article.chronoHisto} className="hover:bg-surface-hover">
                            <td className="px-4 py-3 text-sm font-mono text-on-surface">{article.codeArticle}</td>
                            <td className="px-4 py-3 text-sm text-on-surface">{article.libelleArticle}</td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-on-surface">
                              {article.chronoHisto}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-on-surface">
                              {article.totalArticles}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'exports' && (
              <div className="space-y-6">
                <div className="bg-surface-variant p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-on-surface">Exporter le récapitulatif</h3>
                  <p className="text-sm text-on-surface-muted">
                    Choisissez le format d'export du récapitulatif de fermeture.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleExport('PDF')}
                      className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      Exporter en PDF
                    </button>
                    <button
                      onClick={() => handleExport('EXCEL')}
                      className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      Exporter en Excel
                    </button>
                  </div>
                </div>

                {finTache && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                    ✓ Tâche terminée avec succès
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-start pt-4 border-t border-border">
              <button
                onClick={() => navigate('/caisse/menu')}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Retour au menu
              </button>
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  );
}