import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ActionsPanelProps {
  hasSelection: boolean;
  onValider: () => void;
  onAnnuler: () => void;
  className?: string;
}

export const ActionsPanel = ({
  hasSelection,
  onValider,
  onAnnuler,
  className,
}: ActionsPanelProps) => {
  return (
    <div className={cn('flex items-center justify-end gap-3', className)}>
      <Button
        variant="primary"
        onClick={onValider}
        disabled={!hasSelection}
      >
        Valider
      </Button>
      <Button
        variant="secondary"
        onClick={onAnnuler}
      >
        Annuler
      </Button>
    </div>
  );
};