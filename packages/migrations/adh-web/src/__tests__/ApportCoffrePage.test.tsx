import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/stores/apportCoffreStore');
vi.mock('@/stores/authStore');

import { ApportCoffrePage } from '@/pages/ApportCoffrePage';
import { useApportCoffreStore } from '@/stores/apportCoffreStore';
import { useAuthStore } from '@/stores';
import type { Devise } from '@/types/apportCoffre';

const mockDevises: Devise[] = [
  { code: 'EUR', libelle: 'Euro', venteAutorisee: true },
  { code: 'USD', libelle: 'Dollar américain', venteAutorisee: true },
  { code: 'GBP', libelle: 'Livre sterling', venteAutorisee: true },
];

const mockUser = {
  id: 1,
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com',
  societe: 'TEST',
  caisseId: 1,
};

const defaultStoreState = {
  devises: [],
  isExecuting: false,
  error: null,
  deviseSelectionnee: null,
  montantSaisi: 0,
  chargerDevises: vi.fn(),
  validerApport: vi.fn(),
  setDeviseSelectionnee: vi.fn(),
  setMontantSaisi: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn(),
};

const renderPage = () => {
  return render(
    <BrowserRouter>
      <ApportCoffrePage />
    </BrowserRouter>,
  );
};

describe('ApportCoffrePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue(mockUser);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector(defaultStoreState),
    );
  });

  it('renders without crashing', () => {
    renderPage();
    const mainHeading = screen.getByRole('heading', { name: 'Apport coffre', level: 2 });
    expect(mainHeading).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderPage();
    expect(screen.getByText('Chargement des devises...')).toBeInTheDocument();
  });

  it('calls chargerDevises on mount', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, chargerDevises }),
    );

    renderPage();

    await waitFor(() => {
      expect(chargerDevises).toHaveBeenCalledTimes(1);
    });
  });

  it('displays no devises message when list is empty', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: [], chargerDevises }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Aucune devise autorisée disponible')).toBeInTheDocument();
    });
  });

  it('displays devises and context buttons when loaded', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises }),
    );

    renderPage();

    await waitFor(() => {
      const contextSection = screen.getByText('Contexte').closest('div')!;
      const buttons = within(contextSection.parentElement!).getAllByRole('button');
      const buttonTexts = buttons.map((btn) => btn.textContent);
      expect(buttonTexts).toContain('Ouverture');
      expect(buttonTexts).toContain('Fermeture');
      expect(buttonTexts).toContain('Gestion');
      expect(screen.getByText('Nouvel apport')).toBeInTheDocument();
    });
  });

  it('switches context on button click', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises }),
    );

    renderPage();

    await waitFor(() => {
      const contextSection = screen.getByText('Contexte').closest('div')!;
      expect(contextSection).toBeInTheDocument();
    });

    const contextSection = screen.getByText('Contexte').closest('div')!.parentElement!;
    const fermetureButton = within(contextSection).getByText('Fermeture');
    
    fireEvent.click(fermetureButton);
    
    await waitFor(() => {
      expect(fermetureButton.className).toContain('bg-primary');
    });
  });

  it('opens dialog when Nouvel apport is clicked', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Nouvel apport')).toBeInTheDocument();
    });

    const nouveauApportButton = screen.getByText('Nouvel apport');
    fireEvent.click(nouveauApportButton);

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
      const dialog = dialogs[0];
      const dialogHeading = within(dialog).getByRole('heading', { name: 'Apport coffre', level: 3 });
      expect(dialogHeading).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Devise')).toBeInTheDocument();
    expect(screen.getByLabelText('Montant')).toBeInTheDocument();
  });

  it('calls setDeviseSelectionnee when devise is selected', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    const setDeviseSelectionnee = vi.fn();
    const setError = vi.fn();
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises, setDeviseSelectionnee, setError }),
    );

    renderPage();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Nouvel apport'));
    });

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
    });

    const deviseSelect = screen.getByLabelText('Devise') as HTMLSelectElement;
    fireEvent.change(deviseSelect, { target: { value: 'EUR' } });

    await waitFor(() => {
      expect(setDeviseSelectionnee).toHaveBeenCalledWith('EUR');
      expect(setError).toHaveBeenCalledWith(null);
    });
  });

  it('calls setMontantSaisi when montant is changed', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    const setMontantSaisi = vi.fn();
    const setError = vi.fn();
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises, setMontantSaisi, setError }),
    );

    renderPage();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Nouvel apport'));
    });

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
    });

    const montantInput = screen.getByLabelText('Montant') as HTMLInputElement;
    fireEvent.change(montantInput, { target: { value: '100.50' } });

    await waitFor(() => {
      expect(setMontantSaisi).toHaveBeenCalledWith(100.5);
      expect(setError).toHaveBeenCalledWith(null);
    });
  });

  it('displays error when validation fails', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    const setError = vi.fn();
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises, setError, deviseSelectionnee: null, montantSaisi: 0 }),
    );

    renderPage();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Nouvel apport'));
    });

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
    });

    const validerButton = screen.getByRole('button', { name: 'Valider' });
    fireEvent.click(validerButton);

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith('Veuillez sélectionner une devise');
    });
  });

  it('calls validerApport when form is valid', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    const validerApport = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({
        ...defaultStoreState,
        devises: mockDevises,
        chargerDevises,
        validerApport,
        deviseSelectionnee: 'EUR',
        montantSaisi: 100.0,
        error: null,
      }),
    );

    renderPage();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Nouvel apport'));
    });

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
    });

    const validerButton = screen.getByRole('button', { name: 'Valider' });
    fireEvent.click(validerButton);

    await waitFor(() => {
      expect(validerApport).toHaveBeenCalledWith('EUR', 100.0, 'G');
    });
  });

  it('displays error state from store', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises, error: 'Erreur réseau' }),
    );

    renderPage();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Nouvel apport'));
    });

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
  });

  it('closes dialog on Annuler click', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    const setDeviseSelectionnee = vi.fn();
    const setMontantSaisi = vi.fn();
    const setError = vi.fn();
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({
        ...defaultStoreState,
        devises: mockDevises,
        chargerDevises,
        setDeviseSelectionnee,
        setMontantSaisi,
        setError,
      }),
    );

    renderPage();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Nouvel apport'));
    });

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
    });

    const annulerButton = screen.getByRole('button', { name: 'Annuler' });
    fireEvent.click(annulerButton);

    await waitFor(() => {
      expect(setDeviseSelectionnee).toHaveBeenCalledWith(null);
      expect(setMontantSaisi).toHaveBeenCalledWith(0);
      expect(setError).toHaveBeenCalledWith(null);
    });
  });

  it('calls reset on unmount', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    const reset = vi.fn();
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, chargerDevises, reset }),
    );

    const { unmount } = renderPage();

    await waitFor(() => {
      expect(chargerDevises).toHaveBeenCalled();
    });

    unmount();

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('displays formatted montant when value is entered', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises, montantSaisi: 1234.56 }),
    );

    renderPage();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Nouvel apport'));
    });

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/1\s?234,56/)).toBeInTheDocument();
  });

  it('disables inputs when isExecuting is true', async () => {
    const chargerDevises = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useApportCoffreStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, devises: mockDevises, chargerDevises, isExecuting: true }),
    );

    renderPage();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Nouvel apport'));
    });

    await waitFor(() => {
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);
    });

    expect(screen.getByLabelText('Devise')).toBeDisabled();
    expect(screen.getByLabelText('Montant')).toBeDisabled();
  });
});