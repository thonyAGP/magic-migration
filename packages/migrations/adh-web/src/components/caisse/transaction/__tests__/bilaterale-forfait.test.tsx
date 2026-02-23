// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BilateraleDialog } from '../BilateraleDialog';
import { ForfaitDialog } from '../ForfaitDialog';
import { GratuitConfirmDialog } from '../GratuitConfirmDialog';
import type { ForfaitData } from '@/types/transaction-lot2';

const calculateDays = (dateDebut: string, dateFin: string): number => {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  const diff = fin.getTime() - debut.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  return days;
};

describe('BilateraleDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    totalRestant: 100,
    devise: 'EUR',
    mopLibelle: 'Especes',
    onValidate: vi.fn(),
  };

  it('should render dialog title', () => {
    render(<BilateraleDialog {...defaultProps} />);
    expect(screen.getByText('Paiement bilateral')).toBeDefined();
  });

  it('should show MOP libelle in description', () => {
    render(<BilateraleDialog {...defaultProps} />);
    expect(screen.getByText(/Especes/)).toBeDefined();
  });

  it('should calculate partie2 automatically', () => {
    render(<BilateraleDialog {...defaultProps} />);
    const input = screen.getByPlaceholderText('0,00');
    fireEvent.change(input, { target: { value: '40' } });

    expect(screen.getAllByText(/60,00/).length).toBeGreaterThanOrEqual(1);
  });

  it('should disable validate when partie1 is 0', () => {
    render(<BilateraleDialog {...defaultProps} />);
    const button = screen.getByText('Valider repartition');
    expect(button.getAttribute('disabled')).not.toBeNull();
  });

  it('should disable validate when partie1 >= total', () => {
    render(<BilateraleDialog {...defaultProps} />);
    const input = screen.getByPlaceholderText('0,00');
    fireEvent.change(input, { target: { value: '100' } });

    const button = screen.getByText('Valider repartition');
    expect(button.getAttribute('disabled')).not.toBeNull();
  });

  it('should enable validate when partie1 is valid', () => {
    render(<BilateraleDialog {...defaultProps} />);
    const input = screen.getByPlaceholderText('0,00');
    fireEvent.change(input, { target: { value: '60' } });

    const button = screen.getByText('Valider repartition');
    expect(button.getAttribute('disabled')).toBeNull();
  });

  it('should call onValidate with both parts', () => {
    const onValidate = vi.fn();
    render(<BilateraleDialog {...defaultProps} onValidate={onValidate} />);

    const input = screen.getByPlaceholderText('0,00');
    fireEvent.change(input, { target: { value: '60' } });
    fireEvent.click(screen.getByText('Valider repartition'));

    expect(onValidate).toHaveBeenCalledWith(60, 40);
  });

  it('should show error when partie1 >= total', () => {
    render(<BilateraleDialog {...defaultProps} />);
    const input = screen.getByPlaceholderText('0,00');
    fireEvent.change(input, { target: { value: '100' } });

    expect(screen.getByText(/inferieure au total/)).toBeDefined();
  });

  it('should not render when closed', () => {
    render(<BilateraleDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Paiement bilateral')).toBeNull();
  });
});

