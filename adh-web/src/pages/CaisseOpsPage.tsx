import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  ApproCoffreForm,
  ApproProduitsForm,
  RemiseCoffreForm,
  TelecollectePanel,
  PointageAppRemGrid,
} from '@/components/caisse/operations';
import { useCaisseOpsStore, useCaisseStore } from '@/stores';
import { Vault, Package, ArrowDownToLine, CreditCard, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface TabDef {
  key: string;
  label: string;
  icon: LucideIcon;
}

const tabs: TabDef[] = [
  { key: 'appro-coffre', label: 'Apport Coffre', icon: Vault },
  { key: 'appro-produits', label: 'Apport Produits', icon: Package },
  { key: 'remise-coffre', label: 'Remise Coffre', icon: ArrowDownToLine },
  { key: 'telecollecte', label: 'Telecollecte', icon: CreditCard },
  { key: 'pointage', label: 'Pointage', icon: ClipboardCheck },
];

export function CaisseOpsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appro-coffre');

  const config = useCaisseStore((s) => s.config);
  const loadConfig = useCaisseStore((s) => s.loadConfig);
  const devises = config?.devisesAutorisees ?? ['EUR'];

  const isExecuting = useCaisseOpsStore((s) => s.isExecuting);
  const error = useCaisseOpsStore((s) => s.error);
  const lastResult = useCaisseOpsStore((s) => s.lastResult);
  const telecollecteResult = useCaisseOpsStore((s) => s.telecollecteResult);
  const pointageData = useCaisseOpsStore((s) => s.pointageData);
  const isLoadingPointage = useCaisseOpsStore((s) => s.isLoadingPointage);
  const executeApportCoffre = useCaisseOpsStore((s) => s.executeApportCoffre);
  const executeApportProduits = useCaisseOpsStore((s) => s.executeApportProduits);
  const executeRemiseCoffre = useCaisseOpsStore((s) => s.executeRemiseCoffre);
  const executeTelecollecte = useCaisseOpsStore((s) => s.executeTelecollecte);
  const loadPointage = useCaisseOpsStore((s) => s.loadPointage);
  const executeRegularisation = useCaisseOpsStore((s) => s.executeRegularisation);
  const reset = useCaisseOpsStore((s) => s.reset);

  useEffect(() => {
    loadConfig();
    return () => reset();
  }, [loadConfig, reset]);

  useEffect(() => {
    if (activeTab === 'pointage') {
      loadPointage(config?.devisePrincipale ?? 'EUR');
    }
  }, [activeTab, loadPointage, config?.devisePrincipale]);

  const handleTelecollecte = (terminalId: string) => {
    executeTelecollecte({
      terminalId,
      montantTotal: 0,
      nbTransactions: 0,
      dateDebut: new Date().toISOString(),
      dateFin: new Date().toISOString(),
    });
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Operations de caisse</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Gestion des apports, remises, telecollecte et pointage
            </p>
          </div>
          <button
            onClick={() => navigate('/caisse/menu')}
            className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover text-sm"
          >
            Retour au menu
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {lastResult && !error && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            Operation {lastResult.reference} terminee avec succes
          </div>
        )}

        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-muted hover:text-on-surface hover:border-border',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'appro-coffre' && (
          <ApproCoffreForm
            onSubmit={executeApportCoffre}
            devises={devises}
            isSubmitting={isExecuting}
          />
        )}

        {activeTab === 'appro-produits' && (
          <ApproProduitsForm
            onSubmit={executeApportProduits}
            isSubmitting={isExecuting}
          />
        )}

        {activeTab === 'remise-coffre' && (
          <RemiseCoffreForm
            onSubmit={executeRemiseCoffre}
            devises={devises}
            isSubmitting={isExecuting}
          />
        )}

        {activeTab === 'telecollecte' && (
          <TelecollectePanel
            onExecute={handleTelecollecte}
            result={telecollecteResult}
            isExecuting={isExecuting}
          />
        )}

        {activeTab === 'pointage' && pointageData && !isLoadingPointage && (
          <PointageAppRemGrid
            data={pointageData}
            onRegularise={executeRegularisation}
            deviseCode={config?.devisePrincipale ?? 'EUR'}
          />
        )}

        {activeTab === 'pointage' && isLoadingPointage && (
          <div className="text-center py-8 text-on-surface-muted">
            Chargement du pointage...
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}
