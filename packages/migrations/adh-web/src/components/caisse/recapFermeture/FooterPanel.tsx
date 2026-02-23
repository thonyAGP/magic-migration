import { Button } from '@/components/ui';
import { useRecapFermetureStore } from '@/stores/recapFermetureStore';
import { cn } from '@/lib/utils';

interface FooterPanelProps {
  className?: string;
  onExport?: (format: 'PDF' | 'EXCEL') => void;
}

export const FooterPanel = ({ className, onExport }: FooterPanelProps) => {
  const lignesRecap = useRecapFermetureStore((s) => s.lignesRecap);
  const recap = useRecapFermetureStore((s) => s.recap);
  const exportRecap = useRecapFermetureStore((s) => s.exportRecap);
  const isPrinting = useRecapFermetureStore((s) => s.isPrinting);

  const totalDevise = lignesRecap.reduce((sum, ligne) => sum + ligne.montantDevise, 0);
  const totalEquivalent = lignesRecap.reduce((sum, ligne) => sum + ligne.montantEquivalent, 0);
  const totalEcart = lignesRecap.reduce((sum, ligne) => sum + (ligne.ecart ?? 0), 0);

  const ecartGlobal = recap 
    ? recap.nbreDevisesCalcule - recap.nbreDevisesCompte 
    : 0;

  const hasIntegrityIssue = Math.abs(ecartGlobal) > 0.01 || Math.abs(totalEcart) > 0.01;

  const handleExport = async (format: 'PDF' | 'EXCEL') => {
    try {
      const blob = await exportRecap(format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recap-fermeture-${recap?.session}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onExport?.(format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className={cn('border-t bg-gray-50 p-4', className)}>
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="grid grid-cols-3 gap-6 rounded-lg border bg-white p-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-600">Total Devises</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalDevise.toFixed(2)} {recap?.deviseLocale ?? 'EUR'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-600">Total Équivalent</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalEquivalent.toFixed(2)} {recap?.deviseLocale ?? 'EUR'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-600">Écart Global</div>
            <div className={cn(
              'text-2xl font-bold',
              hasIntegrityIssue ? 'text-red-600' : 'text-green-600'
            )}>
              {ecartGlobal.toFixed(2)} {recap?.deviseLocale ?? 'EUR'}
            </div>
          </div>
        </div>

        {hasIntegrityIssue && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <svg className="h-5 w-5 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-red-800">Alerte Intégrité</div>
              <div className="text-sm text-red-700">
                Des écarts ont été détectés. Veuillez vérifier les montants saisis avant validation.
              </div>
            </div>
          </div>
        )}

        {!hasIntegrityIssue && recap && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-green-800">Intégrité Validée</div>
              <div className="text-sm text-green-700">
                Tous les montants sont cohérents. Vous pouvez procéder à l'export.
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport('EXCEL')}
            disabled={isPrinting || !recap}
            className="min-w-32"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('PDF')}
            disabled={isPrinting || !recap}
            className="min-w-32"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};