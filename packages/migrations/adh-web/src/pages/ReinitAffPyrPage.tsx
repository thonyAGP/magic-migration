import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useReinitAffPyrStore } from '@/stores/reinitAffPyrStore';
import { useAuthStore } from '@/stores';

export function ReinitAffPyrPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const isProcessing = useReinitAffPyrStore((s) => s.isProcessing);
  const error = useReinitAffPyrStore((s) => s.error);
  const lastResetCount = useReinitAffPyrStore((s) => s.lastResetCount);
  const reinitAffectationPyr = useReinitAffPyrStore((s) => s.reinitAffectationPyr);
  const resetAllAffectations = useReinitAffPyrStore((s) => s.resetAllAffectations);
  const getAffectationStatus = useReinitAffPyrStore((s) => s.getAffectationStatus);
  const clearError = useReinitAffPyrStore((s) => s.clearError);
  const reset = useReinitAffPyrStore((s) => s.reset);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showTargetDialog, setShowTargetDialog] = useState(false);
  const [societe] = useState('ADH');
  const [compte, setCompte] = useState('');
  const [chambre, setChambre] = useState('');
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadStatus = useCallback(async () => {
    if (!compte) return;
    try {
      const status = await getAffectationStatus(societe, parseInt(compte, 10));
      setActiveCount(status.count);
    } catch {
      setActiveCount(null);
    }
  }, [compte, societe, getAffectationStatus]);

  useEffect(() => {
    if (compte && /^\d+$/.test(compte)) {
      loadStatus();
    } else {
      setActiveCount(null);
    }
  }, [compte, loadStatus]);

  const handleResetAll = useCallback(async () => {
    setShowConfirmDialog(false);
    try {
      const count = await resetAllAffectations();
      setSuccessMessage(`Réinitialisation globale réussie. ${count} affectation(s) réinitialisée(s).`);
      setActiveCount(0);
    } catch {
      // Error already in store
    }
  }, [resetAllAffectations]);

  const handleResetTargeted = useCallback(async () => {
    setShowTargetDialog(false);
    if (!compte || !/^\d+$/.test(compte)) {
      return;
    }
    try {
      const count = await reinitAffectationPyr({
        societe,
        compte: parseInt(compte, 10),
        chambre: chambre.trim() || undefined,
      });
      setSuccessMessage(
        `Réinitialisation ciblée réussie. ${count} affectation(s) réinitialisée(s) pour le compte ${compte}${chambre ? ` (chambre ${chambre})` : ''}.`,
      );
      await loadStatus();
      setChambre('');
    } catch {
      // Error already in store
    }
  }, [compte, chambre, societe, reinitAffectationPyr, loadStatus]);

  const handleBack = () => {
    navigate('/caisse/menu');
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Réinitialiser affectations PYR</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Gestion des affectations PYR dans les dossiers d'hébergement
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
            {error.message}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <div className="bg-surface border border-border rounded-md p-6 space-y-4">
          <h3 className="text-base font-medium">Statut des affectations</h3>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="compte" className="block text-sm font-medium mb-1">
                Compte
              </label>
              <Input
                id="compte"
                type="text"
                value={compte}
                onChange={(e) => setCompte(e.target.value)}
                placeholder="Numéro de compte"
                disabled={isProcessing}
              />
            </div>
            {activeCount !== null && (
              <div className="px-4 py-2 bg-primary-light text-primary rounded-md text-sm font-medium">
                {activeCount} affectation(s) active(s)
              </div>
            )}
          </div>

          {lastResetCount > 0 && (
            <div className="text-sm text-on-surface-muted">
              Dernière réinitialisation: {lastResetCount} affectation(s) modifiée(s)
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-md p-6 space-y-4">
          <h3 className="text-base font-medium">Actions de réinitialisation</h3>
          
          <div className="space-y-3">
            <Button
              onClick={() => setShowTargetDialog(true)}
              disabled={isProcessing || !compte || !/^\d+$/.test(compte)}
              className="w-full"
              variant="default"
            >
              Réinitialiser pour un compte
            </Button>

            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isProcessing}
              className="w-full"
              variant="destructive"
            >
              Réinitialiser toutes les affectations
            </Button>
          </div>
        </div>

        <div className="flex justify-start">
          <Button onClick={handleBack} variant="outline" disabled={isProcessing}>
            Retour au menu
          </Button>
        </div>

        <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirmation</h3>
            <p className="text-on-surface-muted">
              Êtes-vous sûr de vouloir réinitialiser <strong>toutes</strong> les affectations PYR ?
              Cette action affectera tous les comptes de la base de données.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="outline"
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button onClick={handleResetAll} variant="destructive" disabled={isProcessing}>
                {isProcessing ? 'Réinitialisation...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </Dialog>

        <Dialog open={showTargetDialog} onClose={() => setShowTargetDialog(false)}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Réinitialisation ciblée</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="dialog-compte" className="block text-sm font-medium mb-1">
                  Compte
                </label>
                <Input
                  id="dialog-compte"
                  type="text"
                  value={compte}
                  onChange={(e) => setCompte(e.target.value)}
                  placeholder="Numéro de compte"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label htmlFor="chambre" className="block text-sm font-medium mb-1">
                  Chambre (optionnel)
                </label>
                <Input
                  id="chambre"
                  type="text"
                  value={chambre}
                  onChange={(e) => setChambre(e.target.value)}
                  placeholder="Numéro de chambre"
                  disabled={isProcessing}
                />
                <p className="text-xs text-on-surface-muted mt-1">
                  Laissez vide pour réinitialiser toutes les chambres du compte
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowTargetDialog(false);
                  setChambre('');
                }}
                variant="outline"
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                onClick={handleResetTargeted}
                variant="default"
                disabled={isProcessing || !compte || !/^\d+$/.test(compte)}
              >
                {isProcessing ? 'Réinitialisation...' : 'Réinitialiser'}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
}

export default ReinitAffPyrPage;
