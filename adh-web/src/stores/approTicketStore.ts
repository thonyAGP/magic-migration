import { create } from 'zustand';
import type {
  ApproTicketData,
  ApproTicketLine,
  PrinterChoice,
  GenerateApproTicketParams,
  ApproTicketGenerateResponse,
  ApproTicketPrintResponse,
} from '@/types/approTicket';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface ApproTicketState {
  ticketData: ApproTicketData | null;
  isGenerating: boolean;
  error: string | null;
  printerChoice: PrinterChoice | null;
  showPrinterDialog: boolean;
}

interface ApproTicketActions {
  generateApproTicket: (params: GenerateApproTicketParams) => Promise<void>;
  selectPrinter: (choice: PrinterChoice) => void;
  printTicket: (ticketData: ApproTicketData, printerChoice: PrinterChoice) => Promise<void>;
  clearError: () => void;
  resetState: () => void;
  setPrinterDialogVisible: (visible: boolean) => void;
}

type ApproTicketStore = ApproTicketState & ApproTicketActions;

const _MOCK_TICKET_DATA: ApproTicketData[] = [
  {
    village: 'PHU',
    date: new Date('2026-02-07'),
    sessionId: 1001,
    deviseLocale: 'EUR',
    montantApproProduit: null,
    lines: [
      { operation: 'apport_coffre', devise: 'EUR', montant: 5000 },
      { operation: 'remise_coffre', devise: 'EUR', montant: 4500 },
    ],
  },
  {
    village: 'OPI',
    date: new Date('2026-02-08'),
    sessionId: 1002,
    deviseLocale: 'EUR',
    montantApproProduit: 500,
    lines: [
      { operation: 'apport_coffre', devise: 'EUR', montant: 3000 },
      { operation: 'apport_produits', devise: 'EUR', montant: 500 },
      { operation: 'remise_coffre', devise: 'EUR', montant: 2800 },
    ],
  },
  {
    village: 'DAH',
    date: new Date('2026-02-09'),
    sessionId: 1003,
    deviseLocale: 'EUR',
    montantApproProduit: 750,
    lines: [
      { operation: 'apport_coffre', devise: 'EUR', montant: 8000 },
      { operation: 'apport_produits', devise: 'EUR', montant: 750 },
      { operation: 'remise_coffre', devise: 'EUR', montant: 7200 },
    ],
  },
];

const generateMockTicketData = (params: GenerateApproTicketParams): ApproTicketData => {
  const lines: ApproTicketLine[] = [];
  
  lines.push({
    operation: 'apport_coffre',
    devise: params.deviseLocale,
    montant: Math.floor(Math.random() * 5000) + 3000,
  });

  if (params.montantApproProduit && params.montantApproProduit > 0) {
    lines.push({
      operation: 'apport_produits',
      devise: params.deviseLocale,
      montant: params.montantApproProduit,
    });
  }

  const totalApport = lines.reduce((sum, line) => sum + line.montant, 0);
  const remise = totalApport - Math.floor(Math.random() * 500) - 200;
  
  lines.push({
    operation: 'remise_coffre',
    devise: params.deviseLocale,
    montant: remise,
  });

  return {
    village: params.village,
    date: params.date,
    sessionId: params.sessionId,
    deviseLocale: params.deviseLocale,
    montantApproProduit: params.montantApproProduit ?? null,
    lines,
  };
};

const initialState: ApproTicketState = {
  ticketData: null,
  isGenerating: false,
  error: null,
  printerChoice: null,
  showPrinterDialog: false,
};

export const useApproTicketStore = create<ApproTicketStore>()((set, _get) => ({
  ...initialState,

  generateApproTicket: async (params) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isGenerating: true, error: null });

    if (!isRealApi) {
      const mockData = generateMockTicketData(params);
      set({ ticketData: mockData, isGenerating: false });
      return;
    }

    try {
      const response = await apiClient.post<ApproTicketGenerateResponse>(
        '/api/appro-ticket/generate',
        {
          village: params.village,
          date: params.date.toISOString().split('T')[0],
          sessionId: params.sessionId,
          deviseLocale: params.deviseLocale,
          montantApproProduit: params.montantApproProduit,
        },
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Erreur génération ticket');
      }

      set({ ticketData: response.data.data });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur génération ticket appro/remise';
      set({ ticketData: null, error: message });
    } finally {
      set({ isGenerating: false });
    }
  },

  selectPrinter: (choice) => {
    set({ printerChoice: choice, showPrinterDialog: false });
  },

  printTicket: async (ticketData, printerChoice) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ error: null });

    if (!isRealApi) {
      return;
    }

    try {
      const format = printerChoice.type === 'escpos' ? 'escpos' : 'pdf';
      const response = await apiClient.post<ApproTicketPrintResponse>(
        '/api/appro-ticket/print',
        {
          ticketData,
          format,
          printerId: printerChoice.printerId,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur impression ticket');
      }

      if (printerChoice.type === 'pdf-download' && response.data.data?.url) {
        const link = document.createElement('a');
        link.href = response.data.data.url;
        link.download = `ticket-appro-${ticketData.sessionId}.pdf`;
        link.click();
      } else if (printerChoice.type === 'pdf-browser' && response.data.data?.url) {
        window.open(response.data.data.url, '_blank');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur impression ticket';
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),

  resetState: () => set({ ...initialState }),

  setPrinterDialogVisible: (visible) => set({ showPrinterDialog: visible }),
}));