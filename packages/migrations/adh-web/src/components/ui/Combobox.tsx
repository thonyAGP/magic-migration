import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Search } from 'lucide-react';

type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
};

const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select...',
      searchPlaceholder = 'Search...',
      emptyMessage = 'No results found.',
      disabled,
      error,
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filtered = options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedLabel = options.find((opt) => opt.value === value)?.label;

    const closeDropdown = useCallback(() => {
      setOpen(false);
      setSearch('');
      setHighlightedIndex(0);
    }, []);

    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          closeDropdown();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, closeDropdown]);

    useEffect(() => {
      if (open && inputRef.current) {
        inputRef.current.focus();
      }
    }, [open]);

    useEffect(() => {
      // Resetting highlighted index when search changes is intentional UI sync
      setHighlightedIndex(0);
    }, [search]);

    const selectOption = useCallback(
      (opt: ComboboxOption) => {
        if (opt.disabled) return;
        onChange?.(opt.value);
        closeDropdown();
      },
      [onChange, closeDropdown],
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[highlightedIndex]) {
            selectOption(filtered[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeDropdown();
          break;
      }
    };

    useEffect(() => {
      if (open && listRef.current) {
        const highlighted = listRef.current.children[highlightedIndex] as HTMLElement | undefined;
        highlighted?.scrollIntoView({ block: 'nearest' });
      }
    }, [highlightedIndex, open]);

    return (
      <div
        ref={ref ?? containerRef}
        className={cn('relative', className)}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus-visible:ring-danger',
            !selectedLabel && 'text-on-surface-muted',
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="truncate">{selectedLabel ?? placeholder}</span>
          <ChevronDown className={cn('ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-surface shadow-lg">
            <div className="flex items-center border-b border-border px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={inputRef}
                type="text"
                className="flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-on-surface-muted"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-60 overflow-auto p-1"
            >
              {filtered.length === 0 ? (
                <li className="px-2 py-6 text-center text-sm text-on-surface-muted">
                  {emptyMessage}
                </li>
              ) : (
                filtered.map((opt, i) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={value === opt.value}
                    aria-disabled={opt.disabled}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                      highlightedIndex === i && 'bg-surface-dim',
                      value === opt.value && 'font-medium',
                      opt.disabled && 'pointer-events-none opacity-50',
                    )}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === opt.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    );
  },
);
Combobox.displayName = 'Combobox';

export { Combobox };
export type { ComboboxProps, ComboboxOption };
