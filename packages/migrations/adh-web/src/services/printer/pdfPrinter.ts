import { jsPDF } from 'jspdf';
import type { TicketData } from './types';

const PAPER_WIDTH = 80; // mm
const MARGIN = 5;

export function generateTicketPdf(ticket: TicketData): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: [PAPER_WIDTH, 200] });
  let y = MARGIN;

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.header.societe, PAPER_WIDTH / 2, y, { align: 'center' });
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Caisse: ${ticket.header.caisse}`, MARGIN, y);
  y += 4;
  doc.text(`Session: ${ticket.header.session}`, MARGIN, y);
  y += 4;
  doc.text(`${ticket.header.date} ${ticket.header.heure}`, MARGIN, y);
  y += 4;
  doc.text(`Op: ${ticket.header.operateur}`, MARGIN, y);
  y += 5;

  if (ticket.duplicata) {
    doc.setFont('helvetica', 'bold');
    doc.text('*** DUPLICATA ***', PAPER_WIDTH / 2, y, { align: 'center' });
    y += 5;
  }

  // Separator
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAPER_WIDTH - MARGIN, y);
  y += 3;

  // Lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  for (const line of ticket.lines) {
    const desc = line.quantite
      ? `${line.quantite}x ${line.description}`
      : line.description;
    doc.text(desc, MARGIN, y);
    doc.text(
      `${line.montant.toFixed(2)} ${line.devise}`,
      PAPER_WIDTH - MARGIN,
      y,
      { align: 'right' },
    );
    y += 4;
  }

  // Separator
  y += 1;
  doc.line(MARGIN, y, PAPER_WIDTH - MARGIN, y);
  y += 4;

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', MARGIN, y);
  doc.text(
    `${ticket.footer.total.toFixed(2)} ${ticket.footer.devise}`,
    PAPER_WIDTH - MARGIN,
    y,
    { align: 'right' },
  );
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paiement: ${ticket.footer.moyenPaiement}`, MARGIN, y);
  if (ticket.footer.rendu) {
    y += 4;
    doc.text(
      `Rendu: ${ticket.footer.rendu.toFixed(2)} ${ticket.footer.devise}`,
      MARGIN,
      y,
    );
  }

  return doc;
}

export function printTicket(ticket: TicketData): void {
  const doc = generateTicketPdf(ticket);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}

export function downloadTicket(ticket: TicketData, filename: string): void {
  const doc = generateTicketPdf(ticket);
  doc.save(filename);
}
