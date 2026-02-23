// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VillageConfigPanel } from '../VillageConfigPanel';
import type { VillageConfig, SystemStatus } from '@/types/datacatch';

const MOCK_VILLAGE: VillageConfig = {
  code: 'OIR',
  nom: 'Opio en Provence',
  pays: 'France',
  timezone: 'Europe/Paris',
  saison: 'toutes_saisons',
  capacite: 430,
  deviseLocale: 'EUR',
};

const MOCK_STATUS: SystemStatus = {
  database: 'ok',
  network: 'ok',
  printer: 'ok',
  lastSync: '2026-02-10T10:30:00Z',
};

describe('VillageConfigPanel', () => {
  const defaultProps = {
    village: MOCK_VILLAGE,
    systemStatus: MOCK_STATUS,
    onRefreshStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render village info', () => {
    render(<VillageConfigPanel {...defaultProps} />);

    expect(screen.getByText('Village')).toBeDefined();
    expect(screen.getByText('OIR')).toBeDefined();
    expect(screen.getByText('Opio en Provence')).toBeDefined();
    expect(screen.getByText('France')).toBeDefined();
    expect(screen.getByText('Europe/Paris')).toBeDefined();
    expect(screen.getByText('Toutes saisons')).toBeDefined();
    expect(screen.getByText('430 lits')).toBeDefined();
    expect(screen.getByText('EUR')).toBeDefined();
  });

  it('should render system status section', () => {
    render(<VillageConfigPanel {...defaultProps} />);

    expect(screen.getByText('Systeme')).toBeDefined();
    expect(screen.getByText('Base de donnees')).toBeDefined();
    expect(screen.getByText('Reseau')).toBeDefined();
    expect(screen.getByText('Imprimante')).toBeDefined();
  });

  it('should display ok status for all services', () => {
    render(<VillageConfigPanel {...defaultProps} />);

    const okLabels = screen.getAllByText('ok');
    expect(okLabels.length).toBe(3);
  });

  it('should display error status when service is down', () => {
    render(
      <VillageConfigPanel
        {...defaultProps}
        systemStatus={{ ...MOCK_STATUS, database: 'error' }}
      />,
    );

    expect(screen.getByText('error')).toBeDefined();
  });

  it('should display unavailable status for printer', () => {
    render(
      <VillageConfigPanel
        {...defaultProps}
        systemStatus={{ ...MOCK_STATUS, printer: 'unavailable' }}
      />,
    );

    expect(screen.getByText('unavailable')).toBeDefined();
  });

  it('should show last sync time', () => {
    render(<VillageConfigPanel {...defaultProps} />);

    expect(
      screen.getByText(/Derniere synchronisation.*2026-02-10T10:30:00Z/),
    ).toBeDefined();
  });

  it('should call onRefreshStatus when clicking rafraichir', () => {
    render(<VillageConfigPanel {...defaultProps} />);

    fireEvent.click(screen.getByText('Rafraichir'));
    expect(defaultProps.onRefreshStatus).toHaveBeenCalledOnce();
  });

  it('should display saison ete correctly', () => {
    render(
      <VillageConfigPanel
        {...defaultProps}
        village={{ ...MOCK_VILLAGE, saison: 'ete' }}
      />,
    );

    expect(screen.getByText('Ete')).toBeDefined();
  });

  it('should display saison hiver correctly', () => {
    render(
      <VillageConfigPanel
        {...defaultProps}
        village={{ ...MOCK_VILLAGE, saison: 'hiver' }}
      />,
    );

    expect(screen.getByText('Hiver')).toBeDefined();
  });
});
