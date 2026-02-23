import { cn } from '@/lib/utils';
import type { SessionStatus } from '@/types';
import type { SessionStatusBadgeProps } from './types';

const STATUS_CONFIG: Record<SessionStatus, { label: string; classes: string }> = {
  closed: {
    label: 'Fermee',
    classes: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  opening: {
    label: 'En ouverture',
    classes: 'bg-blue-100 text-blue-600 border-blue-200',
  },
  open: {
    label: 'Ouverte',
    classes: 'bg-green-100 text-green-600 border-green-200',
  },
  closing: {
    label: 'En fermeture',
    classes: 'bg-orange-100 text-orange-600 border-orange-200',
  },
};

export function SessionStatusBadge({ status, size = 'md' }: SessionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-semibold',
        config.classes,
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs',
      )}
    >
      {config.label}
    </span>
  );
}
