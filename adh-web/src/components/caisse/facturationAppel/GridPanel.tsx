import type { HistoriqueAppel } from '@/types/facturationAppel';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface GridPanelProps {
  appels: HistoriqueAppel[];
  isLoading?: boolean;
  onFacturer?: (appel: HistoriqueAppel) => void;
  onMarquerGratuit?: (appel: HistoriqueAppel) => void;
  onAnnuler?: (appel: HistoriqueAppel) => void;
  className?: string;
}

export const GridPanel = ({
  appels,
  isLoading = false,
  onFacturer,
  onMarquerGratuit,
  onAnnuler,
  className,
}: GridPanelProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(montant);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (appels.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="text-gray-500">Aucun appel trouvé</div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Heure</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Numéro</th>
            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Durée</th>
            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Montant</th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Qualité</th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Gratuité</th>
            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appels.map((appel, index) => (
            <tr
              key={appel.id ?? index}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="px-4 py-2 text-sm text-gray-900">
                {formatDate(appel.dateAppel)}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900">{appel.heureAppel}</td>
              <td className="px-4 py-2 text-sm text-gray-900 font-mono">
                {appel.numeroTel}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right font-mono">
                {appel.duree}
              </td>
              <td className="px-4 py-2 text-sm text-gray-900 text-right font-mono">
                {formatMontant(appel.montant)}
              </td>
              <td className="px-4 py-2 text-center">
                {appel.qualite && (
                  <span
                    className={cn(
                      'inline-block px-2 py-1 text-xs font-medium rounded',
                      appel.qualite === 'OK' && 'bg-green-100 text-green-800',
                      appel.qualite === 'Mauvaise' && 'bg-red-100 text-red-800',
                      appel.qualite === 'Interruption' && 'bg-yellow-100 text-yellow-800'
                    )}
                  >
                    {appel.qualite}
                  </span>
                )}
              </td>
              <td className="px-4 py-2 text-center">
                {appel.gratuite && (
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    GRATUIT
                  </span>
                )}
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                  {!appel.facture && !appel.gratuite && (
                    <>
                      <Button
                        onClick={() => onFacturer?.(appel)}
                        variant="primary"
                        size="sm"
                      >
                        Facturer
                      </Button>
                      <Button
                        onClick={() => onMarquerGratuit?.(appel)}
                        variant="secondary"
                        size="sm"
                      >
                        Gratuit
                      </Button>
                    </>
                  )}
                  {(appel.facture || appel.gratuite) && (
                    <Button
                      onClick={() => onAnnuler?.(appel)}
                      variant="danger"
                      size="sm"
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};