import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockLoadRaisonsUtilisation = vi.fn();
const mockSelectRaisonPrimaire = vi.fn();
const mockSelectRaisonSecondaire = vi.fn();
const mockValiderSelection = vi.fn();
const mockAbandonner = vi.fn();
const mockUpdateCommentaire = vi.fn();
const mockReset = vi.fn();

vi.mock('@/stores/raisonsUtilisationStore', () => ({
  useRaisonsUtilisationStore: vi.fn((selector) => {
    const state = {
      raisons: [
        {
          idPrimaire: 1,
          idSecondaire: null,
          commentaire: 'Paiement service bar',
          existeRaisonSecondaire: false,
        },
        {
          idPrimaire: 2,
          idSecondaire: null,
          commentaire: 'Paiement restaurant',
          existeRaisonSecondaire: false,
        },
        {
          idPrimaire: 6,
          idSecondaire: null,
          commentaire: 'Retrait espèces',
          existeRaisonSecondaire: true,
        },
        {
          idPrimaire: 6,
          idSecondaire: 61,
          commentaire: 'Retrait espèces - DAB',
          existeRaisonSecondaire: true,
        },
        {
          idPrimaire: 6,
          idSecondaire: 62,
          commentaire: 'Retrait espèces - Caisse',
          existeRaisonSecondaire: true,
        },
      ],
      selectedRaisonPrimaire: null,
      selectedRaisonSecondaire: null,
      commentaireSaisi: '',
      confirmation: false,
      isLoading: false,
      error: null,
      loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
      selectRaisonPrimaire: mockSelectRaisonPrimaire,
      selectRaisonSecondaire: mockSelectRaisonSecondaire,
      validerSelection: mockValiderSelection,
      abandonner: mockAbandonner,
      updateCommentaire: mockUpdateCommentaire,
      reset: mockReset,
    };
    return selector(state);
  }),
}));

import { RaisonsUtilisationPage } from '@/pages/RaisonsUtilisationPage';

