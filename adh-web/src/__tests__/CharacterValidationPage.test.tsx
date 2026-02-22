import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/stores/characterValidationStore');
vi.mock('@/stores/authStore');

import { CharacterValidationPage } from '@/pages/CharacterValidationPage';
import { useCharacterValidationStore } from '@/stores/characterValidationStore';
import { useAuthStore } from '@/stores';
import type { ValidationResult } from '@/types/characterValidation';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('CharacterValidationPage', () => {
  const mockValidateCharacters = vi.fn();
  const mockLoadForbiddenCharacters = vi.fn();
  const mockCheckString = vi.fn();
  const mockSetError = vi.fn();
  const mockSetIsValidating = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: 1,
        login: 'testuser',
        nom: 'Dupont',
        prenom: 'Jean',
        societe: 'SOC01',
        actif: true,
      },
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(useCharacterValidationStore).mockReturnValue({
      forbiddenCharacters: ['*', '#', '@'],
      lastValidationResult: null,
      isValidating: false,
      error: null,
      validateCharacters: mockValidateCharacters,
      loadForbiddenCharacters: mockLoadForbiddenCharacters,
      checkString: mockCheckString,
      setError: mockSetError,
      setIsValidating: mockSetIsValidating,
      reset: mockReset,
    } as unknown as ReturnType<typeof useCharacterValidationStore>);
  });

  it('renders without crashing', () => {
    renderWithRouter(<CharacterValidationPage />);
    expect(screen.getByText('Validation de caractères')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Saisissez le texte à vérifier...')).toBeInTheDocument();
  });

  it('displays loading state when validating', () => {
    vi.mocked(useCharacterValidationStore).mockReturnValue({
      forbiddenCharacters: [],
      lastValidationResult: null,
      isValidating: true,
      error: null,
      validateCharacters: mockValidateCharacters,
      loadForbiddenCharacters: mockLoadForbiddenCharacters,
      checkString: mockCheckString,
      setError: mockSetError,
      setIsValidating: mockSetIsValidating,
      reset: mockReset,
    } as unknown as ReturnType<typeof useCharacterValidationStore>);

    renderWithRouter(<CharacterValidationPage />);
    expect(screen.getByText('Validation...')).toBeInTheDocument();
  });

  it('displays validation result when text is valid', () => {
    const validResult: ValidationResult = {
      isValid: true,
      invalidCharacters: '',
      position: null,
    };

    vi.mocked(useCharacterValidationStore).mockReturnValue({
      forbiddenCharacters: ['*', '#'],
      lastValidationResult: validResult,
      isValidating: false,
      error: null,
      validateCharacters: mockValidateCharacters,
      loadForbiddenCharacters: mockLoadForbiddenCharacters,
      checkString: mockCheckString,
      setError: mockSetError,
      setIsValidating: mockSetIsValidating,
      reset: mockReset,
    } as unknown as ReturnType<typeof useCharacterValidationStore>);

    renderWithRouter(<CharacterValidationPage />);
    expect(screen.getByText('Texte valide')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('displays validation result when invalid characters detected', () => {
    const invalidResult: ValidationResult = {
      isValid: false,
      invalidCharacters: '*#',
      position: 5,
    };

    vi.mocked(useCharacterValidationStore).mockReturnValue({
      forbiddenCharacters: ['*', '#'],
      lastValidationResult: invalidResult,
      isValidating: false,
      error: null,
      validateCharacters: mockValidateCharacters,
      loadForbiddenCharacters: mockLoadForbiddenCharacters,
      checkString: mockCheckString,
      setError: mockSetError,
      setIsValidating: mockSetIsValidating,
      reset: mockReset,
    } as unknown as ReturnType<typeof useCharacterValidationStore>);

    renderWithRouter(<CharacterValidationPage />);
    expect(screen.getByText('Caractères interdits détectés')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
    expect(screen.getByText(/Position :/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles API validation button click', async () => {
    renderWithRouter(<CharacterValidationPage />);

    const input = screen.getByPlaceholderText('Saisissez le texte à vérifier...');
    fireEvent.change(input, { target: { value: 'test text' } });

    const validateButton = screen.getByText('Valider (API)');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(mockValidateCharacters).toHaveBeenCalledWith('test text');
    });
  });

  it('handles local validation button click', () => {
    renderWithRouter(<CharacterValidationPage />);

    const input = screen.getByPlaceholderText('Saisissez le texte à vérifier...');
    fireEvent.change(input, { target: { value: 'local test' } });

    const localValidateButton = screen.getByText('Valider (local)');
    fireEvent.click(localValidateButton);

    expect(mockCheckString).toHaveBeenCalledWith('local test', ['*', '#', '@']);
  });

  it('shows error when validating empty text', async () => {
    renderWithRouter(<CharacterValidationPage />);

    const validateButton = screen.getByText('Valider (API)');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('Veuillez saisir un texte à valider');
    });
  });

  it('displays error state', () => {
    vi.mocked(useCharacterValidationStore).mockReturnValue({
      forbiddenCharacters: [],
      lastValidationResult: null,
      isValidating: false,
      error: 'Erreur de validation',
      validateCharacters: mockValidateCharacters,
      loadForbiddenCharacters: mockLoadForbiddenCharacters,
      checkString: mockCheckString,
      setError: mockSetError,
      setIsValidating: mockSetIsValidating,
      reset: mockReset,
    } as unknown as ReturnType<typeof useCharacterValidationStore>);

    renderWithRouter(<CharacterValidationPage />);
    expect(screen.getByText('Erreur de validation')).toBeInTheDocument();
  });

  it('opens forbidden characters dialog', () => {
    renderWithRouter(<CharacterValidationPage />);

    const manageButton = screen.getByText('Gérer caractères interdits');
    fireEvent.click(manageButton);

    expect(screen.getByText('Caractères interdits')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nouveau caractère...')).toBeInTheDocument();
  });

  it('adds new forbidden character in dialog', () => {
    renderWithRouter(<CharacterValidationPage />);

    const manageButton = screen.getByText('Gérer caractères interdits');
    fireEvent.click(manageButton);

    const newCharInput = screen.getByPlaceholderText('Nouveau caractère...');
    fireEvent.change(newCharInput, { target: { value: '%' } });

    const addButton = screen.getByText('Ajouter');
    fireEvent.click(addButton);

    expect(newCharInput).toHaveValue('');
  });

  it('removes forbidden character from local list', () => {
    renderWithRouter(<CharacterValidationPage />);

    const manageButton = screen.getByText('Gérer caractères interdits');
    fireEvent.click(manageButton);

    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[0]);

    expect(removeButtons).toHaveLength(3);
  });

  it('navigates back on back button click', () => {
    renderWithRouter(<CharacterValidationPage />);

    const backButton = screen.getByText('Retour au menu');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('loads forbidden characters on mount', () => {
    renderWithRouter(<CharacterValidationPage />);
    expect(mockLoadForbiddenCharacters).toHaveBeenCalled();
  });

  it('resets store on unmount', () => {
    const { unmount } = renderWithRouter(<CharacterValidationPage />);
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });

  it('displays user information', () => {
    renderWithRouter(<CharacterValidationPage />);
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('disables validate button when no input', () => {
    renderWithRouter(<CharacterValidationPage />);
    const validateButton = screen.getByText('Valider (API)');
    expect(validateButton).toBeDisabled();
  });

  it('displays special characters with readable labels', () => {
    vi.mocked(useCharacterValidationStore).mockReturnValue({
      forbiddenCharacters: ['\n', '\t', ' '],
      lastValidationResult: null,
      isValidating: false,
      error: null,
      validateCharacters: mockValidateCharacters,
      loadForbiddenCharacters: mockLoadForbiddenCharacters,
      checkString: mockCheckString,
      setError: mockSetError,
      setIsValidating: mockSetIsValidating,
      reset: mockReset,
    } as unknown as ReturnType<typeof useCharacterValidationStore>);

    renderWithRouter(<CharacterValidationPage />);

    const manageButton = screen.getByText('Gérer caractères interdits');
    fireEvent.click(manageButton);

    expect(screen.getByText('\\n')).toBeInTheDocument();
    expect(screen.getByText('\\t')).toBeInTheDocument();
    expect(screen.getByText('(espace)')).toBeInTheDocument();
  });
});