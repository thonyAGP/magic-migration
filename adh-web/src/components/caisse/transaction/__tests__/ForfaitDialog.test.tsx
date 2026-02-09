// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForfaitDialog } from '../ForfaitDialog';
import type { ForfaitData } from '@/types/transaction-lot2';

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
];

describe('ForfaitDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    catalogForfaits: mockForfaits,
    onValidate: vi.fn(),
  };

  it('should render dialog title', () => {
    render(<ForfaitDialog {...defaultProps} />);

    expect(screen.getByText('Dates forfait')).toBeDefined();
  });

  it('should show forfait presets in dropdown', () => {
    render(<ForfaitDialog {...defaultProps} />);

    expect(screen.getByText('Ski 7 jours')).toBeDefined();
  });

  it('should have date inputs', () => {
    render(<ForfaitDialog {...defaultProps} />);

    expect(screen.getByText('Date debut')).toBeDefined();
    expect(screen.getByText('Date fin')).toBeDefined();
  });

  it('should call onValidate with dates when validated', () => {
    const onValidate = vi.fn();
    render(<ForfaitDialog {...defaultProps} onValidate={onValidate} />);

    // Select the preset forfait
    const select = screen.getByDisplayValue('Manuel');
    fireEvent.change(select, { target: { value: 'SKI7' } });

    fireEvent.click(screen.getByText('Valider dates'));

    expect(onValidate).toHaveBeenCalledWith('2026-02-10', '2026-02-16');
  });

  it('should not render when closed', () => {
    render(<ForfaitDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('Dates forfait')).toBeNull();
  });

  it('should call onOpenChange when Annuler is clicked', () => {
    const onOpenChange = vi.fn();
    render(<ForfaitDialog {...defaultProps} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByText('Annuler'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
