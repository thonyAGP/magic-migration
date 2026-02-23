import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockUseDeviseSessionStore = vi.fn();
const mockUseAuthStore = vi.fn();

vi.mock('@/stores/deviseSessionStore', () => ({
  useDeviseSessionStore: (selector: (state: unknown) => unknown) =>
    mockUseDeviseSessionStore(selector),
}));

vi.mock('@/stores', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    mockUseAuthStore(selector),
}));

import { DeviseSessionPage } from '@/pages/DeviseSessionPage';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <DeviseSessionPage />
    </BrowserRouter>
  );
};

describe('DeviseSessionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDeviseSessionStore.mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: null,
        reset: vi.fn(),
      };
      return selector(state);
    });

    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        user: {
          id: 1,
          prenom: 'Jean',
          nom: 'Dupont',
          login: 'jdupont',
          email: 'jean.dupont@test.com',
          typeUser: 'caissier',
        },
      };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    renderPage();
    expect(
      screen.getByText('Mise à jour Session Devise')
    ).toBeInTheDocument();
  });

  it('displays page title and description', () => {
    renderPage();
    expect(
      screen.getByText('Mise à jour Session Devise')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Service Web sans interface/)
    ).toBeInTheDocument();
  });

  it('displays user information when authenticated', () => {
    renderPage();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('does not display user information when not authenticated', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      const state = { user: null };
      return selector(state);
    });

    renderPage();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
  });

  it('displays backend active indicator', () => {
    renderPage();
    expect(screen.getByText('Programme backend actif')).toBeInTheDocument();
  });

  it('displays functionality description', () => {
    renderPage();
    expect(screen.getByText('Fonctionnalité')).toBeInTheDocument();
    expect(
      screen.getByText(/Ce service Web synchronise automatiquement/)
    ).toBeInTheDocument();
  });

  it('displays list of calling programs', () => {
    renderPage();
    expect(screen.getByText('Programmes appelants (11)')).toBeInTheDocument();
    expect(
      screen.getByText(/Contrôle fermeture caisse WS/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Fermeture caisse \(131\)/)).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    mockUseDeviseSessionStore.mockImplementation((selector) => {
      const state = {
        isLoading: true,
        error: null,
        reset: vi.fn(),
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText('Mise à jour en cours...')).toBeInTheDocument();
  });

  it('displays error message when error exists', () => {
    const errorMessage = 'Erreur de synchronisation';
    mockUseDeviseSessionStore.mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: errorMessage,
        reset: vi.fn(),
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('does not display loading state when isLoading is false', () => {
    renderPage();
    expect(
      screen.queryByText('Mise à jour en cours...')
    ).not.toBeInTheDocument();
  });

  it('does not display error when error is null', () => {
    renderPage();
    const errorElements = screen
      .queryAllByText(/erreur/i)
      .filter((el) => el.className.includes('red'));
    expect(errorElements).toHaveLength(0);
  });

  it('navigates back to menu when back button is clicked', () => {
    renderPage();
    const backButton = screen.getByText('Retour au menu');
    backButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('calls reset on unmount', () => {
    const mockReset = vi.fn();
    mockUseDeviseSessionStore.mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: null,
        reset: mockReset,
      };
      return selector(state);
    });

    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });
});