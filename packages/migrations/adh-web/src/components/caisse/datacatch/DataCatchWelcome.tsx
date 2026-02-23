import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { UserPlus, Search, Users, Clock, BarChart3 } from 'lucide-react';
import { t } from '@/i18n';
import { useDataCatchStore } from '@/stores/datacatchStore';
import type { DataCatchWelcomeProps } from './types';

export function DataCatchWelcome({
  onStartNew,
  onStartExisting,
  disabled = false,
}: DataCatchWelcomeProps) {
  const catchingStats = useDataCatchStore((s) => s.catchingStats);
  const loadCatchingStats = useDataCatchStore((s) => s.loadCatchingStats);

  useEffect(() => {
    loadCatchingStats();
  }, [loadCatchingStats]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border p-6 text-center">
        <h2 className="text-lg font-semibold">{t('datacatch.welcome.title')}</h2>
        <p className="mt-2 text-sm text-on-surface-muted">
          {t('datacatch.welcome.subtitle')}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={onStartNew} disabled={disabled}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t('datacatch.welcome.newClient')}
          </Button>
          <Button variant="outline" onClick={onStartExisting} disabled={disabled}>
            <Search className="mr-2 h-4 w-4" />
            {t('datacatch.welcome.search')}
          </Button>
        </div>
      </div>

      {/* Catching stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 rounded-md border border-border p-3">
          <Users className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-on-surface-muted">{t('datacatch.stats.treatedToday')}</p>
            <p className="text-sm font-semibold">{catchingStats.treatedToday}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border p-3">
          <Clock className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-on-surface-muted">{t('datacatch.stats.avgTime')}</p>
            <p className="text-sm font-semibold">
              {catchingStats.avgTimeMinutes} {t('datacatch.stats.minutes')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border p-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-on-surface-muted">{t('datacatch.stats.completionRate')}</p>
            <p className="text-sm font-semibold">{catchingStats.completionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
