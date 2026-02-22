import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useSoldeOuvertureStore } from '@/stores/soldeOuvertureStore';
import { useAuthStore } from '@/stores';
import type { DeviseConversion, CoherenceValidationResult } from '@/types/soldeOuverture';
import { cn } from '@/lib/utils';

const ALERT_TYPES = {
  MISSING_RATE: 'MISSING_RATE',
  INVALID_RATE: 'INVALID_RATE',
  NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT',
  ZERO_AMOUNT: 'ZERO_AMOUNT',
} as const;

interface Alert {
  type: keyof typeof ALERT_TYPES;
  devise: string;
  message: string;
}

const detectAnomalies = (details: DeviseConversion[]): Alert[] => {
  const alerts: Alert[] = [];
  
  details.forEach((d) => {
    if (d.tauxChange <= 0) {
      alerts.push({
        type: 'INVALID_RATE',
        devise: d.devise,
        message: `Taux de change invalide pour ${d.devise}`,
      });
    }
    if (d.montant < 0) {
      alerts.push({
        type: 'NEGATIVE_AMOUNT',
        devise: d.devise,
        message: `Montant négatif pour ${d.devise}`,
      });
    }
    if (d.montant === 0) {
      alerts.push({
        type: 'ZERO_AMOUNT',
        devise: d.devise,
        message: `Montant nul pour ${d.devise}`,
      });
    }
  });
  
  return alerts;
};

