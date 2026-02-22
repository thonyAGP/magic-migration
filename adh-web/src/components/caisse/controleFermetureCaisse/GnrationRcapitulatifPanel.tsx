import { useState } from 'react';
import { Button } from '@/components/ui';
import { useControleFermetureCaisseStore } from '@/stores/controleFermetureCaisseStore';
import { apiClient } from '@/services/api/apiClient';
import type { GenererTableauRecapResponse } from '@/types/controleFermetureCaisse';
import { cn } from '@/lib/utils';

interface GnrationRcapitulatifPanelProps {
  className?: string;
}

export const GnrationRcapitulatifPanel = ({ className }: GnrationRcapitulatifPanelProps) => {
  const sessionId = useControleFermetureCaisseStore((s) => s.sessionId);
  const tableauRecap = useControleFermetureCaisseStore((s) => s.tableauRecap);
  const setTableauRecap = useControleFermetureCaisseStore((s) => s.setTableauRecap);
  const setError = useControleFermetureCaisseStore((s) => s.setError);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenererRecap = async () => {
    if (!sessionId) {
      setError('Aucune session sélectionnée');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiClient.post<GenererTableauRecapResponse>(
        '/api/controle-fermeture-caisse/generer-tableau-recap',
        { sessionId }
      );

      if (response.success && response.data) {
        setTableauRecap(response.data.tableauRecap);
      } else {
        setError(response.error || 'Erreur lors de la génération du récapitulatif');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsGenerating(false);
    }
  };

  const columns = tableauRecap.length > 0 ? Object.keys(tableauRecap[0]) : [];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Button onClick={handleGenererRecap} disabled={isGenerating || !sessionId}>
          {isGenerating ? 'Génération...' : 'Générer Tableau Recap'}
        </Button>
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span>Génération en cours...</span>
          </div>
        )}
      </div>

      {tableauRecap.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
          Aucun récapitulatif généré. Cliquez sur "Générer Tableau Recap" pour commencer.
        </div>
      ) : (
        <div className="overflow-auto rounded-md border border-gray-300">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2 text-left font-semibold text-gray-700"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableauRecap.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-gray-900">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};