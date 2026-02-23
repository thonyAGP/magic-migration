import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, mockNavigate } from 'react-router-dom';
import type { Session } from '@/types/fermetureSessions';
const mockLoadSessions = vi.fn();
const mockLoadUnilateralBilateralTypes = vi.fn();
const mockFermerSession = vi.fn();
const mockGenerateClosureCode = vi.fn();
const mockValidateSessionClosure = vi.fn();
const mockSetCurrentSession = vi.fn();
const mockClearError = vi.fn();
const mockReset = vi.fn();

let mockState = {
  sessions: [] as Session[],
  currentSession: null as Session | null,
  unilateralBilateralTypes: [] as unknown[],
  isLoading: false,
  error: null as string | null,
  isClosing: false,
};

vi.mock('@/stores/fermetureSessionsStore', () => ({
  useFermetureSessionsStore: (selector: (state: unknown) => unknown) => {
    const state = {
      ...mockState,
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
    mockState = {
      sessions: [],
      currentSession: null,
      unilateralBilateralTypes: [],
      isLoading: false,
      error: null,
      isClosing: false,
    };
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
    mockState.isLoading = true;
    renderComponent();
    expect(screen.getByText(/Chargement des sessions/)).toBeInTheDocument();
  });

  it('should display empty state when no sessions', () => {
    renderComponent();
    expect(screen.getByText(/Aucune session ouverte/i)).toBeInTheDocument();
  });

  it('should display sessions when loaded', () => {
    mockState.sessions = [mockSession, mockSession2];
    renderComponent();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorMessage = 'Erreur de chargement';
    mockState.error = errorMessage;
    renderComponent();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should handle session selection', () => {
    mockState.sessions = [mockSession];
    renderComponent();
    const radioButton = screen.getByRole('radio');
    fireEvent.click(radioButton);
    expect(mockSetCurrentSession).toHaveBeenCalledWith(mockSession);
  });

  it('should initiate closure on button click', async () => {
    mockState.sessions = [mockSession];
    mockState.currentSession = mockSession;
    renderComponent();
    const radioButton = screen.getByRole('radio');
    fireEvent.click(radioButton);

    const closureButton = screen.getByText('Fermer la session sélectionnée');
    fireEvent.click(closureButton);

    await waitFor(() => {
      expect(mockValidateSessionClosure).toHaveBeenCalledWith(1);
      expect(mockGenerateClosureCode).toHaveBeenCalledWith(1);
    });
  });

  it('should navigate back to menu on back button click', async () => {
    renderComponent();
    const backButton = screen.getByText('Retour au menu');
    fireEvent.click(backButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('should disable closure button when no session selected', () => {
    renderComponent();
    const closureButton = screen.getByText('Fermer la session sélectionnée');
    expect(closureButton).toBeDisabled();
  });

  it('should display user information', () => {
    renderComponent();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });
});