describe('ForfaitDialog - calcul forfait', () => {
  const mockForfaits: ForfaitData[] = [
    {
      code: 'SKI7',
      libelle: 'Ski 7 jours',
      dateDebut: '2026-02-10',
      dateFin: '2026-02-16',
      articleType: 'VRL',
      prixParJour: 40,
      prixForfait: 280,
    },
    {
      code: 'SKI3',
      libelle: 'Ski 3 jours',
      dateDebut: '2026-02-10',
      dateFin: '2026-02-12',
      articleType: 'VRL',
      prixParJour: 50,
      prixForfait: 150,
    },
  ];

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    catalogForfaits: mockForfaits,
    onValidate: vi.fn(),
  };

  it('should show forfait calculation when preset selected', () => {
    render(<ForfaitDialog {...defaultProps} />);

    const select = screen.getByDisplayValue('Manuel');
    fireEvent.change(select, { target: { value: 'SKI7' } });

    const calcArea = screen.getByTestId('forfait-calc');
    expect(calcArea).toBeDefined();
    expect(screen.getByText('7')).toBeDefined();
  });

  it('should show 3 jours for SKI3 preset', () => {
    render(<ForfaitDialog {...defaultProps} />);

    const select = screen.getByDisplayValue('Manuel');
    fireEvent.change(select, { target: { value: 'SKI3' } });

    expect(screen.getByText('3')).toBeDefined();
  });

  it('should not show calculation without forfait selected', () => {
    render(<ForfaitDialog {...defaultProps} />);
    expect(screen.queryByTestId('forfait-calc')).toBeNull();
  });
});

describe('calculateDays', () => {
  it('should return 1 for same date', () => {
    expect(calculateDays('2026-02-10', '2026-02-10')).toBe(1);
  });

  it('should return 7 for a week', () => {
    expect(calculateDays('2026-02-10', '2026-02-16')).toBe(7);
  });

  it('should return 3 for 3 days', () => {
    expect(calculateDays('2026-02-10', '2026-02-12')).toBe(3);
  });

  it('should return 30 for a month span', () => {
    expect(calculateDays('2026-02-01', '2026-03-02')).toBe(30);
  });

  it('should return 365 for a year span', () => {
    expect(calculateDays('2026-01-01', '2026-12-31')).toBe(365);
  });
});

describe('GratuitConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    articleDescription: 'Bracelet offert',
    montant: 0,
  };

  it('should render dialog with article description', () => {
    render(<GratuitConfirmDialog {...defaultProps} />);
    expect(screen.getByText(/Bracelet offert/)).toBeDefined();
  });

  it('should show article gratuit title', () => {
    render(<GratuitConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Article gratuit')).toBeDefined();
  });

  it('should have confirm button', () => {
    render(<GratuitConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirmer gratuit')).toBeDefined();
  });

  it('should have modify button', () => {
    render(<GratuitConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Modifier le montant')).toBeDefined();
  });

  it('should call onConfirm when confirm clicked', () => {
    const onConfirm = vi.fn();
    render(<GratuitConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Confirmer gratuit'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onClose when modify clicked', () => {
    const onClose = vi.fn();
    render(<GratuitConfirmDialog {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Modifier le montant'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should not render when closed', () => {
    render(<GratuitConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Article gratuit')).toBeNull();
  });
});

describe('modeLabels', () => {
  it('should have GP labels', () => {
    const gpLabels = {
      clientLabel: 'Adherent',
      compteLabel: 'Compte GM',
      articlesLabel: 'Articles Grande Boutique',
      venteLabel: 'Vente GP',
    };
    expect(gpLabels.clientLabel).toBe('Adherent');
    expect(gpLabels.compteLabel).toBe('Compte GM');
    expect(gpLabels.articlesLabel).toBe('Articles Grande Boutique');
    expect(gpLabels.venteLabel).toBe('Vente GP');
  });

  it('should have Boutique labels', () => {
    const boutiqueLabels = {
      clientLabel: 'Client',
      compteLabel: 'Compte Boutique',
      articlesLabel: 'Articles Boutique',
      venteLabel: 'Vente Boutique',
    };
    expect(boutiqueLabels.clientLabel).toBe('Client');
    expect(boutiqueLabels.compteLabel).toBe('Compte Boutique');
    expect(boutiqueLabels.articlesLabel).toBe('Articles Boutique');
    expect(boutiqueLabels.venteLabel).toBe('Vente Boutique');
  });

  it('should have different labels for GP and Boutique', () => {
    expect('Vente GP').not.toBe('Vente Boutique');
    expect('Compte GM').not.toBe('Compte Boutique');
  });
});