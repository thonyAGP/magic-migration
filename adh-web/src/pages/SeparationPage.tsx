import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  SeparationAccountSelector,
  SeparationPreviewCard,
  SeparationProcessing,
  SeparationResultDialog,
} from '@/components/caisse/separation';
import { useSeparationStore } from '@/stores/separationStore';
import { useAuthStore } from '@/stores';

export function SeparationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';

  const currentStep = useSeparationStore((s) => s.currentStep);
  const compteSource = useSeparationStore((s) => s.compteSource);
  const compteDestination = useSeparationStore((s) => s.compteDestination);
  const preview = useSeparationStore((s) => s.preview);
  const result = useSeparationStore((s) => s.result);
  const progress = useSeparationStore((s) => s.progress);
  const searchResults = useSeparationStore((s) => s.searchResults);
  const isSearching = useSeparationStore((s) => s.isSearching);
  const isValidating = useSeparationStore((s) => s.isValidating);
  const isExecuting = useSeparationStore((s) => s.isExecuting);
  const error = useSeparationStore((s) => s.error);
  const searchAccount = useSeparationStore((s) => s.searchAccount);
  const selectSource = useSeparationStore((s) => s.selectSource);
  const selectDestination = useSeparationStore((s) => s.selectDestination);
  const validateSeparation = useSeparationStore((s) => s.validateSeparation);
  const executeSeparation = useSeparationStore((s) => s.executeSeparation);
  const setStep = useSeparationStore((s) => s.setStep);
  const reset = useSeparationStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleBack = () => {
    if (currentStep === 'selection') {
      navigate('/caisse/menu');
    } else if (currentStep === 'preview' || currentStep === 'confirmation') {
      setStep('selection');
    } else if (currentStep === 'result') {
      reset();
    }
  };

  const handleValidate = async () => {
    const operateur = user?.login ?? 'unknown';
    await validateSeparation(societe, operateur);
  };

  const handleExecute = async () => {
    const operateur = user?.login ?? 'unknown';
    await executeSeparation(societe, operateur);
  };

  const stepLabel: Record<string, string> = {
    selection: 'Selectionner les comptes source et destination',
    preview: 'Verifier les details de la separation',
    confirmation: 'Confirmer la separation',
    processing: 'Separation en cours...',
    result: 'Resultat de la separation',
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Separation de compte</h2>
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

        {currentStep === 'selection' && (
          <>
            <div className="space-y-4">
              <SeparationAccountSelector
                label="Compte source"
                onSelect={selectSource}
                onSearch={(q) => searchAccount(societe, q)}
                searchResults={searchResults}
                selectedAccount={compteSource}
                excludeAccount={compteDestination}
                isSearching={isSearching}
              />
              <SeparationAccountSelector
                label="Compte destination"
                onSelect={selectDestination}
                onSearch={(q) => searchAccount(societe, q)}
                searchResults={searchResults}
                selectedAccount={compteDestination}
                excludeAccount={compteSource}
                isSearching={isSearching}
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Retour au menu
              </button>
              {compteSource && compteDestination && (
                <button
                  onClick={handleValidate}
                  disabled={isValidating}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {isValidating ? 'Validation...' : 'Valider la separation'}
                </button>
              )}
            </div>
          </>
        )}

        {(currentStep === 'preview' || currentStep === 'confirmation') && preview && (
          <>
            <SeparationPreviewCard
              preview={preview}
              isExecuting={isExecuting}
              onConfirm={handleExecute}
              onCancel={handleBack}
            />
          </>
        )}

        {currentStep === 'processing' && (
          <SeparationProcessing progress={progress} isProcessing={isExecuting} />
        )}

        {currentStep === 'result' && result && (
          <SeparationResultDialog
            open={true}
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
