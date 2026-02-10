import { useEffect } from 'react';
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

export function FusionPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';

  const currentStep = useFusionStore((s) => s.currentStep);
  const comptePrincipal = useFusionStore((s) => s.comptePrincipal);
  const compteSecondaire = useFusionStore((s) => s.compteSecondaire);
  const preview = useFusionStore((s) => s.preview);
  const result = useFusionStore((s) => s.result);
  const progress = useFusionStore((s) => s.progress);
  const searchResults = useFusionStore((s) => s.searchResults);
  const isSearching = useFusionStore((s) => s.isSearching);
  const isValidating = useFusionStore((s) => s.isValidating);
  const isExecuting = useFusionStore((s) => s.isExecuting);
  const error = useFusionStore((s) => s.error);
  const searchAccount = useFusionStore((s) => s.searchAccount);
  const selectPrincipal = useFusionStore((s) => s.selectPrincipal);
  const selectSecondaire = useFusionStore((s) => s.selectSecondaire);
  const validateFusion = useFusionStore((s) => s.validateFusion);
  const executeFusion = useFusionStore((s) => s.executeFusion);
  const setStep = useFusionStore((s) => s.setStep);
  const reset = useFusionStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

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

        {(currentStep === 'selection_principal' || currentStep === 'selection_secondaire') && (
          <>
            <FusionAccountSearch
              searchResults={searchResults}
              isSearching={isSearching}
              onSearch={(query) => searchAccount(societe, query)}
            />
            <FusionAccountSelection
              comptePrincipal={comptePrincipal}
              compteSecondaire={compteSecondaire}
              searchResults={searchResults}
              currentStep={currentStep}
              isValidating={isValidating}
              onSelectPrincipal={selectPrincipal}
              onSelectSecondaire={selectSecondaire}
              onValidate={handleValidate}
              onNext={() => setStep('selection_secondaire')}
            />
            <div className="flex justify-start">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                {currentStep === 'selection_principal' ? 'Retour au menu' : 'Retour'}
              </button>
            </div>
          </>
        )}

        {(currentStep === 'preview' || currentStep === 'confirmation') && preview && (
          <FusionPreviewCard
            preview={preview}
            isExecuting={isExecuting}
            onConfirm={handleExecute}
            onCancel={handleBack}
          />
        )}

        {currentStep === 'processing' && (
          <FusionProcessing progress={progress} />
        )}

        {currentStep === 'result' && result && (
          <FusionResultDialog
            result={result}
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
