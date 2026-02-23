import { Button, Badge } from '@/components/ui';
import { RefreshCw, Database, Wifi, Printer } from 'lucide-react';
import type { VillageConfig, SystemStatus } from '@/types/datacatch';

interface VillageConfigPanelProps {
  village: VillageConfig;
  systemStatus: SystemStatus;
  onRefreshStatus: () => void;
}

const SAISON_LABELS: Record<string, string> = {
  ete: 'Ete',
  hiver: 'Hiver',
  toutes_saisons: 'Toutes saisons',
};

const STATUS_ICON_MAP = {
  database: Database,
  network: Wifi,
  printer: Printer,
} as const;

const STATUS_COLORS: Record<string, string> = {
  ok: 'bg-success',
  error: 'bg-danger',
  unavailable: 'bg-on-surface-muted',
};

export function VillageConfigPanel({
  village,
  systemStatus,
  onRefreshStatus,
}: VillageConfigPanelProps) {
  const statusEntries: { key: keyof typeof STATUS_ICON_MAP; label: string; status: string }[] = [
    { key: 'database', label: 'Base de donnees', status: systemStatus.database },
    { key: 'network', label: 'Reseau', status: systemStatus.network },
    { key: 'printer', label: 'Imprimante', status: systemStatus.printer },
  ];

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      {/* Village section */}
      <div>
        <h3 className="text-sm font-semibold">Village</h3>
        <div className="mt-2 space-y-2 rounded-md bg-surface-dim p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Code</span>
            <span className="font-medium">{village.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Nom</span>
            <span className="font-medium">{village.nom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Pays</span>
            <span>{village.pays}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Timezone</span>
            <span>{village.timezone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Saison</span>
            <Badge variant="secondary">
              {SAISON_LABELS[village.saison] ?? village.saison}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Capacite</span>
            <span>{village.capacite} lits</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Devise locale</span>
            <span>{village.deviseLocale}</span>
          </div>
        </div>
      </div>

      {/* System status section */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Systeme</h3>
          <Button variant="ghost" size="sm" onClick={onRefreshStatus}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Rafraichir
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {statusEntries.map(({ key, label, status }) => {
            const Icon = STATUS_ICON_MAP[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-md bg-surface-dim px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-on-surface-muted" />
                  <span>{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status] ?? STATUS_COLORS.error}`}
                  />
                  <span className="text-xs text-on-surface-muted capitalize">{status}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-on-surface-muted">
          Derniere synchronisation: {systemStatus.lastSync}
        </p>
      </div>
    </div>
  );
}
