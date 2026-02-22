import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockUseAuthStore = vi.fn();
const mockUseProgramDispatchStore = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/stores', () => ({
  useAuthStore: (selector: unknown) => mockUseAuthStore(selector),
}));

vi.mock('@/stores/programDispatchStore', () => ({
  useProgramDispatchStore: (selector: unknown) => mockUseProgramDispatchStore(selector),
}));

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="screen-layout">{children}</div>,
}));

import { ProgramDispatchPage } from '@/pages/ProgramDispatchPage';

describe('ProgramDispatchPage', () => {
  const mockGetLastClickedControl = vi.fn();
  const mockDispatchToProgram = vi.fn();
  const mockClearDispatch = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        user: { prenom: 'Test', nom: 'User' },
      };
      return selector(state);
    });

    mockUseProgramDispatchStore.mockImplementation((selector) => {
      const state = {
        lastClickedControl: null,
        isDispatching: false,
        error: null,
        getLastClickedControl: mockGetLastClickedControl,
        dispatchToProgram: mockDispatchToProgram,
        clearDispatch: mockClearDispatch,
        reset: mockReset,
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ProgramDispatchPage />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('screen-layout')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Initialisation...')).toBeInTheDocument();
  });

  it('displays dispatching state when isDispatching is true', () => {
    mockUseProgramDispatchStore.mockImplementation((selector) => {
      const state = {
        lastClickedControl: 'BTN_CHANGE',
        isDispatching: true,
        error: null,
        getLastClickedControl: mockGetLastClickedControl,
        dispatchToProgram: mockDispatchToProgram,
        clearDispatch: mockClearDispatch,
        reset: mockReset,
      };
      return selector(state);
    });

    renderComponent();
    expect(screen.getByText('Redirection en cours...')).toBeInTheDocument();
    expect(screen.getByText('Contrôle: BTN_CHANGE')).toBeInTheDocument();
  });

  it('navigates to menu when no control is clicked', async () => {
    mockGetLastClickedControl.mockResolvedValue(null);

    renderComponent();

    await waitFor(() => {
      expect(mockGetLastClickedControl).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('dispatches to correct route when control is clicked', async () => {
    mockGetLastClickedControl.mockResolvedValue('BTN_CHANGE');
    mockDispatchToProgram.mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      expect(mockGetLastClickedControl).toHaveBeenCalled();
      expect(mockDispatchToProgram).toHaveBeenCalledWith('BTN_CHANGE');
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/change');
    });
  });

  it('navigates to menu for unknown control', async () => {
    mockGetLastClickedControl.mockResolvedValue('UNKNOWN_BTN');
    mockDispatchToProgram.mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      expect(mockGetLastClickedControl).toHaveBeenCalled();
      expect(mockDispatchToProgram).toHaveBeenCalledWith('UNKNOWN_BTN');
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('displays error state when error occurs', () => {
    mockUseProgramDispatchStore.mockImplementation((selector) => {
      const state = {
        lastClickedControl: 'BTN_CHANGE',
        isDispatching: false,
        error: 'Route non trouvée',
        getLastClickedControl: mockGetLastClickedControl,
        dispatchToProgram: mockDispatchToProgram,
        clearDispatch: mockClearDispatch,
        reset: mockReset,
      };
      return selector(state);
    });

    renderComponent();

    expect(screen.getByText('Erreur de routage')).toBeInTheDocument();
    expect(screen.getByText('Route non trouvée')).toBeInTheDocument();
    expect(screen.getByText('Contrôle: BTN_CHANGE')).toBeInTheDocument();
  });

  it('handles error state interactions', async () => {
    mockUseProgramDispatchStore.mockImplementation((selector) => {
      const state = {
        lastClickedControl: 'BTN_CHANGE',
        isDispatching: false,
        error: 'Route non trouvée',
        getLastClickedControl: mockGetLastClickedControl,
        dispatchToProgram: mockDispatchToProgram,
        clearDispatch: mockClearDispatch,
        reset: mockReset,
      };
      return selector(state);
    });

    renderComponent();

    const retourButton = screen.getByText('Retour au menu');
    retourButton.click();

    await waitFor(() => {
      expect(mockClearDispatch).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('displays user info in error state', () => {
    mockUseProgramDispatchStore.mockImplementation((selector) => {
      const state = {
        lastClickedControl: null,
        isDispatching: false,
        error: 'Test error',
        getLastClickedControl: mockGetLastClickedControl,
        dispatchToProgram: mockDispatchToProgram,
        clearDispatch: mockClearDispatch,
        reset: mockReset,
      };
      return selector(state);
    });

    renderComponent();

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('calls reset on unmount', () => {
    const { unmount } = renderComponent();
    unmount();

    expect(mockReset).toHaveBeenCalled();
  });

  it('dispatches all known routes correctly', async () => {
    const routes = [
      { control: 'BTN_CHANGE', route: '/caisse/change' },
      { control: 'BTN_DEPOT', route: '/caisse/depot' },
      { control: 'BTN_GARANTIE', route: '/caisse/garanties' },
      { control: 'BTN_TELEPHONE', route: '/caisse/telephone' },
      { control: 'BTN_MENU_COMPTE', route: '/caisse/changement-compte' },
      { control: 'BTN_EXTRAIT', route: '/caisse/extrait' },
    ];

    for (const { control, route } of routes) {
      vi.clearAllMocks();
      mockGetLastClickedControl.mockResolvedValue(control);
      mockDispatchToProgram.mockResolvedValue(undefined);

      renderComponent();

      await waitFor(() => {
        expect(mockDispatchToProgram).toHaveBeenCalledWith(control);
        expect(mockNavigate).toHaveBeenCalledWith(route);
      });
    }
  });
});