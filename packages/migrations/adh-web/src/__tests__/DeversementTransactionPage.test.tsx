import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockAuthStore = {
  user: {
    id: '1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    societe: 'SOC1',
  },
};

vi.mock('@/stores', () => ({
  useAuthStore: (selector: unknown) => {
    if (typeof selector === 'function') {
      return selector(mockAuthStore);
    }
    return mockAuthStore;
  },
}));

const mockDeversementStore = {
  vente: null,
  operationsDiverses: [],
  compteGM: null,
  hebergement: null,
  transfertAffectation: null,
  isProcessing: false,
  error: null,
  affectationTransfert: '',
  showAffectationModal: false,
  numeroTicket: null,
  venteVrlVsl: false,
  complementsBiking: [],
  deversementHistory: [],
  setVente: vi.fn(),
  setOperationsDiverses: vi.fn(),
  setCompteGM: vi.fn(),
  setHebergement: vi.fn(),
  setTransfertAffectation: vi.fn(),
  setIsProcessing: vi.fn(),
  setError: vi.fn(),
  setAffectationTransfert: vi.fn(),
  setShowAffectationModal: vi.fn(),
  setNumeroTicket: vi.fn(),
  setVenteVrlVsl: vi.fn(),
  setComplementsBiking: vi.fn(),
  deverserVente: vi.fn(),
  creerOperationDiverse: vi.fn(),
  mettreAJourCompteGM: vi.fn(),
  mettreAJourHebergement: vi.fn(),
  affecterTransfert: vi.fn(),
  razAffectationTransfert: vi.fn(),
  incrementerNumeroTicket: vi.fn(),
  mettreAJourComplementsBiking: vi.fn(),
  verifierEtEnvoyerMail: vi.fn(),
  chargerCompteGM: vi.fn(),
  chargerOperationsDiverses: vi.fn(),
  resetState: vi.fn(),
};

vi.mock('@/stores/deversementTransactionStore', () => ({
  useDeversementTransactionStore: (selector: unknown) => {
    if (typeof selector === 'function') {
      return selector(mockDeversementStore);
    }
    return mockDeversementStore;
  },
}));

import { DeversementTransactionPage } from '@/pages/DeversementTransactionPage';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <DeversementTransactionPage />
    </BrowserRouter>
  );
};

