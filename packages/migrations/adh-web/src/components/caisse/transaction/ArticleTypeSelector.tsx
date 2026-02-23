import { cn } from '@/lib/utils';
import { ArrowRightLeft, Unlock, XCircle } from 'lucide-react';
import type { ArticleType } from '@/types/transaction';
import type { TransactionMode } from './types';

const ARTICLE_TYPES: {
  value: ArticleType;
  label: string;
  gpOnly?: boolean;
  destructive?: boolean;
}[] = [
  { value: 'default', label: 'Standard' },
  { value: 'VRL', label: 'VRL' },
  { value: 'VSL', label: 'VSL' },
  { value: 'ANN', label: 'Annulation', destructive: true },
  { value: 'TRF', label: 'Transfert', gpOnly: true },
  { value: 'PYR', label: 'Liberation', gpOnly: true },
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
        const isDisabled = disabled;

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            onClick={() => onSelect(item.value)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected && !item.destructive
                ? 'border-primary bg-primary text-white'
                : isSelected && item.destructive
                  ? 'border-red-400 bg-red-50 text-red-800'
                  : 'border-border bg-surface text-on-surface hover:border-primary/50',
              isDisabled && !isSelected && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {item.destructive && <XCircle className="h-3.5 w-3.5" />}
              {item.value === 'TRF' && <ArrowRightLeft className="h-3.5 w-3.5" />}
              {item.value === 'PYR' && <Unlock className="h-3.5 w-3.5" />}
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
