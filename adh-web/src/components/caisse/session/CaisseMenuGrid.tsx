import { cn } from '@/lib/utils';
import {
  DoorOpen,
  DoorClosed,
  Calculator,
  History,
  Printer,
  Eye,
  Settings,
  Briefcase,
} from 'lucide-react';
import type { CaisseMenuAction } from '@/types';
import type { CaisseMenuGridProps } from './types';
import type { LucideIcon } from 'lucide-react';

const ACTION_ICONS: Partial<Record<CaisseMenuAction, LucideIcon>> = {
  ouverture: DoorOpen,
  fermeture: DoorClosed,
  comptage: Calculator,
  historique: History,
  reimpression: Printer,
  consultation: Eye,
  parametres: Settings,
  operations_caisse: Briefcase,
};

export function CaisseMenuGrid({ items, onAction, currentStatus }: CaisseMenuGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = ACTION_ICONS[item.action] ?? Settings;
        const isDisabled = !item.enabled || (item.requiresOpenSession && currentStatus !== 'open');

        return (
          <button
            key={item.action}
            type="button"
            disabled={isDisabled}
            onClick={() => onAction(item.action)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border border-border p-4',
              'text-center transition-colors',
              isDisabled
                ? 'cursor-not-allowed bg-surface-dim opacity-50'
                : 'bg-surface-elevated shadow-sm hover:border-primary hover:bg-primary/5 active:bg-primary/10',
            )}
          >
            <Icon
              className={cn(
                'h-8 w-8',
                isDisabled ? 'text-on-surface-muted' : 'text-primary',
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                isDisabled ? 'text-on-surface-muted' : 'text-on-surface',
              )}
            >
              {item.label}
            </span>
            <span className="text-xs text-on-surface-muted line-clamp-2">
              {item.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
