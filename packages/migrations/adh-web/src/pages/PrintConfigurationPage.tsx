import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { usePrintConfigStore } from '@/stores/printConfigurationStore';
import { useAuthStore } from '@/stores';

export const PrintConfigurationPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const currentConfig = usePrintConfigStore((s) => s.currentConfig);
  const isInitializing = usePrintConfigStore((s) => s.isInitializing);
  const error = usePrintConfigStore((s) => s.error);
  const getPrintConfig = usePrintConfigStore((s) => s.getPrintConfig);
  const setListingNumber = usePrintConfigStore((s) => s.setListingNumber);
  const resetPrintParameters = usePrintConfigStore((s) => s.resetPrintParameters);
  const reset = usePrintConfigStore((s) => s.reset);

  useEffect(() => {
    getPrintConfig();
    return () => reset();
  }, [getPrintConfig, reset]);

  const handleBack = () => {
    navigate('/caisse/menu');
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Configuration impression</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Service utilitaire backend sans interface
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {isInitializing && (
          <div className="bg-surface-hover border border-border px-4 py-3 rounded-md text-sm text-on-surface">
            Chargement de la configuration...
          </div>
        )}

        {currentConfig && (
          <div className="bg-surface border border-border rounded-md p-6 space-y-4">
            <h3 className="font-medium text-base mb-4">Configuration actuelle</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-on-surface-muted">Numéro listing</span>
                <p className="font-medium">{currentConfig.currentListingNum}</p>
              </div>
              <div>
                <span className="text-sm text-on-surface-muted">Imprimante</span>
                <p className="font-medium">{currentConfig.currentPrinterName}</p>
              </div>
              <div>
                <span className="text-sm text-on-surface-muted">Numéro imprimante</span>
                <p className="font-medium">{currentConfig.currentPrinterNum}</p>
              </div>
              <div>
                <span className="text-sm text-on-surface-muted">Nombre de copies</span>
                <p className="font-medium">{currentConfig.numberCopies}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-on-surface-muted">Impression spécifique</span>
                <p className="font-medium">{currentConfig.specificPrint}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setListingNumber(currentConfig.currentListingNum + 1)}
                disabled={isInitializing}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Incrémenter listing
              </button>
              <button
                onClick={resetPrintParameters}
                disabled={isInitializing}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {!currentConfig && !isInitializing && !error && (
          <div className="bg-surface-hover border border-border px-4 py-3 rounded-md text-sm text-on-surface">
            Aucune configuration disponible
          </div>
        )}

        <div className="flex justify-start pt-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
          >
            Retour au menu
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
};

export default PrintConfigurationPage;
