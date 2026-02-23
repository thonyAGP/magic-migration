import { cn } from '@/lib/utils';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { useFusionStore } from '@/stores/fusionStore';
import type { FusionProcessingProps } from './types';

export function FusionProcessing({ progress, _onStepError, className }: FusionProcessingProps) {
  const percent = Math.min(100, Math.max(0, progress.progression));
  const isLocked = useFusionStore((s) => s.isLocked);

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-6 py-8', className)}>
      <Loader2 className="h-12 w-12 animate-spin text-primary" />

      <div className="text-center space-y-1">
        <h3 className="text-lg font-medium text-on-surface">Fusion en cours</h3>
        <p className="text-sm text-on-surface-muted">{progress.etape}</p>
      </div>

      {/* Lock status */}
      <div className="flex items-center gap-2 text-sm">
        {isLocked ? (
          <>
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-on-surface-muted">Comptes verrouilles</span>
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 text-on-surface-muted" />
            <span className="text-on-surface-muted">Verrouillage comptes...</span>
          </>
        )}
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
