import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApproTicketStore } from '@/stores/approTicketStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type {
  GenerateApproTicketParams,
  ApproTicketData,
  PrinterChoice,
  ApproTicketGenerateResponse,
  ApproTicketPrintResponse,
} from '@/types/approTicket';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(),
  },
}));

const MOCK_PARAMS: GenerateApproTicketParams = {
  village: 'PHU',
  date: new Date('2026-02-20'),
  sessionId: 1001,
  deviseLocale: 'EUR',
  montantApproProduit: 500,
};

const MOCK_TICKET_DATA: ApproTicketData = {
  village: 'PHU',
  date: new Date('2026-02-20'),
  sessionId: 1001,
  deviseLocale: 'EUR',
  montantApproProduit: 500,
  lines: [
    { operation: 'apport_coffre', devise: 'EUR', montant: 5000 },
    { operation: 'apport_produits', devise: 'EUR', montant: 500 },
    { operation: 'remise_coffre', devise: 'EUR', montant: 4500 },
  ],
};

const MOCK_PRINTER_PDF: PrinterChoice = {
  type: 'pdf-browser',
  format: 'a4',
  printerId: 1,
};

const MOCK_PRINTER_THERMAL: PrinterChoice = {
  type: 'escpos',
  format: 'thermal',
  printerId: 9,
};

