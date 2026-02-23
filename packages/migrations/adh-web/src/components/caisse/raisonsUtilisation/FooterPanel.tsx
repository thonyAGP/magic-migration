import type { FC } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FooterPanelProps {
  onValider: () => void | Promise<void>;
  onAbandonner: () => void | Promise<void>;
  canValider?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const FooterPanel: FC<FooterPanelProps> = ({
  onValider,
  onAbandonner,
  canValider = true,
  isLoading = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4',
        className,
      )}
    >
      <Button
        variant="secondary"
        onClick={onAbandonner}
        disabled={isLoading}
        className="min-w-[120px]"
      >
        Abandonner
      </Button>
      <Button
        variant="primary"
        onClick={onValider}
        disabled={!canValider || isLoading}
        className="min-w-[120px]"
      >
        {isLoading ? 'Validation...' : 'Valider'}
      </Button>
    </div>
  );
};