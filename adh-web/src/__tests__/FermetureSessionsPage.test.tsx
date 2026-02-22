import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { Session } from '@/types/fermetureSessions';

const mockNavigate = vi.fn();
const mockLoadSessions = vi.fn();
const mockLoadUnilateralBilateralTypes = vi.fn();
const mockFermerSession = vi.fn();
const mockGenerateClosureCode = vi.fn();
const mockValidateSessionClosure = vi.fn();
const mockSetCurrentSession = vi.fn();
const mockClearError = vi.fn();
const mockReset = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/stores/fermetureSessionsStore', () => ({
  useFermetureSessionsStore: (selector: (state: unknown) => unknown) => {
    const state = {
      sessions: [] as Session[],
      currentSession: null,
      unilateralBilateralTypes: [],
      isLoading: false,
      error: null,
      isClosing: false,
      loadSessions: mockLoadSessions,
      loadUnilateralBilateralTypes: mockLoadUnilateralBilateralTypes,
      fermerSession: mockFermerSession,
      generateClosureCode: mockGenerateClosureCode,
      validateSessionClosure: mockValidateSessionClosure,
      setCurrentSession: mockSetCurrentSession,
      clearError: mockClearError,
      reset: mockReset,
    };
    return selector(state);
  },
}));

vi.mock('@/stores', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) => {
    const state = {
      user: { prenom: 'Jean', nom: 'Dupont' },
    };
    return selector(state);
  },
}));

import { FermetureSessionsPage } from '@/pages/FermetureSessionsPage';

const mockSession: Session = {
  id: 1,
  dateOuverture: new Date('2026-02-20T09:00:00'),
  dateFermeture: null,
  statut: 'O',
};

const mockSession2: Session = {
  id: 2,
  dateOuverture: new Date('2026-02-19T10:00:00'),
  dateFermeture: null,
  statut: 'O',
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <FermetureSessionsPage />
    </BrowserRouter>
  );
};

