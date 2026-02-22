import type { FC } from 'react';
import { cn } from '@/lib/utils';
import type { DateCheckType } from '@/types/integriteDates';

interface DateIntegrityValidationPanelProps {
  checkType: DateCheckType;
  societe: string;
  isValid: boolean;
  hasClosureAnomaly?: boolean;
  errorMessage?: string;
  className?: string;
}

const CHECK_TYPE_LABELS = {
  O: 'Ouverture',
  T: 'Transaction',
  F: 'Fermeture',
} as const;

export const DateIntegrityValidationPanel: FC<DateIntegrityValidationPanelProps> = ({
  checkType,
  societe,
  isValid,
  hasClosureAnomaly = false,
  errorMessage,
  className,
}) => {
  const getStatusColor = () => {
    if (!isValid) return 'bg-red-100 border-red-500 text-red-800';
    if (hasClosureAnomaly) return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-green-100 border-green-500 text-green-800';
  };

  const getStatusIcon = () => {
    if (!isValid) return '✕';
    if (hasClosureAnomaly) return '⚠';
    return '✓';
  };

  const getStatusText = () => {
    if (!isValid) return 'Invalide';
    if (hasClosureAnomaly) return 'Anomalie détectée';
    return 'Valide';
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-lg border-2 transition-colors',
        getStatusColor()
      )}>
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 font-semibold">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">
            Validation {CHECK_TYPE_LABELS[checkType]}
          </div>
          <div className="text-xs opacity-80 mt-0.5">
            Société: {societe}
          </div>
        </div>
        <div className="text-sm font-semibold">
          {getStatusText()}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg border-2 border-red-400 bg-red-50 text-red-800">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">Erreur</div>
              <div className="text-sm">{errorMessage}</div>
            </div>
          </div>
        </div>
      )}

      {hasClosureAnomaly && !errorMessage && (
        <div className="p-4 rounded-lg border-2 border-yellow-400 bg-yellow-50 text-yellow-800">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">Attention</div>
              <div className="text-sm">Une anomalie de fermeture a été détectée</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};