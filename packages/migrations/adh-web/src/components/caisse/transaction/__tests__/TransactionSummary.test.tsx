// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionSummary } from '../TransactionSummary';
import type { TransactionDraft } from '@/types/transaction-lot2';

const mockDraft: TransactionDraft = {
  compteId: 1001,
  compteNom: 'Dupont Jean',
  articleType: 'default',
  lignes: [
    { description: 'Forfait ski', quantite: 1, prixUnitaire: 280, devise: 'EUR' },
    { description: 'Location casque', quantite: 2, prixUnitaire: 15, devise: 'EUR' },
  ],
  mop: [],
  paymentSide: 'unilateral',
  devise: 'EUR',
  montantTotal: 310,
};

describe('TransactionSummary', () => {
  it('should render account name', () => {
    render(<TransactionSummary draft={mockDraft} selectedMOP={[]} />);

    expect(screen.getByText('Dupont Jean')).toBeDefined();
  });

  it('should render all transaction lines', () => {
    render(<TransactionSummary draft={mockDraft} selectedMOP={[]} />);

    expect(screen.getByText(/Forfait ski/)).toBeDefined();
    expect(screen.getByText(/Location casque/)).toBeDefined();
  });

  it('should display total amount', () => {
    render(<TransactionSummary draft={mockDraft} selectedMOP={[]} />);

    expect(screen.getByText('Total')).toBeDefined();
  });

  it('should show "En attente" badge when unbalanced', () => {
    render(<TransactionSummary draft={mockDraft} selectedMOP={[]} />);

    expect(screen.getByText('En attente')).toBeDefined();
  });

  it('should show "Equilibree" badge when balanced', () => {
    render(
      <TransactionSummary
        draft={mockDraft}
        selectedMOP={[{ code: 'ESP', montant: 310 }]}
      />,
    );

    expect(screen.getByText('Equilibree')).toBeDefined();
  });

  it('should display MOP summary when payments are selected', () => {
    render(
      <TransactionSummary
        draft={mockDraft}
        selectedMOP={[
          { code: 'ESP', montant: 100 },
          { code: 'CB', montant: 210 },
        ]}
      />,
    );

    expect(screen.getByText('ESP')).toBeDefined();
    expect(screen.getByText('CB')).toBeDefined();
  });

  it('should display commentaire when present', () => {
    render(
      <TransactionSummary
        draft={{ ...mockDraft, commentaire: 'Client VIP' }}
        selectedMOP={[]}
      />,
    );

    expect(screen.getByText('Client VIP')).toBeDefined();
  });

  it('should display GiftPass info when available', () => {
    render(
      <TransactionSummary
        draft={{
          ...mockDraft,
          giftPass: { balance: 150, available: true, devise: 'EUR' },
        }}
        selectedMOP={[]}
      />,
    );

    expect(screen.getByText(/GiftPass/)).toBeDefined();
  });
});
