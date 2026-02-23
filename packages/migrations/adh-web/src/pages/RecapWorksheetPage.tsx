import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRecapWorksheetStore } from '@/stores/recapWorksheetStore';
import { useAuthStore } from '@/stores';
import type { RecapWorksheetExportFormat } from '@/types/recapWorksheet';

export function RecapWorksheetPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const entries = useRecapWorksheetStore((s) => s.entries);
  const summary = useRecapWorksheetStore((s) => s.summary);
  const isGenerating = useRecapWorksheetStore((s) => s.isGenerating);
  const error = useRecapWorksheetStore((s) => s.error);
  const _filters = useRecapWorksheetStore((s) => s.filters);
  const generateRecapWorksheet = useRecapWorksheetStore((s) => s.generateRecapWorksheet);
  const exportRecapWorksheet = useRecapWorksheetStore((s) => s.exportRecapWorksheet);
  const _setFilters = useRecapWorksheetStore((s) => s.setFilters);
  const reset = useRecapWorksheetStore((s) => s.reset);

  const [numeroSession, setNumeroSession] = useState('');
  const [dateComptable, setDateComptable] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [exportFormat, setExportFormat] = useState<RecapWorksheetExportFormat>('txt');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleGenerate = useCallback(async () => {
    const sessionNum = parseInt(numeroSession, 10);
    if (isNaN(sessionNum) || sessionNum <= 0) {
      return;
    }
    const date = new Date(dateComptable);
    await generateRecapWorksheet(sessionNum, date);
  }, [numeroSession, dateComptable, generateRecapWorksheet]);

  const handleExport = useCallback(async () => {
    if (!summary) return;
    setIsExporting(true);
    try {
      const blob = await exportRecapWorksheet(summary, exportFormat);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = exportFormat === 'txt' ? 'txt' : exportFormat === 'csv' ? 'csv' : 'json';
      a.download = `recap-session-${summary.numeroSession}-${summary.dateComptable.toISOString().split('T')[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [summary, exportFormat, exportRecapWorksheet]);

  const formatCurrency = (amount: number, devise: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
    }).format(amount);
  };

  const hasData = entries.length > 0;

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Récapitulatif Worksheet</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Génération du tableau de synthèse pour la fermeture de caisse
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

        <div className="bg-white border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-medium text-base">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Numéro de session
              </label>
              <Input
                type="number"
                value={numeroSession}
                onChange={(e) => setNumeroSession(e.target.value)}
                placeholder="Ex: 1001"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Date comptable
              </label>
              <Input
                type="date"
                value={dateComptable}
                onChange={(e) => setDateComptable(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !numeroSession}
                className="w-full"
              >
                {isGenerating ? 'Génération...' : 'Générer'}
              </Button>
            </div>
          </div>
        </div>

        {hasData && summary && (
          <>
            <div className="bg-white border border-border rounded-lg p-6 space-y-6">
              <h3 className="font-medium text-base">Récapitulatif</h3>

              <div>
                <h4 className="text-sm font-medium mb-3">Détails des entrées</h4>
                <div className="border border-border rounded-md overflow-hidden">
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-surface sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                            Mode paiement
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                            Devise
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider">
                            Montant
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">
                            Libellé
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-border">
                        {entries.map((entry, idx) => (
                          <tr key={idx} className="hover:bg-surface-hover">
                            <td className="px-3 py-2 text-sm">{entry.type}</td>
                            <td className="px-3 py-2 text-sm">
                              {entry.modePaiement || '-'}
                            </td>
                            <td className="px-3 py-2 text-sm">{entry.codeDevise}</td>
                            <td className="px-3 py-2 text-sm text-right font-mono">
                              {formatCurrency(entry.montant, entry.codeDevise)}
                            </td>
                            <td className="px-3 py-2 text-sm text-on-surface-muted truncate max-w-xs">
                              {entry.libelle || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Totaux par devise</h4>
                  <div className="space-y-2">
                    {Object.entries(summary.totalParDevise).map(([devise, montant]) => (
                      <div
                        key={devise}
                        className="flex justify-between items-center bg-surface px-3 py-2 rounded-md"
                      >
                        <span className="text-sm font-medium">{devise}</span>
                        <span className="text-sm font-mono">
                          {formatCurrency(montant, devise)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Totaux par type</h4>
                  <div className="space-y-2">
                    {Object.entries(summary.totalParType).map(([type, montant]) => (
                      <div
                        key={type}
                        className="flex justify-between items-center bg-surface px-3 py-2 rounded-md"
                      >
                        <span className="text-sm font-medium capitalize">{type}</span>
                        <span className="text-sm font-mono">
                          {formatCurrency(montant)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Totaux par mode paiement</h4>
                  <div className="space-y-2">
                    {Object.entries(summary.totalParModePaiement).map(
                      ([mode, montant]) => (
                        <div
                          key={mode}
                          className="flex justify-between items-center bg-surface px-3 py-2 rounded-md"
                        >
                          <span className="text-sm font-medium capitalize">{mode}</span>
                          <span className="text-sm font-mono">
                            {formatCurrency(montant)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center bg-primary-light px-4 py-3 rounded-md">
                  <span className="text-base font-semibold">Total général</span>
                  <span className="text-lg font-bold font-mono">
                    {formatCurrency(summary.totalGeneral)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-base">Export</h3>
              <div className="flex items-center gap-6">
                <div className="flex gap-4">
                  {(['txt', 'csv', 'json'] as const).map((format) => (
                    <label key={format} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="exportFormat"
                        value={format}
                        checked={exportFormat === format}
                        onChange={(e) =>
                          setExportFormat(e.target.value as RecapWorksheetExportFormat)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium uppercase">{format}</span>
                    </label>
                  ))}
                </div>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  variant="secondary"
                >
                  {isExporting ? 'Export en cours...' : 'Exporter'}
                </Button>
              </div>
            </div>
          </>
        )}

        {!hasData && !isGenerating && (
          <div className="bg-surface border border-border rounded-lg p-8 text-center">
            <p className="text-on-surface-muted">
              Saisissez un numéro de session et cliquez sur Générer pour afficher le
              récapitulatif
            </p>
          </div>
        )}

        <div className="flex justify-start">
          <Button variant="secondary" onClick={() => navigate('/caisse/menu')}>
            Retour au menu
          </Button>
        </div>
      </div>
    </ScreenLayout>
  );
}

export default RecapWorksheetPage;
