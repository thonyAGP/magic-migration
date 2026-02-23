// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardStats } from '../DashboardStats';
import { useDashboardStore } from '@/stores/dashboardStore';
import type { DashboardStats as DashboardStatsType } from '@/types/notification';

vi.mock('@/stores/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

const mockedUseDashboardStore = vi.mocked(useDashboardStore);

const mockStats: DashboardStatsType = {
  sessionsAujourdhui: 5,
  transactionsAujourdhui: 42,
  caTotal: 15890.5,
  devise: 'EUR',
  derniereSynchro: new Date().toISOString(),
  statusConnexion: 'connected',
  caissesActives: 3,
};

function setupStore(overrides: Partial<{ stats: DashboardStatsType | null; isLoading: boolean }> = {}) {
  const state = {
    stats: mockStats,
    isLoading: false,
    loadStats: vi.fn(),
    ...overrides,
  };
  mockedUseDashboardStore.mockImplementation(((selector?: unknown) => {
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state;
  }) as typeof useDashboardStore);
  return state;
}

describe('DashboardStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render 4 stat cards', () => {
    setupStore();
    render(<DashboardStats />);
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('CA Total')).toBeInTheDocument();
    expect(screen.getByText('Caisses actives')).toBeInTheDocument();
  });

  it('should display formatted CA amount', () => {
    setupStore();
    render(<DashboardStats />);
    const caElement = screen.getByText(/15[\s\u202f]?890,50/);
    expect(caElement).toBeInTheDocument();
  });

  it('should show connected status badge in green', () => {
    setupStore({ stats: { ...mockStats, statusConnexion: 'connected' } });
    render(<DashboardStats />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveClass('bg-green-500');
    expect(screen.getByText('Connecte')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading with no stats', () => {
    setupStore({ stats: null, isLoading: true });
    const { container } = render(<DashboardStats />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('should display correct transaction and session counts', () => {
    setupStore();
    render(<DashboardStats />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
