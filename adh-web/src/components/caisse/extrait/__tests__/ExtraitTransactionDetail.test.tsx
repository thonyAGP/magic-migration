// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExtraitTransactionDetail } from '../ExtraitTransactionDetail';
import type { ExtraitTransaction } from '@/types/extrait';

const fullTransaction: ExtraitTransaction = {
  id: 42,
  date: '2026-02-10',
  heure: '14:30',
  libelle: 'Achat boutique',
  libelleSupplementaire: 'Souvenir shop',
  debit: 45.50,
  credit: 0,
  solde: 154.50,
  codeService: 'BTQ',
  codeImputation: 'IMP01',
  giftPassFlag: false,
  nbArticles: 3,
  status: 'debit',
  numeroPiece: 'VTE-001',
  modePaiement: 'CB',
  caissier: 'MARTIN S.',
  commentaire: 'Client fidele',
};

const creditTransaction: ExtraitTransaction = {
  id: 43,
  date: '2026-02-11',
  heure: '09:00',
  libelle: 'Credit compte',
  debit: 0,
  credit: 200,
  solde: 354.50,
  codeService: 'CAI',
  codeImputation: 'IMP02',
  giftPassFlag: false,
  status: 'credit',
};

describe('ExtraitTransactionDetail', () => {
  it('should render all fields for a complete transaction', () => {
    render(
      <ExtraitTransactionDetail
        open={true}
        onClose={vi.fn()}
        transaction={fullTransaction}
      />,
    );

    expect(screen.getByText(/Detail transaction #42/)).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('Achat boutique')).toBeInTheDocument();
    expect(screen.getByText('Souvenir shop')).toBeInTheDocument();
    expect(screen.getByText('VTE-001')).toBeInTheDocument();
    expect(screen.getByText('CB')).toBeInTheDocument();
    expect(screen.getByText('MARTIN S.')).toBeInTheDocument();
    expect(screen.getByText('Client fidele')).toBeInTheDocument();
    expect(screen.getByText('BTQ')).toBeInTheDocument();
    expect(screen.getByText('Debit')).toBeInTheDocument();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <ExtraitTransactionDetail
        open={false}
        onClose={vi.fn()}
        transaction={fullTransaction}
      />,
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should not render when transaction is null', () => {
    const { container } = render(
      <ExtraitTransactionDetail
        open={true}
        onClose={vi.fn()}
        transaction={null}
      />,
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should call onClose when Fermer button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ExtraitTransactionDetail
        open={true}
        onClose={onClose}
        transaction={fullTransaction}
      />,
    );

    fireEvent.click(screen.getByText('Fermer'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should display credit amount in green', () => {
    render(
      <ExtraitTransactionDetail
        open={true}
        onClose={vi.fn()}
        transaction={creditTransaction}
      />,
    );

    expect(screen.getByText('Credit')).toBeInTheDocument();
    // The montant element should contain text-success class
    const montantEl = screen.getByText(/200,00/);
    expect(montantEl.className).toContain('text-success');
  });

  it('should display debit amount in red', () => {
    render(
      <ExtraitTransactionDetail
        open={true}
        onClose={vi.fn()}
        transaction={fullTransaction}
      />,
    );

    const montantEl = screen.getByText(/45,50/);
    expect(montantEl.className).toContain('text-error');
  });
});
