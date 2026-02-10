import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  GarantieDepotForm,
  GarantieOperationGrid,
  GarantieVersementDialog,
  GarantieSummary,
} from '@/components/caisse/garantie';
import { useGarantieStore } from '@/stores/garantieStore';
import { useAuthStore } from '@/stores';
import { Button, Input, Badge } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import type { Garantie, GarantieStatus } from '@/types/garantie';
import type { GarantieDepotFormData } from '@/components/caisse/garantie/types';

type Phase = 'search' | 'detail';

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

const STATUS_CONFIG: Record<GarantieStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Active', variant: 'default' },
  versee: { label: 'Versee', variant: 'success' },
  restituee: { label: 'Restituee', variant: 'warning' },
  annulee: { label: 'Annulee', variant: 'destructive' },
};

export function GarantiePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';

  const {
    currentGarantie,
    operations,
    summary,
    searchResults,
    isSearching,
    isLoadingGarantie,
    isLoadingOperations,
    isLoadingSummary,
    isSubmitting,
    isCancelling,
    error,
    searchGarantie,
    loadGarantie,
    loadOperations,
    loadSummary,
    createDepot,
    recordVersement,
    recordRetrait,
    cancelGarantie,
    reset,
  } = useGarantieStore();

  const [phase, setPhase] = useState<Phase>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogMode, setDialogMode] = useState<'versement' | 'retrait'>('versement');
  const [dialogOpen, setDialogOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSummary(societe);
    return () => reset();
  }, [loadSummary, reset]);

  // Debounced search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!searchQuery.trim()) return;
    timerRef.current = setTimeout(() => {
      searchGarantie(societe, searchQuery);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery, searchGarantie]);

  const handleCreateDepot = useCallback(
    async (data: GarantieDepotFormData) => {
      await createDepot({
        societe,
        codeAdherent: data.codeAdherent,
        filiation: data.filiation,
        montant: data.montant,
        devise: data.devise,
        description: data.description,
        dateExpiration: data.dateExpiration,
      });
    },
    [createDepot],
  );

  const handleSelectGarantie = useCallback(
    async (garantie: Garantie) => {
      await Promise.all([
        loadGarantie(garantie.id),
        loadOperations(garantie.id),
      ]);
      setPhase('detail');
    },
    [loadGarantie, loadOperations],
  );

  const handleVersement = useCallback(() => {
    setDialogMode('versement');
    setDialogOpen(true);
  }, []);

  const handleRetrait = useCallback(() => {
    setDialogMode('retrait');
    setDialogOpen(true);
  }, []);

  const handleDialogConfirm = useCallback(
    async (montant: number, motif: string) => {
      if (!currentGarantie) return;
      const result = dialogMode === 'versement'
        ? await recordVersement(currentGarantie.id, montant, motif)
        : await recordRetrait(currentGarantie.id, montant, motif);
      if (result.success) {
        setDialogOpen(false);
      }
    },
    [currentGarantie, dialogMode, recordVersement, recordRetrait],
  );

  const handleCancel = useCallback(async () => {
    if (!currentGarantie) return;
    await cancelGarantie(currentGarantie.id, 'Annulation par caissier');
  }, [currentGarantie, cancelGarantie]);

  const handleBack = () => {
    if (phase === 'detail') {
      setPhase('search');
      loadSummary(societe);
    } else {
      navigate('/caisse/menu');
    }
  };

  return (
    <ScreenLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Garanties</h2>
            <p className="text-on-surface-muted text-sm">
              {phase === 'search'
                ? 'Gestion des cautions et garanties'
                : `${currentGarantie?.nomAdherent ?? ''} - ${formatCurrency(currentGarantie?.montant ?? 0, currentGarantie?.devise)}`}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            {error}
          </div>
        )}

        {phase === 'search' && (
          <>
            {/* Summary stats */}
            <GarantieSummary summary={summary} isLoading={isLoadingSummary} />

            {/* Main layout */}
            <div className="flex gap-4">
              {/* Left: Depot form */}
              <div className="flex-1 min-w-0">
                <GarantieDepotForm
                  onSubmit={handleCreateDepot}
                  isSubmitting={isSubmitting}
                />
              </div>

              {/* Right: Search */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Rechercher une garantie</label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nom adherent, code, reference..."
                  />
                </div>

                {isSearching && (
                  <p className="text-on-surface-muted text-sm">Recherche en cours...</p>
                )}

                {searchResults && searchResults.garanties.length === 0 && !isSearching && (
                  <p className="text-on-surface-muted text-sm">Aucune garantie trouvee</p>
                )}

                {searchResults && searchResults.garanties.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.garanties.map((g) => {
                      const config = STATUS_CONFIG[g.statut];
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => handleSelectGarantie(g)}
                          className="w-full rounded-md border border-border p-3 text-left hover:bg-surface-dim transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{g.nomAdherent}</span>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-on-surface-muted">
                            <span>Code: {g.codeAdherent} | {g.dateCreation}</span>
                            <span className="font-medium text-sm text-on-surface">
                              {formatCurrency(g.montant, g.devise)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {phase === 'detail' && currentGarantie && (
          <>
            {/* Garantie header */}
            <div className="rounded-md border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{currentGarantie.nomAdherent}</p>
                  <p className="text-xs text-on-surface-muted">
                    Code: {currentGarantie.codeAdherent} | Filiation: {currentGarantie.filiation}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">
                    {formatCurrency(currentGarantie.montant, currentGarantie.devise)}
                  </span>
                  <Badge variant={STATUS_CONFIG[currentGarantie.statut].variant}>
                    {STATUS_CONFIG[currentGarantie.statut].label}
                  </Badge>
                </div>
              </div>
              <div className="mt-2 text-xs text-on-surface-muted">
                Cree le {currentGarantie.dateCreation}
                {currentGarantie.dateExpiration && ` | Expire le ${currentGarantie.dateExpiration}`}
                {currentGarantie.description && ` | ${currentGarantie.description}`}
              </div>
            </div>

            {/* Operations grid */}
            <GarantieOperationGrid
              operations={operations}
              isLoading={isLoadingOperations}
            />

            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              {currentGarantie.statut === 'active' && (
                <>
                  <Button variant="outline" onClick={handleVersement} disabled={isSubmitting}>
                    Versement
                  </Button>
                  <Button variant="outline" onClick={handleRetrait} disabled={isSubmitting}>
                    Retrait
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Annulation...' : 'Annuler la garantie'}
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {phase === 'detail' && isLoadingGarantie && (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded bg-surface-dim" />
            <div className="h-40 animate-pulse rounded bg-surface-dim" />
          </div>
        )}
      </div>

      <GarantieVersementDialog
        open={dialogOpen}
        garantie={currentGarantie}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        isSubmitting={isSubmitting}
        mode={dialogMode}
      />
    </ScreenLayout>
  );
}
