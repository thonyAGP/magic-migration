import type { RecapFermeture } from '@/types/recapFermeture';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface HeaderPanelProps {
  recap: RecapFermeture | null;
  isPrinting: boolean;
  onPrint: () => void;
  onExport: (format: 'PDF' | 'EXCEL') => void;
  className?: string;
}

export const HeaderPanel = ({
  recap,
  isPrinting,
  onPrint,
  onExport,
  className,
}: HeaderPanelProps) => {
  if (!recap) {
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
        <div className="text-sm text-gray-500">Aucune session chargée</div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Session
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {recap.societe} #{recap.session}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Date et heure début
            </div>
            <div className="text-sm text-gray-900">
              {formatDate(recap.dateDebut)} à {recap.heureDebut}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Devise locale
            </div>
            <div className="text-sm font-medium text-gray-900">
              {recap.deviseLocale}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Devises
            </div>
            <div className="text-sm text-gray-900">
              Ouverture: {recap.nbreDeviseOuverture} / Fermeture: {recap.nbreDeviseFermeture}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport('PDF')}
            disabled={isPrinting}
          >
            Export PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onExport('EXCEL')}
            disabled={isPrinting}
          >
            Export Excel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onPrint}
            disabled={isPrinting}
          >
            {isPrinting ? 'Impression...' : 'Imprimer'}
          </Button>
        </div>
      </div>
    </div>
  );
};