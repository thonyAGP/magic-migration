import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useControleFermetureCaisseStore } from '@/stores/controleFermetureCaisseStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

type Step = 'params' | 'recap' | 'ecarts' | 'pointages' | 'final';

const STEPS = [
  { id: 'params' as const, label: 'Paramètres' },
  { id: 'recap' as const, label: 'Récapitulatif' },
  { id: 'ecarts' as const, label: 'Écarts' },
  { id: 'pointages' as const, label: 'Pointages' },
  { id: 'final' as const, label: 'Finalisation' },
];

export function ControleFermetureCaissePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const sessionId = useControleFermetureCaisseStore((s) => s.sessionId);
  const deviseLocale = useControleFermetureCaisseStore((s) => s.deviseLocale);
  const parametreUniBi = useControleFermetureCaisseStore((s) => s.parametreUniBi);
  const parametreKT = useControleFermetureCaisseStore((s) => s.parametreKT);
  const parametre2Caisses = useControleFermetureCaisseStore((s) => s.parametre2Caisses);
  const hostCourantCoffre = useControleFermetureCaisseStore((s) => s.hostCourantCoffre);
  const sessionOuverte = useControleFermetureCaisseStore((s) => s.sessionOuverte);
  const terminalCoffre2 = useControleFermetureCaisseStore((s) => s.terminalCoffre2);
  const hostnameCoffre2 = useControleFermetureCaisseStore((s) => s.hostnameCoffre2);
  const ecarts = useControleFermetureCaisseStore((s) => s.ecarts);
  const devisesPointees = useControleFermetureCaisseStore((s) => s.devisesPointees);
  const articlesPointes = useControleFermetureCaisseStore((s) => s.articlesPointes);
  const approRemisesPointes = useControleFermetureCaisseStore((s) => s.approRemisesPointes);
  const tableauRecap = useControleFermetureCaisseStore((s) => s.tableauRecap);
  const isLoading = useControleFermetureCaisseStore((s) => s.isLoading);
  const error = useControleFermetureCaisseStore((s) => s.error);
  const validationErrors = useControleFermetureCaisseStore((s) => s.validationErrors);

  const setParametreUniBi = useControleFermetureCaisseStore((s) => s.setParametreUniBi);
  const setParametreKT = useControleFermetureCaisseStore((s) => s.setParametreKT);
  const setParametre2Caisses = useControleFermetureCaisseStore((s) => s.setParametre2Caisses);
  const setTerminalCoffre2 = useControleFermetureCaisseStore((s) => s.setTerminalCoffre2);
  const setHostnameCoffre2 = useControleFermetureCaisseStore((s) => s.setHostnameCoffre2);
  const validerParametresUniBi = useControleFermetureCaisseStore((s) => s.validerParametresUniBi);
  const validerConfiguration2Caisses = useControleFermetureCaisseStore((s) => s.validerConfiguration2Caisses);
  const traiterModeKasse = useControleFermetureCaisseStore((s) => s.traiterModeKasse);
  const configurerCoffre2 = useControleFermetureCaisseStore((s) => s.configurerCoffre2);
  const genererTableauRecap = useControleFermetureCaisseStore((s) => s.genererTableauRecap);
  const calculerEcarts = useControleFermetureCaisseStore((s) => s.calculerEcarts);
  const chargerPointages = useControleFermetureCaisseStore((s) => s.chargerPointages);
  const finaliserFermeture = useControleFermetureCaisseStore((s) => s.finaliserFermeture);
  const reset = useControleFermetureCaisseStore((s) => s.reset);

  const [currentStep, setCurrentStep] = useState<Step>('params');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [montantsDeclares, setMontantsDeclares] = useState<Record<string, number>>({});

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleValidateParams = useCallback(async () => {
    const unibiValid = await validerParametresUniBi(parametreUniBi);
    if (!unibiValid) return;

    const configValid = await validerConfiguration2Caisses(
      parametre2Caisses,
      hostCourantCoffre,
      sessionOuverte,
    );
    if (!configValid) return;

    await traiterModeKasse(parametreKT);

    if (parametre2Caisses) {
      await configurerCoffre2(parametre2Caisses, terminalCoffre2, hostnameCoffre2);
    }

    setCurrentStep('recap');
  }, [
    parametreUniBi,
    parametre2Caisses,
    hostCourantCoffre,
    sessionOuverte,
    parametreKT,
    terminalCoffre2,
    hostnameCoffre2,
    validerParametresUniBi,
    validerConfiguration2Caisses,
    traiterModeKasse,
    configurerCoffre2,
  ]);

  const handleGenerateRecap = useCallback(async () => {
    if (!sessionId) return;
    await genererTableauRecap(sessionId);
    setCurrentStep('ecarts');
  }, [sessionId, genererTableauRecap]);

  const handleCalculateEcarts = useCallback(async () => {
    if (!sessionId) return;
    await calculerEcarts(sessionId, montantsDeclares);
    setCurrentStep('pointages');
  }, [sessionId, montantsDeclares, calculerEcarts]);

  const handleLoadPointages = useCallback(async () => {
    if (!sessionId) return;
    await chargerPointages(sessionId);
    setCurrentStep('final');
  }, [sessionId, chargerPointages]);

  const handleFinalize = useCallback(async () => {
    if (!sessionId) return;
    await finaliserFermeture(sessionId);
    setShowConfirmDialog(false);
    navigate('/caisse/menu');
  }, [sessionId, finaliserFermeture, navigate]);

  const hasEcartsAlert = ecarts.some((e) => Math.abs(e.ecart) > 0);

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Contrôle fermeture caisse</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {sessionId ? `Session #${sessionId}` : 'Validation des paramètres'}
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        <div className="flex gap-2 border-b border-border pb-2">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={cn(
                'flex-1 text-center py-2 text-sm font-medium border-b-2 transition-colors',
                currentStep === step.id
                  ? 'border-primary text-primary'
                  : idx < STEPS.findIndex((s) => s.id === currentStep)
                    ? 'border-green-500 text-green-700'
                    : 'border-transparent text-on-surface-muted',
              )}
            >
              {step.label}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm space-y-1">
            {validationErrors.map((err, idx) => (
              <div key={idx}>• {err}</div>
            ))}
          </div>
        )}

        {currentStep === 'params' && (
          <div className="space-y-6 bg-surface p-6 rounded-md border border-border">
            <div>
              <label className="block text-sm font-medium mb-2">Mode caisse (UNI/BI)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="unibi"
                    checked={parametreUniBi === 'U'}
                    onChange={() => setParametreUniBi('U')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Unidirectionnel</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="unibi"
                    checked={parametreUniBi === 'B'}
                    onChange={() => setParametreUniBi('B')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Bidirectionnel</span>
                </label>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={parametre2Caisses}
                  onChange={(e) => setParametre2Caisses(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">2 Caisses</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type terminal (K/T)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kt"
                    checked={parametreKT === 'K'}
                    onChange={() => setParametreKT('K')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Kasse</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kt"
                    checked={parametreKT === 'T'}
                    onChange={() => setParametreKT('T')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Terminal</span>
                </label>
              </div>
            </div>

            {parametre2Caisses && (
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Terminal coffre 2</label>
                  <Input
                    type="number"
                    value={terminalCoffre2 ?? ''}
                    onChange={(e) =>
                      setTerminalCoffre2(e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="Numéro terminal"
                    className="max-w-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hostname coffre 2</label>
                  <Input
                    type="text"
                    value={hostnameCoffre2}
                    onChange={(e) => setHostnameCoffre2(e.target.value)}
                    placeholder="Hostname"
                    className="max-w-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleValidateParams} disabled={isLoading}>
                {isLoading ? 'Validation...' : 'Valider et continuer'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'recap' && (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-md border border-border">
              <h3 className="font-semibold mb-4">Tableau récapitulatif</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : tableauRecap.length === 0 ? (
                <p className="text-on-surface-muted text-sm text-center py-8">
                  Aucune donnée disponible. Cliquez sur Générer.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-border">
                    <thead className="bg-surface-hover">
                      <tr>
                        {Object.keys(tableauRecap[0] || {}).map((key) => (
                          <th key={key} className="px-4 py-2 text-left text-xs font-medium border-b border-border">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableauRecap.map((row, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-surface-hover">
                          {Object.values(row).map((val, vidx) => (
                            <td key={vidx} className="px-4 py-2 text-sm">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('params')}>
                Retour
              </Button>
              <Button onClick={handleGenerateRecap} disabled={isLoading}>
                {tableauRecap.length > 0 ? 'Continuer' : 'Générer'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'ecarts' && (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-md border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Calcul des écarts</h3>
                {hasEcartsAlert && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Écarts détectés
                  </span>
                )}
              </div>

              {ecarts.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-on-surface-muted">
                    Saisissez les montants déclarés pour chaque devise ({deviseLocale}).
                  </p>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Montant déclaré ({deviseLocale})
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={montantsDeclares[deviseLocale] ?? ''}
                      onChange={(e) =>
                        setMontantsDeclares({
                          ...montantsDeclares,
                          [deviseLocale]: Number(e.target.value),
                        })
                      }
                      placeholder="0.00"
                      className="max-w-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-border">
                    <thead className="bg-surface-hover">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium border-b border-border">Devise</th>
                        <th className="px-4 py-2 text-right text-xs font-medium border-b border-border">Attendu</th>
                        <th className="px-4 py-2 text-right text-xs font-medium border-b border-border">Déclaré</th>
                        <th className="px-4 py-2 text-right text-xs font-medium border-b border-border">Écart</th>
                        <th className="px-4 py-2 text-left text-xs font-medium border-b border-border">Classe MOP</th>
                        <th className="px-4 py-2 text-left text-xs font-medium border-b border-border">Libellé</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ecarts.map((ecart, idx) => (
                        <tr
                          key={idx}
                          className={cn(
                            'border-b border-border',
                            Math.abs(ecart.ecart) > 0 && 'bg-red-50',
                          )}
                        >
                          <td className="px-4 py-2 text-sm font-medium">{ecart.deviseCode}</td>
                          <td className="px-4 py-2 text-sm text-right">{ecart.montantAttendu.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-right">{ecart.montantDeclare.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-right font-semibold">
                            {ecart.ecart.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm">{ecart.classeMoyenPaiement || '-'}</td>
                          <td className="px-4 py-2 text-sm">{ecart.libelleMoyenPaiement || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('recap')}>
                Retour
              </Button>
              <Button onClick={handleCalculateEcarts} disabled={isLoading}>
                {ecarts.length > 0 ? 'Continuer' : 'Calculer'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'pointages' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-surface p-4 rounded-md border border-border">
                <h4 className="font-semibold text-sm mb-3">Pointage Devises</h4>
                {devisesPointees.length === 0 ? (
                  <p className="text-xs text-on-surface-muted">Aucune devise pointée</p>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {devisesPointees.map((d, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {d.deviseLocale} ({d.nombreDevises})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-surface p-4 rounded-md border border-border">
                <h4 className="font-semibold text-sm mb-3">Pointage Articles</h4>
                {articlesPointes.length === 0 ? (
                  <p className="text-xs text-on-surface-muted">Aucun article pointé</p>
                ) : (
                  <p className="text-xs">{articlesPointes.length} article(s) en stock</p>
                )}
              </div>

              <div className="bg-surface p-4 rounded-md border border-border">
                <h4 className="font-semibold text-sm mb-3">Pointage Appro/Remises</h4>
                {approRemisesPointes.length === 0 ? (
                  <p className="text-xs text-on-surface-muted">Aucun pointage</p>
                ) : (
                  <p className="text-xs">{approRemisesPointes.length} élément(s)</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('ecarts')}>
                Retour
              </Button>
              <Button onClick={handleLoadPointages} disabled={isLoading}>
                {devisesPointees.length > 0 ? 'Continuer' : 'Charger pointages'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'final' && (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-md border border-border space-y-4">
              <h3 className="font-semibold">Résumé de la session</h3>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <span className="font-medium">Session ID:</span> {sessionId}
                </div>
                <div>
                  <span className="font-medium">Devise locale:</span> {deviseLocale}
                </div>
                <div>
                  <span className="font-medium">Total écarts:</span>{' '}
                  {ecarts.reduce((sum, e) => sum + Math.abs(e.ecart), 0).toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Écarts détectés:</span>{' '}
                  {ecarts.filter((e) => Math.abs(e.ecart) > 0).length}
                </div>
              </div>

              {hasEcartsAlert && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  Attention: Des écarts ont été détectés. Veuillez vérifier avant de finaliser.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('pointages')}>
                Retour
              </Button>
              <Button onClick={() => setShowConfirmDialog(true)} disabled={isLoading}>
                Finaliser fermeture
              </Button>
            </div>
          </div>
        )}

        <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Confirmer la finalisation</h3>
            <p className="text-sm text-on-surface-muted">
              Êtes-vous sûr de vouloir finaliser la fermeture de caisse? Cette action est irréversible.
            </p>
            {hasEcartsAlert && (
              <p className="text-sm text-red-700 font-medium">
                Des écarts ont été détectés. Confirmez-vous la fermeture?
              </p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleFinalize} disabled={isLoading}>
                {isLoading ? 'Finalisation...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
}

export default ControleFermetureCaissePage;
