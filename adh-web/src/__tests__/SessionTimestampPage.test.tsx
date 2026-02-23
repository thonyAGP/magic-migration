import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockGetSessionTimestamp = vi.fn();
const mockResetState = vi.fn();
const mockUser = { prenom: 'John', nom: 'Doe' };
const mockNavigate = vi.fn();

vi.mock('@/stores/sessionTimestampStore', () => ({
  useSessionTimestampStore: vi.fn((selector) => {
    const state = {
      sessionDate: null,
      sessionTime: '',
      timestamp: 0,
      isLoading: false,
      error: null,
      getSessionTimestamp: mockGetSessionTimestamp,
      resetState: mockResetState,
    };
    return selector(state);
  }),
}));

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = { user: mockUser };
    return selector(state);
  }),
}));

import { SessionTimestampPage } from '@/pages/SessionTimestampPage';
import { useSessionTimestampStore } from '@/stores/sessionTimestampStore';
import { useAuthStore } from '@/stores';

describe('SessionTimestampPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSessionTimestampStore).mockImplementation((selector) => {
      const state = {
        sessionDate: null,
        sessionTime: '',
        timestamp: 0,
        isLoading: false,
        error: null,
        getSessionTimestamp: mockGetSessionTimestamp,
        resetState: mockResetState,
      };
      return selector(state);
    });
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = { user: mockUser };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Timestamp Session')).toBeInTheDocument();
    expect(screen.getByText(/horodatage de la session en cours/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    vi.mocked(useSessionTimestampStore).mockImplementation((selector) => {
      const state = {
        sessionDate: null,
        sessionTime: '',
        timestamp: 0,
        isLoading: true,
        error: null,
        getSessionTimestamp: mockGetSessionTimestamp,
        resetState: mockResetState,
      };
      return selector(state);
    });

    render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays data when loaded', () => {
    const mockDate = new Date('2026-02-21T09:30:00');
    vi.mocked(useSessionTimestampStore).mockImplementation((selector) => {
      const state = {
        sessionDate: mockDate,
        sessionTime: '09:30:00',
        timestamp: 1708506600,
        isLoading: false,
        error: null,
        getSessionTimestamp: mockGetSessionTimestamp,
        resetState: mockResetState,
      };
      return selector(state);
    });

    render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    expect(screen.getByText('21/02/2026')).toBeInTheDocument();
    expect(screen.getByText('09:30:00')).toBeInTheDocument();
    expect(screen.getByText('1708506600')).toBeInTheDocument();
    expect(screen.getByText('Date Session')).toBeInTheDocument();
    expect(screen.getByText('Heure Session')).toBeInTheDocument();
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
  });

  it('displays user info when authenticated', () => {
    render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    const backButton = screen.getByText('Retour au menu');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('displays error state', () => {
    vi.mocked(useSessionTimestampStore).mockImplementation((selector) => {
      const state = {
        sessionDate: null,
        sessionTime: '',
        timestamp: 0,
        isLoading: false,
        error: 'Erreur de connexion au serveur',
        getSessionTimestamp: mockGetSessionTimestamp,
        resetState: mockResetState,
      };
      return selector(state);
    });

    render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Erreur de connexion au serveur')).toBeInTheDocument();
  });

  it('displays no session message when no data', () => {
    render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Aucune session active')).toBeInTheDocument();
  });

  it('calls getSessionTimestamp on mount', () => {
    render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    expect(mockGetSessionTimestamp).toHaveBeenCalledTimes(1);
  });

  it('calls resetState on unmount', () => {
    const { unmount } = render(
      <BrowserRouter>
        <SessionTimestampPage />
      </BrowserRouter>
    );

    unmount();

    expect(mockResetState).toHaveBeenCalledTimes(1);
  });
});