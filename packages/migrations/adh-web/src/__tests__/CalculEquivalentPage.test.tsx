import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/stores/calculEquivalentStore');
vi.mock('@/stores/authStore');

import { CalculEquivalentPage } from '@/pages/CalculEquivalentPage';
import { useCalculEquivalentStore } from '@/stores/calculEquivalentStore';
import { useAuthStore } from '@/stores';
import type { ConversionResult } from '@/types/calculEquivalent';

const mockCalculerEquivalent = vi.fn();
const mockClearError = vi.fn();
const mockResetState = vi.fn();

const mockConversionResult: ConversionResult = {
  equivalent: 92.5,
  cdrtDeviseIn: true,
  taux: 0.925,
  quantiteOriginale: 100,
  deviseOriginale: 'USD',
  deviseLocale: 'EUR',
};

const mockUser = {
  id: '1',
  nom: 'Doe',
  prenom: 'John',
  email: 'john.doe@example.com',
  role: 'caissier' as const,
};

const renderPage = () => {
  return render(
    <BrowserRouter>
      <CalculEquivalentPage />
    </BrowserRouter>
  );
};

describe('CalculEquivalentPage', () => {
  beforeEach(() => {
    vi.mocked(useCalculEquivalentStore).mockImplementation((selector: unknown) => {
      const state = {
        isCalculating: false,
        error: null,
        validationErrors: [],
        lastConversion: null,
        calculerEquivalent: mockCalculerEquivalent,
        clearError: mockClearError,
        resetState: mockResetState,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });

    vi.mocked(useAuthStore).mockImplementation((selector: unknown) => {
      const state = {
        user: mockUser,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText("Calcul d'équivalent")).toBeInTheDocument();
    expect(screen.getByText('Conversion de devises')).toBeInTheDocument();
  });

  it('displays user information when authenticated', () => {
    renderPage();
    expect(screen.getAllByText(/John Doe/)[1]).toBeInTheDocument();
  });

  it('displays loading state when calculating', () => {
    vi.mocked(useCalculEquivalentStore).mockImplementation((selector: unknown) => {
      const state = {
        isCalculating: true,
        error: null,
        validationErrors: [],
        lastConversion: null,
        calculerEquivalent: mockCalculerEquivalent,
        clearError: mockClearError,
        resetState: mockResetState,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });

    renderPage();
    const button = screen.getByRole('button', { name: 'Calcul en cours...' });
    expect(button).toBeDisabled();
  });

  it('displays error state', () => {
    const errorMessage = 'Erreur lors du calcul';
    vi.mocked(useCalculEquivalentStore).mockImplementation((selector: unknown) => {
      const state = {
        isCalculating: false,
        error: errorMessage,
        validationErrors: [],
        lastConversion: null,
        calculerEquivalent: mockCalculerEquivalent,
        clearError: mockClearError,
        resetState: mockResetState,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });

    renderPage();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    vi.mocked(useCalculEquivalentStore).mockImplementation((selector: unknown) => {
      const state = {
        isCalculating: false,
        error: null,
        validationErrors: [{ field: 'quantite', message: 'Montant invalide' }],
        lastConversion: null,
        calculerEquivalent: mockCalculerEquivalent,
        clearError: mockClearError,
        resetState: mockResetState,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });

    renderPage();
    expect(screen.getByText('Montant invalide')).toBeInTheDocument();
  });

  it('handles montant input change', () => {
    renderPage();
    const input = screen.getByPlaceholderText('Montant à convertir') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '100' } });
    expect(input.value).toBe('100');
  });

  it('handles devise selection change', () => {
    renderPage();
    const deviseLabel = screen.getByText('Devise');
    const select = deviseLabel.parentElement?.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'GBP' } });
    expect(select.value).toBe('GBP');
  });

  it('handles type operation radio button change', () => {
    renderPage();
    const venteRadio = screen.getByLabelText('Vente') as HTMLInputElement;
    fireEvent.click(venteRadio);
    expect(venteRadio.checked).toBe(true);
  });

  it('handles mode paiement selection change', () => {
    renderPage();
    const modeLabel = screen.getByText('Mode de paiement');
    const select = modeLabel.parentElement?.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'CB' } });
    expect(select.value).toBe('CB');
  });

  it('disables calculate button when montant is empty', () => {
    renderPage();
    const button = screen.getByRole('button', { name: 'Calculer' });
    expect(button).toBeDisabled();
  });

  it('disables calculate button when montant is invalid', () => {
    renderPage();
    const input = screen.getByPlaceholderText('Montant à convertir');
    fireEvent.change(input, { target: { value: '0' } });
    const button = screen.getByRole('button', { name: 'Calculer' });
    expect(button).toBeDisabled();
  });

  it('enables calculate button when montant is valid', () => {
    renderPage();
    const input = screen.getByPlaceholderText('Montant à convertir');
    fireEvent.change(input, { target: { value: '100' } });
    const button = screen.getByRole('button', { name: 'Calculer' });
    expect(button).toBeEnabled();
  });

  it('calls calculerEquivalent when calculate button is clicked', async () => {
    mockCalculerEquivalent.mockResolvedValue(mockConversionResult);
    renderPage();

    const input = screen.getByPlaceholderText('Montant à convertir');
    fireEvent.change(input, { target: { value: '100' } });

    const deviseLabel = screen.getByText('Devise');
    const deviseSelect = deviseLabel.parentElement?.querySelector('select');
    fireEvent.change(deviseSelect!, { target: { value: 'USD' } });

    const button = screen.getByRole('button', { name: 'Calculer' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockCalculerEquivalent).toHaveBeenCalledWith(
        expect.objectContaining({
          societe: '1',
          uniBi: 'U',
          deviseLocale: 'EUR',
          nombreDecimal: 2,
          devise: 'USD',
          modePaiement: 'ESP',
          quantite: 100,
          typeOperation: 'A',
        })
      );
    });
  });

  it('displays conversion result when available', () => {
    vi.mocked(useCalculEquivalentStore).mockImplementation((selector: unknown) => {
      const state = {
        isCalculating: false,
        error: null,
        validationErrors: [],
        lastConversion: mockConversionResult,
        calculerEquivalent: mockCalculerEquivalent,
        clearError: mockClearError,
        resetState: mockResetState,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });

    renderPage();
    expect(screen.getByText('Équivalent:')).toBeInTheDocument();
    expect(screen.getByText('92.50 EUR')).toBeInTheDocument();
    expect(screen.getByText(/Taux appliqué: 0\.9250/)).toBeInTheDocument();
  });

  it('does not call calculerEquivalent with invalid montant', async () => {
    renderPage();

    const input = screen.getByPlaceholderText('Montant à convertir');
    fireEvent.change(input, { target: { value: 'invalid' } });

    const button = screen.getByRole('button', { name: 'Calculer' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCalculerEquivalent).not.toHaveBeenCalled();
    });
  });

  it('calls resetState on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockResetState).toHaveBeenCalled();
  });

  it('disables inputs when calculating', () => {
    vi.mocked(useCalculEquivalentStore).mockImplementation((selector: unknown) => {
      const state = {
        isCalculating: true,
        error: null,
        validationErrors: [],
        lastConversion: null,
        calculerEquivalent: mockCalculerEquivalent,
        clearError: mockClearError,
        resetState: mockResetState,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });

    renderPage();

    const input = screen.getByPlaceholderText('Montant à convertir') as HTMLInputElement;
    const deviseLabel = screen.getByText('Devise');
    const deviseSelect = deviseLabel.parentElement?.querySelector('select') as HTMLSelectElement;
    const modeLabel = screen.getByText('Mode de paiement');
    const modePaiementSelect = modeLabel.parentElement?.querySelector('select') as HTMLSelectElement;
    const achatRadio = screen.getByLabelText('Achat') as HTMLInputElement;

    expect(input.disabled).toBe(true);
    expect(deviseSelect.disabled).toBe(true);
    expect(modePaiementSelect.disabled).toBe(true);
    expect(achatRadio.disabled).toBe(true);
  });

  it('renders all devise options', () => {
    renderPage();
    const deviseLabel = screen.getByText('Devise');
    const select = deviseLabel.parentElement?.querySelector('select');
    expect(select).toHaveTextContent('Euro (EUR)');
    expect(select).toHaveTextContent('Dollar US (USD)');
    expect(select).toHaveTextContent('Livre Sterling (GBP)');
    expect(select).toHaveTextContent('Yen Japonais (JPY)');
  });

  it('renders all mode paiement options', () => {
    renderPage();
    const modeLabel = screen.getByText('Mode de paiement');
    const select = modeLabel.parentElement?.querySelector('select');
    expect(select).toHaveTextContent('Espèces');
    expect(select).toHaveTextContent('Carte Bancaire');
    expect(select).toHaveTextContent('Chèque');
    expect(select).toHaveTextContent('Virement');
  });
});