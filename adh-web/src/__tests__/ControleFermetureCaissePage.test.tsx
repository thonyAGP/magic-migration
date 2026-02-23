import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockAuthUser = { nom: 'Dupont', prenom: 'Jean', operateurId: 1 };

const mockStoreInitialState = {
  sessionId: null,
  deviseLocale: 'EUR',
  parametreUniBi: 'U' as const,
  parametreKT: 'K' as const,
  parametre2Caisses: false,
  hostCourantCoffre: 'HOST01',
  sessionOuverte: true,
  terminalCoffre2: null,
  hostnameCoffre2: '',
  ecarts: [],
  devisesPointees: [],
  articlesPointes: [],
  approRemisesPointes: [],
  histoSessionDetail: [],
  histoSessionDevise: [],
  tableauRecap: [],
  isLoading: false,
  error: null,
  validationErrors: [],
  setParametreUniBi: vi.fn(),
  setParametreKT: vi.fn(),
  setParametre2Caisses: vi.fn(),
  setTerminalCoffre2: vi.fn(),
  setHostnameCoffre2: vi.fn(),
  validerParametresUniBi: vi.fn(),
  validerConfiguration2Caisses: vi.fn(),
  traiterModeKasse: vi.fn(),
  configurerCoffre2: vi.fn(),
  genererTableauRecap: vi.fn(),
  calculerEcarts: vi.fn(),
  chargerPointages: vi.fn(),
  finaliserFermeture: vi.fn(),
  reset: vi.fn(),
};

vi.mock('@/stores/controleFermetureCaisseStore', () => ({
  useControleFermetureCaisseStore: (selector: unknown) => {
    if (typeof selector === 'function') {
      return selector(mockStoreInitialState);
    }
    return mockStoreInitialState;
  },
}));

vi.mock('@/stores', () => ({
  useAuthStore: (selector: unknown) => {
    if (typeof selector === 'function') {
      return selector({ user: mockAuthUser });
    }
    return { user: mockAuthUser };
  },
}));

import { ControleFermetureCaissePage } from '@/pages/ControleFermetureCaissePage';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <ControleFermetureCaissePage />
    </BrowserRouter>
  );
};

// Navigate to a specific step by clicking through the workflow
// The component uses internal useState and only changes step via action handlers
const navigateToStep = async (targetStep: 'recap' | 'ecarts' | 'pointages' | 'final') => {
  const steps: ('recap' | 'ecarts' | 'pointages' | 'final')[] = ['recap', 'ecarts', 'pointages', 'final'];
  const targetIdx = steps.indexOf(targetStep);

  // params -> recap: click "Valider et continuer"
  if (targetIdx >= 0) {
    mockStoreInitialState.validerParametresUniBi = vi.fn().mockResolvedValue(true);
    mockStoreInitialState.validerConfiguration2Caisses = vi.fn().mockResolvedValue(true);
    mockStoreInitialState.traiterModeKasse = vi.fn().mockResolvedValue(undefined);
    const validateBtn = screen.getByRole('button', { name: /valider et continuer/i });
    fireEvent.click(validateBtn);
    await waitFor(() => {
      expect(screen.getByText('Tableau récapitulatif')).toBeInTheDocument();
    });
  }

  // recap -> ecarts: click "Générer"
  if (targetIdx >= 1) {
    mockStoreInitialState.genererTableauRecap = vi.fn().mockResolvedValue(undefined);
    const genBtn = screen.getByRole('button', { name: /générer/i });
    fireEvent.click(genBtn);
    await waitFor(() => {
      expect(screen.getByText('Calcul des écarts')).toBeInTheDocument();
    });
  }

  // ecarts -> pointages: click "Calculer"
  if (targetIdx >= 2) {
    mockStoreInitialState.calculerEcarts = vi.fn().mockResolvedValue(undefined);
    const calcBtn = screen.getByRole('button', { name: /calculer/i });
    fireEvent.click(calcBtn);
    await waitFor(() => {
      expect(screen.getByText('Pointage Devises')).toBeInTheDocument();
    });
  }

  // pointages -> final: click "Charger pointages"
  if (targetIdx >= 3) {
    mockStoreInitialState.chargerPointages = vi.fn().mockResolvedValue(undefined);
    const loadBtn = screen.getByRole('button', { name: /charger pointages/i });
    fireEvent.click(loadBtn);
    await waitFor(() => {
      expect(screen.getByText('Résumé de la session')).toBeInTheDocument();
    });
  }
};

