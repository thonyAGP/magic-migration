// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForfaitTAIPanel } from '../ForfaitTAIPanel';
import type { ForfaitTAI } from '@/types/clubmedpass';

const mockForfaits: ForfaitTAI[] = [
  { id: 'tai-1', libelle: 'Forfait Spa', dateDebut: '2026-02-01', dateFin: '2026-02-15', montant: 150.00, isActive: true },
  { id: 'tai-2', libelle: 'Forfait Sports', dateDebut: '2026-02-01', dateFin: '2026-02-15', montant: 200.00, isActive: false },
  { id: 'tai-3', libelle: 'Forfait Excursions', dateDebut: '2026-02-05', dateFin: '2026-02-12', montant: 120.00, isActive: true },
];

describe('ForfaitTAIPanel', () => {
  const onActivate = vi.fn();
  const onDeactivate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render forfaits list', () => {
    render(
      <ForfaitTAIPanel
        passId="1"
        forfaits={mockForfaits}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />,
    );

    expect(screen.getByText('Forfaits TAI')).toBeDefined();
    expect(screen.getByText('Forfait Spa')).toBeDefined();
    expect(screen.getByText('Forfait Sports')).toBeDefined();
    expect(screen.getByText('Forfait Excursions')).toBeDefined();
  });

  it('should show active/inactive badges', () => {
    render(
      <ForfaitTAIPanel
        passId="1"
        forfaits={mockForfaits}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />,
    );

    const actifBadges = screen.getAllByText('Actif');
    const inactifBadges = screen.getAllByText('Inactif');
    expect(actifBadges.length).toBe(2);
    expect(inactifBadges.length).toBe(1);
  });

  it('should activate a forfait on toggle', () => {
    render(
      <ForfaitTAIPanel
        passId="1"
        forfaits={mockForfaits}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />,
    );

    // Click the inactive forfait checkbox (Forfait Sports)
    const checkboxes = screen.getAllByRole('checkbox');
    // tai-2 is index 1 and is inactive
    fireEvent.click(checkboxes[1]);

    expect(onActivate).toHaveBeenCalledWith('tai-2');
  });

  it('should deactivate a forfait on toggle', () => {
    render(
      <ForfaitTAIPanel
        passId="1"
        forfaits={mockForfaits}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />,
    );

    // Click the first active forfait checkbox (Forfait Spa)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(onDeactivate).toHaveBeenCalledWith('tai-1');
  });

  it('should calculate total of active forfaits', () => {
    render(
      <ForfaitTAIPanel
        passId="1"
        forfaits={mockForfaits}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />,
    );

    // Active: Spa (150) + Excursions (120) = 270
    expect(screen.getByText(/270,00/)).toBeDefined();
  });

  it('should show empty state when no forfaits', () => {
    render(
      <ForfaitTAIPanel
        passId="1"
        forfaits={[]}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />,
    );

    expect(screen.getByText('Aucun forfait disponible')).toBeDefined();
  });

  it('should show loading state', () => {
    const { container } = render(
      <ForfaitTAIPanel
        passId="1"
        forfaits={[]}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
        isLoading
      />,
    );

    const pulses = container.querySelectorAll('.animate-pulse');
    expect(pulses.length).toBeGreaterThan(0);
  });

  it('should display date ranges', () => {
    render(
      <ForfaitTAIPanel
        passId="1"
        forfaits={mockForfaits}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />,
    );

    // Two forfaits share the same date range, so use getAllByText
    const sameRange = screen.getAllByText(/2026-02-01 → 2026-02-15/);
    expect(sameRange.length).toBe(2);
    expect(screen.getByText(/2026-02-05 → 2026-02-12/)).toBeDefined();
  });
});
