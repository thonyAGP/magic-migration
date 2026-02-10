import type { SeparationProcessingProps } from './types';

export function SeparationProcessing({
  progress,
  isProcessing,
}: SeparationProcessingProps) {
  if (!isProcessing && !progress) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-on-surface-muted text-sm">
        En attente du demarrage...
      </div>
    );
  }

  const percentage = progress?.progression ?? 0;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-dim border-t-primary" />

      <h3 className="text-lg font-semibold text-on-surface">
        Separation en cours...
      </h3>

      <div className="w-full max-w-sm space-y-2">
        <div className="h-3 w-full rounded-full bg-surface-dim overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="text-center text-xs text-on-surface-muted">
          {percentage}%
        </p>
      </div>

      {progress?.etape && (
        <p className="text-sm font-medium text-on-surface">
          {progress.etape}
        </p>
      )}

      {progress?.message && (
        <p className="text-sm text-on-surface-muted">
          {progress.message}
        </p>
      )}
    </div>
  );
}