describe('approTicketStore', () => {
  beforeEach(() => {
    useApproTicketStore.setState({
      ticketData: null,
      isGenerating: false,
      error: null,
      printerChoice: null,
      showPrinterDialog: false,
    });
    vi.clearAllMocks();
  });

  describe('generateApproTicket', () => {
    it('should generate ticket with mock data when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useApproTicketStore.getState();
      await store.generateApproTicket(MOCK_PARAMS);

      const state = useApproTicketStore.getState();
      expect(state.ticketData).not.toBeNull();
      expect(state.ticketData?.village).toBe('PHU');
      expect(state.ticketData?.sessionId).toBe(1001);
      expect(state.ticketData?.deviseLocale).toBe('EUR');
      expect(state.ticketData?.montantApproProduit).toBe(500);
      expect(state.ticketData?.lines.length).toBeGreaterThanOrEqual(3);
      expect(state.isGenerating).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should include Apport Produits line when montantApproProduit is provided', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useApproTicketStore.getState();
      await store.generateApproTicket(MOCK_PARAMS);

      const state = useApproTicketStore.getState();
      const apportProduitsLine = state.ticketData?.lines.find(
        (line) => line.operation === 'apport_produits'
      );
      expect(apportProduitsLine).toBeDefined();
      expect(apportProduitsLine?.montant).toBe(500);
    });

    it('should not include Apport Produits line when montantApproProduit is not provided', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const paramsWithoutProduits: GenerateApproTicketParams = {
        ...MOCK_PARAMS,
        montantApproProduit: undefined,
      };

      const store = useApproTicketStore.getState();
      await store.generateApproTicket(paramsWithoutProduits);

      const state = useApproTicketStore.getState();
      const apportProduitsLine = state.ticketData?.lines.find(
        (line) => line.operation === 'apport_produits'
      );
      expect(apportProduitsLine).toBeUndefined();
    });

    it('should generate ticket with real API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      const mockResponse: ApproTicketGenerateResponse = {
        success: true,
        data: MOCK_TICKET_DATA,
        message: 'Ticket généré',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const store = useApproTicketStore.getState();
      await store.generateApproTicket(MOCK_PARAMS);

      expect(apiClient.post).toHaveBeenCalledWith('/api/appro-ticket/generate', {
        village: 'PHU',
        date: '2026-02-20',
        sessionId: 1001,
        deviseLocale: 'EUR',
        montantApproProduit: 500,
      });

      const state = useApproTicketStore.getState();
      expect(state.ticketData).toEqual(MOCK_TICKET_DATA);
      expect(state.isGenerating).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error when API returns failure', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      const mockResponse: ApproTicketGenerateResponse = {
        success: false,
        message: 'Session invalide',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const store = useApproTicketStore.getState();
      await store.generateApproTicket(MOCK_PARAMS);

      const state = useApproTicketStore.getState();
      expect(state.ticketData).toBeNull();
      expect(state.error).toBe('Session invalide');
      expect(state.isGenerating).toBe(false);
    });

    it('should set error when API throws exception', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      const store = useApproTicketStore.getState();
      await store.generateApproTicket(MOCK_PARAMS);

      const state = useApproTicketStore.getState();
      expect(state.ticketData).toBeNull();
      expect(state.error).toBe('Network error');
      expect(state.isGenerating).toBe(false);
    });

    it('should set loading state during generation', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const store = useApproTicketStore.getState();
      const promise = store.generateApproTicket(MOCK_PARAMS);

      expect(useApproTicketStore.getState().isGenerating).toBe(true);

      await promise;

      expect(useApproTicketStore.getState().isGenerating).toBe(false);
    });
  });

  describe('selectPrinter', () => {
    it('should select PDF browser printer (RM-002)', () => {
      const store = useApproTicketStore.getState();
      store.selectPrinter(MOCK_PRINTER_PDF);

      const state = useApproTicketStore.getState();
      expect(state.printerChoice).toEqual(MOCK_PRINTER_PDF);
      expect(state.printerChoice?.type).toBe('pdf-browser');
      expect(state.printerChoice?.format).toBe('a4');
      expect(state.printerChoice?.printerId).toBe(1);
      expect(state.showPrinterDialog).toBe(false);
    });

    it('should select thermal printer (RM-003)', () => {
      const store = useApproTicketStore.getState();
      store.selectPrinter(MOCK_PRINTER_THERMAL);

      const state = useApproTicketStore.getState();
      expect(state.printerChoice).toEqual(MOCK_PRINTER_THERMAL);
      expect(state.printerChoice?.type).toBe('escpos');
      expect(state.printerChoice?.format).toBe('thermal');
      expect(state.printerChoice?.printerId).toBe(9);
      expect(state.showPrinterDialog).toBe(false);
    });

    it('should close printer dialog when selecting printer', () => {
      useApproTicketStore.setState({ showPrinterDialog: true });

      const store = useApproTicketStore.getState();
      store.selectPrinter(MOCK_PRINTER_PDF);

      expect(useApproTicketStore.getState().showPrinterDialog).toBe(false);
    });
  });

  describe('printTicket', () => {
    it('should do nothing in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useApproTicketStore.getState();
      await store.printTicket(MOCK_TICKET_DATA, MOCK_PRINTER_PDF);

      expect(apiClient.post).not.toHaveBeenCalled();
      expect(useApproTicketStore.getState().error).toBeNull();
    });

    it('should print to PDF browser with printer 1', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      const mockResponse: ApproTicketPrintResponse = {
        success: true,
        data: {
          success: true,
          url: 'https://example.com/ticket.pdf',
        },
        message: 'Ticket imprimé',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      const printerChoice: PrinterChoice = {
        type: 'pdf-browser',
        format: 'a4',
        printerId: 1,
      };

      const store = useApproTicketStore.getState();
      await store.printTicket(MOCK_TICKET_DATA, printerChoice);

      expect(apiClient.post).toHaveBeenCalledWith('/api/appro-ticket/print', {
        ticketData: MOCK_TICKET_DATA,
        format: 'pdf',
        printerId: 1,
      });

      expect(windowOpenSpy).toHaveBeenCalledWith('https://example.com/ticket.pdf', '_blank');
      expect(useApproTicketStore.getState().error).toBeNull();

      windowOpenSpy.mockRestore();
    });

    it('should download PDF with pdf-download type', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      const mockResponse: ApproTicketPrintResponse = {
        success: true,
        data: {
          success: true,
          url: 'https://example.com/ticket.pdf',
        },
        message: 'Ticket imprimé',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const createElementSpy = vi.spyOn(document, 'createElement');
      const clickSpy = vi.fn();
      createElementSpy.mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
      } as never);

      const printerChoice: PrinterChoice = {
        type: 'pdf-download',
        format: 'a4',
        printerId: 1,
      };

      const store = useApproTicketStore.getState();
      await store.printTicket(MOCK_TICKET_DATA, printerChoice);

      expect(apiClient.post).toHaveBeenCalledWith('/api/appro-ticket/print', {
        ticketData: MOCK_TICKET_DATA,
        format: 'pdf',
        printerId: 1,
      });

      expect(clickSpy).toHaveBeenCalled();
      expect(useApproTicketStore.getState().error).toBeNull();

      createElementSpy.mockRestore();
    });

    it('should print to ESC/POS thermal printer with printer 9', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      const mockResponse: ApproTicketPrintResponse = {
        success: true,
        data: {
          success: true,
          jobId: 'job-123',
        },
        message: 'Ticket envoyé à l\'imprimante',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const store = useApproTicketStore.getState();
      await store.printTicket(MOCK_TICKET_DATA, MOCK_PRINTER_THERMAL);

      expect(apiClient.post).toHaveBeenCalledWith('/api/appro-ticket/print', {
        ticketData: MOCK_TICKET_DATA,
        format: 'escpos',
        printerId: 9,
      });

      expect(useApproTicketStore.getState().error).toBeNull();
    });

    it('should set error when print API fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      const mockResponse: ApproTicketPrintResponse = {
        success: false,
        message: 'Imprimante hors ligne',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const store = useApproTicketStore.getState();
      await store.printTicket(MOCK_TICKET_DATA, MOCK_PRINTER_PDF);

      expect(useApproTicketStore.getState().error).toBe('Imprimante hors ligne');
    });

    it('should set error when print API throws exception', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Printer connection failed'));

      const store = useApproTicketStore.getState();
      await store.printTicket(MOCK_TICKET_DATA, MOCK_PRINTER_THERMAL);

      expect(useApproTicketStore.getState().error).toBe('Printer connection failed');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useApproTicketStore.setState({ error: 'Test error' });

      const store = useApproTicketStore.getState();
      store.clearError();

      expect(useApproTicketStore.getState().error).toBeNull();
    });
  });

  describe('resetState', () => {
    it('should reset all state to initial values', () => {
      useApproTicketStore.setState({
        ticketData: MOCK_TICKET_DATA,
        isGenerating: true,
        error: 'Test error',
        printerChoice: MOCK_PRINTER_PDF,
        showPrinterDialog: true,
      });

      const store = useApproTicketStore.getState();
      store.resetState();

      const state = useApproTicketStore.getState();
      expect(state.ticketData).toBeNull();
      expect(state.isGenerating).toBe(false);
      expect(state.error).toBeNull();
      expect(state.printerChoice).toBeNull();
      expect(state.showPrinterDialog).toBe(false);
    });
  });

  describe('setPrinterDialogVisible', () => {
    it('should show printer dialog', () => {
      const store = useApproTicketStore.getState();
      store.setPrinterDialogVisible(true);

      expect(useApproTicketStore.getState().showPrinterDialog).toBe(true);
    });

    it('should hide printer dialog', () => {
      useApproTicketStore.setState({ showPrinterDialog: true });

      const store = useApproTicketStore.getState();
      store.setPrinterDialogVisible(false);

      expect(useApproTicketStore.getState().showPrinterDialog).toBe(false);
    });
  });
});