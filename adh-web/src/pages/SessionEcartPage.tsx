import { useState, useEffect, useCallback } from 'react';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useSessionEcartStore } from '@/stores/sessionEcartStore';
import { cn } from '@/lib/utils';
import type { SessionEcart } from '@/types/sessionEcart';

export function SessionEcartPage() {
  const sessionId = useSessionEcartStore((s) => s.sessionId);
  const deviseCode = useSessionEcartStore((s) => s.deviseCode);
  const caisseComptee = useSessionEcartStore((s) => s.caisseComptee);
  const soldePrecedent = useSessionEcartStore((s) => s.soldePrecedent);
  const montantEcart = useSessionEcartStore((s) => s.montantEcart);
  const commentaire = useSessionEcartStore((s) => s.commentaire);
  const commentaireDevise = useSessionEcartStore((s) => s.commentaireDevise);
  const isLoading = useSessionEcartStore((s) => s.isLoading);
  const error = useSessionEcartStore((s) => s.error);
  const ecartSaved = useSessionEcartStore((s) => s.ecartSaved);
  const seuilAlerte = useSessionEcartStore((s) => s.seuilAlerte);

  const calculerEcart = useSessionEcartStore((s) => s.calculerEcart);
  const validerSeuilEcart = useSessionEcartStore((s) => s.validerSeuilEcart);
  const sauvegarderEcart = useSessionEcartStore((s) => s.sauvegarderEcart);
  const setSessionId = useSessionEcartStore((s) => s.setSessionId);
  const setDeviseCode = useSessionEcartStore((s) => s.setDeviseCode);
  const setCaisseComptee = useSessionEcartStore((s) => s.setCaisseComptee);
  const setSoldePrecedent = useSessionEcartStore((s) => s.setSoldePrecedent);
  const setCommentaire = useSessionEcartStore((s) => s.setCommentaire);
  const setCommentaireDevise = useSessionEcartStore((s) => s.setCommentaireDevise);
  const setSeuilAlerte = useSessionEcartStore((s) => s.setSeuilAlerte);
  const setError = useSessionEcartStore((s) => s.setError);
  const reset = useSessionEcartStore((s) => s.reset);

  const [showDialog, setShowDialog] = useState(false);
  const [tempCaisseComptee, setTempCaisseComptee] = useState('');
  const [tempSoldePrecedent, setTempSoldePrecedent] = useState('');

  useEffect(() => {
    setSessionId(1);
    setDeviseCode('EUR');
    setSoldePrecedent(1250.75);
    setSeuilAlerte(50);
    
    return () => reset();
  }, [reset, setSessionId, setDeviseCode, setSoldePrecedent, setSeuilAlerte]);

  useEffect(() => {
    if (caisseComptee > 0 || soldePrecedent > 0) {
      calculerEcart(caisseComptee, soldePrecedent);
    }
  }, [caisseComptee, soldePrecedent, calculerEcart]);

  const handleOpenDialog = useCallback(() => {
    setTempCaisseComptee('');
    setTempSoldePrecedent(soldePrecedent.toString());
    setShowDialog(true);
  }, [soldePrecedent]);

  const handleCloseDialog = useCallback(() => {
    setShowDialog(false);
    setError(null);
  }, [setError]);

  const handleCalculateEcart = useCallback(() => {
    const caisse = parseFloat(tempCaisseComptee) || 0;
    const solde = parseFloat(tempSoldePrecedent) || soldePrecedent;
    
    setCaisseComptee(caisse);
    setSoldePrecedent(solde);
    calculerEcart(caisse, solde);
    setShowDialog(false);
  }, [tempCaisseComptee, tempSoldePrecedent, soldePrecedent, setCaisseComptee, setSoldePrecedent, calculerEcart]);

  const handleValidate = useCallback(async () => {
    if (!sessionId || !deviseCode) {
      setError('Session ou devise manquante');
      return;
    }

    const validation = validerSeuilEcart(montantEcart, seuilAlerte);
    
    if (validation.exceeded && !commentaire.trim()) {
      setError('Un commentaire est obligatoire pour un écart supérieur au seuil');
      return;
    }

    if (validation.blocking && !commentaire.trim()) {
      setError('Un commentaire est obligatoire pour un écart bloquant');
      return;
    }

    const ecart: SessionEcart = {
      sessionId,
      deviseCode,
      quand: 'F',
      caisseComptee,
      montantEcart,
      commentaire: commentaire.trim() || null,
      commentaireDevise: commentaireDevise.trim() || null,
    };

    await sauvegarderEcart(ecart);
  }, [
    sessionId,
    deviseCode,
    montantEcart,
    caisseComptee,
    commentaire,
    commentaireDevise,
    seuilAlerte,
    validerSeuilEcart,
    sauvegarderEcart,
    setError,
  ]);

  const validation = validerSeuilEcart(montantEcart, seuilAlerte);
  const formatAmount = (amount: number) => `${amount.toFixed(2)} ${deviseCode || 'EUR'}`;

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-xl font-semibold">Saisie des écarts de caisse</h2>
          <p className="text-on-surface-muted text-sm mt-1">
            Gestion des écarts entre le solde précédent et la caisse comptée
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {ecartSaved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            Écart sauvegardé avec succès
          </div>
        )}

        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Devise</label>
              <div className="px-3 py-2 bg-surface-muted rounded-md text-on-surface">
                {deviseCode || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Solde précédent</label>
              <div className="px-3 py-2 bg-surface-muted rounded-md text-on-surface">
                {formatAmount(soldePrecedent)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Caisse comptée</label>
              <div className="px-3 py-2 bg-surface-muted rounded-md text-on-surface">
                {caisseComptee > 0 ? formatAmount(caisseComptee) : '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Montant écart</label>
              <div
                className={cn(
                  'px-3 py-2 rounded-md font-semibold',
                  validation.blocking
                    ? 'bg-red-100 text-red-700'
                    : validation.exceeded
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-surface-muted text-on-surface'
                )}
              >
                {montantEcart !== 0 ? formatAmount(montantEcart) : '-'}
              </div>
            </div>
          </div>

          {validation.exceeded && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
              ⚠️ L'écart dépasse le seuil d'alerte ({seuilAlerte} {deviseCode})
              {validation.blocking && ' - Écart bloquant détecté'}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="commentaire" className="block text-sm font-medium mb-1">
              Commentaire {validation.exceeded && <span className="text-red-600">*</span>}
            </label>
            <textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={validation.exceeded ? 'Obligatoire pour un écart supérieur au seuil' : 'Optionnel'}
            />
          </div>

          <div>
            <label htmlFor="commentaireDevise" className="block text-sm font-medium mb-1">
              Commentaire devise (optionnel)
            </label>
            <textarea
              id="commentaireDevise"
              value={commentaireDevise}
              onChange={(e) => setCommentaireDevise(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Notes supplémentaires sur la devise"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleOpenDialog}>
            Nouvelle saisie
          </Button>
          <Button
            variant="primary"
            onClick={handleValidate}
            disabled={isLoading || caisseComptee === 0}
          >
            {isLoading ? 'Enregistrement...' : 'Valider l\'écart'}
          </Button>
        </div>

        <Dialog open={showDialog} onClose={handleCloseDialog} title="Saisie caisse comptée">
          <div className="space-y-4">
            <div>
              <label htmlFor="tempSoldePrecedent" className="block text-sm font-medium mb-1">
                Solde précédent
              </label>
              <Input
                id="tempSoldePrecedent"
                type="number"
                step="0.01"
                value={tempSoldePrecedent}
                onChange={(e) => setTempSoldePrecedent(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="tempCaisseComptee" className="block text-sm font-medium mb-1">
                Caisse comptée <span className="text-red-600">*</span>
              </label>
              <Input
                id="tempCaisseComptee"
                type="number"
                step="0.01"
                value={tempCaisseComptee}
                onChange={(e) => setTempCaisseComptee(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleCalculateEcart}
                disabled={!tempCaisseComptee}
              >
                Calculer l'écart
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
}