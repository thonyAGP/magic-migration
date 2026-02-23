import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { SessionConcurrency } from '@/types/sessionConcurrency';

const mockNavigate = vi.fn();
const mockCheckConcurrency = vi.fn();
const mockRegisterSession = vi.fn();
const mockReleaseSession = vi.fn();
const mockForceOpenSession = vi.fn();
const mockSetError = vi.fn();
const mockClearConflict = vi.fn();
const mockReset = vi.fn();

let mockStoreState = {
  activeSessions: [] as SessionConcurrency[],
  isLoading: false,
  error: null as string | null,
  conflictDetected: false,
  conflictingSession: null as SessionConcurrency | null,
  checkConcurrency: mockCheckConcurrency,
  registerSession: mockRegisterSession,
  releaseSession: mockReleaseSession,
  forceOpenSession: mockForceOpenSession,
  setError: mockSetError,
  clearConflict: mockClearConflict,
  reset: mockReset,
};

vi.mock('@/stores/sessionConcurrencyStore', () => ({
  useSessionConcurrencyStore: (selector: (state: typeof mockStoreState) => unknown) => {
    return selector(mockStoreState);
  },
}));

vi.mock('@/stores', () => ({
  useAuthStore: (selector: unknown) => {
    const store = {
      user: { prenom: 'John', nom: 'Doe' },
    };
    return typeof selector === 'function' ? selector(store) : store;
  },
}));

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui', () => ({
  Dialog: ({ open, children, title, onClose }: { open: boolean; children: React.ReactNode; title: string; onClose: () => void }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}));

import { SessionConcurrencyPage } from '@/pages/SessionConcurrencyPage';

const mockSession: SessionConcurrency = {
  societe: 'SOC001',
  compte: 12345,
  filiation: 1,
  terminalId: 'TERM001',
  timestamp: new Date('2026-02-21T10:30:00'),
  codeCalcul: 'C',
  coffreEnCoursComptage: true,
};

const renderPage = () => {
  return render(
    <BrowserRouter>
      <SessionConcurrencyPage />
    </BrowserRouter>
  );
};

describe('SessionConcurrencyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      activeSessions: [],
      isLoading: false,
      error: null,
      conflictDetected: false,
      conflictingSession: null,
      checkConcurrency: mockCheckConcurrency,
      registerSession: mockRegisterSession,
      releaseSession: mockReleaseSession,
      forceOpenSession: mockForceOpenSession,
      setError: mockSetError,
      clearConflict: mockClearConflict,
      reset: mockReset,
    };
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Contrôle de concurrence')).toBeInTheDocument();
    expect(screen.getByText('Gestion des sessions actives')).toBeInTheDocument();
  });

  it('displays user name', () => {
    renderPage();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockStoreState.isLoading = true;

    renderPage();
    expect(screen.getByText('Vérification en cours...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockStoreState.error = 'Session conflict detected';

    renderPage();
    expect(screen.getByText('Session conflict detected')).toBeInTheDocument();
  });

  it('displays empty state when no sessions', () => {
    renderPage();
    expect(screen.getByText('Aucune session active détectée')).toBeInTheDocument();
  });

  it('displays active sessions table', () => {
    mockStoreState.activeSessions = [mockSession];

    renderPage();
    expect(screen.getByText('SOC001')).toBeInTheDocument();
    expect(screen.getByText('12345 / 1')).toBeInTheDocument();
    expect(screen.getByText('TERM001')).toBeInTheDocument();
    expect(screen.getByText('En comptage')).toBeInTheDocument();
  });

  it('displays conflict dialog when conflict detected', () => {
    mockStoreState.conflictDetected = true;
    mockStoreState.conflictingSession = mockSession;

    renderPage();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Session déjà ouverte')).toBeInTheDocument();
    expect(screen.getByText('Une session est déjà ouverte pour ce compte')).toBeInTheDocument();
  });

  it('handles force open with reason', async () => {
    mockStoreState.conflictDetected = true;
    mockStoreState.conflictingSession = mockSession;
    mockForceOpenSession.mockResolvedValue(undefined);

    renderPage();

    const textarea = screen.getByPlaceholderText(/Ex: Session bloquée/i);
    fireEvent.change(textarea, { target: { value: 'Session bloquée suite à coupure réseau' } });

    const forceButton = screen.getByText("Forcer l'ouverture");
    fireEvent.click(forceButton);

    await waitFor(() => {
      expect(mockForceOpenSession).toHaveBeenCalledWith(
        'SOC001',
        12345,
        1,
        'CURRENT_TERMINAL',
        'Session bloquée suite à coupure réseau'
      );
    });
  });

  it('disables force button when no reason provided', () => {
    mockStoreState.conflictDetected = true;
    mockStoreState.conflictingSession = mockSession;

    renderPage();

    const forceButton = screen.getByText("Forcer l'ouverture");
    expect(forceButton).toBeDisabled();
  });

  it('handles dialog cancel', () => {
    mockStoreState.conflictDetected = true;
    mockStoreState.conflictingSession = mockSession;

    renderPage();

    const cancelButton = screen.getByText('Annuler');
    fireEvent.click(cancelButton);

    expect(mockClearConflict).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('handles back to menu button', () => {
    renderPage();

    const backButton = screen.getByText('Retour au menu');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('calls reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });
});