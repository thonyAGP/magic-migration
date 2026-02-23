import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useIntegriteDatesStore } from '@/stores/integriteDatesStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

const CHECK_TYPE_LABELS = {
  O: 'Ouverture',
  T: 'Transaction',
  F: 'Fermeture',
} as const;

export function IntegriteDatesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const checkType = useIntegriteDatesStore((s) => s.checkType);
  const societe = useIntegriteDatesStore((s) => s.societe);
  const isLoading = useIntegriteDatesStore((s) => s.isLoading);
  const error = useIntegriteDatesStore((s) => s.error);
  const validationResult = useIntegriteDatesStore((s) => s.validationResult);
  const ouvertureValidation = useIntegriteDatesStore((s) => s.ouvertureValidation);
  const transactionValidation = useIntegriteDatesStore((s) => s.transactionValidation);
  const fermetureValidation = useIntegriteDatesStore((s) => s.fermetureValidation);
  const setCheckType = useIntegriteDatesStore((s) => s.setCheckType);
  const setSociete = useIntegriteDatesStore((s) => s.setSociete);
  const _validateDateIntegrity = useIntegriteDatesStore((s) => s.validateDateIntegrity);
  const checkOuverture = useIntegriteDatesStore((s) => s.checkOuverture);
  const checkTransaction = useIntegriteDatesStore((s) => s.checkTransaction);
  const checkFermeture = useIntegriteDatesStore((s) => s.checkFermeture);
  const clearValidationResult = useIntegriteDatesStore((s) => s.clearValidationResult);
  const reset = useIntegriteDatesStore((s) => s.reset);

  const [dateSession, setDateSession] = useState('');
  const [heureSession, setHeureSession] = useState('');
  const [showResultDialog, setShowResultDialog] = useState(false);

  useEffect(() => {
    setSociete('ADH');
    return () => reset();
  }, [setSociete, reset]);

  const handleValidate = useCallback(async () => {
    if (!societe) return;

    clearValidationResult();

    if (checkType === 'T') {
      if (!dateSession || !heureSession) {
        return;
      }
      await checkTransaction(societe, dateSession, heureSession);
    } else if (checkType === 'O') {
      await checkOuverture(societe);
    } else if (checkType === 'F') {
      await checkFermeture(societe);
    }

    setShowResultDialog(true);
  }, [
    societe,
    checkType,
    dateSession,
    heureSession,
    clearValidationResult,
    checkTransaction,
    checkOuverture,
    checkFermeture,
  ]);

  const handleBack = useCallback(() => {
    navigate('/caisse/menu');
  }, [navigate]);

  const handleCloseDialog = useCallback(() => {
    setShowResultDialog(false);
  }, []);

  const renderValidationStatus = () => {
    if (!validationResult) return null;

    const isValid = validationResult.isValid;
    const hasAnomaly = validationResult.hasClosureAnomaly;

    return (
      <div
        className={cn(
          'px-4 py-3 rounded-md text-sm',
          isValid && !hasAnomaly && 'bg-green-50 border border-green-200 text-green-700',
          !isValid && 'bg-red-50 border border-red-200 text-red-700',
          hasAnomaly && 'bg-yellow-50 border border-yellow-200 text-yellow-700',
        )}
      >
        <div className="font-semibold mb-1">
          {isValid && !hasAnomaly && '✓ Validation réussie'}
          {!isValid && '✗ Validation échouée'}
          {hasAnomaly && '⚠ Anomalie détectée'}
        </div>
        {validationResult.errorMessage && <div>{validationResult.errorMessage}</div>}
        {ouvertureValidation && (
          <div className="mt-2 space-y-1">
            <div>Date comptable: {ouvertureValidation.dateComptable}</div>
            <div>Date actuelle: {ouvertureValidation.currentDate}</div>
            {ouvertureValidation.delaiExceeded && <div>Délai dépassé</div>}
          </div>
        )}
        {transactionValidation && (
          <div className="mt-2 space-y-1">
            <div>Date session: {transactionValidation.dateSession}</div>
            <div>Heure session: {transactionValidation.heureSession}</div>
            <div>Timestamp valide: {transactionValidation.isTimestampValid ? 'Oui' : 'Non'}</div>
          </div>
        )}
        {fermetureValidation && (
          <div className="mt-2 space-y-1">
            <div>Anomalie: {fermetureValidation.hasAnomaly ? 'Oui' : 'Non'}</div>
            {fermetureValidation.blockedReason && <div>Raison: {fermetureValidation.blockedReason}</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Intégrité des dates</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Validation des dates comptables et de session
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type de contrôle</label>
            <div className="flex gap-3">
              {(['O', 'T', 'F'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setCheckType(type)}
                  className={cn(
                    'px-4 py-2 rounded-md border text-sm font-medium transition-colors',
                    checkType === type
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface border-border text-on-surface hover:bg-surface-hover',
                  )}
                >
                  {CHECK_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {checkType === 'T' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date session</label>
                <Input
                  type="date"
                  value={dateSession}
                  onChange={(e) => setDateSession(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Heure session</label>
                <Input
                  type="time"
                  value={heureSession}
                  onChange={(e) => setHeureSession(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {validationResult && renderValidationStatus()}

          <div className="flex gap-3 justify-between">
            <Button variant="secondary" onClick={handleBack}>
              Retour au menu
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isLoading || (checkType === 'T' && (!dateSession || !heureSession))}
            >
              {isLoading ? 'Validation...' : 'Valider'}
            </Button>
          </div>
        </div>

        <Dialog open={showResultDialog} onClose={handleCloseDialog}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Résultat de la validation</h3>
            {renderValidationStatus()}
            <div className="flex justify-end">
              <Button onClick={handleCloseDialog}>Fermer</Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
}

export default IntegriteDatesPage;
