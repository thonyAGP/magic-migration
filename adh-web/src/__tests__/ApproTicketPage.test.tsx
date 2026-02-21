import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/stores/approTicketStore');
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
}));

import { ApproTicketPage } from '@/pages/ApproTicketPage';
import { useApproTicketStore } from '@/stores/approTicketStore';
import { useAuthStore } from '@/stores';
import type { ApproTicketData } from '@/types/approTicket';

const mockGenerateApproTicket = vi.fn();
const mockSelectPrinter = vi.fn();
const mockPrintTicket = vi.fn();
const mockClearError = vi.fn();
const mockResetState = vi.fn();
const mockSetPrinterDialogVisible = vi.fn();

const mockTicketData: ApproTicketData = {
  village: 'PHU',
  date: new Date('2026-02-20'),
  sessionId: 1001,
  deviseLocale: 'EUR',
  montantApproProduit: 500,
  lines: [
    { operation: 'apport_coffre', devise: 'EUR', montant: 1000 },
    { operation: 'apport_produits', devise: 'EUR', montant: 500 },
    { operation: 'remise_coffre', devise: 'EUR', montant: 200 },
  ],
};

const defaultStoreState = {
  ticketData: null,
  isGenerating: false,
  error: null,
  printerChoice: null,
  showPrinterDialog: false,
  generateApproTicket: mockGenerateApproTicket,
  selectPrinter: mockSelectPrinter,
  printTicket: mockPrintTicket,
  clearError: mockClearError,
  resetState: mockResetState,
  setPrinterDialogVisible: mockSetPrinterDialogVisible,
};

const renderPage = () => {
  return render(
    <BrowserRouter>
      <ApproTicketPage />
    </BrowserRouter>
  );
};

