import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { Mock } from 'vitest';

const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams('sessionId=123&quand=O');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

vi.mock('@/stores/saisieContenuCaisseStore', () => ({
  useSaisieContenuCaisseStore: vi.fn(),
}));

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
}));

import { SaisieContenuCaissePage } from '@/pages/SaisieContenuCaissePage';
import { useSaisieContenuCaisseStore } from '@/stores/saisieContenuCaisseStore';
import { useAuthStore } from '@/stores';

describe('SaisieContenuCaissePage', () => {
  const mockStore = {
    activeDevise: 'EUR',
    comptageDevises: new Map([
      [
        'EUR',
        {
          deviseCode: 'EUR',
          deviseLibelle: 'Euro',
          totalSaisi: 100.0,
          denominations: [
            {
              denominationId: 1,
              deviseCode: 'EUR',
              valeur: 50,
              quantite: 2,
              total: 100,
            },
          ],
        },
      ],
      [
        'USD',
        {
          deviseCode: 'USD',
          deviseLibelle: 'Dollar',
          totalSaisi: 0,
          denominations: [
            {
              denominationId: 2,
              deviseCode: 'USD',
              valeur: 100,
              quantite: 0,
              total: 0,
            },
          ],
        },
      ],
      [
        'GBP',
        {
          deviseCode: 'GBP',
          deviseLibelle: 'Livre',
          totalSaisi: 0,
          denominations: [],
        },
      ],
    ]),
    recapMOP: [],
    validationResult: null,
    isValidating: false,
    validationError: null,
    isPersisting: false,
    canSubmit: true,
    devisesAutorisees: ['EUR', 'USD', 'GBP'],
    sessionId: 123,
    quand: 'O' as const,
    initComptage: vi.fn(),
    updateQuantite: vi.fn(),
    switchDevise: vi.fn(),
    validateComptage: vi.fn(),
    loadRecapMOP: vi.fn(),
    persistComptage: vi.fn(),
    resetState: vi.fn(),
    setValidationError: vi.fn(),
  };

  const mockAuthStore = {
    user: {
      id: 1,
      prenom: 'John',
      nom: 'Doe',
      email: 'john@example.com',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.set('sessionId', '123');
    mockSearchParams.set('quand', 'O');
    (useSaisieContenuCaisseStore as unknown as Mock).mockImplementation(
      (selector) => selector(mockStore),
    );
    (useAuthStore as unknown as Mock).mockImplementation((selector) =>
      selector(mockAuthStore),
    );
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <SaisieContenuCaissePage />
      </BrowserRouter>,
    );

  it('renders without crashing', () => {
    renderPage();
    expect(
      screen.getByText(/Saisie contenu caisse - Ouverture/i),
    ).toBeInTheDocument();
  });

  it('displays loading state when devises not loaded', () => {
    (useSaisieContenuCaisseStore as unknown as Mock).mockImplementation(
      (selector) =>
        selector({
          ...mockStore,
          devisesAutorisees: [],
        }),
    );

    renderPage();

    expect(mockStore.initComptage).toHaveBeenCalledWith(123, 'O', [
      'EUR',
      'USD',
      'GBP',
    ]);
  });

  it('displays session info and user name', () => {
    renderPage();

    expect(screen.getByText('Session #123')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays error message when validation error exists', () => {
    (useSaisieContenuCaisseStore as unknown as Mock).mockImplementation(
      (selector) =>
        selector({
          ...mockStore,
          validationError: 'Erreur de validation',
        }),
    );

    renderPage();

    expect(screen.getByText('Erreur de validation')).toBeInTheDocument();
  });

  it('displays devise tabs', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'EUR' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'USD' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GBP' })).toBeInTheDocument();
  });

  it('highlights active devise tab', () => {
    renderPage();

    const activeTab = screen.getByRole('button', { name: 'EUR' });
    expect(activeTab).toHaveClass('border-primary');
  });

  it('switches devise when tab clicked', () => {
    renderPage();

    const usdTab = screen.getByRole('button', { name: 'USD' });
    fireEvent.click(usdTab);

    expect(mockStore.switchDevise).toHaveBeenCalledWith('USD');
  });

  it('displays denomination grid for active devise', () => {
    renderPage();

    expect(screen.getByText('Comptage Euro')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('updates quantite when input changed', () => {
    renderPage();

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '5' } });

    expect(mockStore.updateQuantite).toHaveBeenCalledWith('EUR', 1, 5);
  });

  it('displays total for active devise', () => {
    renderPage();

    expect(screen.getByText('Total EUR')).toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();
  });

  it('validates comptage when validate button clicked', async () => {
    const mockValidationResult = {
      totalCaisse: 100,
      totalMonnaie: 100,
      totalProduits: 0,
      totalCartes: 0,
      totalCheques: 0,
      totalOD: 0,
      shouldProcess: true,
      nbreDevise: 1,
      fromIms: false,
    };

    mockStore.validateComptage.mockResolvedValue(mockValidationResult);

    renderPage();

    const validateButton = screen.getByRole('button', {
      name: /Valider le comptage/i,
    });
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(mockStore.validateComptage).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockStore.loadRecapMOP).toHaveBeenCalledWith(123);
    });
  });

  it('disables validate button when cannot submit', () => {
    (useSaisieContenuCaisseStore as unknown as Mock).mockImplementation(
      (selector) =>
        selector({
          ...mockStore,
          canSubmit: false,
        }),
    );

    renderPage();

    const validateButton = screen.getByRole('button', {
      name: /Valider le comptage/i,
    });
    expect(validateButton).toBeDisabled();
  });

  it('displays validating state', () => {
    (useSaisieContenuCaisseStore as unknown as Mock).mockImplementation(
      (selector) =>
        selector({
          ...mockStore,
          isValidating: true,
        }),
    );

    renderPage();

    expect(screen.getByText('Validation...')).toBeInTheDocument();
  });

  it('navigates back when cancel button clicked', () => {
    renderPage();

    const cancelButton = screen.getByRole('button', { name: 'Annuler' });
    fireEvent.click(cancelButton);

    expect(mockStore.resetState).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('displays error when sessionId missing', () => {
    mockSearchParams.delete('sessionId');
    mockSearchParams.delete('quand');

    renderPage();

    expect(
      screen.getByText(/Paramètres manquants \(sessionId ou quand\)/i),
    ).toBeInTheDocument();
  });

  it('cleans up state on unmount', () => {
    const { unmount } = renderPage();

    unmount();

    expect(mockStore.resetState).toHaveBeenCalled();
  });

  it('displays recapitulatif phase when validation succeeds', async () => {
    const mockValidationResult = {
      totalCaisse: 100,
      totalMonnaie: 100,
      totalProduits: 0,
      totalCartes: 0,
      totalCheques: 0,
      totalOD: 0,
      shouldProcess: true,
      nbreDevise: 1,
      fromIms: false,
    };

    const mockRecapMOP = [
      {
        moyenPaiement: 'M',
        moyenPaiementLibelle: 'Monnaie',
        attendu: 100,
        compte: 100,
        ecart: 0,
      },
    ];

    mockStore.validateComptage.mockResolvedValue(mockValidationResult);
    mockStore.loadRecapMOP.mockResolvedValue(undefined);

    const { rerender } = renderPage();

    const validateButton = screen.getByRole('button', {
      name: /Valider le comptage/i,
    });
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(mockStore.validateComptage).toHaveBeenCalled();
    });

    (useSaisieContenuCaisseStore as unknown as Mock).mockImplementation(
      (selector) =>
        selector({
          ...mockStore,
          validationResult: mockValidationResult,
          recapMOP: mockRecapMOP,
        }),
    );

    rerender(
      <BrowserRouter>
        <SaisieContenuCaissePage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Monnaie')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Caisse')).toBeInTheDocument();
  });

  it('persists comptage when confirm button clicked', async () => {
    const mockValidationResult = {
      totalCaisse: 100,
      totalMonnaie: 100,
      totalProduits: 0,
      totalCartes: 0,
      totalCheques: 0,
      totalOD: 0,
      shouldProcess: true,
      nbreDevise: 1,
      fromIms: false,
    };

    mockStore.persistComptage.mockResolvedValue({
      success: true,
      ticketUrl: '/ticket/123',
      sessionId: 123,
      timestamp: '2024-01-01T00:00:00Z',
    });

    (useSaisieContenuCaisseStore as unknown as Mock).mockImplementation(
      (selector) =>
        selector({
          ...mockStore,
          validationResult: mockValidationResult,
          recapMOP: [],
        }),
    );

    renderPage();

    const confirmButton = screen.getByRole('button', { name: 'Confirmer' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockStore.persistComptage).toHaveBeenCalledWith(
        123,
        mockValidationResult,
      );
    });
  });
});