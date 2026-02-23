import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useSaisieContenuCaisseStore } from '@/stores/saisieContenuCaisseStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

type Phase = 'comptage' | 'recapitulatif' | 'confirmation';

export const SaisieContenuCaissePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const sessionId = Number(searchParams.get('sessionId')) || null;
  const quand = (searchParams.get('quand') as 'O' | 'F') || null;

  const activeDevise = useSaisieContenuCaisseStore((s) => s.activeDevise);
  const comptageDevises = useSaisieContenuCaisseStore((s) => s.comptageDevises);
  const recapMOP = useSaisieContenuCaisseStore((s) => s.recapMOP);
  const validationResult = useSaisieContenuCaisseStore(
    (s) => s.validationResult,
  );
  const isValidating = useSaisieContenuCaisseStore((s) => s.isValidating);
  const validationError = useSaisieContenuCaisseStore((s) => s.validationError);
  const isPersisting = useSaisieContenuCaisseStore((s) => s.isPersisting);
  const canSubmit = useSaisieContenuCaisseStore((s) => s.canSubmit);
  const devisesAutorisees = useSaisieContenuCaisseStore(
    (s) => s.devisesAutorisees,
  );

  const initComptage = useSaisieContenuCaisseStore((s) => s.initComptage);
  const updateQuantite = useSaisieContenuCaisseStore((s) => s.updateQuantite);
  const switchDevise = useSaisieContenuCaisseStore((s) => s.switchDevise);
  const validateComptage = useSaisieContenuCaisseStore(
    (s) => s.validateComptage,
  );
  const loadRecapMOP = useSaisieContenuCaisseStore((s) => s.loadRecapMOP);
  const persistComptage = useSaisieContenuCaisseStore((s) => s.persistComptage);
  const resetState = useSaisieContenuCaisseStore((s) => s.resetState);
  const setValidationError = useSaisieContenuCaisseStore(
    (s) => s.setValidationError,
  );

  const [phase, setPhase] = useState<Phase>('comptage');
  const [persistResult, setPersistResult] = useState<{
    success: boolean;
    ticketUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (sessionId && quand && devisesAutorisees.length === 0) {
      initComptage(sessionId, quand, ['EUR', 'USD', 'GBP']);
    }
  }, [sessionId, quand, devisesAutorisees.length, initComptage]);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  const handleQuantiteChange = useCallback(
    (denominationId: number, quantite: number) => {
      if (!activeDevise) return;
      updateQuantite(activeDevise, denominationId, quantite);
    },
    [activeDevise, updateQuantite],
  );

  const handleValidate = useCallback(async () => {
    setValidationError(null);
    const result = await validateComptage();
    if (result && sessionId) {
      await loadRecapMOP(sessionId);
      setPhase('recapitulatif');
    }
  }, [validateComptage, loadRecapMOP, sessionId, setValidationError]);

  const handleConfirm = useCallback(async () => {
    if (!sessionId || !validationResult) return;
    const result = await persistComptage(sessionId, validationResult);
    if (result.success) {
      setPersistResult(result);
      setPhase('confirmation');
    }
  }, [sessionId, validationResult, persistComptage]);

  const handlePrint = useCallback(() => {
    if (persistResult?.ticketUrl) {
      window.open(persistResult.ticketUrl, '_blank');
    }
  }, [persistResult]);

  const handleReturn = useCallback(() => {
    resetState();
    navigate('/caisse/menu');
  }, [resetState, navigate]);

  const handleBack = useCallback(() => {
    if (phase === 'recapitulatif') {
      setPhase('comptage');
      setValidationError(null);
    } else if (phase === 'confirmation') {
      handleReturn();
    } else {
      handleReturn();
    }
  }, [phase, handleReturn, setValidationError]);

  const activeComptage = activeDevise
    ? comptageDevises.get(activeDevise)
    : null;

  if (!sessionId || !quand) {
    return (
      <ScreenLayout>
        <div className="text-center py-12">
          <p className="text-on-surface-muted">
            Paramètres manquants (sessionId ou quand)
          </p>
          <Button onClick={handleReturn} className="mt-4">
            Retour au menu
          </Button>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Saisie contenu caisse -{' '}
              {quand === 'O' ? 'Ouverture' : 'Fermeture'}
            </h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Session #{sessionId}
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {validationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {validationError}
          </div>
        )}

        {phase === 'comptage' && (
          <>
            <div className="border-b border-border">
              <div className="flex gap-2">
                {devisesAutorisees.map((code) => (
                  <button
                    key={code}
                    onClick={() => switchDevise(code)}
                    className={cn(
                      'px-4 py-2 border-b-2 transition-colors',
                      activeDevise === code
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-on-surface-muted hover:text-on-surface',
                    )}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {activeComptage && (
              <div className="space-y-4">
                <div className="bg-surface rounded-lg border border-border p-4">
                  <h3 className="font-medium mb-4">
                    Comptage {activeComptage.deviseLibelle}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {activeComptage.denominations.map((denom) => (
                      <div
                        key={denom.denominationId}
                        className="flex items-center gap-2 p-2 border border-border rounded"
                      >
                        <label className="flex-1 text-sm font-medium">
                          {denom.valeur}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={denom.quantite}
                          onChange={(e) =>
                            handleQuantiteChange(
                              denom.denominationId,
                              Number(e.target.value) || 0,
                            )
                          }
                          className="w-16 px-2 py-1 border border-border rounded text-sm text-right"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total {activeDevise}</span>
                    <span className="text-lg font-semibold">
                      {activeComptage.totalSaisi.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-between">
              <Button onClick={handleBack} variant="outline">
                Annuler
              </Button>
              <Button
                onClick={handleValidate}
                disabled={!canSubmit || isValidating}
              >
                {isValidating ? 'Validation...' : 'Valider le comptage'}
              </Button>
            </div>
          </>
        )}

        {phase === 'recapitulatif' && (
          <>
            <div className="space-y-4">
              <div className="bg-surface rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-hover">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">MOP</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Attendu
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Compté
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Écart
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recapMOP.map((ligne, idx) => (
                      <tr
                        key={idx}
                        className={cn(
                          'border-t border-border',
                          ligne.ecart !== 0 && 'bg-red-50',
                        )}
                      >
                        <td className="px-4 py-3">
                          {ligne.moyenPaiementLibelle}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {ligne.attendu.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {ligne.compte.toFixed(2)}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-3 text-right font-medium',
                            ligne.ecart !== 0 && 'text-red-700',
                          )}
                        >
                          {ligne.ecart.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validationResult && (
                <div className="bg-surface rounded-lg border border-border p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Caisse</span>
                    <span className="font-medium">
                      {validationResult.totalCaisse.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Monnaie</span>
                    <span className="font-medium">
                      {validationResult.totalMonnaie.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Produits</span>
                    <span className="font-medium">
                      {validationResult.totalProduits.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Cartes</span>
                    <span className="font-medium">
                      {validationResult.totalCartes.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Chèques</span>
                    <span className="font-medium">
                      {validationResult.totalCheques.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total O/D</span>
                    <span className="font-medium">
                      {validationResult.totalOD.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                    <span>Nombre devises</span>
                    <span>{validationResult.nbreDevise}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-between">
              <Button onClick={handleBack} variant="outline">
                Retour au comptage
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isPersisting || !validationResult?.shouldProcess}
              >
                {isPersisting ? 'Enregistrement...' : 'Confirmer'}
              </Button>
            </div>
          </>
        )}

        {phase === 'confirmation' && persistResult && (
          <>
            <div className="text-center py-12 space-y-4">
              {persistResult.success ? (
                <>
                  <div className="text-green-600 text-5xl">✓</div>
                  <h3 className="text-xl font-semibold">
                    Comptage enregistré avec succès
                  </h3>
                  <p className="text-on-surface-muted">
                    Session #{sessionId} - Comptage validé
                  </p>
                </>
              ) : (
                <>
                  <div className="text-red-600 text-5xl">✗</div>
                  <h3 className="text-xl font-semibold">Erreur</h3>
                  <p className="text-on-surface-muted">
                    Impossible d'enregistrer le comptage
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              {persistResult.ticketUrl && (
                <Button onClick={handlePrint} variant="outline">
                  Imprimer le ticket
                </Button>
              )}
              <Button onClick={handleReturn}>Retour au menu</Button>
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  );
};

export default SaisieContenuCaissePage;
