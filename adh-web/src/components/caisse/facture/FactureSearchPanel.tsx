import { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Label, Badge } from '@/components/ui';
import { factureApi } from '@/services/api/endpoints-lot4';
import type { Facture } from '@/types/facture';
import type { FactureSearchPanelProps } from './types';

const formatEUR = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('fr-FR').format(new Date(dateStr));

const statutVariant = (statut: string) => {
  switch (statut) {
    case 'brouillon': return 'secondary' as const;
    case 'emise': return 'default' as const;
    case 'payee': return 'outline' as const;
    case 'annulee': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

export function FactureSearchPanel({
  onSelectFacture,
}: FactureSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [results, setResults] = useState<Facture[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string, dd: string, df: string) => {
    if (!q && !dd && !df) {
      setResults([]);
      setSearched(false);
      return;
    }

    setSearching(true);
    try {
      const response = await factureApi.search(
        '',
        q || undefined,
        dd || undefined,
        df || undefined,
      );
      setResults(response.data.data?.factures ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      doSearch(query, dateDebut, dateFin);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, dateDebut, dateFin, doSearch]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="space-y-1.5">
        <Label className="text-sm">Recherche</Label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par reference ou adherent..."
        />
      </div>

      {/* Date filters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Debut</Label>
          <Input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Fin</Label>
          <Input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {searching && (
          <p className="text-on-surface-muted text-sm">Recherche en cours...</p>
        )}

        {!searching && searched && results.length === 0 && (
          <p className="text-on-surface-muted text-sm">Aucune facture trouvee</p>
        )}

        {results.map((facture) => (
          <button
            key={facture.id}
            type="button"
            onClick={() => onSelectFacture(facture)}
            className="w-full rounded-md border border-border p-3 text-left hover:bg-surface-dim transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{facture.reference}</span>
              <Badge variant={statutVariant(facture.statut)}>
                {facture.statut}
              </Badge>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-on-surface-muted">
              <span>
                {formatDate(facture.dateEmission)} - {facture.nomAdherent}
              </span>
              <span className="font-medium text-sm text-on-surface">
                {formatEUR(facture.totalTTC)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
