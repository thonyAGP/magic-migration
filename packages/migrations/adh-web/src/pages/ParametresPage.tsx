import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import {
  SettingsNav,
  UserSettings,
  CaisseSettings,
  PrinterSettings,
  NetworkSettings,
  AuditLog,
} from '@/components/caisse/parametres';
import { useParametresStore } from '@/stores/parametresStore';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Section = 'profil' | 'caisse' | 'imprimantes' | 'reseau' | 'audit';

const SECTION_COMPONENTS: Record<Section, React.ComponentType<{ className?: string }>> = {
  profil: UserSettings,
  caisse: CaisseSettings,
  imprimantes: PrinterSettings,
  reseau: NetworkSettings,
  audit: AuditLog,
};

export function ParametresPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('profil');
  const { loadSettings, loadProfile, loadCaisseConfig, loadPrinters, loadNetworkConfig } =
    useParametresStore();

  useEffect(() => {
    void Promise.all([
      loadSettings(),
      loadProfile(),
      loadCaisseConfig(),
      loadPrinters(),
      loadNetworkConfig(),
    ]);
  }, [loadSettings, loadProfile, loadCaisseConfig, loadPrinters, loadNetworkConfig]);

  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <ScreenLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/caisse/menu')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Parametres</h2>
            <p className="text-on-surface-muted text-sm">Configuration de la caisse</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-48 shrink-0">
            <SettingsNav
              activeSection={activeSection}
              onSectionChange={(s) => setActiveSection(s as Section)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </ScreenLayout>
  );
}