describe('DeversementTransactionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeversementStore.vente = null;
    mockDeversementStore.operationsDiverses = [];
    mockDeversementStore.compteGM = null;
    mockDeversementStore.error = null;
    mockDeversementStore.isProcessing = false;
    mockDeversementStore.showAffectationModal = false;
    mockDeversementStore.numeroTicket = null;
    mockDeversementStore.transfertAffectation = null;
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Déversement Transaction')).toBeInTheDocument();
    expect(screen.getByText('Saisir les informations de la vente')).toBeInTheDocument();
  });

  it('displays user information', () => {
    renderPage();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('displays form fields in initial state', () => {
    renderPage();
    expect(screen.getByDisplayValue('SOC1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('C1001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    expect(screen.getByDisplayValue('150.00')).toBeInTheDocument();
    expect(screen.getByText('Type de vente')).toBeInTheDocument();
    expect(screen.getByText('Annulation')).toBeInTheDocument();
  });

  it('loads compte GM when societe and compte are provided', async () => {
    renderPage();

    const societeInput = screen.getByDisplayValue('SOC1') as HTMLInputElement;
    const compteInput = screen.getByDisplayValue('C1001') as HTMLInputElement;

    fireEvent.change(societeInput, { target: { value: 'SOC2' } });
    fireEvent.change(compteInput, { target: { value: 'C2001' } });

    await waitFor(() => {
      expect(mockDeversementStore.chargerCompteGM).toHaveBeenCalledWith('SOC2', 'C2001');
    });
  });

  it('displays compte GM information when loaded', () => {
    mockDeversementStore.compteGM = {
      societe: 'SOC1',
      compte: 'C1001',
      solde: 500.50,
      dateMAJ: new Date('2026-02-20T10:00:00'),
    };

    renderPage();

    expect(screen.getByText('Solde actuel compte GM')).toBeInTheDocument();
    expect(screen.getByText('500,50 €')).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    renderPage();

    const societeInput = screen.getByDisplayValue('SOC1') as HTMLInputElement;
    const montantInput = screen.getByDisplayValue('150.00') as HTMLInputElement;
    const annulationCheckbox = screen.getByRole('checkbox') as HTMLInputElement;

    fireEvent.change(societeInput, { target: { value: 'SOC3' } });
    expect(societeInput.value).toBe('SOC3');

    fireEvent.change(montantInput, { target: { value: '250.00' } });
    expect(montantInput.value).toBe('250.00');

    fireEvent.click(annulationCheckbox);
    expect(annulationCheckbox.checked).toBe(true);
  });

  it('handles type vente selection', () => {
    renderPage();

    const typeSelectLabel = screen.getByText('Type de vente');
    const typeSelect = typeSelectLabel.parentElement?.querySelector('select') as HTMLSelectElement;

    fireEvent.change(typeSelect, { target: { value: 'VRL' } });
    expect(typeSelect.value).toBe('VRL');

    fireEvent.change(typeSelect, { target: { value: 'VSL' } });
    expect(typeSelect.value).toBe('VSL');
  });

  it('shows affectation modal for VRL/VSL ventes', async () => {
    renderPage();

    const typeSelectLabel = screen.getByText('Type de vente');
    const typeSelect = typeSelectLabel.parentElement?.querySelector('select') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'VRL' } });

    const deverserButton = screen.getByRole('button', { name: 'Déverser' });
    fireEvent.click(deverserButton);

    await waitFor(() => {
      expect(mockDeversementStore.setShowAffectationModal).toHaveBeenCalledWith(true);
    });
  });

  it('processes standard vente without affectation modal', async () => {
    mockDeversementStore.deverserVente.mockResolvedValue(undefined);
    mockDeversementStore.chargerOperationsDiverses.mockResolvedValue(undefined);

    renderPage();

    const deverserButton = screen.getByRole('button', { name: 'Déverser' });
    fireEvent.click(deverserButton);

    await waitFor(() => {
      expect(mockDeversementStore.deverserVente).toHaveBeenCalled();
      expect(mockDeversementStore.chargerOperationsDiverses).toHaveBeenCalled();
    });
  });

  it('displays processing state', () => {
    mockDeversementStore.isProcessing = true;

    renderPage();

    // Multiple "Traitement..." buttons exist (form + dialog render children simultaneously)
    const traitementButtons = screen.getAllByRole('button', { name: 'Traitement...' });
    expect(traitementButtons.length).toBeGreaterThanOrEqual(1);
    expect(traitementButtons[0]).toBeDisabled();
  });

  it('displays error message', () => {
    mockDeversementStore.error = 'Erreur de traitement';

    renderPage();

    expect(screen.getByText('Erreur de traitement')).toBeInTheDocument();
  });

  it('displays result phase after successful deversement', async () => {
    mockDeversementStore.vente = {
      id: 1,
      societe: 'SOC1',
      compte: 'C1001',
      filiation: 0,
      dateEncaissement: new Date('2026-02-20T10:00:00'),
      montant: 150.00,
      annulation: false,
      typeVente: 'standard',
      modePaiement: 'CB',
      operateur: 'Jean Dupont',
    };
    mockDeversementStore.numeroTicket = 12345;
    mockDeversementStore.operationsDiverses = [
      {
        id: 1,
        societe: 'SOC1',
        compte: 'C1001',
        typeOD: 'compte',
        montant: 150.00,
        dateOperation: new Date('2026-02-20T10:00:00'),
        description: 'Test OD',
      },
    ];
    mockDeversementStore.compteGM = {
      societe: 'SOC1',
      compte: 'C1001',
      solde: 350.50,
      dateMAJ: new Date('2026-02-20T10:00:00'),
    };

    mockDeversementStore.deverserVente.mockResolvedValue(undefined);
    mockDeversementStore.chargerOperationsDiverses.mockResolvedValue(undefined);

    renderPage();

    const deverserButton = screen.getByRole('button', { name: 'Déverser' });
    fireEvent.click(deverserButton);

    await waitFor(() => {
      expect(screen.getByText('Déversement effectué avec succès')).toBeInTheDocument();
    });

    expect(screen.getByText('#12345')).toBeInTheDocument();
    // "150,00 €" appears in both vente montant and compteGM solde sections
    expect(screen.getAllByText(/150,00/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Compte')).toBeInTheDocument();
  });

  it('displays operations diverses table in result phase', async () => {
    mockDeversementStore.vente = {
      id: 1,
      societe: 'SOC1',
      compte: 'C1001',
      filiation: 0,
      dateEncaissement: new Date(),
      montant: 150.00,
      annulation: false,
      typeVente: 'standard',
    };
    mockDeversementStore.operationsDiverses = [
      {
        id: 1,
        societe: 'SOC1',
        compte: 'C1001',
        typeOD: 'compte',
        montant: 50.00,
        dateOperation: new Date(),
      },
      {
        id: 2,
        societe: 'SOC1',
        compte: 'C1001',
        typeOD: 'service',
        montant: 100.00,
        dateOperation: new Date(),
      },
    ];

    mockDeversementStore.deverserVente.mockResolvedValue(undefined);
    mockDeversementStore.chargerOperationsDiverses.mockResolvedValue(undefined);

    renderPage();

    const deverserButton = screen.getByRole('button', { name: 'Déverser' });
    fireEvent.click(deverserButton);

    await waitFor(() => {
      expect(screen.getByText('Opérations diverses créées (2)')).toBeInTheDocument();
    });

    expect(screen.getByText('Compte')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('handles back navigation from form', () => {
    renderPage();

    const backButton = screen.getByRole('button', { name: 'Retour au menu' });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
  });

  it('resets state when navigating back from result phase', async () => {
    mockDeversementStore.vente = {
      id: 1,
      societe: 'SOC1',
      compte: 'C1001',
      filiation: 0,
      dateEncaissement: new Date(),
      montant: 150.00,
      annulation: false,
      typeVente: 'standard',
    };

    mockDeversementStore.deverserVente.mockResolvedValue(undefined);
    mockDeversementStore.chargerOperationsDiverses.mockResolvedValue(undefined);

    renderPage();

    const deverserButton = screen.getByRole('button', { name: 'Déverser' });
    fireEvent.click(deverserButton);

    await waitFor(() => {
      expect(screen.getByText('Déversement effectué avec succès')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: 'Nouvelle transaction' });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(mockDeversementStore.resetState).toHaveBeenCalled();
    });
  });

  it('displays transfert affectation in result phase', async () => {
    mockDeversementStore.vente = {
      id: 1,
      societe: 'SOC1',
      compte: 'C1001',
      filiation: 0,
      dateEncaissement: new Date(),
      montant: 150.00,
      annulation: false,
      typeVente: 'VRL',
    };
    mockDeversementStore.transfertAffectation = {
      id: 1,
      venteId: 1,
      affectation: 'TRANSFERT-001',
      dateTransfert: new Date(),
    };

    mockDeversementStore.deverserVente.mockResolvedValue(undefined);
    mockDeversementStore.chargerOperationsDiverses.mockResolvedValue(undefined);

    renderPage();

    const deverserButton = screen.getByRole('button', { name: 'Déverser' });
    fireEvent.click(deverserButton);

    await waitFor(() => {
      expect(screen.getByText('Affectation transfert')).toBeInTheDocument();
    });

    expect(screen.getByText('TRANSFERT-001')).toBeInTheDocument();
  });

  it('calls resetState on unmount', () => {
    const { unmount } = renderPage();
    
    unmount();

    expect(mockDeversementStore.resetState).toHaveBeenCalled();
  });

  it('handles affectation modal confirmation', async () => {
    mockDeversementStore.showAffectationModal = true;
    mockDeversementStore.vente = {
      id: 1,
      societe: 'SOC1',
      compte: 'C1001',
      filiation: 0,
      dateEncaissement: new Date(),
      montant: 150.00,
      annulation: false,
      typeVente: 'VRL',
    };

    mockDeversementStore.deverserVente.mockResolvedValue(undefined);
    mockDeversementStore.affecterTransfert.mockResolvedValue(undefined);
    mockDeversementStore.chargerOperationsDiverses.mockResolvedValue(undefined);

    renderPage();

    const affectationInput = screen.getByPlaceholderText('Ex: TRANSFERT-001') as HTMLInputElement;
    fireEvent.change(affectationInput, { target: { value: 'TRANSFERT-123' } });

    const confirmerButton = screen.getByRole('button', { name: 'Confirmer' });
    fireEvent.click(confirmerButton);

    await waitFor(() => {
      expect(mockDeversementStore.deverserVente).toHaveBeenCalled();
      expect(mockDeversementStore.affecterTransfert).toHaveBeenCalledWith(1, 'TRANSFERT-123');
      expect(mockDeversementStore.setShowAffectationModal).toHaveBeenCalledWith(false);
    });
  });

  it('handles affectation modal cancellation', () => {
    mockDeversementStore.showAffectationModal = true;

    renderPage();

    const annulerButton = screen.getByRole('button', { name: 'Annuler' });
    fireEvent.click(annulerButton);

    expect(mockDeversementStore.setShowAffectationModal).toHaveBeenCalledWith(false);
  });
});