import type { MouseEvent } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ActionsPanelProps {
  onSubmit: (e: MouseEvent<HTMLButtonElement>) => void;
  onCancel: (e: MouseEvent<HTMLButtonElement>) => void;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export const ActionsPanel = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  isDisabled = false,
  className,
}: ActionsPanelProps) => {
  return (
    <div className={cn('flex gap-3 justify-end', className)}>
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="min-w-24"
      >
        Annuler
      </Button>
      <Button
        variant="primary"
        onClick={onSubmit}
        disabled={isDisabled || isSubmitting}
        className="min-w-24"
      >
        {isSubmitting ? 'Validation...' : 'Valider'}
      </Button>
    </div>
  );
};