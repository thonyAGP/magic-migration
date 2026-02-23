import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/stores/dashboardStore';
import { ShoppingCart, CreditCard, Euro, Monitor } from 'lucide-react';
import type { DashboardStatsProps } from './types';

const REFRESH_INTERVAL = 60_000;

const statusColors = {
  connected: 'bg-green-500',
  disconnected: 'bg-red-500',
  reconnecting: 'bg-yellow-500',
};

const statusLabels = {
  connected: 'Connecte',
  disconnected: 'Deconnecte',
  reconnecting: 'Reconnexion...',
};

function formatCurrency(amount: number, devise: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
  }).format(amount);
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'A l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `Il y a ${hours}h${minutes % 60 > 0 ? `${String(minutes % 60).padStart(2, '0')}` : ''}`;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const stats = useDashboardStore((s) => s.stats);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const loadStats = useDashboardStore((s) => s.loadStats);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadStats]);

  if (isLoading && !stats) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: 'Sessions',
      value: String(stats.sessionsAujourdhui),
      icon: Monitor,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Transactions',
      value: String(stats.transactionsAujourdhui),
      icon: ShoppingCart,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'CA Total',
      value: formatCurrency(stats.caTotal, stats.devise),
      icon: Euro,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Caisses actives',
      value: String(stats.caissesActives),
      icon: CreditCard,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('p-2 rounded-lg', card.color)}>
                <card.icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-on-surface/60">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-on-surface/60">
        <div className="flex items-center gap-2">
          <span
            className={cn('w-2 h-2 rounded-full', statusColors[stats.statusConnexion])}
            data-testid="status-badge"
          />
          <span>{statusLabels[stats.statusConnexion]}</span>
        </div>
        <span>Synchro: {formatRelativeTime(stats.derniereSynchro)}</span>
      </div>
    </div>
  );
}
