import type { TicketData } from './types';

export const ESC = 0x1b;
export const GS = 0x1d;

export function encodeInit(): Uint8Array {
  return new Uint8Array([ESC, 0x40]);
}

export function encodeText(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text + '\n');
}

export function encodeBold(on: boolean): Uint8Array {
  return new Uint8Array([ESC, 0x45, on ? 1 : 0]);
}

export function encodeAlign(align: 'left' | 'center' | 'right'): Uint8Array {
  const map = { left: 0, center: 1, right: 2 };
  return new Uint8Array([ESC, 0x61, map[align]]);
}

export function encodeCut(): Uint8Array {
  return new Uint8Array([GS, 0x56, 0x00]);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function padRight(text: string, width: number): string {
  return text.length >= width ? text.slice(0, width) : text + ' '.repeat(width - text.length);
}

function padLeft(text: string, width: number): string {
  return text.length >= width ? text.slice(0, width) : ' '.repeat(width - text.length) + text;
}

const LINE_WIDTH = 42; // Standard 80mm thermal

export function encodeTicket(data: TicketData): Uint8Array {
  const parts: Uint8Array[] = [encodeInit()];

  // Header
  parts.push(encodeAlign('center'), encodeBold(true));
  parts.push(encodeText(data.header.societe));
  parts.push(encodeBold(false), encodeAlign('left'));
  parts.push(encodeText(`Caisse: ${data.header.caisse}`));
  parts.push(encodeText(`Session: ${data.header.session}`));
  parts.push(encodeText(`${data.header.date} ${data.header.heure}`));
  parts.push(encodeText(`Op: ${data.header.operateur}`));

  if (data.duplicata) {
    parts.push(encodeAlign('center'), encodeBold(true));
    parts.push(encodeText('*** DUPLICATA ***'));
    parts.push(encodeBold(false), encodeAlign('left'));
  }

  parts.push(encodeText('-'.repeat(LINE_WIDTH)));

  // Lines
  for (const line of data.lines) {
    if (line.description === '---') {
      parts.push(encodeText('-'.repeat(LINE_WIDTH)));
      continue;
    }
    const desc = line.quantite ? `${line.quantite}x ${line.description}` : line.description;
    if (line.montant !== 0 && line.devise) {
      const valStr = `${line.montant.toFixed(2)} ${line.devise}`;
      const availWidth = LINE_WIDTH - valStr.length - 1;
      parts.push(encodeText(padRight(desc, availWidth) + ' ' + padLeft(valStr, valStr.length)));
    } else {
      parts.push(encodeText(desc));
    }
  }

  parts.push(encodeText('-'.repeat(LINE_WIDTH)));

  // Footer
  const totalStr = `${data.footer.total.toFixed(2)} ${data.footer.devise}`;
  parts.push(encodeBold(true));
  parts.push(encodeText(padRight('TOTAL', LINE_WIDTH - totalStr.length - 1) + ' ' + totalStr));
  parts.push(encodeBold(false));
  parts.push(encodeText(`Paiement: ${data.footer.moyenPaiement}`));

  if (data.footer.rendu) {
    parts.push(encodeText(`Rendu: ${data.footer.rendu.toFixed(2)} ${data.footer.devise}`));
  }

  parts.push(encodeText(''));
  parts.push(encodeCut());

  return concat(...parts);
}
