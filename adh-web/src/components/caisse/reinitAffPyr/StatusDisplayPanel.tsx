import { cn } from '@/lib/utils';

interface StatusDisplayPanelProps {
  activeCount: number | null;
  lastResetCount: number;
  isLoading?: boolean;
  className?: string;
}

export const StatusDisplayPanel = ({
  activeCount,
  lastResetCount,
  isLoading = false,
  className,
}: StatusDisplayPanelProps) => {
  return (
    <div className={cn('space-y-4 rounded-lg border border-gray-200 bg-white p-4', className)}>
      <h3 className="text-sm font-semibold text-gray-700">Statut des affectations</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-sm text-gray-600">Nombre d'affectations actives</span>
          <span
            className={cn(
              'text-sm font-medium',
              isLoading && 'text-gray-400',
              !isLoading && activeCount !== null && activeCount > 0 && 'text-blue-600',
              !isLoading && activeCount === 0 && 'text-gray-500'
            )}
          >
            {isLoading ? '...' : activeCount !== null ? activeCount : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Dernière réinitialisation</span>
          <span className="text-sm font-medium text-gray-700">
            {lastResetCount > 0 ? `${lastResetCount} enregistrement(s)` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};