import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { DashboardStats, DashboardChart } from '@/components/caisse/dashboard';
import { useDashboardStore } from '@/stores/dashboardStore';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function DashboardPage() {
  const navigate = useNavigate();
  const { loadStats, loadDailyActivity } = useDashboardStore();

  useEffect(() => {
    void Promise.all([loadStats(), loadDailyActivity()]);
  }, [loadStats, loadDailyActivity]);

  return (
    <ScreenLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/caisse/menu')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Tableau de bord</h2>
            <p className="text-on-surface-muted text-sm">Statistiques et suivi d'activite</p>
          </div>
        </div>

        <DashboardStats />
        <DashboardChart />
      </div>
    </ScreenLayout>
  );
}
