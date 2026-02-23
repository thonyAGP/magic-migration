import { Button } from '@/components/ui';
import { useSaisieContenuCaisseStore } from '@/stores/saisieContenuCaisseStore';
import { cn } from '@/lib/utils';

interface ActionsPanelProps {
  onValidate: () => void;
  onCancel: () => void;
  onReset: () => void;
  className?: string;
}

export const ActionsPanel = ({
  onValidate,
  onCancel,
  onReset,
  className,
}: ActionsPanelProps) => {
  const canSubmit = useSaisieContenuCaisseStore((s) => s.canSubmit);
  const isValidating = useSaisieContenuCaisseStore((s) => s.isValidating);
  const isPersisting = useSaisieContenuCaisseStore((s) => s.isPersisting);

  const isProcessing = isValidating || isPersisting;

  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4',
        className,
      )}
    >
      <Button variant="ghost" onClick={onReset} disabled={isProcessing}>
        Réinitialiser
      </Button>

      <Button variant="secondary" onClick={onCancel} disabled={isProcessing}>
        Annuler
      </Button>

      <Button
        variant="primary"
        onClick={onValidate}
        disabled={!canSubmit || isProcessing}
      >
        {isProcessing ? 'Traitement...' : 'Valider la remise'}
      </Button>
    </div>
  );
};