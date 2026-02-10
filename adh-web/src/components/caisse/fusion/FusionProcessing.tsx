import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { FusionProcessingProps } from './types';

export function FusionProcessing({ progress, className }: FusionProcessingProps) {
  const percent = Math.min(100, Math.max(0, progress.progression));

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-6 py-8', className)}>
      <Loader2 className="h-12 w-12 animate-spin text-primary" />

      <div className="text-center space-y-1">
        <h3 className="text-lg font-medium text-on-surface">Fusion en cours</h3>
        <p className="text-sm text-on-surface-muted">{progress.etape}</p>
      </div>

      <div className="w-full max-w-md space-y-2">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-dim">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="text-center text-xs text-on-surface-muted">{percent}%</div>
      </div>

      {progress.message && (
        <p className="text-sm text-on-surface-muted">{progress.message}</p>
      )}
    </div>
  );
}
