import { useState } from 'react';
import { Button, Dialog } from '@/components/ui';
import { useControleFermetureCaisseStore } from '@/stores/controleFermetureCaisseStore';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/services/api/apiClient';
import type { FinaliserFermetureApiResponse } from '@/types/controleFermetureCaisse';
import { cn } from '@/lib/utils';

interface FinalisationPanelProps {
  className?: string;
  onFinalisationComplete?: (histoId: number) => void;
}

export const FinalisationPanel = ({ className, onFinalisationComplete }: FinalisationPanelProps) => {
  const user = useAuthStore((s) => s.user);
  const sessionId = useControleFermetureCaisseStore((s) => s.sessionId);
  const ecarts = useControleFermetureCaisseStore((s) => s.ecarts);
  const tableauRecap = useControleFermetureCaisseStore((s) => s.tableauRecap);
  const isLoading = useControleFermetureCaisseStore((s) => s.isLoading);
  const setIsLoading = useControleFermetureCaisseStore((s) => s.setIsLoading);
  const setError = useControleFermetureCaisseStore((s) => s.setError);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const sessionSummary = tableauRecap[0] as Record<string, unknown> | undefined;
  const dateOuverture = sessionSummary?.dateOuverture as string | undefined;
  const dateFermeture = sessionSummary?.dateFermeture as string | undefined;

  const totalEcarts = ecarts.reduce((sum, e) => sum + Math.abs(e.ecart), 0);
  const nbEcartsDetectes = ecarts.filter((e) => Math.abs(e.ecart) > 0.01).length;

  const handleFinaliser = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmFinalisation = async () => {
    if (!sessionId) {
      setError('Aucune session sélectionnée');
      return;
    }

    setShowConfirmDialog(false);
    setFinalizing(true);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<FinaliserFermetureApiResponse>(
        '/api/controle-fermeture-caisse/finaliser',
        { sessionId }
      );

      if (response.data.success && response.data.data) {
        const histoId = response.data.data.histoId;
        onFinalisationComplete?.(histoId);
      } else {
        setError(response.data.error || 'Erreur lors de la finalisation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setFinalizing(false);
      setIsLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div className={cn('p-6 bg-yellow-50 border border-yellow-200 rounded', className)}>
        <p className="text-yellow-800">Aucune session sélectionnée. Retournez à l'étape Paramètres.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Résumé Session</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">ID Session:</span>
            <span className="ml-2 text-gray-900">{sessionId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Opérateur:</span>
            <span className="ml-2 text-gray-900">{user?.username || 'N/A'}</span>
          </div>
          {dateOuverture && (
            <div>
              <span className="font-medium text-gray-700">Date Ouverture:</span>
              <span className="ml-2 text-gray-900">{new Date(dateOuverture).toLocaleString('fr-FR')}</span>
            </div>
          )}
          {dateFermeture && (
            <div>
              <span className="font-medium text-gray-700">Date Fermeture:</span>
              <span className="ml-2 text-gray-900">{new Date(dateFermeture).toLocaleString('fr-FR')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Résumé Écarts Totaux</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Nombre d'écarts détectés:</span>
            <span className={cn('ml-2 font-semibold', nbEcartsDetectes > 0 ? 'text-red-600' : 'text-green-600')}>
              {nbEcartsDetectes}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Montant total écart:</span>
            <span className={cn('ml-2 font-semibold', Math.abs(totalEcarts) > 0.01 ? 'text-red-600' : 'text-green-600')}>
              {totalEcarts.toFixed(2)} €
            </span>
          </div>
        </div>

        {ecarts.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Devise</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Attendu</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Déclaré</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700">Écart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ecarts.map((ecart, idx) => (
                  <tr key={idx} className={cn(Math.abs(ecart.ecart) > 0.01 && 'bg-red-50')}>
                    <td className="px-4 py-2 text-gray-900">{ecart.deviseCode}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{ecart.montantAttendu.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-gray-900">{ecart.montantDeclare.toFixed(2)}</td>
                    <td className={cn('px-4 py-2 text-right font-semibold', Math.abs(ecart.ecart) > 0.01 ? 'text-red-600' : 'text-green-600')}>
                      {ecart.ecart.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleFinaliser}
          disabled={isLoading || finalizing}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {finalizing ? 'Finalisation en cours...' : 'Finaliser Fermeture'}
        </Button>
      </div>

      <Dialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirmation Finalisation"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir finaliser la fermeture de la session <strong>{sessionId}</strong> ?
          </p>
          {nbEcartsDetectes > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 font-medium">
                ⚠️ Attention: {nbEcartsDetectes} écart(s) détecté(s) pour un total de {totalEcarts.toFixed(2)} €
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmFinalisation}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};