describe('ApproTicketPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector(defaultStoreState)
    );
    vi.mocked(useAuthStore).mockReturnValue({
      user: { prenom: 'John', nom: 'Doe' },
    } as never);
  });

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText(/Ticket Appro Remise/i)).toBeInTheDocument();
  });

  it('displays generate form in initial phase', () => {
    renderPage();
    expect(screen.getByLabelText(/Village/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Session ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Devise locale/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Montant appro produit \(optionnel\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Générer le ticket/i })).toBeInTheDocument();
  });

  it('displays loading state when generating', () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, isGenerating: true })
    );
    renderPage();
    expect(screen.getByRole('button', { name: /Génération.../i })).toBeDisabled();
  });

  it('displays error message when error exists', () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, error: 'Erreur de génération' })
    );
    renderPage();
    expect(screen.getByText(/Erreur de génération/i)).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    renderPage();
    const villageInput = screen.getByLabelText(/Village/i) as HTMLInputElement;
    const sessionInput = screen.getByLabelText(/Session ID/i) as HTMLInputElement;
    const deviseInput = screen.getByLabelText(/Devise locale/i) as HTMLInputElement;

    fireEvent.change(villageInput, { target: { value: 'opi' } });
    fireEvent.change(sessionInput, { target: { value: '2002' } });
    fireEvent.change(deviseInput, { target: { value: 'usd' } });

    expect(villageInput.value).toBe('OPI');
    expect(sessionInput.value).toBe('2002');
    expect(deviseInput.value).toBe('USD');
  });

  it('calls generateApproTicket when form is submitted', async () => {
    renderPage();
    const villageInput = screen.getByLabelText(/Village/i);
    const sessionInput = screen.getByLabelText(/Session ID/i);
    const deviseInput = screen.getByLabelText(/Devise locale/i);
    const montantInput = screen.getByLabelText(/Montant appro produit \(optionnel\)/i);
    const generateButton = screen.getByRole('button', { name: /Générer le ticket/i });

    fireEvent.change(villageInput, { target: { value: 'PHU' } });
    fireEvent.change(sessionInput, { target: { value: '1001' } });
    fireEvent.change(deviseInput, { target: { value: 'EUR' } });
    fireEvent.change(montantInput, { target: { value: '500' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockClearError).toHaveBeenCalled();
      expect(mockGenerateApproTicket).toHaveBeenCalledWith(
        expect.objectContaining({
          village: 'PHU',
          sessionId: 1001,
          deviseLocale: 'EUR',
          montantApproProduit: 500,
        })
      );
    });
  });

  it('disables generate button when required fields are empty', () => {
    renderPage();
    const villageInput = screen.getByLabelText(/Village/i);
    const sessionInput = screen.getByLabelText(/Session ID/i);
    const deviseInput = screen.getByLabelText(/Devise locale/i);

    fireEvent.change(villageInput, { target: { value: '' } });
    fireEvent.change(sessionInput, { target: { value: '' } });
    fireEvent.change(deviseInput, { target: { value: '' } });

    const generateButton = screen.getByRole('button', { name: /Générer le ticket/i });
    expect(generateButton).toBeDisabled();
  });

  it('displays ticket preview when ticketData is available', () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, ticketData: mockTicketData })
    );
    renderPage();

    expect(screen.getByText((content, element) => {
      return element?.tagName === 'H3' && content === 'PHU';
    })).toBeInTheDocument();
    expect(screen.getByText(/Session: #1001/i)).toBeInTheDocument();
    expect(screen.getByText(/Apport Coffre/i)).toBeInTheDocument();
    expect(screen.getByText(/Apport Produits/i)).toBeInTheDocument();
    expect(screen.getByText(/Remise Coffre/i)).toBeInTheDocument();
  });

  it('calculates total correctly', () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, ticketData: mockTicketData })
    );
    renderPage();

    expect(screen.getByText((content) => {
      return content.includes('1300.00') && content.includes('EUR');
    })).toBeInTheDocument();
  });

  it('displays empty state when no lines exist', () => {
    const emptyTicketData: ApproTicketData = {
      ...mockTicketData,
      lines: [],
    };
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, ticketData: emptyTicketData })
    );
    renderPage();

    expect(screen.getByText((content) => {
      return content.includes('Aucune opération enregistrée');
    })).toBeInTheDocument();
  });

  it('opens printer dialog when print button is clicked', () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, ticketData: mockTicketData })
    );
    renderPage();

    const printButtons = screen.getAllByRole('button', { name: /Imprimer/i });
    const printButton = printButtons.find((btn) => !btn.closest('[role="dialog"]'));
    expect(printButton).toBeTruthy();
    fireEvent.click(printButton!);

    expect(mockSetPrinterDialogVisible).toHaveBeenCalledWith(true);
  });

  it('displays printer dialog when showPrinterDialog is true', () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({
        ...defaultStoreState,
        ticketData: mockTicketData,
        showPrinterDialog: true,
      })
    );
    renderPage();

    expect(screen.getByText((content) => {
      return content.includes('Sélection imprimante');
    })).toBeInTheDocument();
    expect(screen.getByText(/Imprimante PDF \(Navigateur\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Imprimante Thermique/i)).toBeInTheDocument();
  });

  it('handles printer selection in dialog', async () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({
        ...defaultStoreState,
        ticketData: mockTicketData,
        showPrinterDialog: true,
      })
    );
    renderPage();

    const thermalRadio = screen.getByRole('radio', { name: /Imprimante Thermique/i }) as HTMLInputElement;
    fireEvent.click(thermalRadio);

    expect(thermalRadio.checked).toBe(true);

    const printButtons = screen.getAllByRole('button', { name: /Imprimer/i });
    const confirmButton = printButtons.find((btn) => btn.closest('[role="dialog"]'));
    expect(confirmButton).toBeTruthy();
    fireEvent.click(confirmButton!);

    await waitFor(() => {
      expect(mockSelectPrinter).toHaveBeenCalled();
      expect(mockPrintTicket).toHaveBeenCalledWith(
        mockTicketData,
        expect.objectContaining({ printerId: 9 })
      );
      expect(mockSetPrinterDialogVisible).toHaveBeenCalledWith(false);
    });
  });

  it('closes printer dialog when cancel is clicked', () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({
        ...defaultStoreState,
        ticketData: mockTicketData,
        showPrinterDialog: true,
      })
    );
    renderPage();

    const cancelButtons = screen.getAllByRole('button', { name: /Annuler/i });
    const cancelButton = cancelButtons.find((btn) => btn.closest('[role="dialog"]'));
    expect(cancelButton).toBeTruthy();
    fireEvent.click(cancelButton!);

    expect(mockSetPrinterDialogVisible).toHaveBeenCalledWith(false);
  });

  it('calls resetState on unmount', () => {
    const { unmount } = renderPage();
    unmount();
    expect(mockResetState).toHaveBeenCalled();
  });

  it('resets to generate phase when back button is clicked in preview', () => {
    vi.mocked(useApproTicketStore).mockImplementation((selector) =>
      selector({ ...defaultStoreState, ticketData: mockTicketData })
    );
    renderPage();

    const backButtons = screen.getAllByRole('button', { name: /Nouveau ticket/i });
    const backButton = backButtons[0];
    fireEvent.click(backButton);

    expect(mockResetState).toHaveBeenCalled();
  });

  it('displays user info when user is logged in', () => {
    renderPage();
    expect(screen.getByText((content) => {
      return content.includes('John') && content.includes('Doe');
    })).toBeInTheDocument();
  });
});