import type { FC } from 'react';
import { Button } from '@/components/ui';
import { DenominationGrid, DenominationSummary } from '@/components/caisse/denomination';
import type { DenominationCount, SoldeParMOP } from '@/types';

export interface ComptagePanelProps {
  comptage: DenominationCount[];
  soldeParMOP: SoldeParMOP | null;
  isLoading: boolean;
  onCountChange: (denominationId: number, count: number) => void;
  onValidate: () => void;
  onCancel: () => void;
  className?: string;
}

export const ComptagePanel: FC<ComptagePanelProps> = ({
  comptage,
  soldeParMOP,
  isLoading,
  onCountChange,
  onValidate,
  onCancel,
  className,
}) => {
  const hasData = comptage.length > 0;
  const canValidate = hasData && !isLoading;

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Comptage initial</h2>
        
        {!hasData && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            Aucune dénomination configurée
          </div>
        )}

        {hasData && (
          <DenominationGrid
            counts={comptage}
            onChange={onCountChange}
            disabled={isLoading}
          />
        )}
      </div>

      {soldeParMOP && (
        <div className="mb-6">
          <DenominationSummary soldeParMOP={soldeParMOP} />
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          onClick={onValidate}
          disabled={!canValidate}
          isLoading={isLoading}
        >
          Valider
        </Button>
      </div>
    </div>
  );
};