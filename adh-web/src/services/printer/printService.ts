import type { TicketData, TicketType, PrinterChoice } from './types';
import { printTicket, downloadTicket } from './pdfPrinter';
import { createEscPosPrinter } from './escposPrinter';

export async function executePrint(
  type: TicketType,
  data: TicketData,
  choice: PrinterChoice,
): Promise<void> {
  switch (choice) {
    case 'pdf-browser':
      return printTicket(data);
    case 'pdf-download':
      return downloadTicket(data, `ticket-${type}.pdf`);
    case 'escpos': {
      const printer = createEscPosPrinter({ type: 'escpos' });
      await printer.connect();
      await printer.print(data);
      await printer.cut();
      await printer.disconnect();
      return;
    }
  }
}
