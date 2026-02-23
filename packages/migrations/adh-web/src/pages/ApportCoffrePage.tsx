import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, DialogContent, DialogHeader, Input } from '@/components/ui';
import { useApportCoffreStore } from '@/stores/apportCoffreStore';
import { useAuthStore } from '@/stores';
import { CONTEXT_LABELS, APPORT_COFFRE_VALIDATION } from '@/types/apportCoffre';
import { cn } from '@/lib/utils';

type ApportContext = 'O' | 'F' | 'G';

export function ApportCoffrePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const devises = useApportCoffreStore((s) => s.devises);
  const isExecuting = useApportCoffreStore((s) => s.isExecuting);
  const error = useApportCoffreStore((s) => s.error);
  const deviseSelectionnee = useApportCoffreStore((s) => s.deviseSelectionnee);
  const montantSaisi = useApportCoffreStore((s) => s.montantSaisi);
  const chargerDevises = useApportCoffreStore((s) => s.chargerDevises);
  const validerApport = useApportCoffreStore((s) => s.validerApport);
  const setDeviseSelectionnee = useApportCoffreStore((s) => s.setDeviseSelectionnee);
  const setMontantSaisi = useApportCoffreStore((s) => s.setMontantSaisi);
  const setError = useApportCoffreStore((s) => s.setError);
  const reset = useApportCoffreStore((s) => s.reset);

  const [context, setContext] = useState<ApportContext>('G');
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await chargerDevises();
      setIsLoading(false);
    };
    init();
    return () => reset();
  }, [chargerDevises, reset]);

  const handleDeviseChange = useCallback(
    (code: string) => {
      setDeviseSelectionnee(code);
      setError(null);
    },
    [setDeviseSelectionnee, setError],
  );

  const handleMontantChange = useCallback(
    (value: string) => {
      const montant = parseFloat(value) || 0;
      setMontantSaisi(montant);
      setError(null);
    },
    [setMontantSaisi, setError],
  );

  const handleValider = useCallback(async () => {
    if (!deviseSelectionnee) {
      setError('Veuillez sélectionner une devise');
      return;
    }
    if (montantSaisi < APPORT_COFFRE_VALIDATION.MONTANT_MIN) {
      setError(`Le montant minimum est ${APPORT_COFFRE_VALIDATION.MONTANT_MIN.toFixed(2)} €`);
      return;
    }
    if (montantSaisi > APPORT_COFFRE_VALIDATION.MONTANT_MAX) {
      setError(`Le montant maximum est ${APPORT_COFFRE_VALIDATION.MONTANT_MAX.toFixed(2)} €`);
      return;
    }

    await validerApport(deviseSelectionnee, montantSaisi, context);
    if (!error) {
      setShowDialog(false);
    }
  }, [deviseSelectionnee, montantSaisi, context, validerApport, setError, error]);

  const handleAnnuler = useCallback(() => {
    setShowDialog(false);
    setDeviseSelectionnee(null);
    setMontantSaisi(0);
    setError(null);
  }, [setDeviseSelectionnee, setMontantSaisi, setError]);

  const handleRetour = () => {
    navigate('/caisse/menu');
  };

  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(montant);
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Apport coffre</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Enregistrement d'un apport en coffre
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="text-on-surface-muted">Chargement des devises...</div>
          </div>
        )}

        {!isLoading && devises.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
            Aucune devise autorisée disponible
          </div>
        )}

        {!isLoading && devises.length > 0 && (
          <>
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Contexte
                </label>
                <div className="flex gap-2">
                  {(['O', 'F', 'G'] as ApportContext[]).map((ctx) => (
                    <button
                      key={ctx}
                      onClick={() => setContext(ctx)}
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        context === ctx
                          ? 'bg-primary text-white'
                          : 'bg-surface-hover text-on-surface hover:bg-surface-hover',
                      )}
                    >
                      {CONTEXT_LABELS[ctx]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={() => setShowDialog(true)} className="px-6 py-3">
                  Nouvel apport
                </Button>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                onClick={handleRetour}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Retour au menu
              </button>
            </div>
          </>
        )}

        {showDialog && (
          <Dialog open={true} onOpenChange={(open) => !open && handleAnnuler()}>
            <DialogContent>
              <div className="space-y-4">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Apport coffre</h3>
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {CONTEXT_LABELS[context]}
                    </span>
                  </div>
                </DialogHeader>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="devise" className="block text-sm font-medium text-on-surface mb-2">
                    Devise
                  </label>
                  <select
                    id="devise"
                    value={deviseSelectionnee || ''}
                    onChange={(e) => handleDeviseChange(e.target.value)}
                    disabled={isExecuting}
                    className="w-full px-3 py-2 border border-border rounded-md bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">-- Sélectionner une devise --</option>
                    {devises.map((devise) => (
                      <option key={devise.code} value={devise.code}>
                        {devise.code} - {devise.libelle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="montant" className="block text-sm font-medium text-on-surface mb-2">
                    Montant
                  </label>
                  <Input
                    id="montant"
                    type="number"
                    value={montantSaisi === 0 ? '' : montantSaisi.toString()}
                    onChange={(e) => handleMontantChange(e.target.value)}
                    disabled={isExecuting}
                    min={APPORT_COFFRE_VALIDATION.MONTANT_MIN}
                    max={APPORT_COFFRE_VALIDATION.MONTANT_MAX}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full"
                  />
                  {montantSaisi > 0 && (
                    <p className="text-xs text-on-surface-muted mt-1">
                      {formatMontant(montantSaisi)}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <Button variant="secondary" onClick={handleAnnuler} disabled={isExecuting}>
                    Annuler
                  </Button>
                  <Button onClick={handleValider} disabled={isExecuting}>
                    {isExecuting ? 'Traitement...' : 'Valider'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ScreenLayout>
  );
}