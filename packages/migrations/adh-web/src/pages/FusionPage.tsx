import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  FusionAccountSearch,
  FusionAccountSelection,
  FusionPreviewCard,
  FusionProcessing,
  FusionResultDialog,
} from '@/components/caisse/fusion';
import { useFusionStore } from '@/stores/fusionStore';
import { useAuthStore } from '@/stores';
import { AlertTriangle } from 'lucide-react';

export function FusionPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';
  const [dismissedWarnings, setDismissedWarnings] = useState(false);

  const currentStep = useFusionStore((s) => s.currentStep);
  const comptePrincipal = useFusionStore((s) => s.comptePrincipal);
  const compteSecondaire = useFusionStore((s) => s.compteSecondaire);
  const preview = useFusionStore((s) => s.preview);
  const result = useFusionStore((s) => s.result);
  const progress = useFusionStore((s) => s.progress);
  const _searchResults = useFusionStore((s) => s.searchResults);
  const _isSearching = useFusionStore((s) => s.isSearching);
  const _isValidating = useFusionStore((s) => s.isValidating);
  const _isExecuting = useFusionStore((s) => s.isExecuting);
  const error = useFusionStore((s) => s.error);
  const prerequisites = useFusionStore((s) => s.prerequisites);
  const _searchAccount = useFusionStore((s) => s.searchAccount);
  const selectPrincipal = useFusionStore((s) => s.selectPrincipal);
  const selectSecondaire = useFusionStore((s) => s.selectSecondaire);
  const validateFusion = useFusionStore((s) => s.validateFusion);
  const executeFusion = useFusionStore((s) => s.executeFusion);
  const checkPrerequisites = useFusionStore((s) => s.checkPrerequisites);
  const setStep = useFusionStore((s) => s.setStep);
  const reset = useFusionStore((s) => s.reset);

  useEffect(() => {
    void checkPrerequisites();
    return () => reset();
  }, [reset, checkPrerequisites]);

  const handleBack = () => {
    if (currentStep === 'selection_principal') {
      navigate('/caisse/menu');
    } else if (currentStep === 'selection_secondaire') {
      setStep('selection_principal');
    } else if (currentStep === 'preview' || currentStep === 'confirmation') {
      setStep('selection_secondaire');
    } else if (currentStep === 'result') {
      reset();
    }
  };

  const handleValidate = async () => {
    const operateur = user?.login ?? 'unknown';
    await validateFusion(societe, operateur);
  };

  const handleExecute = async () => {
    const operateur = user?.login ?? 'unknown';
    await executeFusion(societe, operateur);
  };

  const stepLabel: Record<string, string> = {
    selection_principal: 'Selectionner le compte principal',
    selection_secondaire: 'Selectionner le compte secondaire',
    preview: 'Verifier les details de la fusion',
    confirmation: 'Confirmer la fusion',
    processing: 'Fusion en cours...',
    result: 'Resultat de la fusion',
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Fusion de comptes</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {stepLabel[currentStep] ?? ''}
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

        {prerequisites && prerequisites.warnings.length > 0 && !dismissedWarnings && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-md px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-yellow-800 font-medium text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Alertes pre-fusion</span>
            </div>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              {prerequisites.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            <button
              onClick={() => setDismissedWarnings(true)}
              className="text-xs text-yellow-800 underline hover:text-yellow-900"
            >
              Continuer malgre les alertes
            </button>
          </div>
        )}

        {currentStep === 'selection_principal' && (
          <>
            <FusionAccountSearch
              onSelect={(principal, secondaire) => {
                selectPrincipal(principal);
                selectSecondaire(secondaire);
                void handleValidate();
              }}
            />
            <div className="flex justify-start">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Retour au menu
              </button>
            </div>
          </>
        )}

        {currentStep === 'selection_secondaire' && comptePrincipal && compteSecondaire && (
          <>
            <FusionAccountSelection
              principal={comptePrincipal}
              secondaire={compteSecondaire}
              onPreview={handleValidate}
              onBack={handleBack}
            />
          </>
        )}

        {(currentStep === 'preview' || currentStep === 'confirmation') && preview && (
          <FusionPreviewCard
            preview={preview}
            onConfirm={handleExecute}
            onCancel={handleBack}
          />
        )}

        {currentStep === 'processing' && progress && (
          <FusionProcessing progress={progress} />
        )}

        {currentStep === 'result' && result && (
          <FusionResultDialog
            result={result}
            onRetry={() => setStep('selection_principal')}
            onClose={() => {
              reset();
              navigate('/caisse/menu');
            }}
          />
        )}
      </div>
    </ScreenLayout>
  );
}