describe('ControleFermetureCaissePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockStoreInitialState, {
      sessionId: null,
      deviseLocale: 'EUR',
      parametreUniBi: 'U' as const,
      parametreKT: 'K' as const,
      parametre2Caisses: false,
      terminalCoffre2: null,
      hostnameCoffre2: '',
      ecarts: [],
      devisesPointees: [],
      articlesPointes: [],
      approRemisesPointes: [],
      tableauRecap: [],
      isLoading: false,
      error: null,
      validationErrors: [],
    });
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Contrôle fermeture caisse')).toBeInTheDocument();
  });

  it('displays user info when logged in', () => {
    renderPage();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('displays step navigation with params as first step', () => {
    renderPage();
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
    expect(screen.getByText('Récapitulatif')).toBeInTheDocument();
    expect(screen.getByText('Écarts')).toBeInTheDocument();
    expect(screen.getByText('Pointages')).toBeInTheDocument();
    expect(screen.getByText('Finalisation')).toBeInTheDocument();
  });

  it('displays params form on params step', () => {
    renderPage();
    expect(screen.getByText('Mode caisse (UNI/BI)')).toBeInTheDocument();
    expect(screen.getByText('Unidirectionnel')).toBeInTheDocument();
    expect(screen.getByText('Bidirectionnel')).toBeInTheDocument();
    expect(screen.getByText('2 Caisses')).toBeInTheDocument();
    expect(screen.getByText('Type terminal (K/T)')).toBeInTheDocument();
    expect(screen.getByText('Kasse')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
  });

  it('calls setParametreUniBi when UNI/BI radio changes', () => {
    renderPage();
    const radioBI = screen.getByRole('radio', { name: /bidirectionnel/i });
    fireEvent.click(radioBI);
    expect(mockStoreInitialState.setParametreUniBi).toHaveBeenCalledWith('B');
  });

  it('calls setParametreKT when K/T radio changes', () => {
    renderPage();
    const radioT = screen.getByRole('radio', { name: /terminal/i });
    fireEvent.click(radioT);
    expect(mockStoreInitialState.setParametreKT).toHaveBeenCalledWith('T');
  });

  it('calls setParametre2Caisses when checkbox changes', () => {
    renderPage();
    const checkbox = screen.getByRole('checkbox', { name: /2 caisses/i });
    fireEvent.click(checkbox);
    expect(mockStoreInitialState.setParametre2Caisses).toHaveBeenCalledWith(true);
  });

  it('shows coffre2 inputs when parametre2Caisses is true', () => {
    Object.assign(mockStoreInitialState, { parametre2Caisses: true });
    renderPage();
    expect(screen.getByPlaceholderText('Numéro terminal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Hostname')).toBeInTheDocument();
  });

  it('calls validation actions when validate button is clicked', async () => {
    mockStoreInitialState.validerParametresUniBi = vi.fn().mockResolvedValue(true);
    mockStoreInitialState.validerConfiguration2Caisses = vi.fn().mockResolvedValue(true);
    mockStoreInitialState.traiterModeKasse = vi.fn().mockResolvedValue(undefined);

    renderPage();
    const validateBtn = screen.getByRole('button', { name: /valider et continuer/i });
    fireEvent.click(validateBtn);

    await waitFor(() => {
      expect(mockStoreInitialState.validerParametresUniBi).toHaveBeenCalledWith('U');
      expect(mockStoreInitialState.validerConfiguration2Caisses).toHaveBeenCalled();
      expect(mockStoreInitialState.traiterModeKasse).toHaveBeenCalledWith('K');
    });
  });

  it('displays loading state', () => {
    Object.assign(mockStoreInitialState, { isLoading: true });
    renderPage();
    expect(screen.getByText('Validation...')).toBeInTheDocument();
  });

  it('displays error message when error exists', () => {
    Object.assign(mockStoreInitialState, { error: 'Test error message' });
    renderPage();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays validation errors', () => {
    Object.assign(mockStoreInitialState, {
      validationErrors: ['Error 1', 'Error 2'],
    });
    renderPage();
    expect(screen.getByText(/• Error 1/)).toBeInTheDocument();
    expect(screen.getByText(/• Error 2/)).toBeInTheDocument();
  });

  it('displays recap step with empty state', async () => {
    Object.assign(mockStoreInitialState, { sessionId: 123 });
    renderPage();
    await navigateToStep('recap');

    expect(screen.getByText('Tableau récapitulatif')).toBeInTheDocument();
  });

  it('displays tableau recap when data exists', async () => {
    Object.assign(mockStoreInitialState, {
      sessionId: 123,
      tableauRecap: [
        { col1: 'val1', col2: 'val2' },
        { col1: 'val3', col2: 'val4' },
      ],
    });
    renderPage();
    await navigateToStep('recap');

    expect(screen.getByText('val1')).toBeInTheDocument();
    expect(screen.getByText('val2')).toBeInTheDocument();
  });

  it('calls genererTableauRecap when generate button clicked', async () => {
    const genererFn = vi.fn().mockResolvedValue(undefined);
    Object.assign(mockStoreInitialState, { sessionId: 123, genererTableauRecap: genererFn });
    renderPage();
    await navigateToStep('recap');

    const generateBtn = screen.getByRole('button', { name: /générer/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(genererFn).toHaveBeenCalledWith(123);
    });
  });

  it('displays ecarts step with form', async () => {
    Object.assign(mockStoreInitialState, { sessionId: 123 });
    renderPage();
    await navigateToStep('ecarts');

    expect(screen.getByText('Calcul des écarts')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('displays ecarts table when data exists', async () => {
    Object.assign(mockStoreInitialState, {
      sessionId: 123,
      ecarts: [
        {
          deviseCode: 'EUR',
          montantAttendu: 100.0,
          montantDeclare: 95.0,
          ecart: -5.0,
          classeMoyenPaiement: 'CASH',
          libelleMoyenPaiement: 'Espèces',
        },
      ],
    });
    renderPage();
    await navigateToStep('ecarts');

    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();
    expect(screen.getByText('95.00')).toBeInTheDocument();
    expect(screen.getByText('-5.00')).toBeInTheDocument();
  });

  it('displays alert badge when ecarts detected', async () => {
    Object.assign(mockStoreInitialState, {
      sessionId: 123,
      ecarts: [
        {
          deviseCode: 'EUR',
          montantAttendu: 100.0,
          montantDeclare: 95.0,
          ecart: -5.0,
          classeMoyenPaiement: null,
          libelleMoyenPaiement: null,
        },
      ],
    });
    renderPage();
    await navigateToStep('ecarts');

    expect(screen.getByText('Écarts détectés')).toBeInTheDocument();
  });

  it('calls calculerEcarts when calculate button clicked', async () => {
    Object.assign(mockStoreInitialState, { sessionId: 123 });
    renderPage();
    await navigateToStep('ecarts');

    mockStoreInitialState.calculerEcarts = vi.fn().mockResolvedValue(undefined);
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '100' } });

    const calcBtn = screen.getByRole('button', { name: /calculer|continuer/i });
    fireEvent.click(calcBtn);

    await waitFor(() => {
      expect(mockStoreInitialState.calculerEcarts).toHaveBeenCalledWith(123, { EUR: 100 });
    });
  });

  it('displays pointages step with empty state', async () => {
    Object.assign(mockStoreInitialState, { sessionId: 123 });
    renderPage();
    await navigateToStep('pointages');

    expect(screen.getByText('Pointage Devises')).toBeInTheDocument();
    expect(screen.getByText('Pointage Articles')).toBeInTheDocument();
    expect(screen.getByText('Pointage Appro/Remises')).toBeInTheDocument();
  });

  it('displays pointages data when loaded', async () => {
    Object.assign(mockStoreInitialState, {
      sessionId: 123,
      devisesPointees: [{ finPointage: true, devisesPointees: true, deviseLocale: 'EUR', nombreDevises: 5 }],
      articlesPointes: [{ existeArticleStock: true }],
      approRemisesPointes: [{ id: 1 }],
    });
    renderPage();
    await navigateToStep('pointages');

    expect(screen.getByText(/EUR \(5\)/)).toBeInTheDocument();
    expect(screen.getByText('1 article(s) en stock')).toBeInTheDocument();
    expect(screen.getByText('1 élément(s)')).toBeInTheDocument();
  });

  it('calls chargerPointages when load button clicked', async () => {
    const chargerFn = vi.fn().mockResolvedValue(undefined);
    Object.assign(mockStoreInitialState, { sessionId: 123, chargerPointages: chargerFn });
    renderPage();
    await navigateToStep('pointages');

    const loadBtn = screen.getByRole('button', { name: /charger pointages/i });
    fireEvent.click(loadBtn);

    await waitFor(() => {
      expect(chargerFn).toHaveBeenCalledWith(123);
    });
  });

  it('displays final step with summary', async () => {
    Object.assign(mockStoreInitialState, {
      sessionId: 123,
      deviseLocale: 'EUR',
      ecarts: [],
    });
    renderPage();
    await navigateToStep('final');

    expect(screen.getByText('Résumé de la session')).toBeInTheDocument();
    expect(screen.getByText(/Session ID:/)).toBeInTheDocument();
    // Session ID 123 appears in both header subtitle and summary - use getAllByText
    expect(screen.getAllByText(/123/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows confirmation dialog when finalize button clicked', async () => {
    Object.assign(mockStoreInitialState, { sessionId: 123, ecarts: [] });
    renderPage();
    await navigateToStep('final');

    const finalizeBtn = screen.getByRole('button', { name: /finaliser fermeture/i });
    fireEvent.click(finalizeBtn);

    await waitFor(() => {
      expect(screen.getByText('Confirmer la finalisation')).toBeInTheDocument();
    });
  });

  it('calls finaliserFermeture when confirmed', async () => {
    const finaliseFn = vi.fn().mockResolvedValue(undefined);
    Object.assign(mockStoreInitialState, { sessionId: 123, ecarts: [], finaliserFermeture: finaliseFn });

    renderPage();
    await navigateToStep('final');

    const finalizeBtn = screen.getByRole('button', { name: /finaliser fermeture/i });
    fireEvent.click(finalizeBtn);

    await waitFor(() => {
      expect(screen.getByText('Confirmer la finalisation')).toBeInTheDocument();
    });

    // Click "Confirmer" (not "Confirmer la finalisation" which is an h3)
    const buttons = screen.getAllByRole('button');
    const confirmBtn = buttons.find((b) => b.textContent === 'Confirmer');
    fireEvent.click(confirmBtn!);

    await waitFor(() => {
      expect(finaliseFn).toHaveBeenCalledWith(123);
      expect(mockNavigate).toHaveBeenCalledWith('/caisse/menu');
    });
  });

  it('navigates back through steps', async () => {
    Object.assign(mockStoreInitialState, { sessionId: 123 });
    renderPage();
    await navigateToStep('recap');

    expect(screen.getByText('Tableau récapitulatif')).toBeInTheDocument();

    const retourBtn = screen.getByRole('button', { name: /retour/i });
    fireEvent.click(retourBtn);

    expect(screen.getByText('Mode caisse (UNI/BI)')).toBeInTheDocument();
  });

  it('calls reset on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockStoreInitialState.reset).toHaveBeenCalled();
  });
});