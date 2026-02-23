import { Button } from '@/components/ui';
import { useFermetureCaisseStore } from '@/stores/fermetureCaisseStore';
import { cn } from '@/lib/utils';

interface ValidationPanelProps {
  societe: string;
  numeroSession: number;
  className?: string;
}

export const ValidationPanel = ({ societe, numeroSession, className }: ValidationPanelProps) => {
  const tousPointes = useFermetureCaisseStore((s) => s.tousPointes);
  const ecartsDetectes = useFermetureCaisseStore((s) => s.ecartsDetectes);
  const ecartsJustifies = useFermetureCaisseStore((s) => s.ecartsJustifies);
  const fermetureValidee = useFermetureCaisseStore((s) => s.fermetureValidee);
  const isLoading = useFermetureCaisseStore((s) => s.isLoading);
  const validerFermeture = useFermetureCaisseStore((s) => s.validerFermeture);

  const pointageOk = tousPointes;
  const ecartsOk = !ecartsDetectes || ecartsJustifies;
  const canValidate = pointageOk && ecartsOk && !fermetureValidee;

  const handleValider = async () => {
    if (!canValidate) return;
    await validerFermeture(societe, numeroSession);
  };

  return (
    <div className={cn('flex flex-col gap-4 p-6 bg-white rounded-lg shadow', className)}>
      <h2 className="text-xl font-semibold text-gray-900">Validation de la fermeture</h2>

      <div className="flex flex-col gap-3">
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border',
            pointageOk
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          )}
        >
          {pointageOk ? (
            <svg
              className="w-6 h-6 text-green-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-yellow-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          <span className={cn('font-medium', pointageOk ? 'text-green-800' : 'text-yellow-800')}>
            {pointageOk
              ? 'Tous les moyens de paiement ont été pointés'
              : 'Des moyens de paiement restent à pointer'}
          </span>
        </div>

        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border',
            ecartsOk
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          )}
        >
          {ecartsOk ? (
            <svg
              className="w-6 h-6 text-green-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-yellow-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          <span className={cn('font-medium', ecartsOk ? 'text-green-800' : 'text-yellow-800')}>
            {ecartsOk
              ? 'Tous les écarts sont justifiés'
              : 'Des écarts doivent être justifiés'}
          </span>
        </div>
      </div>

      {fermetureValidee && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <svg
            className="w-6 h-6 text-blue-600 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium text-blue-800">
            La fermeture de caisse a été validée avec succès
          </span>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          variant="primary"
          onClick={handleValider}
          disabled={!canValidate || isLoading}
        >
          {isLoading ? 'Validation...' : 'Valider la fermeture'}
        </Button>
      </div>
    </div>
  );
};