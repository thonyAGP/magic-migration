import { User, Settings, Printer, Wifi, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SettingsNavProps, SettingsSection } from './types';

const SECTIONS: SettingsSection[] = [
  { id: 'profil', label: 'Profil', icon: 'User' },
  { id: 'caisse', label: 'Caisse', icon: 'Settings' },
  { id: 'imprimantes', label: 'Imprimantes', icon: 'Printer' },
  { id: 'reseau', label: 'Reseau', icon: 'Wifi' },
  { id: 'audit', label: 'Audit', icon: 'ClipboardList' },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Settings,
  Printer,
  Wifi,
  ClipboardList,
};

export function SettingsNav({ activeSection, onSectionChange, className }: SettingsNavProps) {
  return (
    <nav className={cn('flex flex-col gap-1', className)} role="navigation" aria-label="Parametres">
      {SECTIONS.map((section) => {
        const Icon = ICON_MAP[section.icon];
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionChange(section.id)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface hover:bg-surface-dim',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span>{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
