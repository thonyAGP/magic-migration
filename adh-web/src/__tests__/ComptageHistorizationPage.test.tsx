import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, mockNavigate } from 'react-router-dom';

vi.mock('@/stores/comptageHistorizationStore', () => ({
  useComptageHistorizationStore: vi.fn(),
}));

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screen-layout">{children}</div>
  ),
}));

import { ComptageHistorizationPage } from '@/pages/ComptageHistorizationPage';
import { useComptageHistorizationStore } from '@/stores/comptageHistorizationStore';
import { useAuthStore } from '@/stores';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <ComptageHistorizationPage />
    </BrowserRouter>
  );
};

describe('ComptageHistorizationPage', () => {
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    vi.mocked(useComptageHistorizationStore).mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: null,
        lastHistoId: null,
        reset: mockReset,
      };
      return selector(state);
    });

    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = {
        user: {
          code: 'OP001',
          prenom: 'Jean',
          nom: 'Dupont',
          codeAcces: '1234',
          fonction: 'Caissier',
          societeDefaut: 'SOC001',
        },
      };
      return selector(state);
    });
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Historisation des comptages')).toBeInTheDocument();
  });

  it('displays backend service information', () => {
    renderPage();
    expect(screen.getByText('Service backend - Pas d\'interface utilisateur')).toBeInTheDocument();
    expect(screen.getByText('Programme backend uniquement')).toBeInTheDocument();
  });

  it('displays user information when authenticated', () => {
    renderPage();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('displays feature list', () => {
    renderPage();
    expect(screen.getByText(/Sauvegarde automatique des comptages validés/)).toBeInTheDocument();
    expect(screen.getByText(/Enregistrement header/)).toBeInTheDocument();
    expect(screen.getByText(/Enregistrement détails par devise/)).toBeInTheDocument();
    expect(screen.getByText(/Retour du chronoHisto/)).toBeInTheDocument();
  });

  it('displays code example', () => {
    renderPage();
    expect(screen.getByText('Appel depuis l\'interface')).toBeInTheDocument();
    expect(screen.getByText(/const { saveComptageHistorization }/)).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    vi.mocked(useComptageHistorizationStore).mockImplementation((selector) => {
      const state = {
        isLoading: true,
        error: null,
        lastHistoId: null,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText('Sauvegarde en cours...')).toBeInTheDocument();
  });

  it('displays error state when error is present', () => {
    vi.mocked(useComptageHistorizationStore).mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: 'Erreur de sauvegarde',
        lastHistoId: null,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText('Erreur de sauvegarde')).toBeInTheDocument();
  });

  it('displays last historization ID when available', () => {
    vi.mocked(useComptageHistorizationStore).mockImplementation((selector) => {
      const state = {
        isLoading: false,
        error: null,
        lastHistoId: 12345,
        reset: mockReset,
      };
      return selector(state);
    });

    renderPage();
    expect(screen.getByText('Dernière historisation: #12345')).toBeInTheDocument();
  });

  it('navigates back to menu when back button is clicked', () => {
    renderPage();
    const backButton = screen.getByText('Retour au menu');
    backButton.click();
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('calls reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });

  it('does not display user info when user is null', () => {
    vi.mocked(useAuthStore).mockImplementation((selector) => {
      const state = {
        user: null,
      };
      return selector(state);
    });

    renderPage();
    expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument();
  });
});