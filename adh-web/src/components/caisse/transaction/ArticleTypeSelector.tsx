import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import type { ArticleType } from '@/types/transaction';
import type { TransactionMode } from './types';

const ARTICLE_TYPES: {
  value: ArticleType;
  label: string;
  gpOnly?: boolean;
  stub?: boolean;
}[] = [
  { value: 'default', label: 'Standard' },
  { value: 'VRL', label: 'VRL' },
  { value: 'VSL', label: 'VSL' },
  { value: 'TRF', label: 'Transfert', gpOnly: true, stub: true },
  { value: 'PYR', label: 'Liberation', gpOnly: true, stub: true },
];

interface ArticleTypeSelectorProps {
  selected: ArticleType;
  onSelect: (type: ArticleType) => void;
  mode: TransactionMode;
  disabled?: boolean;
}

export function ArticleTypeSelector({
  selected,
  onSelect,
  mode,
  disabled = false,
}: ArticleTypeSelectorProps) {
  const items = mode === 'Boutique'
    ? ARTICLE_TYPES.filter((t) => !t.gpOnly)
    : ARTICLE_TYPES;

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Type article">
      {items.map((item) => {
        const isSelected = selected === item.value;
        const isDisabled = disabled || item.stub;

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => onSelect(item.value)}
            title={item.stub ? 'Fonctionnalite a venir' : undefined}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-on-surface hover:border-primary/50',
              isDisabled && !isSelected && 'opacity-50 cursor-not-allowed',
            )}
          >
            {item.label}
            {item.stub && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1 py-0">
                Bientot
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
