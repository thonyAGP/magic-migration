import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const DEVISE_FLAGS: Record<string, string> = {
  EUR: '\u20AC',
  USD: '$',
  GBP: '\u00A3',
  CHF: 'Fr',
  JPY: '\u00A5',
  CAD: 'C$',
  AUD: 'A$',
};

const formatCurrency = (value: number, devise: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

export interface DeviseTabSelectorProps {
  devises: string[];
  activeDevise: string;
  onSelect: (deviseCode: string) => void;
  totals?: Record<string, number>;
}

export function DeviseTabSelector({
  devises,
  activeDevise,
  onSelect,
  totals,
}: DeviseTabSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current && activeRef.current.scrollIntoView) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeDevise]);

  if (devises.length <= 1) return null;

  return (
    <div
      ref={containerRef}
      className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-border pb-1"
      role="tablist"
      aria-label="Selection devise"
    >
      {devises.map((devise) => {
        const isActive = devise === activeDevise;
        const symbol = DEVISE_FLAGS[devise] ?? devise;
        const total = totals?.[devise];

        return (
          <button
            key={devise}
            ref={isActive ? activeRef : undefined}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(devise)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-md whitespace-nowrap transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary/30',
              isActive
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-hover',
            )}
          >
            <span className="font-mono text-xs">{symbol}</span>
            <span>{devise}</span>
            {total !== undefined && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-hover text-on-surface-muted',
                )}
              >
                {formatCurrency(total, devise)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
