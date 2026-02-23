import { describe, it, expect } from 'vitest';
import {
  ESC,
  GS,
  encodeInit,
  encodeText,
  encodeBold,
  encodeAlign,
  encodeCut,
  encodeTicket,
} from '../escposEncoder';
import type { TicketData } from '../types';

describe('ESC/POS Encoder', () => {
  it('should encode init command', () => {
    const result = encodeInit();
    expect(result).toEqual(new Uint8Array([ESC, 0x40]));
  });

  it('should encode text with newline', () => {
    const result = encodeText('Hello');
    const decoder = new TextDecoder();
    expect(decoder.decode(result)).toBe('Hello\n');
  });

  it('should encode bold on and off', () => {
    expect(encodeBold(true)).toEqual(new Uint8Array([ESC, 0x45, 1]));
    expect(encodeBold(false)).toEqual(new Uint8Array([ESC, 0x45, 0]));
  });

  it('should encode alignment', () => {
    expect(encodeAlign('left')).toEqual(new Uint8Array([ESC, 0x61, 0]));
    expect(encodeAlign('center')).toEqual(new Uint8Array([ESC, 0x61, 1]));
    expect(encodeAlign('right')).toEqual(new Uint8Array([ESC, 0x61, 2]));
  });

  it('should encode cut command', () => {
    expect(encodeCut()).toEqual(new Uint8Array([GS, 0x56, 0x00]));
  });

  it('should encode a full ticket', () => {
    const ticket: TicketData = {
      header: {
        societe: 'Test Village',
        caisse: 'C01',
        session: 'S001',
        date: '11/02/2026',
        heure: '14:30',
        operateur: 'Jean',
      },
      lines: [
        { description: 'Article 1', quantite: 2, montant: 10.0, devise: 'EUR' },
        { description: '---', montant: 0, devise: '' },
        { description: 'Article 2', montant: 5.5, devise: 'EUR' },
      ],
      footer: {
        total: 15.5,
        devise: 'EUR',
        moyenPaiement: 'CB',
      },
    };

    const result = encodeTicket(ticket);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);

    // Should start with init command
    expect(result[0]).toBe(ESC);
    expect(result[1]).toBe(0x40);

    // Should end with cut command
    const lastThree = result.slice(-3);
    expect(lastThree[0]).toBe(GS);
    expect(lastThree[1]).toBe(0x56);
    expect(lastThree[2]).toBe(0x00);

    // Should contain the text
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toContain('Test Village');
    expect(decoded).toContain('TOTAL');
    expect(decoded).toContain('15.50 EUR');
  });

  it('should handle duplicata flag', () => {
    const ticket: TicketData = {
      header: {
        societe: 'Village',
        caisse: 'C01',
        session: 'S001',
        date: '11/02/2026',
        heure: '14:30',
        operateur: 'Jean',
      },
      lines: [],
      footer: { total: 0, devise: 'EUR', moyenPaiement: 'CB' },
      duplicata: true,
    };

    const result = encodeTicket(ticket);
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toContain('DUPLICATA');
  });

  it('should handle rendu in footer', () => {
    const ticket: TicketData = {
      header: {
        societe: 'Village',
        caisse: 'C01',
        session: 'S001',
        date: '11/02/2026',
        heure: '14:30',
        operateur: 'Jean',
      },
      lines: [],
      footer: { total: 10, devise: 'EUR', moyenPaiement: 'ESPECES', rendu: 5 },
    };

    const result = encodeTicket(ticket);
    const decoded = new TextDecoder().decode(result);
    expect(decoded).toContain('Rendu: 5.00 EUR');
  });
});
