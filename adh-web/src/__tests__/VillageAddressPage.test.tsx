import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockLoadVillageAddress = vi.fn();
const mockSetVillageAddress = vi.fn();
const mockClearError = vi.fn();
const mockReset = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/stores/villageAddressStore', () => ({
  useVillageAddressStore: (selector: unknown) => {
    const state = {
      villageAddress: {
        clubCode: 'CLUB001',
        name: 'Village Test',
        address1: '123 Rue Test',
        address2: 'Bat A',
        zipCode: '75001',
        phone: '+33123456789',
        email: 'test@village.fr',
        siret: '12345678901234',
        vatNumber: 'FR12345678901',
      },
      isLoading: false,
      error: null,
      loadVillageAddress: mockLoadVillageAddress,
      setVillageAddress: mockSetVillageAddress,
      clearError: mockClearError,
      reset: mockReset,
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

vi.mock('@/stores', () => ({
  useAuthStore: (selector: unknown) => {
    const state = {
      user: { prenom: 'John', nom: 'Doe' },
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

import { VillageAddressPage } from '@/pages/VillageAddressPage';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <VillageAddressPage />
    </BrowserRouter>
  );
};

describe('VillageAddressPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadVillageAddress.mockResolvedValue({
      clubCode: 'CLUB001',
      name: 'Village Test',
      address1: '123 Rue Test',
      address2: 'Bat A',
      zipCode: '75001',
      phone: '+33123456789',
      email: 'test@village.fr',
      siret: '12345678901234',
      vatNumber: 'FR12345678901',
    });
    mockSetVillageAddress.mockResolvedValue(undefined);
  });

  it('should render without crashing', () => {
    renderPage();
    expect(screen.getByText('Adresse du village')).toBeInTheDocument();
  });

  it('should display user info', () => {
    renderPage();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should load village address on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockLoadVillageAddress).toHaveBeenCalledTimes(1);
    });
  });

  it('should display loaded data in form fields', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/Code club/i)).toHaveValue('CLUB001');
    });
    expect(screen.getByLabelText(/^Nom$/i)).toHaveValue('Village Test');
    expect(screen.getByLabelText(/Adresse ligne 1/i)).toHaveValue('123 Rue Test');
    expect(screen.getByLabelText(/Adresse ligne 2/i)).toHaveValue('Bat A');
    expect(screen.getByLabelText(/Code postal/i)).toHaveValue('75001');
    expect(screen.getByLabelText(/Téléphone/i)).toHaveValue('+33123456789');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('test@village.fr');
    expect(screen.getByLabelText(/SIRET/i)).toHaveValue('12345678901234');
    expect(screen.getByLabelText(/Numéro de TVA/i)).toHaveValue('FR12345678901');
  });

  it('should handle input changes', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/Code club/i)).toBeInTheDocument();
    });

    const clubCodeInput = screen.getByLabelText(/Code club/i);
    fireEvent.change(clubCodeInput, { target: { value: 'CLUB999' } });
    expect(clubCodeInput).toHaveValue('CLUB999');
  });

  it('should validate required fields on save', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/Code club/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Code club/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText('Code club requis')).toBeInTheDocument();
    });
    expect(mockSetVillageAddress).not.toHaveBeenCalled();
  });

  it('should validate zip code format', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/Code postal/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Code postal/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText('Code postal invalide (5 chiffres)')).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument();
    });
  });

  it('should validate siret format', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/SIRET/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/SIRET/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(screen.getByText('SIRET invalide (14 chiffres)')).toBeInTheDocument();
    });
  });

  it('should save village address on valid form submit', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/Code club/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Code club/i), { target: { value: 'CLUB999' } });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(mockSetVillageAddress).toHaveBeenCalledWith({
        clubCode: 'CLUB999',
        name: 'Village Test',
        address1: '123 Rue Test',
        address2: 'Bat A',
        zipCode: '75001',
        phone: '+33123456789',
        email: 'test@village.fr',
        siret: '12345678901234',
        vatNumber: 'FR12345678901',
      });
    });
  });

  it('should navigate to menu on successful save', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/Code club/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('should navigate to menu on cancel', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('should call reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });
});