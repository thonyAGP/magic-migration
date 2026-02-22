import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { Hebergement, ClientGm, ChoixPyrState } from '@/types/choixPyr';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createMockStore = (overrides?: Partial<ChoixPyrState>): ChoixPyrState => ({
  hebergements: [],
  selectedHebergement: null,
  clientInfo: null,
  isLoading: false,
  error: null,
  fetchHebergements: vi.fn(),
  selectChambre: vi.fn(),
  cancelSelection: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn(),
  ...overrides,
});

let mockStore = createMockStore();

vi.mock('@/stores/choixPyrStore', () => ({
  useChoixPyrStore: (selector: (state: ChoixPyrState) => unknown) => selector(mockStore),
}));

vi.mock('@/stores', () => ({
  useAuthStore: () => ({
    user: { nom: 'Dupont', prenom: 'Jean' },
  }),
}));

import { ChoixPyrPage } from '@/pages/ChoixPyrPage';

const mockHebergements: Hebergement[] = [
  {
    societe: 1,
    compte: 1001,
    filiation: 0,
    chambre: 'A101',
    dateDebut: new Date('2026-02-20'),
    dateFin: new Date('2026-02-27'),
    statut: 'ACTIF',
  },
  {
    societe: 1,
    compte: 1001,
    filiation: 0,
    chambre: 'A102',
    dateDebut: new Date('2026-02-21'),
    dateFin: new Date('2026-02-28'),
    statut: 'ACTIF',
  },
];

const mockClientInfo: ClientGm = {
  societe: 1,
  compte: 1001,
  filiation: 0,
  nom: 'Martin',
  prenom: 'Sophie',
};

const renderPage = () => {
  return render(
    <BrowserRouter>
      <ChoixPyrPage />
    </BrowserRouter>
  );
};

describe('ChoixPyrPage', () => {
  beforeEach(() => {
    mockStore = createMockStore();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Choix chambre PYR')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockStore = createMockStore({ isLoading: true });
    renderPage();
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('fetches hebergements on mount', () => {
    const fetchHebergements = vi.fn();
    mockStore = createMockStore({ fetchHebergements });
    renderPage();
    expect(fetchHebergements).toHaveBeenCalledWith(1, 1001, 0);
  });

  it('calls reset on unmount', () => {
    const reset = vi.fn();
    mockStore = createMockStore({ reset });
    const { unmount } = renderPage();
    unmount();
    expect(reset).toHaveBeenCalled();
  });

  it('displays client info when available', () => {
    mockStore = createMockStore({ clientInfo: mockClientInfo });
    renderPage();
    expect(screen.getByText('Client: Martin Sophie')).toBeInTheDocument();
  });

  it('displays user info', () => {
    renderPage();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('displays instruction message', () => {
    renderPage();
    expect(screen.getByText('Veuillez choisir la chambre pour le paiement PYR')).toBeInTheDocument();
  });

  it('displays error state', () => {
    mockStore = createMockStore({ error: 'Erreur de chargement' });
    renderPage();
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('displays empty state when no hebergements', () => {
    mockStore = createMockStore({ hebergements: [] });
    renderPage();
    expect(screen.getByText('Aucun hébergement actif trouvé')).toBeInTheDocument();
  });

  it('displays hebergements table', () => {
    mockStore = createMockStore({ hebergements: mockHebergements });
    renderPage();
    expect(screen.getByText('A101')).toBeInTheDocument();
    expect(screen.getByText('A102')).toBeInTheDocument();
    expect(screen.getByText('ACTIF')).toBeInTheDocument();
  });

  it('sorts hebergements by chambre', () => {
    const unsortedHebergements: Hebergement[] = [
      { ...mockHebergements[1] },
      { ...mockHebergements[0] },
    ];
    mockStore = createMockStore({ hebergements: unsortedHebergements });
    renderPage();
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('A101');
    expect(rows[2]).toHaveTextContent('A102');
  });

  it('formats dates correctly', () => {
    mockStore = createMockStore({ hebergements: mockHebergements });
    renderPage();
    expect(screen.getByText('20/02/2026')).toBeInTheDocument();
    expect(screen.getByText('27/02/2026')).toBeInTheDocument();
  });

  it('handles row click to select hebergement', async () => {
    const selectChambre = vi.fn();
    mockStore = createMockStore({ 
      hebergements: mockHebergements,
      selectChambre,
    });
    renderPage();
    const firstRow = screen.getByText('A101').closest('tr');
    fireEvent.click(firstRow!);
    await waitFor(() => {
      expect(selectChambre).toHaveBeenCalledWith(mockHebergements[0]);
    });
  });

  it('highlights selected hebergement', () => {
    mockStore = createMockStore({
      hebergements: mockHebergements,
      selectedHebergement: mockHebergements[0],
    });
    renderPage();
    const firstRow = screen.getByText('A101').closest('tr');
    expect(firstRow).toHaveClass('bg-primary-light');
  });

  it('disables Valider button when no selection', () => {
    mockStore = createMockStore({ hebergements: mockHebergements });
    renderPage();
    const validerBtn = screen.getByText('Valider');
    expect(validerBtn).toBeDisabled();
    expect(validerBtn).toHaveClass('bg-gray-300', 'cursor-not-allowed');
  });

  it('enables Valider button when selection exists', () => {
    mockStore = createMockStore({
      hebergements: mockHebergements,
      selectedHebergement: mockHebergements[0],
    });
    renderPage();
    const validerBtn = screen.getByText('Valider');
    expect(validerBtn).not.toBeDisabled();
    expect(validerBtn).toHaveClass('bg-primary');
  });

  it('navigates to menu on Valider click', async () => {
    mockStore = createMockStore({
      hebergements: mockHebergements,
      selectedHebergement: mockHebergements[0],
    });
    renderPage();
    const validerBtn = screen.getByText('Valider');
    fireEvent.click(validerBtn);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('calls cancelSelection and navigates on Annuler click', async () => {
    const cancelSelection = vi.fn();
    mockStore = createMockStore({ cancelSelection });
    renderPage();
    const annulerBtn = screen.getByText('Annuler');
    fireEvent.click(annulerBtn);
    await waitFor(() => {
      expect(cancelSelection).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('handles null dateFin correctly', () => {
    const hebergementsWithNullDate: Hebergement[] = [
      {
        ...mockHebergements[0],
        dateFin: null,
      },
    ];
    mockStore = createMockStore({ hebergements: hebergementsWithNullDate });
    renderPage();
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('N/A');
  });

  it('displays table headers', () => {
    mockStore = createMockStore({ hebergements: mockHebergements });
    renderPage();
    expect(screen.getByText('Chambre')).toBeInTheDocument();
    expect(screen.getByText('Date début')).toBeInTheDocument();
    expect(screen.getByText('Date fin')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
  });
});