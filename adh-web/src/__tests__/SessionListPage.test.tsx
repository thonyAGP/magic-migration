import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { Session, SessionFilter } from '@/types/session';

const mockFetchSessions = vi.fn();
const mockSetFilters = vi.fn();
const mockClearError = vi.fn();
const mockReset = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/stores/sessionListStore', () => ({
  useSessionListStore: (selector: (state: unknown) => unknown) => {
    const state = {
      sessions: [] as Session[],
      isLoading: false,
      error: null as string | null,
      filters: {
        existeSession: true,
        existeSessionOuverte: true,
        societe: null,
        deviseLocale: null,
      } as SessionFilter,
      fetchSessions: mockFetchSessions,
      setFilters: mockSetFilters,
      clearError: mockClearError,
      reset: mockReset,
    };
    return selector(state);
  },
}));

vi.mock('@/stores', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) => {
    const state = {
      user: {
        prenom: 'John',
        nom: 'Doe',
      },
    };
    return selector(state);
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { SessionListPage } from '@/pages/SessionListPage';

const mockSessions: Session[] = [
  {
    id: 1,
    societe: 'CAI001',
    caisse: 'C001',
    operateur: 'OP001',
    dateOuverture: new Date('2026-02-22T08:00:00'),
    etat: 'O',
    montantOuverture: 500,
  },
  {
    id: 2,
    societe: 'CAI002',
    caisse: 'C002',
    operateur: 'OP002',
    dateOuverture: new Date('2026-02-21T09:00:00'),
    etat: '',
    montantOuverture: 300,
  },
];

const renderPage = () => {
  return render(
    <BrowserRouter>
      <SessionListPage />
    </BrowserRouter>
  );
};

describe('SessionListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    renderPage();
    expect(screen.getByText('Sessions de caisse')).toBeInTheDocument();
  });

  it('should fetch sessions on mount', () => {
    renderPage();
    expect(mockFetchSessions).toHaveBeenCalledWith({
      existeSession: true,
      existeSessionOuverte: true,
      societe: null,
      deviseLocale: null,
    });
  });

  it('should display loading state', () => {
    vi.mocked(useSessionListStore).mockImplementationOnce((selector) => {
      const state = {
        sessions: [],
        isLoading: true,
        error: null,
        filters: {
          existeSession: true,
          existeSessionOuverte: true,
          societe: null,
          deviseLocale: null,
        },
        fetchSessions: mockFetchSessions,
        setFilters: mockSetFilters,
        clearError: mockClearError,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText('Chargement des sessions...')).toBeInTheDocument();
  });

  it('should display sessions when loaded', () => {
    vi.mocked(useSessionListStore).mockImplementation((selector) => {
      const state = {
        sessions: mockSessions,
        isLoading: false,
        error: null,
        filters: {
          existeSession: true,
          existeSessionOuverte: true,
          societe: null,
          deviseLocale: null,
        },
        fetchSessions: mockFetchSessions,
        setFilters: mockSetFilters,
        clearError: mockClearError,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText('CAI001')).toBeInTheDocument();
    expect(screen.getByText('C001')).toBeInTheDocument();
    expect(screen.getByText('OP001')).toBeInTheDocument();
    expect(screen.getByText('Ouverte')).toBeInTheDocument();
    expect(screen.getByText('Fermée')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorMessage = 'Erreur de chargement';
    vi.mocked(useSessionListStore).mockImplementation((selector) => {
      const state = {
        sessions: [],
        isLoading: false,
        error: errorMessage,
        filters: {
          existeSession: true,
          existeSessionOuverte: true,
          societe: null,
          deviseLocale: null,
        },
        fetchSessions: mockFetchSessions,
        setFilters: mockSetFilters,
        clearError: mockClearError,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should handle error dismissal', () => {
    vi.mocked(useSessionListStore).mockImplementation((selector) => {
      const state = {
        sessions: [],
        isLoading: false,
        error: 'Test error',
        filters: {
          existeSession: true,
          existeSessionOuverte: true,
          societe: null,
          deviseLocale: null,
        },
        fetchSessions: mockFetchSessions,
        setFilters: mockSetFilters,
        clearError: mockClearError,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    const dismissButton = screen.getByText('×');
    fireEvent.click(dismissButton);
    expect(mockClearError).toHaveBeenCalled();
  });

  it('should handle existe session checkbox change', () => {
    renderPage();
    const checkbox = screen.getByLabelText('Existe session');
    fireEvent.click(checkbox);
    expect(mockSetFilters).toHaveBeenCalledWith({ existeSession: false });
  });

  it('should handle existe session ouverte checkbox change', () => {
    renderPage();
    const checkbox = screen.getByLabelText('Session ouverte uniquement');
    fireEvent.click(checkbox);
    expect(mockSetFilters).toHaveBeenCalledWith({ existeSessionOuverte: false });
  });

  it('should handle societe select change', () => {
    renderPage();
    const select = screen.getByLabelText('Société:');
    fireEvent.change(select, { target: { value: 'CAI001' } });
    expect(mockSetFilters).toHaveBeenCalledWith({ societe: 'CAI001' });
  });

  it('should handle societe select clear', () => {
    renderPage();
    const select = screen.getByLabelText('Société:');
    fireEvent.change(select, { target: { value: '' } });
    expect(mockSetFilters).toHaveBeenCalledWith({ societe: null });
  });

  it('should handle refresh button click', () => {
    renderPage();
    const refreshButton = screen.getByText('Actualiser');
    fireEvent.click(refreshButton);
    expect(mockFetchSessions).toHaveBeenCalledTimes(2);
  });

  it('should disable refresh button when loading', () => {
    vi.mocked(useSessionListStore).mockImplementation((selector) => {
      const state = {
        sessions: [],
        isLoading: true,
        error: null,
        filters: {
          existeSession: true,
          existeSessionOuverte: true,
          societe: null,
          deviseLocale: null,
        },
        fetchSessions: mockFetchSessions,
        setFilters: mockSetFilters,
        clearError: mockClearError,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    const refreshButton = screen.getByText('Actualisation...');
    expect(refreshButton).toBeDisabled();
  });

  it('should handle back button click', () => {
    renderPage();
    const backButton = screen.getByText('Retour au menu');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('should display empty state when no sessions', () => {
    vi.mocked(useSessionListStore).mockImplementation((selector) => {
      const state = {
        sessions: [],
        isLoading: false,
        error: null,
        filters: {
          existeSession: true,
          existeSessionOuverte: true,
          societe: null,
          deviseLocale: null,
        },
        fetchSessions: mockFetchSessions,
        setFilters: mockSetFilters,
        clearError: mockClearError,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    expect(
      screen.getByText('Aucune session trouvée avec les filtres actuels.')
    ).toBeInTheDocument();
  });

  it('should display user name', () => {
    renderPage();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display session count', () => {
    vi.mocked(useSessionListStore).mockImplementation((selector) => {
      const state = {
        sessions: mockSessions,
        isLoading: false,
        error: null,
        filters: {
          existeSession: true,
          existeSessionOuverte: true,
          societe: null,
          deviseLocale: null,
        },
        fetchSessions: mockFetchSessions,
        setFilters: mockSetFilters,
        clearError: mockClearError,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText('2 sessions affichées')).toBeInTheDocument();
  });

  it('should call reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });
});