describe('FermetureSessionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadSessions.mockResolvedValue(undefined);
    mockLoadUnilateralBilateralTypes.mockResolvedValue(undefined);
    mockFermerSession.mockResolvedValue(undefined);
    mockGenerateClosureCode.mockReturnValue('CLOSE-2026-001');
    mockValidateSessionClosure.mockResolvedValue(true);
  });

  it('should render without crashing', () => {
    renderComponent();
    expect(screen.getByText(/Fermeture de sessions/i)).toBeInTheDocument();
  });

  it('should load sessions and types on mount', () => {
    renderComponent();
    expect(mockLoadSessions).toHaveBeenCalledWith({ statut: 'O' });
    expect(mockLoadUnilateralBilateralTypes).toHaveBeenCalled();
  });

  it('should call reset on unmount', () => {
    const { unmount } = renderComponent();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    vi.mocked(vi.importActual('@/stores/fermetureSessionsStore')).useFermetureSessionsStore = 
      vi.fn((selector) => {
        const state = {
          sessions: [],
          currentSession: null,
          unilateralBilateralTypes: [],
          isLoading: true,
          error: null,
          isClosing: false,
          loadSessions: mockLoadSessions,
          loadUnilateralBilateralTypes: mockLoadUnilateralBilateralTypes,
          fermerSession: mockFermerSession,
          generateClosureCode: mockGenerateClosureCode,
          validateSessionClosure: mockValidateSessionClosure,
          setCurrentSession: mockSetCurrentSession,
          clearError: mockClearError,
          reset: mockReset,
        };
        return selector(state);
      }) as Mock;

    renderComponent();
    expect(screen.getByText(/Chargement des sessions/i)).toBeInTheDocument();
  });

  it('should display empty state when no sessions', () => {
    renderComponent();
    expect(screen.getByText(/Aucune session ouverte/i)).toBeInTheDocument();
  });

  it('should display sessions when loaded', () => {
    vi.mocked(vi.importActual('@/stores/fermetureSessionsStore')).useFermetureSessionsStore = 
      vi.fn((selector) => {
        const state = {
          sessions: [mockSession, mockSession2],
          currentSession: null,
          unilateralBilateralTypes: [],
          isLoading: false,
          error: null,
          isClosing: false,
          loadSessions: mockLoadSessions,
          loadUnilateralBilateralTypes: mockLoadUnilateralBilateralTypes,
          fermerSession: mockFermerSession,
          generateClosureCode: mockGenerateClosureCode,
          validateSessionClosure: mockValidateSessionClosure,
          setCurrentSession: mockSetCurrentSession,
          clearError: mockClearError,
          reset: mockReset,
        };
        return selector(state);
      }) as Mock;

    renderComponent();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorMessage = 'Erreur de chargement';
    vi.mocked(vi.importActual('@/stores/fermetureSessionsStore')).useFermetureSessionsStore = 
      vi.fn((selector) => {
        const state = {
          sessions: [],
          currentSession: null,
          unilateralBilateralTypes: [],
          isLoading: false,
          error: errorMessage,
          isClosing: false,
          loadSessions: mockLoadSessions,
          loadUnilateralBilateralTypes: mockLoadUnilateralBilateralTypes,
          fermerSession: mockFermerSession,
          generateClosureCode: mockGenerateClosureCode,
          validateSessionClosure: mockValidateSessionClosure,
          setCurrentSession: mockSetCurrentSession,
          clearError: mockClearError,
          reset: mockReset,
        };
        return selector(state);
      }) as Mock;

    renderComponent();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should handle session selection', () => {
    vi.mocked(vi.importActual('@/stores/fermetureSessionsStore')).useFermetureSessionsStore = 
      vi.fn((selector) => {
        const state = {
          sessions: [mockSession],
          currentSession: null,
          unilateralBilateralTypes: [],
          isLoading: false,
          error: null,
          isClosing: false,
          loadSessions: mockLoadSessions,
          loadUnilateralBilateralTypes: mockLoadUnilateralBilateralTypes,
          fermerSession: mockFermerSession,
          generateClosureCode: mockGenerateClosureCode,
          validateSessionClosure: mockValidateSessionClosure,
          setCurrentSession: mockSetCurrentSession,
          clearError: mockClearError,
          reset: mockReset,
        };
        return selector(state);
      }) as Mock;

    renderComponent();
    const radioButton = screen.getByRole('radio');
    fireEvent.click(radioButton);
    expect(mockSetCurrentSession).toHaveBeenCalledWith(mockSession);
  });

  it('should initiate closure on button click', async () => {
    vi.mocked(vi.importActual('@/stores/fermetureSessionsStore')).useFermetureSessionsStore = 
      vi.fn((selector) => {
        const state = {
          sessions: [mockSession],
          currentSession: mockSession,
          unilateralBilateralTypes: [],
          isLoading: false,
          error: null,
          isClosing: false,
          loadSessions: mockLoadSessions,
          loadUnilateralBilateralTypes: mockLoadUnilateralBilateralTypes,
          fermerSession: mockFermerSession,
          generateClosureCode: mockGenerateClosureCode,
          validateSessionClosure: mockValidateSessionClosure,
          setCurrentSession: mockSetCurrentSession,
          clearError: mockClearError,
          reset: mockReset,
        };
        return selector(state);
      }) as Mock;

    renderComponent();
    const radioButton = screen.getByRole('radio');
    fireEvent.click(radioButton);

    const closureButton = screen.getByText(/Fermer la session sélectionnée/i);
    fireEvent.click(closureButton);

    await waitFor(() => {
      expect(mockValidateSessionClosure).toHaveBeenCalledWith(1);
      expect(mockGenerateClosureCode).toHaveBeenCalledWith(1);
    });
  });

  it('should navigate back to menu on back button click', () => {
    renderComponent();
    const backButton = screen.getByText(/Retour au menu/i);
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('should disable closure button when no session selected', () => {
    renderComponent();
    const closureButton = screen.getByText(/Fermer la session sélectionnée/i);
    expect(closureButton).toBeDisabled();
  });

  it('should display user information', () => {
    renderComponent();
    expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
  });
});