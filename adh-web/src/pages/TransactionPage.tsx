import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { TransactionForm } from '@/components/caisse/transaction';
import { useTransactionStore } from '@/stores';
import type { TransactionMode } from '@/components/caisse/transaction/types';

function isValidMode(mode: string | undefined): mode is TransactionMode {
  return mode === 'GP' || mode === 'Boutique';
}

export function TransactionPage() {
  const { mode: rawMode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const mode = isValidMode(rawMode) ? rawMode : 'GP';

  const {
    isLoadingCatalogs,
    preCheckResult,
    catalogErrors,
    loadCatalogs,
    resetTransaction,
  } = useTransactionStore();

  useEffect(() => {
    if (!isValidMode(rawMode)) {
      navigate('/caisse/vente/GP', { replace: true });
    }
  }, [rawMode, navigate]);

  useEffect(() => {
    loadCatalogs();
    return () => resetTransaction();
  }, [loadCatalogs, resetTransaction]);

  const handleSubmit = async () => {
    // Transaction submission is handled inside TransactionForm via store
  };

  const handleCancel = () => {
    resetTransaction();
    navigate('/caisse/menu');
  };

  if (isLoadingCatalogs) {
    return (
      <ScreenLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-on-surface-muted">Chargement des catalogues...</div>
        </div>
      </ScreenLayout>
    );
  }

  if (preCheckResult && !preCheckResult.canSell) {
    return (
      <ScreenLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-danger font-medium">Vente impossible</div>
          <div className="text-sm text-on-surface-muted">
            {preCheckResult.reason ?? 'Le reseau est cloture ou une condition bloque la vente.'}
          </div>
          <button
            onClick={() => navigate('/caisse/menu')}
            className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark"
          >
            Retour au menu
          </button>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <div className="space-y-4">
        {catalogErrors.length > 0 && (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            Certains catalogues n'ont pas pu etre charges : {catalogErrors.join(', ')}
          </div>
        )}
        <TransactionForm
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </ScreenLayout>
  );
}
