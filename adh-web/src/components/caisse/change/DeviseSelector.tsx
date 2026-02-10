import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui';
import { Search } from 'lucide-react';
import type { DeviseSelectorProps } from './types';

export function DeviseSelector({
  devises,
  selected,
  onSelect,
  disabled = false,
}: DeviseSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return devises;
    const q = search.toLowerCase();
    return devises.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.libelle.toLowerCase().includes(q),
    );
  }, [devises, search]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-muted" />
        <Input
          type="text"
          placeholder="Rechercher devise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          className="pl-9"
        />
      </div>

      <div className="max-h-48 overflow-y-auto rounded-md border border-border">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-on-surface-muted">
            Aucune devise trouvee
          </div>
        ) : (
          filtered.map((devise) => (
            <button
              key={devise.code}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(devise.code)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface-dim',
                selected === devise.code && 'bg-primary/10 font-medium',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{devise.code}</span>
                <span className="text-on-surface-muted">{devise.libelle}</span>
              </div>
              <span className="text-on-surface-muted">{devise.tauxActuel.toFixed(4)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
