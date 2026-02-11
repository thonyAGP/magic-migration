import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { SeparationAccountSelectorProps } from './types';
import type { SeparationAccount } from '@/types/separation';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function SeparationAccountSelector({
  label,
  onSelect,
  onSearch,
  searchResults = [],
  selectedAccount,
  excludeAccount,
  isLoading = false,
  isSearching = false,
  disabled = false,
}: SeparationAccountSelectorProps) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback((q: string) => {
    if (q.trim().length === 0) {
      setSearched(false);
      return;
    }
    onSearch(q.trim());
    setSearched(true);
  }, [onSearch]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length === 0) {
      setSearched(false);
      return;
    }
    timerRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, doSearch]);

  const filteredResults = useMemo(() =>
    excludeAccount
      ? searchResults.filter(
          (a) =>
            a.codeAdherent !== excludeAccount.codeAdherent ||
            a.filiation !== excludeAccount.filiation,
        )
      : searchResults,
    [searchResults, excludeAccount],
  );

  const showLoading = isSearching || isLoading;

  if (selectedAccount) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-on-surface">{label}</p>
        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <span className="font-medium">
              {selectedAccount.nom} {selectedAccount.prenom}
            </span>
            <span className="text-on-surface-muted text-sm ml-2">
              #{selectedAccount.codeAdherent}
              {selectedAccount.filiation > 0 && `.${selectedAccount.filiation}`}
            </span>
            <span className="text-sm ml-3">
              {formatCurrency(selectedAccount.solde)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">Selectionne</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSelect(null as unknown as SeparationAccount);
                setQuery('');
                setSearched(false);
              }}
              disabled={disabled}
            >
              Changer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-on-surface">{label}</p>
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

      {!showLoading && searched && filteredResults.length === 0 && (
        <div className="text-center py-4 text-on-surface-muted text-sm">
          Aucun compte trouve
        </div>
      )}

      {!showLoading && filteredResults.length > 0 && (
        <div className="space-y-2">
          {filteredResults.map((account) => (
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
                <span className="text-sm font-medium">
                  {formatCurrency(account.solde)}
                </span>
              </div>
              <div className="text-xs text-on-surface-muted mt-1">
                {account.nbTransactions} transactions
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
