import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionCard } from '../SessionCard';
import type { Session, SessionEcart } from '@/types';

const mockSession: Session = {
  id: 1,
  caisseId: 10,
  userId: 42,
  dateOuverture: '2026-02-09T08:00:00Z',
  status: 'open',
  devises: [
    { deviseCode: 'EUR', fondCaisse: 500, totalVentes: 0, totalEncaissements: 0 },
    { deviseCode: 'USD', fondCaisse: 200, totalVentes: 0, totalEncaissements: 0 },
  ],
};

const closedSession: Session = {
  ...mockSession,
  id: 2,
  status: 'closed',
  dateFermeture: '2026-02-09T18:00:00Z',
};

describe('SessionCard', () => {
  it('should render caisse number', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText(/caisse 10/i)).toBeInTheDocument();
  });

  it('should render user id', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText(/utilisateur 42/i)).toBeInTheDocument();
  });

  it('should render opening date', () => {
    render(<SessionCard session={mockSession} />);

    // fr-FR format: 09/02/2026 09:00 (UTC+1 or similar)
    expect(screen.getByText(/09\/02\/2026/)).toBeInTheDocument();
  });

  it('should render session status badge', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText('Ouverte')).toBeInTheDocument();
  });

  it('should display devises with fond de caisse', () => {
    render(<SessionCard session={mockSession} />);

    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText(/500,00/)).toBeInTheDocument();
    expect(screen.getByText(/200,00/)).toBeInTheDocument();
  });

  it('should apply green border for open session', () => {
    const { container } = render(<SessionCard session={mockSession} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-l-green-500');
  });

  it('should apply gray border for closed session', () => {
    const { container } = render(<SessionCard session={closedSession} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-l-gray-400');
  });

  it('should apply blue border for opening session', () => {
    const openingSession: Session = { ...mockSession, status: 'opening' };
    const { container } = render(<SessionCard session={openingSession} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-l-blue-500');
  });

  it('should apply orange border for closing session', () => {
    const closingSession: Session = { ...mockSession, status: 'closing' };
    const { container } = render(<SessionCard session={closingSession} />);

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-l-orange-500');
  });

  it('should display ecart indicator when ecart is provided and not equilibre', () => {
    const ecart: SessionEcart = {
      attendu: 500,
      compte: 490,
      ecart: -10,
      estEquilibre: false,
      statut: 'negatif',
      ecartsDevises: [{ deviseCode: 'EUR', attendu: 500, compte: 490, ecart: -10 }],
    };

    render(<SessionCard session={mockSession} ecart={ecart} />);

    expect(screen.getByText(/ecart/i)).toBeInTheDocument();
  });

  it('should not display ecart indicator when ecart is equilibre', () => {
    const ecart: SessionEcart = {
      attendu: 500,
      compte: 500,
      ecart: 0,
      estEquilibre: true,
      statut: 'equilibre',
      ecartsDevises: [],
    };

    render(<SessionCard session={mockSession} ecart={ecart} />);

    // The ecart section should not be rendered
    const ecartElements = screen.queryAllByText(/ecart/i);
    // Only "Ecart" section appears if not equilibre
    expect(ecartElements.length).toBe(0);
  });

  it('should not display ecart indicator when no ecart is provided', () => {
    render(<SessionCard session={mockSession} />);

    const ecartElements = screen.queryAllByText(/ecart :/i);
    expect(ecartElements.length).toBe(0);
  });

  it('should show duration for open session', () => {
    // The duration is calculated dynamically, so we just check the element is present
    render(<SessionCard session={mockSession} />);

    // Duration format is Xh00 - there should be an element matching the duration pattern
    const durationElements = screen.queryAllByText(/\d+h\d{2}/);
    expect(durationElements.length).toBeGreaterThanOrEqual(1);
  });
});
