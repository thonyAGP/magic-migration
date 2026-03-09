import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const { mockStore } = vi.hoisted(() => {
  const store = {
    sessions: [] as Array<{
      id: number;
      societe: string;
      caisse: string;
      operateur: string;
      dateOuverture: Date;
      etat: string;
      montantOuverture: number | null;
    }>,
    isLoading: false,
    error: null as string | null,
    filters: {
      existeSession: true,
      existeSessionOuverte: true,
      societe: null as string | null,
      deviseLocale: null as string | null,
    },
    fetchSessions: vi.fn(),
    setFilters: vi.fn(),
    clearError: vi.fn(),
    reset: vi.fn(),
  };
  return { mockStore: store };
});

vi.mock('@/stores/sessionListStore', () => ({
  useSessionListStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}));

vi.mock('@/stores', () => ({
  useAuthStore: (selector: (s: { user: { prenom: string; nom: string } | null }) => unknown) =>
    selector({ user: { prenom: 'Jean', nom: 'MARTIN' } }),
}));

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

import { SessionListPage } from '@/pages/SessionListPage';

describe('SessionListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.sessions = [];
    mockStore.isLoading = false;
    mockStore.error = null;
    mockStore.filters = {
      existeSession: true,
      existeSessionOuverte: true,
      societe: null,
      deviseLocale: null,
    };
  });

  it('renders page title and subtitle', () => {
    render(<SessionListPage />);
    expect(screen.getByText('Sessions de caisse')).toBeInTheDocument();
    expect(screen.getByText('Liste des sessions ouvertes et fermées')).toBeInTheDocument();
  });

  it('displays user name from auth store', () => {
    render(<SessionListPage />);
    expect(screen.getByText('Jean MARTIN')).toBeInTheDocument();
  });

  it('calls fetchSessions on mount', () => {
    render(<SessionListPage />);
    expect(mockStore.fetchSessions).toHaveBeenCalledWith(mockStore.filters);
  });

  it('calls reset on unmount', () => {
    const { unmount } = render(<SessionListPage />);
    unmount();
    expect(mockStore.reset).toHaveBeenCalled();
  });

  it('displays loading state when loading and no sessions', () => {
    mockStore.isLoading = true;
    render(<SessionListPage />);
    expect(screen.getByText('Chargement des sessions...')).toBeInTheDocument();
  });

  it('displays empty state when no sessions found', () => {
    render(<SessionListPage />);
    expect(screen.getByText('Aucune session trouvée avec les filtres actuels.')).toBeInTheDocument();
  });

  it('displays error message with dismiss button', () => {
    mockStore.error = 'Erreur de connexion';
    render(<SessionListPage />);
    expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();

    fireEvent.click(screen.getByText('×'));
    expect(mockStore.clearError).toHaveBeenCalled();
  });

  it('renders sessions in table', () => {
    mockStore.sessions = [
      {
        id: 1,
        societe: 'CAI001',
        caisse: 'CAISSE_01',
        operateur: 'MARTIN',
        dateOuverture: new Date('2026-02-21T08:00:00'),
        etat: 'O',
        montantOuverture: 500.0,
      },
      {
        id: 2,
        societe: 'CAI002',
        caisse: 'CAISSE_02',
        operateur: 'DUPONT',
        dateOuverture: new Date('2026-02-20T08:00:00'),
        etat: '',
        montantOuverture: null,
      },
    ];

    render(<SessionListPage />);

    expect(screen.getByText('CAISSE_01')).toBeInTheDocument();
    expect(screen.getByText('CAISSE_02')).toBeInTheDocument();
    expect(screen.getByText('Ouverte')).toBeInTheDocument();
    expect(screen.getByText('Fermée')).toBeInTheDocument();
    expect(screen.getByText('DUPONT')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('2 sessions affichées')).toBeInTheDocument();
  });

  it('handles refresh button click', () => {
    render(<SessionListPage />);
    fireEvent.click(screen.getByText('Actualiser'));
    expect(mockStore.fetchSessions).toHaveBeenCalledWith(mockStore.filters);
  });

  it('shows loading text on refresh button when loading', () => {
    mockStore.isLoading = true;
    mockStore.sessions = [
      {
        id: 1,
        societe: 'CAI001',
        caisse: 'C1',
        operateur: 'OP',
        dateOuverture: new Date(),
        etat: 'O',
        montantOuverture: 100,
      },
    ];
    render(<SessionListPage />);
    expect(screen.getByText('Actualisation...')).toBeInTheDocument();
  });

  it('handles checkbox filter changes', () => {
    render(<SessionListPage />);
    const checkboxes = screen.getAllByRole('checkbox');

    fireEvent.click(checkboxes[0]);
    expect(mockStore.setFilters).toHaveBeenCalledWith({ existeSession: false });

    fireEvent.click(checkboxes[1]);
    expect(mockStore.setFilters).toHaveBeenCalledWith({ existeSessionOuverte: false });
  });

  it('handles societe select change', () => {
    render(<SessionListPage />);
    const select = screen.getByLabelText('Société:');
    fireEvent.change(select, { target: { value: 'CAI001' } });
    expect(mockStore.setFilters).toHaveBeenCalledWith({ societe: 'CAI001' });
  });

  it('sets societe to null when "Toutes" is selected', () => {
    mockStore.filters.societe = 'CAI001';
    render(<SessionListPage />);
    const select = screen.getByLabelText('Société:');
    fireEvent.change(select, { target: { value: '' } });
    expect(mockStore.setFilters).toHaveBeenCalledWith({ societe: null });
  });

  it('displays singular form for 1 session', () => {
    mockStore.sessions = [
      {
        id: 1,
        societe: 'CAI001',
        caisse: 'C1',
        operateur: 'OP',
        dateOuverture: new Date(),
        etat: 'O',
        montantOuverture: 100,
      },
    ];
    render(<SessionListPage />);
    expect(screen.getByText('1 session affichée')).toBeInTheDocument();
  });
});
