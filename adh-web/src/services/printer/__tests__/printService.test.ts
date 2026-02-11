import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executePrint } from '../printService';
import { TicketType } from '../types';
import type { TicketData } from '../types';

vi.mock('../pdfPrinter', () => ({
  printTicket: vi.fn(),
  downloadTicket: vi.fn(),
}));

vi.mock('../escposPrinter', () => ({
  createEscPosPrinter: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    print: vi.fn().mockResolvedValue(undefined),
    cut: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    isConnected: vi.fn().mockReturnValue(false),
  })),
}));

const mockTicketData: TicketData = {
  header: {
    societe: 'ADH',
    caisse: '1',
    session: '100',
    date: '11/02/2026',
    heure: '10:30',
    operateur: 'caissier1',
  },
  lines: [
    { description: 'Article test', quantite: 2, montant: 50, devise: 'EUR' },
  ],
  footer: {
    total: 50,
    devise: 'EUR',
    moyenPaiement: 'Especes',
  },
};

describe('executePrint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call printTicket for pdf-browser choice', async () => {
    const { printTicket } = await import('../pdfPrinter');

    await executePrint(TicketType.VENTE, mockTicketData, 'pdf-browser');

    expect(printTicket).toHaveBeenCalledWith(mockTicketData);
  });

  it('should call downloadTicket for pdf-download choice', async () => {
    const { downloadTicket } = await import('../pdfPrinter');

    await executePrint(TicketType.OUVERTURE, mockTicketData, 'pdf-download');

    expect(downloadTicket).toHaveBeenCalledWith(mockTicketData, 'ticket-OUVERTURE.pdf');
  });

  it('should create ESC/POS printer and call connect/print/cut/disconnect for escpos choice', async () => {
    const { createEscPosPrinter } = await import('../escposPrinter');

    await executePrint(TicketType.FERMETURE, mockTicketData, 'escpos');

    expect(createEscPosPrinter).toHaveBeenCalledWith({ type: 'escpos' });
    const printer = (createEscPosPrinter as ReturnType<typeof vi.fn>).mock.results[0].value;
    expect(printer.connect).toHaveBeenCalled();
    expect(printer.print).toHaveBeenCalledWith(mockTicketData);
    expect(printer.cut).toHaveBeenCalled();
    expect(printer.disconnect).toHaveBeenCalled();
  });

  it('should use correct filename based on TicketType', async () => {
    const { downloadTicket } = await import('../pdfPrinter');

    await executePrint(TicketType.GARANTIE, mockTicketData, 'pdf-download');
    expect(downloadTicket).toHaveBeenCalledWith(mockTicketData, 'ticket-GARANTIE.pdf');

    await executePrint(TicketType.CHANGE, mockTicketData, 'pdf-download');
    expect(downloadTicket).toHaveBeenCalledWith(mockTicketData, 'ticket-CHANGE.pdf');

    await executePrint(TicketType.RECAP, mockTicketData, 'pdf-download');
    expect(downloadTicket).toHaveBeenCalledWith(mockTicketData, 'ticket-RECAP.pdf');
  });
});
