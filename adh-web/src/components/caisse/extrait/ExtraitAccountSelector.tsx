import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ExtraitAccountSelectorProps } from './types';
import type { ExtraitAccountInfo } from '@/types/extrait';
import { extraitApi } from '@/services/api/endpoints-lot3';

const statutVariant = (statut: ExtraitAccountInfo['statut']) => {
  if (statut === 'bloque') return 'destructive' as const;
  if (statut === 'suspendu') return 'secondary' as const;
  return 'default' as const;
};

const statutLabel = (statut: ExtraitAccountInfo['statut']) => {
  if (statut === 'bloque') return 'Bloque';
  if (statut === 'suspendu') return 'Suspendu';
  return 'Actif';
};

export function ExtraitAccountSelector({
  onSelect,
  isLoading = false,
  disabled = false,
}: ExtraitAccountSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ExtraitAccountInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    try {
      const response = await extraitApi.searchAccount('ADH', q.trim());
      setResults(response.data.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length === 0) {
      setResults([]);
      setSearched(false);
      return;
    }
    timerRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, doSearch]);

  const showLoading = searching || isLoading;

  return (
    <div className="space-y-3">
      <Input
        placeholder="Rechercher par code ou nom..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
      />

      {showLoading && (
        <div className="text-center py-4 text-on-surface-muted text-sm">
          Recherche en cours...
        </div>
      )}

      {!showLoading && searched && results.length === 0 && (
        <div className="text-center py-4 text-on-surface-muted text-sm">
          Aucun compte trouve
        </div>
      )}

      {!showLoading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((account) => (
            <button
              key={`${account.codeAdherent}-${account.filiation}`}
              type="button"
              onClick={() => onSelect(account)}
              className={cn(
                'w-full text-left rounded-md border border-border p-3',
                'hover:bg-surface-hover transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary',
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">
                    {account.nom} {account.prenom}
                  </span>
                  <span className="text-on-surface-muted text-sm ml-2">
                    #{account.codeAdherent}
                    {account.filiation > 0 && `.${account.filiation}`}
                  </span>
                </div>
                <Badge variant={statutVariant(account.statut)}>
                  {statutLabel(account.statut)}
                </Badge>
              </div>
              {account.hasGiftPass && (
                <span className="text-xs text-primary mt-1 inline-block">
                  GiftPass
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
