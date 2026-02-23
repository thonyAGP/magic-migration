import { create } from 'zustand';
import type {
  ValidationResult,
  ValidateCharactersRequest,
  ValidateCharactersResponse,
  ForbiddenCharactersResponse,
  CharacterValidationState,
} from '@/types/characterValidation';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

const MOCK_FORBIDDEN_CHARS = [
  '@', '#', '$', '%', '&', '*', '<', '>', '|', '\\', '/', '?', '"', "'",
  '\n', '\r', '\t', '\0', '\x01', '\x02', '\x03',
];

const MOCK_VALIDATION_RESULTS: Record<string, ValidationResult> = {
  'test@email.com': {
    isValid: false,
    invalidCharacters: '@',
    position: 4,
  },
  'valid-name': {
    isValid: true,
    invalidCharacters: '',
    position: null,
  },
  'special$char%here': {
    isValid: false,
    invalidCharacters: '$%',
    position: 7,
  },
};

const initialState = {
  forbiddenCharacters: [],
  lastValidationResult: null,
  isValidating: false,
  error: null,
};

export const useCharacterValidationStore = create<CharacterValidationState>()((set, _get) => ({
  ...initialState,

  validateCharacters: async (input: string): Promise<ValidationResult> => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isValidating: true, error: null });

    if (!isRealApi) {
      const mockResult = MOCK_VALIDATION_RESULTS[input] || {
        isValid: true,
        invalidCharacters: '',
        position: null,
      };
      set({ lastValidationResult: mockResult, isValidating: false });
      return mockResult;
    }

    try {
      const response = await apiClient.post<ApiResponse<ValidateCharactersResponse>>(
        '/api/validation/check-string',
        { input } as ValidateCharactersRequest,
      );
      const result = response.data.data?.result || {
        isValid: true,
        invalidCharacters: '',
        position: null,
      };
      set({ lastValidationResult: result });
      return result;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation caractères';
      set({ error: message, lastValidationResult: null });
      return {
        isValid: false,
        invalidCharacters: '',
        position: null,
      };
    } finally {
      set({ isValidating: false });
    }
  },

  loadForbiddenCharacters: async (): Promise<void> => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ error: null });

    if (!isRealApi) {
      set({ forbiddenCharacters: MOCK_FORBIDDEN_CHARS });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<ForbiddenCharactersResponse>>(
        '/api/validation/forbidden-characters',
      );
      const characters = response.data.data?.characters || [];
      set({ forbiddenCharacters: characters });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement caractères interdits';
      set({ error: message, forbiddenCharacters: [] });
    }
  },

  checkString: (input: string, forbiddenChars: string[]): ValidationResult => {
    const invalidCharsFound: string[] = [];
    let firstInvalidPosition: number | null = null;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (forbiddenChars.includes(char)) {
        if (firstInvalidPosition === null) {
          firstInvalidPosition = i;
        }
        if (!invalidCharsFound.includes(char)) {
          invalidCharsFound.push(char);
        }
      }
    }

    const result: ValidationResult = {
      isValid: invalidCharsFound.length === 0,
      invalidCharacters: invalidCharsFound.join(''),
      position: firstInvalidPosition,
    };

    set({ lastValidationResult: result });
    return result;
  },

  setError: (error: string | null) => set({ error }),

  setIsValidating: (isValidating: boolean) => set({ isValidating }),

  reset: () => set({ ...initialState }),
}));