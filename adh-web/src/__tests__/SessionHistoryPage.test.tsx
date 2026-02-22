import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { SessionHistoryState } from '@/types/sessionHistory';

vi.mock('@/stores/sessionHistoryStore', () => ({
  useSessionHistoryStore: vi.fn(),
}));

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="screen-layout">{children}</div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { SessionHistoryPage } from '@/pages/SessionHistoryPage';
import { useSessionHistoryStore } from '@/stores/sessionHistoryStore';
import { useAuthStore } from '@/stores';

const createMockStore = (overrides?: Partial<SessionHistoryState>): SessionHistoryState => ({
  sessions: [],
  selectedSessionDetails: null,
  selectedSessionCurrencies: [],
  isLoading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    status: null,
    operatorId: null,
  },
  societe: 'ADH',
  localCurrencyCode: 'EUR',
  amountMask: '0,0.00',
  loadSessions: vi.fn(),
  loadSessionDetails: vi.fn(),
  loadSessionCurrencies: vi.fn(),
  setFilters: vi.fn(),
  clearFilters: vi.fn(),
  setSociete: vi.fn(),
  setLocalCurrencyCode: vi.fn(),
  setAmountMask: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn(),
  ...overrides,
});

const mockUser = {
  id: 'OP001',
  nom: 'Dupont',
  prenom: 'Jean',
  role: 'caissier',
};

