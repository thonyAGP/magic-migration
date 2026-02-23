import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input, Button } from '@/components/ui';
import { Search } from 'lucide-react';
import { useFusionStore } from '@/stores/fusionStore';
import type { FusionAccount } from '@/types/fusion';
import type { FusionAccountSearchProps } from './types';

export function FusionAccountSearch({ onSelect, className }: FusionAccountSearchProps) {
  const { searchResults, isSearching, searchAccount } = useFusionStore();
  const [query, setQuery] = useState('');
  const [principal, setPrincipal] = useState<FusionAccount | null>(null);
  const [secondaire, setSecondaire] = useState<FusionAccount | null>(null);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;
    await searchAccount('ADH', query.trim());
  }, [query, searchAccount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void handleSearch();
      }
    },
    [handleSearch],
  );

  const availableForPrincipal = useMemo(
    () =>
      searchResults.filter(
        (a) => !secondaire || a.codeAdherent !== secondaire.codeAdherent || a.filiation !== secondaire.filiation,
      ),
    [searchResults, secondaire],
  );

  const availableForSecondaire = useMemo(
    () =>
      searchResults.filter(
        (a) => !principal || a.codeAdherent !== principal.codeAdherent || a.filiation !== principal.filiation,
      ),
    [searchResults, principal],
  );

  const canConfirm = principal !== null && secondaire !== null;

  const handleConfirm = useCallback(() => {
    if (principal && secondaire) {
      onSelect(principal, secondaire);
    }
  }, [principal, secondaire, onSelect]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-muted" />
          <Input
            type="text"
            placeholder="Rechercher par code ou nom..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || query.trim().length < 2}>
          {isSearching ? 'Recherche...' : 'Rechercher'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Compte principal */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-on-surface">Compte principal (conserve)</h3>
          <div className="max-h-48 overflow-y-auto rounded-md border border-border">
            {availableForPrincipal.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-on-surface-muted">
                Aucun compte trouve
              </div>
            ) : (
              availableForPrincipal.map((account) => (
                <button
                  key={`p-${account.codeAdherent}-${account.filiation}`}
                  type="button"
                  onClick={() => setPrincipal(account)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface-dim',
                    principal?.codeAdherent === account.codeAdherent &&
                      principal?.filiation === account.filiation &&
                      'bg-primary/10 font-medium',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{account.codeAdherent}</span>
                    <span className="text-on-surface-muted">
                      {account.nom} {account.prenom}
                    </span>
                  </div>
                  <span className="text-on-surface-muted">{account.solde.toFixed(2)} EUR</span>
                </button>
              ))
            )}
          </div>
          {principal && (
            <div className="rounded-md bg-primary/5 p-2 text-xs">
              Selectionne: <strong>{principal.codeAdherent}</strong> - {principal.nom} {principal.prenom}
            </div>
          )}
        </div>

        {/* Compte secondaire */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-on-surface">Compte secondaire (absorbe)</h3>
          <div className="max-h-48 overflow-y-auto rounded-md border border-border">
            {availableForSecondaire.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-on-surface-muted">
                Aucun compte trouve
              </div>
            ) : (
              availableForSecondaire.map((account) => (
                <button
                  key={`s-${account.codeAdherent}-${account.filiation}`}
                  type="button"
                  onClick={() => setSecondaire(account)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface-dim',
                    secondaire?.codeAdherent === account.codeAdherent &&
                      secondaire?.filiation === account.filiation &&
                      'bg-primary/10 font-medium',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{account.codeAdherent}</span>
                    <span className="text-on-surface-muted">
                      {account.nom} {account.prenom}
                    </span>
                  </div>
                  <span className="text-on-surface-muted">{account.solde.toFixed(2)} EUR</span>
                </button>
              ))
            )}
          </div>
          {secondaire && (
            <div className="rounded-md bg-destructive/5 p-2 text-xs">
              Selectionne: <strong>{secondaire.codeAdherent}</strong> - {secondaire.nom} {secondaire.prenom}
            </div>
          )}
        </div>
      </div>

      {canConfirm && (
        <div className="flex justify-end">
          <Button onClick={handleConfirm}>Continuer</Button>
        </div>
      )}
    </div>
  );
}
