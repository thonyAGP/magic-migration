import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  DataCatchWelcome,
  CustomerSearchPanel,
  PersonalInfoForm,
  AddressForm,
  PreferencesForm,
  DataCatchReview,
  DataCatchCompletion,
  DataCatchStepIndicator,
} from '@/components/caisse/datacatch';
import { useDataCatchStore } from '@/stores/datacatchStore';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import type { DataCatchStep } from '@/types/datacatch';
import type {
  PersonalInfoFormData,
  AddressFormData,
  PreferencesFormData,
} from '@/components/caisse/datacatch/types';

const STEPS: DataCatchStep[] = [
  'welcome',
  'search',
  'personal',
  'address',
  'preferences',
  'review',
  'complete',
];

export function DataCatchPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';
  const operateur = user?.login ?? 'caissier';

  const currentSession = useDataCatchStore((s) => s.currentSession);
  const currentStep = useDataCatchStore((s) => s.currentStep);
  const personalInfo = useDataCatchStore((s) => s.personalInfo);
  const address = useDataCatchStore((s) => s.address);
  const preferences = useDataCatchStore((s) => s.preferences);
  const isSearching = useDataCatchStore((s) => s.isSearching);
  const isSaving = useDataCatchStore((s) => s.isSaving);
  const isCompleting = useDataCatchStore((s) => s.isCompleting);
  const error = useDataCatchStore((s) => s.error);
  const createSession = useDataCatchStore((s) => s.createSession);
  const savePersonalInfo = useDataCatchStore((s) => s.savePersonalInfo);
  const saveAddress = useDataCatchStore((s) => s.saveAddress);
  const savePreferences = useDataCatchStore((s) => s.savePreferences);
  const completeSession = useDataCatchStore((s) => s.completeSession);
  const setStep = useDataCatchStore((s) => s.setStep);
  const reset = useDataCatchStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleStartNew = useCallback(async () => {
    const result = await createSession(societe, operateur, undefined, true);
    if (result.success) {
      setStep('personal');
    }
  }, [createSession, societe, operateur, setStep]);

  const handleStartExisting = useCallback(() => {
    setStep('search');
  }, [setStep]);

  const handleSelectCustomer = useCallback(
    async (customer: { customerId: number }) => {
      const result = await createSession(societe, operateur, customer.customerId, false);
      if (result.success) {
        setStep('personal');
      }
    },
    [createSession, societe, operateur, setStep],
  );

  const handleCreateNew = useCallback(async () => {
    const result = await createSession(societe, operateur, undefined, true);
    if (result.success) {
      setStep('personal');
    }
  }, [createSession, societe, operateur, setStep]);

  const handleSavePersonal = useCallback(
    async (data: PersonalInfoFormData) => {
      const sessionId = currentSession?.sessionId;
      if (!sessionId) return;
      await savePersonalInfo(sessionId, data);
    },
    [currentSession, savePersonalInfo],
  );

  const handleSaveAddress = useCallback(
    async (data: AddressFormData) => {
      const sessionId = currentSession?.sessionId;
      if (!sessionId) return;
      await saveAddress(sessionId, data);
    },
    [currentSession, saveAddress],
  );

  const handleSavePreferences = useCallback(
    async (data: PreferencesFormData) => {
      const sessionId = currentSession?.sessionId;
      if (!sessionId) return;
      await savePreferences(sessionId, data);
    },
    [currentSession, savePreferences],
  );

  const handleComplete = useCallback(async () => {
    const sessionId = currentSession?.sessionId;
    if (!sessionId) return;
    await completeSession(sessionId);
  }, [currentSession, completeSession]);

  const handleFinish = useCallback(() => {
    reset();
    navigate('/caisse/menu');
  }, [reset, navigate]);

  const handleBack = useCallback(() => {
    if (currentStep === 'welcome') {
      navigate('/caisse/menu');
    } else if (currentStep === 'search') {
      setStep('welcome');
    } else if (currentStep === 'personal') {
      setStep(currentSession ? 'search' : 'welcome');
    } else if (currentStep === 'address') {
      setStep('personal');
    } else if (currentStep === 'preferences') {
      setStep('address');
    } else if (currentStep === 'review') {
      setStep('preferences');
    }
  }, [currentStep, currentSession, setStep, navigate]);

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <DataCatchWelcome
            onStartNew={handleStartNew}
            onStartExisting={handleStartExisting}
            disabled={isSaving}
          />
        );
      case 'search':
        return (
          <CustomerSearchPanel
            onSelectCustomer={handleSelectCustomer}
            onCreateNew={handleCreateNew}
            isSearching={isSearching}
          />
        );
      case 'personal':
        return (
          <PersonalInfoForm
            initialData={personalInfo}
            onSave={handleSavePersonal}
            onBack={handleBack}
            isSaving={isSaving}
          />
        );
      case 'address':
        return (
          <AddressForm
            initialData={address}
            onSave={handleSaveAddress}
            onBack={handleBack}
            isSaving={isSaving}
          />
        );
      case 'preferences':
        return (
          <PreferencesForm
            initialData={preferences}
            onSave={handleSavePreferences}
            onBack={handleBack}
            isSaving={isSaving}
          />
        );
      case 'review':
        return (
          <DataCatchReview
            personalInfo={personalInfo}
            address={address}
            preferences={preferences}
            onConfirm={handleComplete}
            onBack={handleBack}
            isSubmitting={isCompleting}
          />
        );
      case 'complete':
        return (
          <DataCatchCompletion
            success={!error}
            sessionId={currentSession?.sessionId ?? null}
            onClose={handleFinish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScreenLayout>
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Saisie client</h2>
        </div>

        {/* Step indicator */}
        <DataCatchStepIndicator currentStep={currentStep} steps={STEPS} />

        {error && currentStep !== 'complete' && (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            {error}
          </div>
        )}

        {/* Step content */}
        {renderStep()}
      </div>
    </ScreenLayout>
  );
}
