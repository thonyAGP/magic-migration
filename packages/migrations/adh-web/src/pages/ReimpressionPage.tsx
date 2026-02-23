import { useEffect, useState } from 'react';
import { ScreenLayout } from '@/components/layout';
import { SessionStatusBadge } from '@/components/caisse/session';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useSessionStore } from '@/stores';
import { useNotificationStore } from '@/stores/notificationStore';
import { printTicket } from '@/services/printer';
import type { SessionHistoryItem } from '@/types';
import type { TicketData } from '@/services/printer/types';
import { Search, Printer } from 'lucide-react';

type SearchType = 'numero' | 'date' | 'all';

function buildTicketData(session: SessionHistoryItem): TicketData {
  return {
    header: {
      societe: 'Club Med',
      caisse: session.caisseNumero || `Caisse ${session.caisseId}`,
      session: `#${session.id}`,
      date: new Date(session.dateOuverture).toLocaleDateString('fr-FR'),
      heure: new Date(session.dateOuverture).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      operateur: session.userLogin || 'N/A',
    },
    lines: [],
    footer: {
      total: 0,
      devise: 'EUR',
      moyenPaiement: '-',
    },
    duplicata: true,
  };
}

export function ReimpressionPage() {
  const history = useSessionStore((s) => s.history);
  const isLoading = useSessionStore((s) => s.isLoadingHistory);
  const loadHistory = useSessionStore((s) => s.loadHistory);
  const { success, error: showError } = useNotificationStore();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = history.filter((session) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();

    switch (searchType) {
      case 'numero':
        return String(session.id).includes(query);
      case 'date':
        return (
          new Date(session.dateOuverture)
            .toLocaleDateString('fr-FR')
            .includes(query) ||
          (session.dateFermeture &&
            new Date(session.dateFermeture)
              .toLocaleDateString('fr-FR')
              .includes(query))
        );
      default:
        return (
          String(session.id).includes(query) ||
          new Date(session.dateOuverture)
            .toLocaleDateString('fr-FR')
            .includes(query) ||
          (session.caisseNumero || '').toLowerCase().includes(query) ||
          (session.userLogin || '').toLowerCase().includes(query)
        );
    }
  });

  const handleReprint = async (session: SessionHistoryItem) => {
    setSelectedId(session.id);
    setIsPrinting(true);
    try {
      const ticketData = buildTicketData(session);
      printTicket(ticketData);
      success('Impression lancee', `Ticket session #${session.id} envoye`);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur lors de l\'impression';
      showError('Erreur impression', message);
    } finally {
      setIsPrinting(false);
      setSelectedId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h2 className="text-xl font-semibold">Reimpression tickets</h2>
          <p className="text-on-surface-muted text-sm mt-1">
            Recherchez et reimprimez un ticket de session
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40" />
            <Input
              placeholder="Rechercher par numero, date, caisse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="border border-border rounded-md px-3 py-2 text-sm bg-surface"
          >
            <option value="all">Tout</option>
            <option value="numero">N. ticket</option>
            <option value="date">Date</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-on-surface-muted">
            Chargement des sessions...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-on-surface-muted">
            {searchQuery.trim()
              ? 'Aucune session ne correspond a la recherche'
              : 'Aucune session trouvee'}
          </div>
        ) : (
          <div className="border border-border rounded-md divide-y divide-border">
            {filteredHistory.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface-hover"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-on-surface-muted">
                    #{session.id}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {formatDate(session.dateOuverture)}
                      {session.dateFermeture && (
                        <span className="text-on-surface-muted">
                          {' '}
                          &mdash; {formatDate(session.dateFermeture)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-on-surface-muted">
                      Caisse {session.caisseNumero || session.caisseId}
                    </p>
                  </div>
                  <SessionStatusBadge status={session.status} size="sm" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReprint(session)}
                  disabled={isPrinting && selectedId === session.id}
                >
                  <Printer className="w-3.5 h-3.5" />
                  {isPrinting && selectedId === session.id
                    ? 'Impression...'
                    : 'Reimprimer'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {filteredHistory.length > 0 && (
          <p className="text-xs text-on-surface/40 text-center">
            {filteredHistory.length} session{filteredHistory.length > 1 ? 's' : ''}
            {searchQuery.trim() ? ` (filtre sur ${history.length})` : ''}
          </p>
        )}
      </div>
    </ScreenLayout>
  );
}
