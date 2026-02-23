import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

const mockSessionStore = {
  status: 'closed',
  openSession: vi.fn(),
  calculateMopFromResults: vi.fn(),
  calculateEcartOuverture: vi.fn(),
  checkConcurrentSessions: vi.fn(),
  checkNetworkClosure: vi.fn(),
  checkStockCoherence: vi.fn(),
};

const mockCaisseStore = {
  config: {
    id: 1,
    libelle: 'Caisse Test',
    devisePrincipale: 'EUR',
    devisesAutorisees: ['EUR'],
  },
  denominations: [
    { id: 1, deviseCode: 'EUR', valeur: 50, type: 'billet', libelle: '50 EUR' },
    { id: 2, deviseCode: 'EUR', valeur: 20, type: 'billet', libelle: '20 EUR' },
    { id: 3, deviseCode: 'EUR', valeur: 10, type: 'billet', libelle: '10 EUR' },
  ],
  loadDenominations: vi.fn(),
  isLoadingDenominations: false,
  resetCounting: vi.fn(),
  dateComptable: '2024-02-20',
  validateDateComptable: vi.fn(() => true),
};

const mockAuthStore = {
  user: {
    id: 1,
    login: 'testuser',
    nom: 'Test User',
  },
};

vi.mock('@/stores', () => ({
  useSessionStore: (selector: (state: typeof mockSessionStore) => unknown) =>
    selector(mockSessionStore),
  useCaisseStore: (selector: (state: typeof mockCaisseStore) => unknown) =>
    selector(mockCaisseStore),
  useAuthStore: (selector: (state: typeof mockAuthStore) => unknown) =>
    selector(mockAuthStore),
}));

vi.mock('@/services/printer', () => ({
  executePrint: vi.fn(),
  TicketType: {
    OUVERTURE: 'ouverture',
  },
}));

vi.mock('@/services/printer/generators/ouvertureTicketGenerator', () => ({
  generateOuvertureTicket: vi.fn(() => ({ type: 'ouverture', data: {} })),
}));

import { SessionOuverturePage } from '@/pages/SessionOuverturePage';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <SessionOuverturePage />
    </BrowserRouter>
  );
};

