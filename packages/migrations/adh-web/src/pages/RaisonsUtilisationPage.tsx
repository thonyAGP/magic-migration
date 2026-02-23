import { useState, useEffect, useCallback } from 'react';
import { ScreenLayout } from '@/components/layout';
import { Dialog, Button, Input } from '@/components/ui';
import { useRaisonsUtilisationStore } from '@/stores/raisonsUtilisationStore';
import { cn } from '@/lib/utils';

const MAX_COMMENTAIRE_LENGTH = 100;

export function RaisonsUtilisationPage() {
  const raisons = useRaisonsUtilisationStore((s) => s.raisons);
  const selectedRaisonPrimaire = useRaisonsUtilisationStore((s) => s.selectedRaisonPrimaire);
  const selectedRaisonSecondaire = useRaisonsUtilisationStore((s) => s.selectedRaisonSecondaire);
  const commentaireSaisi = useRaisonsUtilisationStore((s) => s.commentaireSaisi);
  const confirmation = useRaisonsUtilisationStore((s) => s.confirmation);
  const isLoading = useRaisonsUtilisationStore((s) => s.isLoading);
  const error = useRaisonsUtilisationStore((s) => s.error);
  
  const loadRaisonsUtilisation = useRaisonsUtilisationStore((s) => s.loadRaisonsUtilisation);
  const selectRaisonPrimaire = useRaisonsUtilisationStore((s) => s.selectRaisonPrimaire);
  const selectRaisonSecondaire = useRaisonsUtilisationStore((s) => s.selectRaisonSecondaire);
  const validerSelection = useRaisonsUtilisationStore((s) => s.validerSelection);
  const abandonner = useRaisonsUtilisationStore((s) => s.abandonner);
  const updateCommentaire = useRaisonsUtilisationStore((s) => s.updateCommentaire);
  const reset = useRaisonsUtilisationStore((s) => s.reset);

  const [open, setOpen] = useState(true);

  useEffect(() => {
    loadRaisonsUtilisation();
    return () => reset();
  }, [loadRaisonsUtilisation, reset]);

  useEffect(() => {
    if (confirmation) {
      setOpen(false);
    }
  }, [confirmation]);

  const handleRowClick = useCallback(
    async (idPrimaire: number) => {
      await selectRaisonPrimaire(idPrimaire);
    },
    [selectRaisonPrimaire],
  );

  const handleSecondarySelect = useCallback(
    async (idSecondaire: number) => {
      await selectRaisonSecondaire(idSecondaire);
    },
    [selectRaisonSecondaire],
  );

  const handleValider = useCallback(async () => {
    if (selectedRaisonPrimaire === null) {
      return;
    }
    await validerSelection();
  }, [selectedRaisonPrimaire, validerSelection]);

  const handleAbandonner = useCallback(async () => {
    await abandonner();
    setOpen(false);
  }, [abandonner]);

  const handleCommentaireChange = useCallback(
    (value: string) => {
      if (value.length <= MAX_COMMENTAIRE_LENGTH) {
        updateCommentaire(value);
      }
    },
    [updateCommentaire],
  );

  const selectedPrimaryRaison = raisons.find((r) => r.idPrimaire === selectedRaisonPrimaire);
  const showSecondaryGrid = selectedPrimaryRaison?.existeRaisonSecondaire === true;
  const secondaryRaisons = showSecondaryGrid
    ? raisons.filter((r) => r.idPrimaire === selectedRaisonPrimaire && r.idSecondaire !== null)
    : [];

  const canValidate = selectedRaisonPrimaire !== null && (
    !selectedPrimaryRaison?.existeRaisonSecondaire || selectedRaisonSecondaire !== null
  );

  return (
    <ScreenLayout>
      <Dialog open={open} onClose={handleAbandonner}>
        <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-on-surface">
              Raisons d'utilisation du compte
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-on-surface-muted">Chargement...</div>
              </div>
            ) : (
              <>
                <div className="border border-border rounded-md overflow-hidden">
                  <div className="bg-surface-hover px-4 py-2 grid grid-cols-[100px_100px_1fr] gap-4 border-b border-border font-medium text-sm">
                    <div>Code Primaire</div>
                    <div>Code Secondaire</div>
                    <div>Libellé</div>
                  </div>
                  <div className="divide-y divide-border max-h-60 overflow-y-auto">
                    {raisons
                      .filter((r) => r.idSecondaire === null || !r.existeRaisonSecondaire)
                      .map((raison) => (
                        <button
                          key={raison.idPrimaire}
                          onClick={() => handleRowClick(raison.idPrimaire)}
                          className={cn(
                            'w-full px-4 py-2 grid grid-cols-[100px_100px_1fr] gap-4 text-left hover:bg-surface-hover transition-colors text-sm',
                            selectedRaisonPrimaire === raison.idPrimaire && 'bg-primary/10',
                          )}
                        >
                          <div>{raison.idPrimaire}</div>
                          <div>{raison.idSecondaire ?? '-'}</div>
                          <div>{raison.commentaire}</div>
                        </button>
                      ))}
                    {raisons.filter((r) => r.idSecondaire === null || !r.existeRaisonSecondaire).length === 0 && (
                      <div className="px-4 py-8 text-center text-on-surface-muted text-sm">
                        Aucune raison disponible
                      </div>
                    )}
                  </div>
                </div>

                {showSecondaryGrid && (
                  <div className="border border-border rounded-md overflow-hidden">
                    <div className="bg-surface-hover px-4 py-2 font-medium text-sm border-b border-border">
                      Raisons secondaires
                    </div>
                    <div className="divide-y divide-border max-h-40 overflow-y-auto">
                      {secondaryRaisons.map((raison) => (
                        <button
                          key={raison.idSecondaire}
                          onClick={() => raison.idSecondaire !== null && handleSecondarySelect(raison.idSecondaire)}
                          className={cn(
                            'w-full px-4 py-2 grid grid-cols-[100px_1fr] gap-4 text-left hover:bg-surface-hover transition-colors text-sm',
                            selectedRaisonSecondaire === raison.idSecondaire && 'bg-primary/10',
                          )}
                        >
                          <div>{raison.idSecondaire}</div>
                          <div>{raison.commentaire}</div>
                        </button>
                      ))}
                      {secondaryRaisons.length === 0 && (
                        <div className="px-4 py-4 text-center text-on-surface-muted text-sm">
                          Aucune raison secondaire disponible
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="commentaire" className="block text-sm font-medium text-on-surface">
                    Commentaire (optionnel)
                  </label>
                  <Input
                    id="commentaire"
                    value={commentaireSaisi}
                    onChange={(e) => handleCommentaireChange(e.target.value)}
                    placeholder="Saisir un commentaire..."
                    maxLength={MAX_COMMENTAIRE_LENGTH}
                  />
                  <div className="flex justify-end text-xs text-on-surface-muted">
                    {commentaireSaisi.length} / {MAX_COMMENTAIRE_LENGTH}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <Button variant="secondary" onClick={handleAbandonner}>
              Abandonner
            </Button>
            <Button variant="primary" onClick={handleValider} disabled={!canValidate || isLoading}>
              Valider
            </Button>
          </div>
        </div>
      </Dialog>
    </ScreenLayout>
  );
}

export default RaisonsUtilisationPage;
