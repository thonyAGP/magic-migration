import { Users, User } from 'lucide-react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { FiliationListProps } from './types';

const relationIcon = (type: string) => {
  switch (type) {
    case 'parent':
      return <Users className="h-4 w-4 text-primary" />;
    case 'conjoint':
      return <Users className="h-4 w-4 text-secondary" />;
    default:
      return <User className="h-4 w-4 text-on-surface-muted" />;
  }
};

const relationLabel = (type: string) => {
  switch (type) {
    case 'parent':
      return 'Parent';
    case 'enfant':
      return 'Enfant';
    case 'conjoint':
      return 'Conjoint';
    default:
      return type;
  }
};

export function FiliationList({
  filiations,
  onSelectFiliation,
}: FiliationListProps) {
  if (filiations.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs font-medium text-on-surface-muted">
        Filiations ({filiations.length})
      </p>
      <div className="space-y-1">
        {filiations.map((fil) => {
          const isClickable = !!onSelectFiliation;
          return (
            <button
              key={fil.id}
              type="button"
              disabled={!isClickable}
              onClick={() => onSelectFiliation?.(fil.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded border border-border px-3 py-2 text-sm',
                isClickable && 'hover:bg-surface-hover cursor-pointer',
                !isClickable && 'cursor-default',
              )}
            >
              {relationIcon(fil.typeRelation)}
              <span className="font-medium">
                {fil.nom} {fil.prenom}
              </span>
              <Badge variant="outline" className="ml-auto text-xs">
                {relationLabel(fil.typeRelation)}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