describe('SessionOuverturePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStore.status = 'closed';
    mockSessionStore.checkConcurrentSessions.mockResolvedValue(null);
    mockSessionStore.checkNetworkClosure.mockResolvedValue({
      status: 'completed',
      lastDate: undefined,
    });
    mockSessionStore.checkStockCoherence.mockResolvedValue({
      coherent: true,
      details: [],
    });
    mockSessionStore.calculateMopFromResults.mockReturnValue({
      monnaie: 0,
      produits: 0,
      cartes: 0,
      cheques: 0,
      od: 0,
      total: 0,
    });
    mockSessionStore.calculateEcartOuverture.mockReturnValue({
      ecart: 0,
      estEquilibre: true,
      details: [],
    });
    mockCaisseStore.isLoadingDenominations = false;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Ouverture de caisse')).toBeInTheDocument();
    expect(screen.getByText('Comptez le contenu initial de la caisse')).toBeInTheDocument();
  });

  it('displays loading state when denominations are loading', () => {
    mockCaisseStore.isLoadingDenominations = true;
    renderPage();
    expect(screen.getByText('Chargement des denominations...')).toBeInTheDocument();
  });

  it('displays denomination grid when loaded', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockCaisseStore.loadDenominations).toHaveBeenCalled();
    });
    expect(screen.getByText('50 EUR')).toBeInTheDocument();
    expect(screen.getByText('20 EUR')).toBeInTheDocument();
    expect(screen.getByText('10 EUR')).toBeInTheDocument();
  });

  it('displays error when validating empty comptage', async () => {
    renderPage();
    const validateButton = screen.getByText('Valider le comptage');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText('Veuillez saisir au moins une denomination')).toBeInTheDocument();
    });
  });

  it('handles count changes', async () => {
    renderPage();
    const inputs = screen.getAllByRole('spinbutton');
    const firstInput = inputs[0];

    fireEvent.change(firstInput, { target: { value: '5' } });

    expect(firstInput).toHaveValue(5);
  });

  it('proceeds to validation step when comptage is valid', async () => {
    mockSessionStore.checkConcurrentSessions.mockResolvedValue(null);
    renderPage();

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });

    const validateButton = screen.getByText('Valider le comptage');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(mockSessionStore.checkConcurrentSessions).toHaveBeenCalled();
      expect(screen.getByText('Verifiez le comptage avant ouverture')).toBeInTheDocument();
    });
  });

  it('displays concurrent session warning when detected', async () => {
    mockSessionStore.checkConcurrentSessions.mockResolvedValue({
      chrono: 123,
      dateOuverture: new Date(),
      operateur: 'other-user',
      status: 'open',
    });

    renderPage();

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });

    const validateButton = screen.getByText('Valider le comptage');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(mockSessionStore.checkConcurrentSessions).toHaveBeenCalled();
    });
  });

  it('displays network closure alert when closure is not completed', async () => {
    mockSessionStore.checkNetworkClosure.mockResolvedValue({
      status: 'pending',
      lastDate: '2024-02-19',
    });

    renderPage();

    await waitFor(() => {
      expect(mockSessionStore.checkNetworkClosure).toHaveBeenCalled();
    });
  });

  it('displays stock coherence warning when incoherent', async () => {
    mockSessionStore.checkStockCoherence.mockResolvedValue({
      coherent: false,
      details: ['Stock produit X incohérent'],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Incoherence de stock detectee')).toBeInTheDocument();
    });
  });

  it('submits session opening from validation step', async () => {
    mockSessionStore.openSession.mockResolvedValue(undefined);
    mockSessionStore.checkConcurrentSessions.mockResolvedValue(null);

    renderPage();

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });

    const validateButton = screen.getByText('Valider le comptage');
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText('Ouvrir la caisse')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Ouvrir la caisse');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSessionStore.openSession).toHaveBeenCalled();
    });
  });

  it('displays success message after opening', async () => {
    mockSessionStore.openSession.mockResolvedValue(undefined);
    mockSessionStore.checkConcurrentSessions.mockResolvedValue(null);

    renderPage();

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });

    fireEvent.click(screen.getByText('Valider le comptage'));

    await waitFor(() => {
      expect(screen.getByText('Ouvrir la caisse')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ouvrir la caisse'));

    await waitFor(() => {
      expect(screen.getByText('Caisse ouverte avec succes')).toBeInTheDocument();
    });
  });

  it('displays error state when opening fails', async () => {
    const errorMessage = 'Erreur réseau';
    mockSessionStore.openSession.mockRejectedValue(new Error(errorMessage));
    mockSessionStore.checkConcurrentSessions.mockResolvedValue(null);

    renderPage();

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });

    fireEvent.click(screen.getByText('Valider le comptage'));

    await waitFor(() => {
      expect(screen.getByText('Ouvrir la caisse')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ouvrir la caisse'));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('navigates back from validation step', async () => {
    mockSessionStore.checkConcurrentSessions.mockResolvedValue(null);

    renderPage();

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });

    fireEvent.click(screen.getByText('Valider le comptage'));

    await waitFor(() => {
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Modifier'));

    expect(screen.getByText('Comptez le contenu initial de la caisse')).toBeInTheDocument();
  });

  it('redirects to menu when session is already open', () => {
    mockSessionStore.status = 'open';

    renderPage();

    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('displays invalid date comptable warning', () => {
    mockCaisseStore.validateDateComptable = vi.fn(() => false);

    renderPage();

    expect(screen.getByText(/La date comptable/)).toBeInTheDocument();
  });

  it('calls loadDenominations for each authorized devise', async () => {
    mockCaisseStore.config = {
      ...mockCaisseStore.config,
      devisesAutorisees: ['EUR', 'USD'],
    };

    renderPage();

    await waitFor(() => {
      expect(mockCaisseStore.loadDenominations).toHaveBeenCalledWith('EUR');
      expect(mockCaisseStore.loadDenominations).toHaveBeenCalledWith('USD');
    });
  });

  it('displays MOP breakdown in validation step', async () => {
    mockSessionStore.checkConcurrentSessions.mockResolvedValue(null);
    mockSessionStore.calculateMopFromResults.mockReturnValue({
      monnaie: 100,
      produits: 50,
      cartes: 0,
      cheques: 0,
      od: 0,
      total: 150,
    });

    renderPage();

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });

    fireEvent.click(screen.getByText('Valider le comptage'));

    await waitFor(() => {
      expect(screen.getByText('Ventilation par mode de paiement')).toBeInTheDocument();
      expect(screen.getByText('Monnaie (especes)')).toBeInTheDocument();
    });
  });

  it('resets counting when component unmounts', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockCaisseStore.resetCounting).toHaveBeenCalled();
  });
});