import type {
  CustomerSearchResult,
  CustomerPersonalInfo,
  CustomerAddress,
  CustomerPreferences,
  DataCatchStep,
} from '@/types/datacatch';
import type {
  PersonalInfoFormData,
  AddressFormData,
  PreferencesFormData,
} from './schemas';

export interface DataCatchWelcomeProps {
  onStartNew: () => void;
  onStartExisting: () => void;
  disabled?: boolean;
}

export interface CustomerSearchPanelProps {
  onSelectCustomer: (customer: CustomerSearchResult) => void;
  onCreateNew: () => void;
  isSearching?: boolean;
}

export interface PersonalInfoFormProps {
  initialData?: CustomerPersonalInfo | null;
  onSave: (data: PersonalInfoFormData) => void;
  onBack: () => void;
  isSaving?: boolean;
}

export interface AddressFormProps {
  initialData?: CustomerAddress | null;
  onSave: (data: AddressFormData) => void;
  onBack: () => void;
  isSaving?: boolean;
}

export interface PreferencesFormProps {
  initialData?: CustomerPreferences | null;
  onSave: (data: PreferencesFormData) => void;
  onBack: () => void;
  isSaving?: boolean;
}

export interface DataCatchReviewProps {
  personalInfo: CustomerPersonalInfo | null;
  address: CustomerAddress | null;
  preferences: CustomerPreferences | null;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export interface DataCatchCompletionProps {
  success: boolean;
  sessionId: string | null;
  onClose: () => void;
}

export interface DataCatchStepIndicatorProps {
  currentStep: DataCatchStep;
  steps: DataCatchStep[];
}

export type { PersonalInfoFormData, AddressFormData, PreferencesFormData };
