import type { FC } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ActionsPanelProps {
  className?: string;
  onValider: () => void;
  onAnnuler: () => void;
  isExecuting?: boolean;
  isValiderDisabled?: boolean;
}

export const ActionsPanel: FC<ActionsPanelProps> = ({
  className,
  onValider,
  onAnnuler,
  isExecuting = false,
  isValiderDisabled = false,
}) => {
  return (
    <div className={cn('flex items-center justify-end gap-3', className)}>
      <Button
        variant="secondary"
        onClick={onAnnuler}
        disabled={isExecuting}
      >
        Annuler
      </Button>
      <Button
        variant="primary"
        onClick={onValider}
        disabled={isValiderDisabled || isExecuting}
      >
        {isExecuting ? 'Validation...' : 'Valider'}
      </Button>
    </div>
  );
};