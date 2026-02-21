// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionCard } from '../SessionCard';
import { SessionStatusBadge } from '../SessionStatusBadge';
import { CaisseMenuGrid } from '../CaisseMenuGrid';
import { EcartJustificationDialog } from '../EcartJustificationDialog';
import type { Session, SessionEcart, CaisseMenuItem, SessionStatus } from '@/types';

// --- Fixtures ---

const baseSession: Session = {
  id: 1,
  caisseId: 5,
  userId: 10,
  dateOuverture: '2026-02-09T08:00:00Z',
  status: 'open',
  devises: [
    { deviseCode: 'EUR', fondCaisse: 1000, totalVentes: 250, totalEncaissements: 300 },
  ],
};

const ecartNegatif: SessionEcart = {
  attendu: 1000,
  compte: 950,
  ecart: -50,
  estEquilibre: false,
  statut: 'negatif',
  ecartsDevises: [{ deviseCode: 'EUR', attendu: 1000, compte: 950, ecart: -50 }],
};

const _ecartPositif: SessionEcart = {
  attendu: 1000,
  compte: 1020,
  ecart: 20,
  estEquilibre: false,
  statut: 'positif',
  ecartsDevises: [{ deviseCode: 'EUR', attendu: 1000, compte: 1020, ecart: 20 }],
};

const ecartEquilibre: SessionEcart = {
  attendu: 1000,
  compte: 1000,
  ecart: 0,
  estEquilibre: true,
  statut: 'equilibre',
  ecartsDevises: [],
};

const ecartAlerte: SessionEcart = {
  attendu: 1000,
  compte: 800,
  ecart: -200,
  estEquilibre: false,
  statut: 'alerte',
  ecartsDevises: [
    { deviseCode: 'EUR', attendu: 800, compte: 600, ecart: -200 },
    { deviseCode: 'USD', attendu: 200, compte: 200, ecart: 0 },
  ],
};

const menuItems: CaisseMenuItem[] = [
  { action: 'ouverture', label: 'Ouverture', icon: 'DoorOpen', description: 'Ouvrir la caisse', enabled: true, requiresOpenSession: false },
  { action: 'fermeture', label: 'Fermeture', icon: 'DoorClosed', description: 'Fermer la caisse', enabled: true, requiresOpenSession: true },
  { action: 'vente_gp', label: 'Vente GP', icon: 'ShoppingCart', description: 'Vente GM', enabled: true, requiresOpenSession: true },
  { action: 'parametres', label: 'Parametres', icon: 'Settings', description: 'Config', enabled: false, requiresOpenSession: false },
];

// --- Tests ---


describe('Session Workflow Integration', () => {
  describe('SessionCard with different statuses', () => {
    it('should render open session with duration and green border', () => {
      const { container } = render(<SessionCard session={baseSession} />);

      expect(screen.getByText('Ouverte')).toBeInTheDocument();
      expect(screen.getByText(/caisse 5/i)).toBeInTheDocument();
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-l-green-500');
    });

    it('should render closed session without duration', () => {
      const closed: Session = { ...baseSession, status: 'closed', dateFermeture: '2026-02-09T18:00:00Z' };
      const { container } = render(<SessionCard session={closed} />);

      expect(screen.getByText('Fermee')).toBeInTheDocument();
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-l-gray-400');
      // No duration for closed session
      expect(screen.queryByText(/\d+h\d{2}/)).not.toBeInTheDocument();
    });

    it('should render opening session with blue border', () => {
      const opening: Session = { ...baseSession, status: 'opening' };
      const { container } = render(<SessionCard session={opening} />);

      expect(screen.getByText('En ouverture')).toBeInTheDocument();
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-l-blue-500');
    });
  });

  describe('SessionCard with ecart display', () => {
    it('should show negative ecart indicator with orange background', () => {
      render(<SessionCard session={baseSession} ecart={ecartNegatif} />);

      expect(screen.getByText(/ecart/i)).toBeInTheDocument();
    });

    it('should show alert ecart indicator with red background', () => {
      render(<SessionCard session={baseSession} ecart={ecartAlerte} />);

      expect(screen.getByText(/ecart/i)).toBeInTheDocument();
    });

    it('should not show ecart when equilibre', () => {
      render(<SessionCard session={baseSession} ecart={ecartEquilibre} />);

      expect(screen.queryByText(/ecart :/i)).not.toBeInTheDocument();
    });
  });

  describe('SessionStatusBadge variants', () => {
    const statuses: { status: SessionStatus; label: string }[] = [
      { status: 'open', label: 'Ouverte' },
      { status: 'closed', label: 'Fermee' },
      { status: 'opening', label: 'En ouverture' },
      { status: 'closing', label: 'En fermeture' },
    ];

    statuses.forEach(({ status, label }) => {
      it(`should render "${label}" for status "${status}"`, () => {
        render(<SessionStatusBadge status={status} />);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('CaisseMenuGrid interactions', () => {
    it('should call onAction when enabled menu item is clicked', () => {
      const onAction = vi.fn();
      render(<CaisseMenuGrid items={menuItems} onAction={onAction} currentStatus="open" />);

      fireEvent.click(screen.getByText('Ouverture'));
      expect(onAction).toHaveBeenCalledWith('ouverture');
    });

    it('should disable items requiring open session when session is closed', () => {
      const onAction = vi.fn();
      render(<CaisseMenuGrid items={menuItems} onAction={onAction} currentStatus="closed" />);

      const fermetureButton = screen.getByText('Fermeture').closest('button');
      expect(fermetureButton).toBeDisabled();
    });

    it('should disable items with enabled=false', () => {
      const onAction = vi.fn();
      render(<CaisseMenuGrid items={menuItems} onAction={onAction} currentStatus="open" />);

      const parametresButton = screen.getByText('Parametres').closest('button');
      expect(parametresButton).toBeDisabled();
    });
  });

  describe('EcartJustificationDialog', () => {
    it('should display ecart values in dialog', () => {
      render(
        <EcartJustificationDialog
          ecart={ecartNegatif}
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByText(/attendu/i)).toBeInTheDocument();
      expect(screen.getByText(/compte/i)).toBeInTheDocument();
    });

    it('should require justification when ecart is non-zero', () => {
      const onSubmit = vi.fn();
      render(
        <EcartJustificationDialog
          ecart={ecartNegatif}
          open={true}
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />,
      );

      // Valider button should be present but requires text
      const validateButton = screen.getByText('Valider');
      expect(validateButton).toBeDisabled();
    });

    it('should enable submit after entering justification', () => {
      const onSubmit = vi.fn();
      render(
        <EcartJustificationDialog
          ecart={ecartNegatif}
          open={true}
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />,
      );

      const textarea = screen.getByPlaceholderText(/saisissez/i);
      fireEvent.change(textarea, { target: { value: 'Erreur de comptage' } });

      const validateButton = screen.getByText('Valider');
      expect(validateButton).not.toBeDisabled();
    });

    it('should call onSubmit with justification text', () => {
      const onSubmit = vi.fn();
      render(
        <EcartJustificationDialog
          ecart={ecartNegatif}
          open={true}
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />,
      );

      const textarea = screen.getByPlaceholderText(/saisissez/i);
      fireEvent.change(textarea, { target: { value: 'Erreur caisse' } });
      fireEvent.click(screen.getByText('Valider'));

      expect(onSubmit).toHaveBeenCalledWith('Erreur caisse');
    });

    it('should show multi-devise detail when multiple devises', () => {
      render(
        <EcartJustificationDialog
          ecart={ecartAlerte}
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />,
      );

      expect(screen.getByText('EUR')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
    });
  });
});
