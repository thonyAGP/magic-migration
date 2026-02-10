import { useState, useEffect, useRef, useCallback } from 'react';
import { Input, Label, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { datacatchApi } from '@/services/api/endpoints-lot5';
import type { CustomerSearchPanelProps } from './types';
import type { CustomerSearchResult } from '@/types/datacatch';

export function CustomerSearchPanel({
  onSelectCustomer,
  onCreateNew,
  isSearching: externalSearching = false,
}: CustomerSearchPanelProps) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (n: string, p: string) => {
    if (n.trim().length === 0 && p.trim().length === 0) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    try {
      const response = await datacatchApi.searchCustomer({
        nom: n.trim() || undefined,
        prenom: p.trim() || undefined,
      });
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
    if (nom.trim().length === 0 && prenom.trim().length === 0) {
      setResults([]);
      setSearched(false);
      return;
    }
    timerRef.current = setTimeout(() => doSearch(nom, prenom), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [nom, prenom, doSearch]);

  const showLoading = searching || externalSearching;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="text-sm">Nom</Label>
          <Input
            placeholder="Nom du client"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label className="text-sm">Prenom</Label>
          <Input
            placeholder="Prenom du client"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => doSearch(nom, prenom)}
        disabled={nom.trim().length === 0 && prenom.trim().length === 0}
      >
        Rechercher
      </Button>

      {showLoading && (
        <div className="text-center py-4 text-on-surface-muted text-sm">
          Recherche en cours...
        </div>
      )}

      {!showLoading && searched && results.length === 0 && (
        <div className="text-center py-4 text-on-surface-muted text-sm">
          Aucun client trouve
        </div>
      )}

      {!showLoading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((customer) => (
            <button
              key={customer.customerId}
              type="button"
              onClick={() => onSelectCustomer(customer)}
              className={cn(
                'w-full text-left rounded-md border border-border p-3',
                'hover:bg-surface-hover transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary',
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">
                    {customer.nom} {customer.prenom}
                  </span>
                  {customer.email && (
                    <span className="text-on-surface-muted text-sm ml-2">
                      {customer.email}
                    </span>
                  )}
                </div>
                <Badge variant="default">{customer.scoreMatch}%</Badge>
              </div>
              {customer.telephone && (
                <span className="text-xs text-on-surface-muted mt-1 inline-block">
                  {customer.telephone}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onCreateNew}
        className="w-full text-center text-sm text-primary hover:underline py-2"
      >
        Creer nouveau client
      </button>
    </div>
  );
}