describe('RaisonsUtilisationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<RaisonsUtilisationPage />);
    expect(screen.getByText("Raisons d'utilisation du compte")).toBeInTheDocument();
  });

  it('loads raisons on mount', () => {
    render(<RaisonsUtilisationPage />);
    expect(mockLoadRaisonsUtilisation).toHaveBeenCalledTimes(1);
  });

  it('calls reset on unmount', () => {
    const { unmount } = render(<RaisonsUtilisationPage />);
    unmount();
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [],
        selectedRaisonPrimaire: null,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        confirmation: false,
        isLoading: true,
        error: null,
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [],
        selectedRaisonPrimaire: null,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        confirmation: false,
        isLoading: false,
        error: 'Erreur de chargement',
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('displays raisons when loaded', () => {
    render(<RaisonsUtilisationPage />);
    expect(screen.getByText('Paiement service bar')).toBeInTheDocument();
    expect(screen.getByText('Paiement restaurant')).toBeInTheDocument();
    expect(screen.getByText('Retrait espèces')).toBeInTheDocument();
  });

  it('displays column headers', () => {
    render(<RaisonsUtilisationPage />);
    expect(screen.getByText('Code Primaire')).toBeInTheDocument();
    expect(screen.getByText('Code Secondaire')).toBeInTheDocument();
    expect(screen.getByText('Libellé')).toBeInTheDocument();
  });

  it('handles primary raison selection', async () => {
    render(<RaisonsUtilisationPage />);
    const raisonRow = screen.getByText('Paiement service bar').closest('button');
    
    if (raisonRow) {
      fireEvent.click(raisonRow);
      await waitFor(() => {
        expect(mockSelectRaisonPrimaire).toHaveBeenCalledWith(1);
      });
    }
  });

  it('shows secondary grid when raison with existeRaisonSecondaire is selected', () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [
          {
            idPrimaire: 6,
            idSecondaire: null,
            commentaire: 'Retrait espèces',
            existeRaisonSecondaire: true,
          },
          {
            idPrimaire: 6,
            idSecondaire: 61,
            commentaire: 'Retrait espèces - DAB',
            existeRaisonSecondaire: true,
          },
          {
            idPrimaire: 6,
            idSecondaire: 62,
            commentaire: 'Retrait espèces - Caisse',
            existeRaisonSecondaire: true,
          },
        ],
        selectedRaisonPrimaire: 6,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        confirmation: false,
        isLoading: false,
        error: null,
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    expect(screen.getByText('Raisons secondaires')).toBeInTheDocument();
    expect(screen.getByText('Retrait espèces - DAB')).toBeInTheDocument();
    expect(screen.getByText('Retrait espèces - Caisse')).toBeInTheDocument();
  });

  it('handles secondary raison selection', async () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [
          {
            idPrimaire: 6,
            idSecondaire: null,
            commentaire: 'Retrait espèces',
            existeRaisonSecondaire: true,
          },
          {
            idPrimaire: 6,
            idSecondaire: 61,
            commentaire: 'Retrait espèces - DAB',
            existeRaisonSecondaire: true,
          },
        ],
        selectedRaisonPrimaire: 6,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        confirmation: false,
        isLoading: false,
        error: null,
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    const secondaryRow = screen.getByText('Retrait espèces - DAB').closest('button');
    
    if (secondaryRow) {
      fireEvent.click(secondaryRow);
      await waitFor(() => {
        expect(mockSelectRaisonSecondaire).toHaveBeenCalledWith(61);
      });
    }
  });

  it('handles commentaire input change', () => {
    render(<RaisonsUtilisationPage />);
    const input = screen.getByPlaceholderText('Saisir un commentaire...') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'Test commentaire' } });
    expect(mockUpdateCommentaire).toHaveBeenCalledWith('Test commentaire');
  });

  it('respects commentaire max length', () => {
    render(<RaisonsUtilisationPage />);
    const input = screen.getByPlaceholderText('Saisir un commentaire...') as HTMLInputElement;
    const longText = 'a'.repeat(101);
    
    fireEvent.change(input, { target: { value: longText } });
    expect(mockUpdateCommentaire).not.toHaveBeenCalledWith(longText);
  });

  it('displays commentaire character count', () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [],
        selectedRaisonPrimaire: null,
        selectedRaisonSecondaire: null,
        commentaireSaisi: 'Test',
        confirmation: false,
        isLoading: false,
        error: null,
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    expect(screen.getByText('4 / 100')).toBeInTheDocument();
  });

  it('handles abandonner click', async () => {
    render(<RaisonsUtilisationPage />);
    const abandonnerButton = screen.getByText('Abandonner');
    
    fireEvent.click(abandonnerButton);
    await waitFor(() => {
      expect(mockAbandonner).toHaveBeenCalledTimes(1);
    });
  });

  it('handles valider click when primary raison is selected', async () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [
          {
            idPrimaire: 1,
            idSecondaire: null,
            commentaire: 'Paiement service bar',
            existeRaisonSecondaire: false,
          },
        ],
        selectedRaisonPrimaire: 1,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        confirmation: false,
        isLoading: false,
        error: null,
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    const validerButton = screen.getByText('Valider');
    
    fireEvent.click(validerButton);
    await waitFor(() => {
      expect(mockValiderSelection).toHaveBeenCalledTimes(1);
    });
  });

  it('disables valider button when no raison is selected', () => {
    render(<RaisonsUtilisationPage />);
    const validerButton = screen.getByText('Valider') as HTMLButtonElement;
    expect(validerButton.disabled).toBe(true);
  });

  it('disables valider button when primary with existeRaisonSecondaire is selected but no secondary', () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [
          {
            idPrimaire: 6,
            idSecondaire: null,
            commentaire: 'Retrait espèces',
            existeRaisonSecondaire: true,
          },
        ],
        selectedRaisonPrimaire: 6,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        confirmation: false,
        isLoading: false,
        error: null,
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    const validerButton = screen.getByText('Valider') as HTMLButtonElement;
    expect(validerButton.disabled).toBe(true);
  });

  it('closes dialog when confirmation is true', () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [],
        selectedRaisonPrimaire: null,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        confirmation: true,
        isLoading: false,
        error: null,
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    expect(screen.queryByText("Raisons d'utilisation du compte")).not.toBeInTheDocument();
  });

  it('displays message when no raisons available', () => {
    const useRaisonsUtilisationStore = vi.mocked(
      await import('@/stores/raisonsUtilisationStore')
    ).useRaisonsUtilisationStore;

    useRaisonsUtilisationStore.mockImplementation((selector) => {
      const state = {
        raisons: [],
        selectedRaisonPrimaire: null,
        selectedRaisonSecondaire: null,
        commentaireSaisi: '',
        confirmation: false,
        isLoading: false,
        error: null,
        loadRaisonsUtilisation: mockLoadRaisonsUtilisation,
        selectRaisonPrimaire: mockSelectRaisonPrimaire,
        selectRaisonSecondaire: mockSelectRaisonSecondaire,
        validerSelection: mockValiderSelection,
        abandonner: mockAbandonner,
        updateCommentaire: mockUpdateCommentaire,
        reset: mockReset,
      };
      return selector(state);
    });

    render(<RaisonsUtilisationPage />);
    expect(screen.getByText('Aucune raison disponible')).toBeInTheDocument();
  });
});