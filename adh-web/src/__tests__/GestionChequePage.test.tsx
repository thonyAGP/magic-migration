import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockAuthStore = {
  user: {
    prenom: 'John',
    nom: 'Doe',
    compte: 'CMP001',
    filiation: 'FIL001',
  },
};

const mockGestionChequeStore = {
  cheques: [],
  selectedCheque: null,
  isLoading: false,
  error: null,
  filters: {},
  totalDepots: 0,
  totalRetraits: 0,
  setFilters: vi.fn(),
  enregistrerDepot: vi.fn(),
  enregistrerRetrait: vi.fn(),
  validerCheque: vi.fn(),
  listerChequesCompte: vi.fn(),
  calculerTotaux: vi.fn(),
  reset: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn((selector) => selector(mockAuthStore)),
}));

vi.mock('@/stores/gestionChequeStore', () => ({
  useGestionChequeStore: vi.fn((selector) => selector(mockGestionChequeStore)),
}));

import { GestionChequePage } from '@/pages/GestionChequePage';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <GestionChequePage />
    </BrowserRouter>
  );
};

describe('GestionChequePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGestionChequeStore.cheques = [];
    mockGestionChequeStore.isLoading = false;
    mockGestionChequeStore.error = null;
    mockGestionChequeStore.totalDepots = 0;
    mockGestionChequeStore.totalRetraits = 0;
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Gestion des Chèques')).toBeInTheDocument();
  });

  it('displays user information', () => {
    renderPage();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays form phase by default', () => {
    renderPage();
    expect(screen.getByText('Enregistrement de chèque')).toBeInTheDocument();
    expect(screen.getByLabelText(/Numéro de chèque/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Montant/)).toBeInTheDocument();
  });

  it('displays error state when error exists', () => {
    mockGestionChequeStore.error = 'Erreur de chargement';
    renderPage();
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('switches to historique phase when tab clicked', async () => {
    renderPage();
    const historiqueTab = screen.getByText('Historique');
    fireEvent.click(historiqueTab);
    
    await waitFor(() => {
      expect(screen.getByText('Historique des chèques')).toBeInTheDocument();
    });
    
    expect(mockGestionChequeStore.listerChequesCompte).toHaveBeenCalledWith(
      'ADH',
      'CMP001',
      'FIL001',
      {}
    );
    expect(mockGestionChequeStore.calculerTotaux).toHaveBeenCalledWith(
      'ADH',
      'CMP001',
      'FIL001'
    );
  });

  it('validates cheque on blur of numero or date fields', async () => {
    mockGestionChequeStore.validerCheque.mockResolvedValue({
      valide: true,
      estPostdate: false,
    });

    renderPage();
    
    const numeroChequeInput = screen.getByLabelText(/Numéro de chèque/);
    const dateInput = screen.getByLabelText(/Date d'émission/);

    fireEvent.change(numeroChequeInput, { target: { value: 'CHQ-123' } });
    fireEvent.change(dateInput, { target: { value: '2026-02-22' } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(mockGestionChequeStore.validerCheque).toHaveBeenCalledWith(
        'CHQ-123',
        expect.any(Date)
      );
    });
  });

  it('shows alert when validation fails', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    mockGestionChequeStore.validerCheque.mockResolvedValue({
      valide: false,
      estPostdate: false,
      erreur: 'Numéro invalide',
    });

    renderPage();
    
    const numeroChequeInput = screen.getByLabelText(/Numéro de chèque/);
    const dateInput = screen.getByLabelText(/Date d'émission/);

    fireEvent.change(numeroChequeInput, { target: { value: 'INVALID' } });
    fireEvent.change(dateInput, { target: { value: '2026-02-22' } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Numéro invalide');
    });

    alertSpy.mockRestore();
  });

  it('updates operation type when radio button clicked', () => {
    renderPage();
    
    const retraitRadio = screen.getByLabelText('Retrait');
    fireEvent.click(retraitRadio);
    
    expect(retraitRadio).toBeChecked();
  });

  it('shows confirmation dialog when valider clicked', async () => {
    mockGestionChequeStore.validerCheque.mockResolvedValue({
      valide: true,
      estPostdate: false,
    });

    renderPage();
    
    fireEvent.change(screen.getByLabelText(/Numéro de chèque/), {
      target: { value: 'CHQ-123' },
    });
    fireEvent.change(screen.getByLabelText(/Montant/), {
      target: { value: '150.00' },
    });
    fireEvent.change(screen.getByLabelText(/Date d'émission/), {
      target: { value: '2026-02-22' },
    });

    const validerButton = screen.getAllByText('Valider')[0];
    fireEvent.click(validerButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirmer le dépôt/)).toBeInTheDocument();
    });
  });

  it('submits depot when confirmed', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    mockGestionChequeStore.validerCheque.mockResolvedValue({
      valide: true,
      estPostdate: false,
    });
    mockGestionChequeStore.enregistrerDepot.mockResolvedValue(undefined);

    renderPage();
    
    fireEvent.change(screen.getByLabelText(/Numéro de chèque/), {
      target: { value: 'CHQ-123' },
    });
    fireEvent.change(screen.getByLabelText(/Montant/), {
      target: { value: '150.00' },
    });
    fireEvent.change(screen.getByLabelText(/Date d'émission/), {
      target: { value: '2026-02-22' },
    });

    const validerButton = screen.getAllByText('Valider')[0];
    fireEvent.click(validerButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirmer le dépôt/)).toBeInTheDocument();
    });

    const confirmerButton = screen.getAllByText('Confirmer')[0];
    fireEvent.click(confirmerButton);

    await waitFor(() => {
      expect(mockGestionChequeStore.enregistrerDepot).toHaveBeenCalledWith(
        expect.objectContaining({
          numeroCheque: 'CHQ-123',
          montant: 150.00,
          estPostdate: false,
        }),
        'ADH',
        'CMP001',
        'FIL001'
      );
    });

    expect(alertSpy).toHaveBeenCalledWith('Dépôt enregistré avec succès');
    alertSpy.mockRestore();
  });

  it('submits retrait when retrait selected and confirmed', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    mockGestionChequeStore.validerCheque.mockResolvedValue({
      valide: true,
      estPostdate: false,
    });
    mockGestionChequeStore.enregistrerRetrait.mockResolvedValue(undefined);

    renderPage();
    
    fireEvent.click(screen.getByLabelText('Retrait'));
    
    fireEvent.change(screen.getByLabelText(/Numéro de chèque/), {
      target: { value: 'CHQ-456' },
    });
    fireEvent.change(screen.getByLabelText(/Montant/), {
      target: { value: '200.00' },
    });
    fireEvent.change(screen.getByLabelText(/Date d'émission/), {
      target: { value: '2026-02-22' },
    });

    const validerButton = screen.getAllByText('Valider')[0];
    fireEvent.click(validerButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirmer le retrait/)).toBeInTheDocument();
    });

    const confirmerButton = screen.getAllByText('Confirmer')[0];
    fireEvent.click(confirmerButton);

    await waitFor(() => {
      expect(mockGestionChequeStore.enregistrerRetrait).toHaveBeenCalled();
    });

    expect(alertSpy).toHaveBeenCalledWith('Retrait enregistré avec succès');
    alertSpy.mockRestore();
  });

  it('shows alert when required fields missing', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderPage();
    
    const validerButton = screen.getAllByText('Valider')[0];
    fireEvent.click(validerButton);

    await waitFor(() => {
      expect(screen.getByText(/Confirmer le dépôt/)).toBeInTheDocument();
    });

    const confirmerButton = screen.getAllByText('Confirmer')[0];
    fireEvent.click(confirmerButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Veuillez remplir tous les champs obligatoires');
    });

    alertSpy.mockRestore();
  });

  it('clears form when annuler clicked', () => {
    renderPage();
    
    fireEvent.change(screen.getByLabelText(/Numéro de chèque/), {
      target: { value: 'CHQ-123' },
    });
    fireEvent.change(screen.getByLabelText(/Montant/), {
      target: { value: '150.00' },
    });

    const annulerButton = screen.getByText('Annuler');
    fireEvent.click(annulerButton);

    expect(screen.getByLabelText(/Numéro de chèque/)).toHaveValue('');
    expect(screen.getByLabelText(/Montant/)).toHaveValue(null);
  });

  it('displays loading state in historique', () => {
    mockGestionChequeStore.isLoading = true;
    renderPage();
    
    fireEvent.click(screen.getByText('Historique'));
    
    expect(screen.getByText('Chargement de l\'historique...')).toBeInTheDocument();
  });

  it('displays empty state when no cheques', async () => {
    renderPage();
    
    fireEvent.click(screen.getByText('Historique'));
    
    await waitFor(() => {
      expect(screen.getByText('Aucun chèque trouvé')).toBeInTheDocument();
    });
  });

  it('displays cheques list in historique', async () => {
    mockGestionChequeStore.cheques = [
      {
        numeroCheque: 'CHQ-001',
        montant: 150.00,
        dateEmission: new Date('2026-02-20'),
        banque: 'BNP Paribas',
        titulaire: 'Jean Dupont',
        estPostdate: false,
      },
      {
        numeroCheque: 'CHQ-002',
        montant: 200.00,
        dateEmission: new Date('2026-02-21'),
        banque: null,
        titulaire: null,
        estPostdate: true,
      },
    ];

    renderPage();
    
    fireEvent.click(screen.getByText('Historique'));
    
    await waitFor(() => {
      expect(screen.getByText('CHQ-001')).toBeInTheDocument();
      expect(screen.getByText('CHQ-002')).toBeInTheDocument();
      expect(screen.getByText('BNP Paribas')).toBeInTheDocument();
      expect(screen.getByText('Postdaté')).toBeInTheDocument();
    });
  });

  it('applies filters when button clicked in historique', async () => {
    renderPage();
    
    fireEvent.click(screen.getByText('Historique'));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Date début/)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Date début/), {
      target: { value: '2026-02-01' },
    });
    fireEvent.change(screen.getByLabelText(/Date fin/), {
      target: { value: '2026-02-28' },
    });

    const appliquerButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(appliquerButton);

    expect(mockGestionChequeStore.setFilters).toHaveBeenCalledWith({
      dateDebut: expect.any(Date),
      dateFin: expect.any(Date),
      estPostdate: undefined,
    });
  });

  it('applies postdate filter when checkbox checked', async () => {
    renderPage();
    
    fireEvent.click(screen.getByText('Historique'));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Afficher uniquement les chèques postdatés/)).toBeInTheDocument();
    });

    const postdateCheckbox = screen.getByLabelText(/Afficher uniquement les chèques postdatés/);
    fireEvent.click(postdateCheckbox);

    const appliquerButton = screen.getByText('Appliquer les filtres');
    fireEvent.click(appliquerButton);

    expect(mockGestionChequeStore.setFilters).toHaveBeenCalledWith({
      dateDebut: undefined,
      dateFin: undefined,
      estPostdate: true,
    });
  });

  it('displays totals in historique', async () => {
    mockGestionChequeStore.totalDepots = 1500.00;
    mockGestionChequeStore.totalRetraits = 500.00;

    renderPage();
    
    fireEvent.click(screen.getByText('Historique'));
    
    await waitFor(() => {
      expect(screen.getByText('Total dépôts')).toBeInTheDocument();
      expect(screen.getByText('Total retraits')).toBeInTheDocument();
      expect(screen.getByText('1 500,00 €')).toBeInTheDocument();
      expect(screen.getByText('500,00 €')).toBeInTheDocument();
    });
  });

  it('navigates back when retour button clicked', () => {
    renderPage();
    
    const retourButton = screen.getByText('Retour au menu');
    fireEvent.click(retourButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('calls reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockGestionChequeStore.reset).toHaveBeenCalled();
  });

  it('disables valider button when loading', () => {
    mockGestionChequeStore.isLoading = true;
    renderPage();
    
    const validerButton = screen.getAllByText(/Enregistrement/)[0];
    expect(validerButton).toBeDisabled();
  });

  it('handles enregistrement error', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    mockGestionChequeStore.validerCheque.mockResolvedValue({
      valide: true,
      estPostdate: false,
    });
    mockGestionChequeStore.enregistrerDepot.mockRejectedValue(
      new Error('Erreur réseau')
    );

    renderPage();
    
    fireEvent.change(screen.getByLabelText(/Numéro de chèque/), {
      target: { value: 'CHQ-123' },
    });
    fireEvent.change(screen.getByLabelText(/Montant/), {
      target: { value: '150.00' },
    });
    fireEvent.change(screen.getByLabelText(/Date d'émission/), {
      target: { value: '2026-02-22' },
    });

    fireEvent.click(screen.getAllByText('Valider')[0]);

    await waitFor(() => {
      expect(screen.getByText(/Confirmer le dépôt/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Confirmer')[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Erreur lors de l'enregistrement: Erreur réseau");
    });

    alertSpy.mockRestore();
  });
});