describe('SessionHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(useAuthStore).mockReturnValue(mockUser);
  });

  it('renders without crashing', () => {
    const mockStore = createMockStore();
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    expect(screen.getByText('Historique des sessions')).toBeInTheDocument();
    expect(screen.getByText('Sélectionner les critères de recherche')).toBeInTheDocument();
  });

  it('displays loading state when fetching sessions', () => {
    const mockStore = createMockStore({ isLoading: true });
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const loadingElements = screen.getAllByText(/chargement/i);
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('displays error message when error occurs', () => {
    const mockStore = createMockStore({ error: 'Erreur de chargement des sessions' });
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    expect(screen.getByText('Erreur de chargement des sessions')).toBeInTheDocument();
  });

  it('displays user information', () => {
    const mockStore = createMockStore();
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });

  it('handles filter form inputs', () => {
    const mockStore = createMockStore();
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const startDateInput = screen.getByLabelText(/date début/i) as HTMLInputElement;
    const endDateInput = screen.getByLabelText(/date fin/i) as HTMLInputElement;
    const statusSelect = screen.getByLabelText(/statut/i) as HTMLSelectElement;
    const operatorInput = screen.getByPlaceholderText(/code opérateur/i) as HTMLInputElement;

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });
    fireEvent.change(statusSelect, { target: { value: 'OUVERTE' } });
    fireEvent.change(operatorInput, { target: { value: 'OP001' } });

    expect(startDateInput.value).toBe('2024-01-01');
    expect(endDateInput.value).toBe('2024-01-31');
    expect(statusSelect.value).toBe('OUVERTE');
    expect(operatorInput.value).toBe('OP001');
  });

  it('applies filters when clicking apply button', async () => {
    const loadSessions = vi.fn().mockResolvedValue(undefined);
    const setFilters = vi.fn();
    const mockStore = createMockStore({ loadSessions, setFilters });
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const startDateInput = screen.getByLabelText(/date début/i);
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(setFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
        }),
      );
      expect(loadSessions).toHaveBeenCalled();
    });
  });

  it('clears filters when clicking clear button', () => {
    const clearFilters = vi.fn();
    const mockStore = createMockStore({ clearFilters });
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const startDateInput = screen.getByLabelText(/date début/i);
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    const clearButton = screen.getByRole('button', { name: /réinitialiser/i });
    fireEvent.click(clearButton);

    expect(clearFilters).toHaveBeenCalled();
    expect((startDateInput as HTMLInputElement).value).toBe('');
  });

  it('displays sessions when data is loaded', async () => {
    const mockSessions = [
      {
        sessionId: 'S001',
        openedDate: new Date('2024-01-15'),
        openedTime: '08:00',
        closedDate: new Date('2024-01-15'),
        closedTime: '18:00',
        operatorId: 'OP001',
        status: 'FERMEE',
        hasDetails: true,
        title: null,
      },
      {
        sessionId: 'S002',
        openedDate: new Date('2024-01-16'),
        openedTime: '08:30',
        closedDate: null,
        closedTime: null,
        operatorId: 'OP002',
        status: 'OUVERTE',
        hasDetails: false,
        title: null,
      },
    ];

    const loadSessions = vi.fn().mockResolvedValue(undefined);
    const setFilters = vi.fn();
    const mockStore = createMockStore({ sessions: mockSessions, loadSessions, setFilters });
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('S001')).toBeInTheDocument();
      expect(screen.getByText('S002')).toBeInTheDocument();
      expect(screen.getByText(/2 session\(s\) trouvée\(s\)/)).toBeInTheDocument();
    });
  });

  it('handles session selection and loads details', async () => {
    const mockSessions = [
      {
        sessionId: 'S001',
        openedDate: new Date('2024-01-15'),
        openedTime: '08:00',
        closedDate: new Date('2024-01-15'),
        closedTime: '18:00',
        operatorId: 'OP001',
        status: 'FERMEE',
        hasDetails: true,
        title: null,
      },
    ];

    const loadSessions = vi.fn().mockResolvedValue(undefined);
    const loadSessionDetails = vi.fn().mockResolvedValue(undefined);
    const loadSessionCurrencies = vi.fn().mockResolvedValue(undefined);
    const setFilters = vi.fn();

    const mockStore = createMockStore({
      sessions: mockSessions,
      loadSessions,
      loadSessionDetails,
      loadSessionCurrencies,
      setFilters,
    });

    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('S001')).toBeInTheDocument();
    });

    const sessionItem = screen.getByText('S001');
    fireEvent.click(sessionItem);

    await waitFor(() => {
      expect(loadSessionDetails).toHaveBeenCalledWith('S001');
      expect(loadSessionCurrencies).toHaveBeenCalledWith('S001');
    });
  });

  it('displays session details when selected', async () => {
    const mockSessions = [
      {
        sessionId: 'S001',
        openedDate: new Date('2024-01-15'),
        openedTime: '08:00',
        closedDate: new Date('2024-01-15'),
        closedTime: '18:00',
        operatorId: 'OP001',
        status: 'FERMEE',
        hasDetails: true,
        title: null,
      },
    ];

    const mockDetails = {
      sessionId: 'S001',
      totalAmount: 1250.75,
      hasDetails: true,
      isEndOfHistory: false,
    };

    const mockCurrencies = [
      {
        sessionId: 'S001',
        currencyCode: 'EUR',
        amount: 1000.0,
        totalAmount: 1000.0,
        isLocalCurrency: true,
        isEndOfHistory: false,
      },
      {
        sessionId: 'S001',
        currencyCode: 'USD',
        amount: 250.75,
        totalAmount: 250.75,
        isLocalCurrency: false,
        isEndOfHistory: false,
      },
    ];

    const loadSessions = vi.fn().mockResolvedValue(undefined);
    const setFilters = vi.fn();
    const mockStore = createMockStore({
      sessions: mockSessions,
      selectedSessionDetails: mockDetails,
      selectedSessionCurrencies: mockCurrencies,
      loadSessions,
      setFilters,
    });

    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('1 250,75 €')).toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
    });
  });

  it('navigates back to menu when clicking back button in filters phase', () => {
    const mockStore = createMockStore();
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const backButton = screen.getByRole('button', { name: /retour au menu/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('returns to filters phase when clicking back button in results phase', async () => {
    const mockSessions = [
      {
        sessionId: 'S001',
        openedDate: new Date('2024-01-15'),
        openedTime: '08:00',
        closedDate: new Date('2024-01-15'),
        closedTime: '18:00',
        operatorId: 'OP001',
        status: 'FERMEE',
        hasDetails: true,
        title: null,
      },
    ];

    const loadSessions = vi.fn().mockResolvedValue(undefined);
    const setFilters = vi.fn();
    const mockStore = createMockStore({ sessions: mockSessions, loadSessions, setFilters });
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText(/1 session\(s\) trouvée\(s\)/)).toBeInTheDocument();
    });

    const newSearchButton = screen.getByRole('button', { name: /nouvelle recherche/i });
    fireEvent.click(newSearchButton);

    await waitFor(() => {
      expect(screen.getByText('Sélectionner les critères de recherche')).toBeInTheDocument();
    });
  });

  it('displays empty state when no sessions found', async () => {
    const loadSessions = vi.fn().mockResolvedValue(undefined);
    const setFilters = vi.fn();
    const mockStore = createMockStore({ sessions: [], loadSessions, setFilters });
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    const applyButton = screen.getByRole('button', { name: /appliquer les filtres/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Aucune session trouvée')).toBeInTheDocument();
    });
  });

  it('calls reset on unmount', () => {
    const reset = vi.fn();
    const mockStore = createMockStore({ reset });
    vi.mocked(useSessionHistoryStore).mockImplementation((selector) =>
      selector(mockStore),
    );

    const { unmount } = render(
      <BrowserRouter>
        <SessionHistoryPage />
      </BrowserRouter>,
    );

    unmount();

    expect(reset).toHaveBeenCalled();
  });
});