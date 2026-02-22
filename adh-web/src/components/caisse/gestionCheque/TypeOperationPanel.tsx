import type { ChequeOperationType } from '@/types/gestionCheque';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface TypeOperationPanelProps {
  typeOperation: ChequeOperationType | null;
  onTypeOperationChange: (type: ChequeOperationType) => void;
  onValidate: () => void;
  onCancel: () => void;
  className?: string;
}

export const TypeOperationPanel = ({
  typeOperation,
  onTypeOperationChange,
  onValidate,
  onCancel,
  className,
}: TypeOperationPanelProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Type d'opération
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="typeOperation"
              value="depot"
              checked={typeOperation === 'depot'}
              onChange={() => onTypeOperationChange('depot')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Dépôt</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="typeOperation"
              value="retrait"
              checked={typeOperation === 'retrait'}
              onChange={() => onTypeOperationChange('retrait')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Retrait</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-4 py-2"
        >
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={onValidate}
          disabled={!typeOperation}
          className="px-4 py-2"
        >
          Valider
        </Button>
      </div>
    </div>
  );
};