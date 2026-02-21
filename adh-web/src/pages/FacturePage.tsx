import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  FactureForm,
  FactureLigneGrid,
  FactureTVABreakdown,
  FacturePreview,
  FactureSearchPanel,
} from '@/components/caisse/facture';
import { EmailSendDialog } from '@/components/caisse/dialogs';
import { useFactureStore } from '@/stores/factureStore';
import { Button, Badge } from '@/components/ui';
import { ArrowLeft, Mail } from 'lucide-react';
import type { Facture, FactureLigne, FactureSummary, FactureTVALine } from '@/types/facture';
import type { FactureCreateFormData, FactureLigneFormData } from '@/components/caisse/facture/types';

type Phase = 'search' | 'edit' | 'preview';

const round2 = (x: number) => Math.round(x * 100) / 100;

const statutVariant = (statut: string) => {
  switch (statut) {
    case 'brouillon': return 'secondary' as const;
    case 'emise': return 'default' as const;
    case 'payee': return 'outline' as const;
    case 'annulee': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

export function FacturePage() {
  const navigate = useNavigate();
  const societe = 'ADH';

  const {
    currentFacture,
    searchResults: factureSearchResults,
    isSearching: isSearchingFactures,
    isLoadingFacture,
    isSubmitting,
    isValidating,
    _isCancelling,
    isPrinting,
    error,
    searchFactures,
    loadFacture,
    createFacture,
    updateLignes,
    validateFacture,
    _cancelFacture,
    printFacture,
    reset,
  } = useFactureStore();

  const [phase, setPhase] = useState<Phase>('search');
  const [lignes, setLignes] = useState<FactureLigne[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // Sync local lignes when currentFacture changes
  useEffect(() => {
    if (currentFacture) {
      setLignes(currentFacture.lignes);
    }
  }, [currentFacture]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Compute local summary from lignes
  const localSummary = useMemo((): FactureSummary | null => {
    if (lignes.length === 0) return null;

    const totalHT = round2(lignes.reduce((sum, l) => sum + l.montantHT, 0));
    const totalTVA = round2(lignes.reduce((sum, l) => sum + l.montantTVA, 0));
    const totalTTC = round2(lignes.reduce((sum, l) => sum + l.montantTTC, 0));

    // Group by tauxTVA for ventilation
    const tvaMap = new Map<number, { baseHT: number; montantTVA: number }>();
    for (const l of lignes) {
      const existing = tvaMap.get(l.tauxTVA) ?? { baseHT: 0, montantTVA: 0 };
      tvaMap.set(l.tauxTVA, {
        baseHT: round2(existing.baseHT + l.montantHT),
        montantTVA: round2(existing.montantTVA + l.montantTVA),
      });
    }

    const ventilationTVA: FactureTVALine[] = Array.from(tvaMap.entries())
      .map(([tauxTVA, data]) => ({ tauxTVA, ...data }))
      .sort((a, b) => a.tauxTVA - b.tauxTVA);

    return { totalHT, totalTVA, totalTTC, ventilationTVA };
  }, [lignes]);

  const handleCreateFacture = useCallback(
    async (data: FactureCreateFormData) => {
      const result = await createFacture({
        societe,
        codeAdherent: data.codeAdherent,
        filiation: data.filiation,
        type: data.type,
        commentaire: data.commentaire,
      });
      if (result.success && result.id) {
        await loadFacture(result.id);
        setPhase('edit');
      }
    },
    [createFacture, loadFacture],
  );

  const handleSelectExisting = useCallback(
    async (facture: Facture) => {
      await loadFacture(facture.id);
      setPhase('edit');
    },
    [loadFacture],
  );

  const handleAddLigne = useCallback(
    (data: FactureLigneFormData) => {
      const montantHT = round2(data.quantite * data.prixUnitaireHT);
      const montantTVA = round2(montantHT * data.tauxTVA / 100);
      const montantTTC = round2(montantHT + montantTVA);

      const newLigne: FactureLigne = {
        id: Date.now(),
        factureId: currentFacture?.id ?? 0,
        codeArticle: data.codeArticle,
        libelle: data.libelle,
        quantite: data.quantite,
        prixUnitaireHT: data.prixUnitaireHT,
        tauxTVA: data.tauxTVA,
        montantHT,
        montantTVA,
        montantTTC,
      };

      setLignes((prev) => [...prev, newLigne]);
    },
    [currentFacture],
  );

  const handleRemoveLigne = useCallback((index: number) => {
    setLignes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveLignes = useCallback(async () => {
    if (!currentFacture) return;
    await updateLignes(
      currentFacture.id,
      lignes.map((l) => ({
        codeArticle: l.codeArticle,
        libelle: l.libelle,
        quantite: l.quantite,
        prixUnitaireHT: l.prixUnitaireHT,
        tauxTVA: l.tauxTVA,
      })),
    );
  }, [currentFacture, lignes, updateLignes]);

  const handlePreview = useCallback(() => {
    setPreviewOpen(true);
  }, []);

  const handlePrint = useCallback(async () => {
    if (!currentFacture) return;
    await printFacture(currentFacture.id);
  }, [currentFacture, printFacture]);

  const handleValidate = useCallback(async () => {
    if (!currentFacture) return;
    const result = await validateFacture(currentFacture.id);
    if (result.success) {
      setPreviewOpen(false);
    }
  }, [currentFacture, validateFacture]);

  const handleBack = () => {
    if (phase === 'edit') {
      setPhase('search');
      setLignes([]);
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
            <h2 className="text-lg font-semibold">Factures TVA</h2>
            <p className="text-on-surface-muted text-sm">
              {phase === 'search'
                ? 'Creation et gestion des factures'
                : currentFacture
                  ? `Facture #${currentFacture.reference}`
                  : 'Chargement...'}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            {error}
          </div>
        )}

        {phase === 'search' && (
          <div className="flex gap-4">
            {/* Left: Create form */}
            <div className="flex-1 min-w-0">
              <FactureForm
                onSubmit={handleCreateFacture}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Right: Search */}
            <div className="flex-1 min-w-0 rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Rechercher une facture</h3>
              <FactureSearchPanel
                onSelectFacture={handleSelectExisting}
                onSearch={(q, dd, df) => searchFactures(societe, q, dd, df)}
                searchResults={factureSearchResults?.factures ?? []}
                isSearching={isSearchingFactures}
              />
            </div>
          </div>
        )}

        {phase === 'edit' && currentFacture && (
          <>
            {/* Facture header */}
            <div className="flex items-center justify-between rounded-md border border-border p-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  Facture #{currentFacture.reference}
                </span>
                <Badge variant={currentFacture.type === 'facture' ? 'default' : 'secondary'}>
                  {currentFacture.type}
                </Badge>
                <Badge variant={statutVariant(currentFacture.statut)}>
                  {currentFacture.statut}
                </Badge>
              </div>
              <div className="text-sm text-on-surface-muted">
                {currentFacture.nomAdherent} | Code: {currentFacture.codeAdherent}
              </div>
            </div>

            {/* Main layout */}
            <div className="flex gap-4">
              {/* Left: Ligne grid (2/3) */}
              <div className="flex-[2] min-w-0">
                <FactureLigneGrid
                  lignes={lignes}
                  onAddLigne={handleAddLigne}
                  onRemoveLigne={handleRemoveLigne}
                  isEditable={currentFacture.statut === 'brouillon'}
                />
              </div>

              {/* Right: TVA breakdown (1/3) */}
              <div className="flex-1 min-w-0">
                <FactureTVABreakdown summary={localSummary} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-between">
              <Button variant="outline" onClick={handleBack}>
                Retour
              </Button>
              <div className="flex gap-3">
                {currentFacture.statut === 'brouillon' && (
                  <Button
                    variant="outline"
                    onClick={handleSaveLignes}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                )}
                <Button variant="outline" onClick={handlePreview}>
                  Apercu
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEmailDialogOpen(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                {currentFacture.statut === 'brouillon' && (
                  <Button
                    onClick={handleValidate}
                    disabled={isValidating || lignes.length === 0}
                  >
                    {isValidating ? 'Validation...' : 'Valider'}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {phase === 'edit' && isLoadingFacture && !currentFacture && (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded bg-surface-dim" />
            <div className="h-48 animate-pulse rounded bg-surface-dim" />
          </div>
        )}
      </div>

      <FacturePreview
        open={previewOpen}
        facture={currentFacture ? { ...currentFacture, lignes } : null}
        onClose={() => setPreviewOpen(false)}
        onPrint={handlePrint}
        isPrinting={isPrinting}
      />

      <EmailSendDialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        documentType="facture"
        documentId={currentFacture ? String(currentFacture.id) : ''}
        defaultEmail={currentFacture?.client?.email}
      />
    </ScreenLayout>
  );
}
