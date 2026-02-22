import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useSessionHistoryStore } from '@/stores/sessionHistoryStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

type Phase = 'filters' | 'results';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'OUVERTE', label: 'Ouvertes' },
  { value: 'FERMEE', label: 'Fermées' },
] as const;

export const SessionHistoryPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';

  const sessions = useSessionHistoryStore((s) => s.sessions);
  const selectedSessionDetails = useSessionHistoryStore((s) => s.selectedSessionDetails);
  const selectedSessionCurrencies = useSessionHistoryStore((s) => s.selectedSessionCurrencies);
  const isLoading = useSessionHistoryStore((s) => s.isLoading);
  const error = useSessionHistoryStore((s) => s.error);
  const filters = useSessionHistoryStore((s) => s.filters);
  const loadSessions = useSessionHistoryStore((s) => s.loadSessions);
  const loadSessionDetails = useSessionHistoryStore((s) => s.loadSessionDetails);
  const loadSessionCurrencies = useSessionHistoryStore((s) => s.loadSessionCurrencies);
  const setFilters = useSessionHistoryStore((s) => s.setFilters);
  const clearFilters = useSessionHistoryStore((s) => s.clearFilters);
  const reset = useSessionHistoryStore((s) => s.reset);

  const [phase, setPhase] = useState<Phase>('filters');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [operatorId, setOperatorId] = useState('');

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleApplyFilters = useCallback(async () => {
    const filterData = {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: statusFilter || null,
      operatorId: operatorId.trim() || null,
    };
    setFilters(filterData);
    await loadSessions(societe, filterData);
    setPhase('results');
  }, [startDate, endDate, statusFilter, operatorId, setFilters, loadSessions, societe]);

  const handleClearFilters = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setOperatorId('');
    clearFilters();
  }, [clearFilters]);

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      setSelectedSessionId(sessionId);
      await Promise.all([
        loadSessionDetails(sessionId),
        loadSessionCurrencies(sessionId),
      ]);
    },
    [loadSessionDetails, loadSessionCurrencies],
  );

  const handleBack = () => {
    if (phase === 'results') {
      setPhase('filters');
      setSelectedSessionId(null);
    } else {
      navigate('/caisse/menu');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Historique des sessions</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {phase === 'filters'
                ? 'Sélectionner les critères de recherche'
                : `${sessions.length} session(s) trouvée(s)`}
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {phase === 'filters' && (
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date début</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Statut</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Opérateur</label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  placeholder="Code opérateur"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? 'Recherche...' : 'Appliquer les filtres'}
              </button>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-border rounded-md hover:bg-surface-hover"
              >
                Réinitialiser
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md hover:bg-surface-hover ml-auto"
              >
                Retour au menu
              </button>
            </div>
          </div>
        )}

        {phase === 'results' && (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-surface border border-border rounded-lg overflow-hidden">
                <div className="bg-primary text-white px-4 py-2 font-medium">
                  Sessions
                </div>
                <div className="overflow-y-auto max-h-96">
                  {isLoading && (
                    <div className="p-8 text-center text-on-surface-muted">
                      Chargement...
                    </div>
                  )}
                  {!isLoading && sessions.length === 0 && (
                    <div className="p-8 text-center text-on-surface-muted">
                      Aucune session trouvée
                    </div>
                  )}
                  {!isLoading && sessions.length > 0 && (
                    <div className="divide-y divide-border">
                      {sessions.map((session) => (
                        <div
                          key={session.sessionId}
                          onClick={() => handleSelectSession(session.sessionId)}
                          className={cn(
                            'p-4 cursor-pointer hover:bg-surface-hover',
                            selectedSessionId === session.sessionId &&
                              'bg-primary-light',
                          )}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">{session.sessionId}</span>
                            <span
                              className={cn(
                                'text-xs px-2 py-1 rounded',
                                session.status === 'OUVERTE'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800',
                              )}
                            >
                              {session.status}
                            </span>
                          </div>
                          <div className="text-sm text-on-surface-muted space-y-1">
                            <div>
                              Ouvert: {formatDate(session.openedDate)} à{' '}
                              {session.openedTime}
                            </div>
                            {session.closedDate && (
                              <div>
                                Fermé: {formatDate(session.closedDate)} à{' '}
                                {session.closedTime}
                              </div>
                            )}
                            <div>Opérateur: {session.operatorId}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                  <div className="bg-primary text-white px-4 py-2 font-medium">
                    Détails de la session
                  </div>
                  <div className="p-4">
                    {!selectedSessionId && (
                      <div className="text-center text-on-surface-muted py-8">
                        Sélectionnez une session pour voir les détails
                      </div>
                    )}
                    {selectedSessionId && !selectedSessionDetails && isLoading && (
                      <div className="text-center text-on-surface-muted py-8">
                        Chargement...
                      </div>
                    )}
                    {selectedSessionId && selectedSessionDetails && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-on-surface-muted">Session ID:</span>
                          <span className="font-medium">
                            {selectedSessionDetails.sessionId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-muted">Montant total:</span>
                          <span className="font-medium">
                            {formatAmount(selectedSessionDetails.totalAmount)} €
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-lg overflow-hidden">
                  <div className="bg-primary text-white px-4 py-2 font-medium">
                    Devises
                  </div>
                  <div className="overflow-y-auto max-h-64">
                    {!selectedSessionId && (
                      <div className="text-center text-on-surface-muted py-8">
                        Sélectionnez une session pour voir les devises
                      </div>
                    )}
                    {selectedSessionId &&
                      selectedSessionCurrencies.length === 0 &&
                      !isLoading && (
                        <div className="text-center text-on-surface-muted py-8">
                          Aucune devise trouvée
                        </div>
                      )}
                    {selectedSessionId && isLoading && (
                      <div className="text-center text-on-surface-muted py-8">
                        Chargement...
                      </div>
                    )}
                    {selectedSessionId &&
                      selectedSessionCurrencies.length > 0 &&
                      !isLoading && (
                        <table className="w-full">
                          <thead className="bg-surface-hover">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium">
                                Code
                              </th>
                              <th className="px-4 py-2 text-right text-sm font-medium">
                                Montant
                              </th>
                              <th className="px-4 py-2 text-center text-sm font-medium">
                                Local
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {selectedSessionCurrencies.map((currency, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm">
                                  {currency.currencyCode}
                                </td>
                                <td className="px-4 py-2 text-sm text-right">
                                  {formatAmount(currency.amount)}
                                </td>
                                <td className="px-4 py-2 text-sm text-center">
                                  {currency.isLocalCurrency ? '✓' : ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md hover:bg-surface-hover"
              >
                Nouvelle recherche
              </button>
            </div>
          </>
        )}
      </div>
    </ScreenLayout>
  );
};