export function SoldeOuverturePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';

  const soldeOuverture = useSoldeOuvertureStore((s) => s.soldeOuverture);
  const moyensReglement = useSoldeOuvertureStore((s) => s.moyensReglement);
  const devisesSessions = useSoldeOuvertureStore((s) => s.devisesSessions);
  const isLoading = useSoldeOuvertureStore((s) => s.isLoading);
  const error = useSoldeOuvertureStore((s) => s.error);
  const isCalculating = useSoldeOuvertureStore((s) => s.isCalculating);
  const calculationResult = useSoldeOuvertureStore((s) => s.calculationResult);
  const loadSoldeOuverture = useSoldeOuvertureStore((s) => s.loadSoldeOuverture);
  const calculerSoldeOuverture = useSoldeOuvertureStore((s) => s.calculerSoldeOuverture);
  const updateDeviseSession = useSoldeOuvertureStore((s) => s.updateDeviseSession);
  const validerCoherenceSolde = useSoldeOuvertureStore((s) => s.validerCoherenceSolde);
  const clearError = useSoldeOuvertureStore((s) => s.clearError);
  const reset = useSoldeOuvertureStore((s) => s.reset);

  const [sessionId, setSessionId] = useState('');
  const [coherenceValidation, setCoherenceValidation] = useState<CoherenceValidationResult | null>(null);
  const [showCoherenceDialog, setShowCoherenceDialog] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  useEffect(() => {
    if (calculationResult?.details) {
      setAlerts(detectAnomalies(calculationResult.details));
    }
  }, [calculationResult]);

  const handleLoadSolde = useCallback(async () => {
    if (!sessionId.trim()) return;
    await loadSoldeOuverture(societe, Number(sessionId));
  }, [sessionId, loadSoldeOuverture, societe]);

  const handleCalculer = useCallback(async () => {
    if (!sessionId.trim()) return;
    const result = await calculerSoldeOuverture(societe, Number(sessionId));
    if (result && soldeOuverture) {
      const validation = await validerCoherenceSolde(soldeOuverture.soldeOuverture, result.totalEur);
      setCoherenceValidation(validation);
      if (!validation.coherent) {
        setShowCoherenceDialog(true);
      }
    }
  }, [sessionId, calculerSoldeOuverture, soldeOuverture, validerCoherenceSolde, societe]);

  const handleUpdateDevise = useCallback(async () => {
    if (!sessionId.trim()) return;
    await updateDeviseSession(Number(sessionId));
  }, [sessionId, updateDeviseSession]);

  const handleBack = () => {
    navigate('/caisse/menu');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Solde d'ouverture</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Calcul consolidé des soldes d'ouverture par devise
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900 font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Session ID</label>
              <Input
                type="number"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Entrez le numéro de session"
                className="w-full"
              />
            </div>
            <Button
              onClick={handleLoadSolde}
              disabled={!sessionId.trim() || isLoading}
              variant="secondary"
            >
              Charger
            </Button>
            <Button
              onClick={handleCalculer}
              disabled={!sessionId.trim() || isCalculating}
              variant="primary"
            >
              Calculer
            </Button>
            <Button
              onClick={handleUpdateDevise}
              disabled={!sessionId.trim() || isLoading}
              variant="secondary"
            >
              MAJ Devises
            </Button>
          </div>
        </div>

        {calculationResult && (
          <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-semibold">Résultats du calcul</h3>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(calculationResult.totalEur)}
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4 space-y-2">
                <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Alertes détectées ({alerts.length})</span>
                </h4>
                <ul className="space-y-1 text-sm text-orange-700">
                  {alerts.map((alert, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{alert.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {coherenceValidation && (
              <div
                className={cn(
                  'border rounded-md p-4',
                  coherenceValidation.coherent
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200',
                )}
              >
                <h4 className="font-semibold mb-2">
                  {coherenceValidation.coherent ? '✓ Cohérence validée' : '✗ Incohérence détectée'}
                </h4>
                {coherenceValidation.ecart !== null && (
                  <p className="text-sm">
                    Écart: {formatCurrency(coherenceValidation.ecart)}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold">Détail des conversions par devise</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-hover">
                    <tr>
                      <th className="px-4 py-2 text-left">Devise</th>
                      <th className="px-4 py-2 text-right">Montant</th>
                      <th className="px-4 py-2 text-right">Taux de change</th>
                      <th className="px-4 py-2 text-right">Montant EUR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculationResult.details.map((detail, idx) => (
                      <tr
                        key={idx}
                        className={cn(
                          'border-t border-border',
                          detail.montant < 0 && 'bg-red-50',
                        )}
                      >
                        <td className="px-4 py-2 font-medium">{detail.devise}</td>
                        <td className="px-4 py-2 text-right">{detail.montant.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right">{detail.tauxChange.toFixed(4)}</td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {formatCurrency(detail.montantEur)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {soldeOuverture && (
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-3">
              Détails du solde d'ouverture
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Société:</span>
                  <span className="font-semibold">{soldeOuverture.societe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Devise locale:</span>
                  <span className="font-semibold">{soldeOuverture.deviseLocale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Type change:</span>
                  <span className="font-semibold">{soldeOuverture.uniBi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Nombre de devises:</span>
                  <span className="font-semibold">{soldeOuverture.nbreDevise}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Solde ouverture monnaie:</span>
                  <span className="font-semibold">
                    {formatCurrency(soldeOuverture.soldeOuvertureMonnaie)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Solde ouverture produits:</span>
                  <span className="font-semibold">
                    {formatCurrency(soldeOuverture.soldeOuvertureProduits)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Solde ouverture cartes:</span>
                  <span className="font-semibold">
                    {formatCurrency(soldeOuverture.soldeOuvertureCartes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Solde ouverture chèques:</span>
                  <span className="font-semibold">
                    {formatCurrency(soldeOuverture.soldeOuvertureCheques)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-muted">Solde ouverture OD:</span>
                  <span className="font-semibold">
                    {formatCurrency(soldeOuverture.soldeOuvertureOd)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-semibold">Solde total:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(soldeOuverture.soldeOuverture)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {devisesSessions.length > 0 && (
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold border-b border-border pb-3">
              Devises de la session
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-hover">
                  <tr>
                    <th className="px-4 py-2 text-left">Devise</th>
                    <th className="px-4 py-2 text-right">Montant</th>
                    <th className="px-4 py-2 text-right">Taux de change</th>
                  </tr>
                </thead>
                <tbody>
                  {devisesSessions.map((devise) => (
                    <tr key={devise.id} className="border-t border-border">
                      <td className="px-4 py-2 font-medium">{devise.deviseCode}</td>
                      <td className="px-4 py-2 text-right">{devise.montant.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{devise.tauxChange.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isLoading && !soldeOuverture && !calculationResult && (
          <div className="bg-surface border border-border rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-on-surface-muted">Chargement des données...</p>
          </div>
        )}

        {!isLoading && !soldeOuverture && !calculationResult && sessionId && (
          <div className="bg-surface border border-border rounded-lg p-12 text-center text-on-surface-muted">
            Aucune donnée disponible pour cette session
          </div>
        )}

        <div className="flex justify-start">
          <Button onClick={handleBack} variant="secondary">
            Retour au menu
          </Button>
        </div>

        <Dialog open={showCoherenceDialog} onClose={() => setShowCoherenceDialog(false)}>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-red-700">Incohérence détectée</h3>
            {coherenceValidation && (
              <div className="space-y-2">
                <p className="text-sm">
                  Le solde calculé ne correspond pas au solde enregistré.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Solde enregistré:</span>
                    <span className="font-semibold">
                      {soldeOuverture && formatCurrency(soldeOuverture.soldeOuverture)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solde calculé:</span>
                    <span className="font-semibold">
                      {calculationResult && formatCurrency(calculationResult.totalEur)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-red-300">
                    <span className="font-semibold">Écart:</span>
                    <span className="font-bold text-red-700">
                      {coherenceValidation.ecart !== null &&
                        formatCurrency(coherenceValidation.ecart)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setShowCoherenceDialog(false)} variant="primary">
                Fermer
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
}