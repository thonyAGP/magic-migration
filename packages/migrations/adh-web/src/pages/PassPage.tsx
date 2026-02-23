import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  PassValidationForm,
  PassDetailCard,
  PassTransactionGrid,
  PassLimitDialog,
  PassAffiliateSelector,
  BarLimitConfig,
  ForfaitTAIPanel,
} from '@/components/caisse/clubmedpass';
import { PassCreationForm } from '@/components/caisse/clubmedpass/PassCreationForm';
import { PassOppositionDialog } from '@/components/caisse/clubmedpass/PassOppositionDialog';
import { PassDeleteDialog } from '@/components/caisse/clubmedpass/PassDeleteDialog';
import { PrinterChoiceDialog } from '@/components/ui/PrinterChoiceDialog';
import { executePrint } from '@/services/printer/printService';
import { useClubMedPassStore } from '@/stores/clubmedPassStore';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui';
import { ArrowLeft, Plus, ShieldOff, Trash2, Printer } from 'lucide-react';
import type { PassValidationFormData } from '@/components/caisse/clubmedpass/types';
import type { PassCreationData, PassOppositionData } from '@/types/clubmedpass';
import type { PrinterChoice } from '@/services/printer/types';

export function PassPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';

  const currentPass = useClubMedPassStore((s) => s.currentPass);
  const transactions = useClubMedPassStore((s) => s.transactions);
  const validationResult = useClubMedPassStore((s) => s.validationResult);
  const isValidating = useClubMedPassStore((s) => s.isValidating);
  const isLoadingPass = useClubMedPassStore((s) => s.isLoadingPass);
  const isLoadingTransactions = useClubMedPassStore((s) => s.isLoadingTransactions);
  const isScanning = useClubMedPassStore((s) => s.isScanning);
  const isCreating = useClubMedPassStore((s) => s.isCreating);
  const error = useClubMedPassStore((s) => s.error);
  const validatePass = useClubMedPassStore((s) => s.validatePass);
  const scanCard = useClubMedPassStore((s) => s.scanCard);
  const createPass = useClubMedPassStore((s) => s.createPass);
  const opposePass = useClubMedPassStore((s) => s.opposePass);
  const deletePass = useClubMedPassStore((s) => s.deletePass);
  const reset = useClubMedPassStore((s) => s.reset);

  // T7-CMP2: Affiliates, Bar Limit, Forfaits TAI
  const affiliates = useClubMedPassStore((s) => s.affiliates);
  const isLoadingAffiliates = useClubMedPassStore((s) => s.isLoadingAffiliates);
  const addAffiliate = useClubMedPassStore((s) => s.addAffiliate);
  const removeAffiliate = useClubMedPassStore((s) => s.removeAffiliate);
  const toggleAffiliate = useClubMedPassStore((s) => s.toggleAffiliate);
  const barLimit = useClubMedPassStore((s) => s.barLimit);
  const maxBarLimit = useClubMedPassStore((s) => s.maxBarLimit);
  const updateBarLimit = useClubMedPassStore((s) => s.updateBarLimit);
  const forfaitsTAI = useClubMedPassStore((s) => s.forfaitsTAI);
  const isLoadingForfaits = useClubMedPassStore((s) => s.isLoadingForfaits);
  const activateForfait = useClubMedPassStore((s) => s.activateForfait);
  const deactivateForfait = useClubMedPassStore((s) => s.deactivateForfait);
  const loadAffiliates = useClubMedPassStore((s) => s.loadAffiliates);
  const loadForfaitsTAI = useClubMedPassStore((s) => s.loadForfaitsTAI);

  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [oppositionDialogOpen, setOppositionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Load affiliates + forfaits TAI when pass changes
  useEffect(() => {
    if (currentPass) {
      loadAffiliates(String(currentPass.id));
      loadForfaitsTAI(String(currentPass.id));
    }
  }, [currentPass, loadAffiliates, loadForfaitsTAI]);

  const handleValidate = useCallback(
    async (data: PassValidationFormData) => {
      const result = await validatePass(data.numeroPass, data.montantTransaction, societe);
      if (result.success && !useClubMedPassStore.getState().validationResult?.peutTraiter) {
        setLimitDialogOpen(true);
      }
    },
    [validatePass, societe],
  );

  const handleScan = useCallback(
    async (numeroPass: string) => {
      await scanCard(numeroPass, societe);
    },
    [scanCard, societe],
  );

  const handleCloseLimitDialog = useCallback(() => {
    setLimitDialogOpen(false);
  }, []);

  const handleCreatePass = useCallback(
    async (data: PassCreationData) => {
      const result = await createPass(data);
      if (result.success) {
        setShowCreationForm(false);
      }
    },
    [createPass],
  );

  const handleOpposePass = useCallback(
    async (data: PassOppositionData) => {
      const result = await opposePass(data);
      if (result.success) {
        setOppositionDialogOpen(false);
      }
    },
    [opposePass],
  );

  const handleDeletePass = useCallback(async () => {
    if (!currentPass) return;
    const result = await deletePass(String(currentPass.id));
    if (result.success) {
      setDeleteDialogOpen(false);
    }
  }, [currentPass, deletePass]);

  const handlePrint = useCallback(
    async (choice: PrinterChoice) => {
      setPrinterDialogOpen(false);
      if (!currentPass) return;

      await executePrint('RECAP', {
        header: {
          societe,
          caisse: 'CMP',
          session: '',
          date: new Date().toLocaleDateString('fr-FR'),
          heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          operateur: user?.login ?? '',
        },
        lines: transactions.map((t) => ({
          description: t.libelle,
          montant: t.type === 'debit' ? -t.montant : t.montant,
          devise: currentPass.devise,
        })),
        footer: {
          total: currentPass.solde,
          devise: currentPass.devise,
          moyenPaiement: 'Club Med Pass',
        },
      }, choice);
    },
    [currentPass, transactions, societe, user],
  );

  return (
    <ScreenLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/caisse/menu')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Club Med Pass</h2>
          <div className="ml-auto flex gap-2">
            {!showCreationForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreationForm(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Nouvelle carte
              </Button>
            )}
            {currentPass && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPrinterDialogOpen(true)}
                >
                  <Printer className="mr-1 h-4 w-4" />
                  Imprimer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOppositionDialogOpen(true)}
                  disabled={currentPass.statut !== 'active'}
                >
                  <ShieldOff className="mr-1 h-4 w-4" />
                  Opposer
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Supprimer
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            {error}
          </div>
        )}

        {/* Creation form */}
        {showCreationForm && (
          <PassCreationForm
            onValidate={handleCreatePass}
            onCancel={() => setShowCreationForm(false)}
            isSubmitting={isCreating}
          />
        )}

        {/* Main layout */}
        <div className="flex gap-4">
          {/* Left: Validation + Transactions (2/3) */}
          <div className="flex-[2] space-y-4 min-w-0">
            <PassValidationForm
              onValidate={handleValidate}
              onScan={handleScan}
              isValidating={isValidating}
              isScanning={isScanning}
              disabled={isLoadingPass}
            />
            <PassTransactionGrid
              transactions={transactions}
              isLoading={isLoadingTransactions}
            />
          </div>

          {/* Right: Pass detail (1/3) */}
          <div className="flex-1 min-w-0">
            <PassDetailCard
              pass={currentPass}
              validationResult={validationResult}
              isLoading={isLoadingPass}
            />
          </div>
        </div>

        {/* T7-CMP2: Affilies + Bar Limit + Forfaits TAI sections */}
        {currentPass && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <PassAffiliateSelector
              passId={String(currentPass.id)}
              affiliates={affiliates}
              onAdd={addAffiliate}
              onRemove={removeAffiliate}
              onToggle={toggleAffiliate}
              isLoading={isLoadingAffiliates}
            />
            <BarLimitConfig
              passId={String(currentPass.id)}
              currentLimit={barLimit}
              maxLimit={maxBarLimit}
              onUpdate={(limit) => updateBarLimit(String(currentPass.id), limit)}
            />
            <ForfaitTAIPanel
              passId={String(currentPass.id)}
              forfaits={forfaitsTAI}
              onActivate={activateForfait}
              onDeactivate={deactivateForfait}
              isLoading={isLoadingForfaits}
            />
          </div>
        )}
      </div>

      <PassLimitDialog
        open={limitDialogOpen}
        validationResult={validationResult}
        onClose={handleCloseLimitDialog}
      />

      {currentPass && (
        <>
          <PassOppositionDialog
            open={oppositionDialogOpen}
            onClose={() => setOppositionDialogOpen(false)}
            passId={String(currentPass.id)}
            passHolder={currentPass.titulaire}
            onConfirm={handleOpposePass}
          />
          <PassDeleteDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            passId={String(currentPass.id)}
            passHolder={currentPass.titulaire}
            onConfirm={handleDeletePass}
          />
        </>
      )}

      <PrinterChoiceDialog
        open={printerDialogOpen}
        onClose={() => setPrinterDialogOpen(false)}
        onSelect={handlePrint}
      />
    </ScreenLayout>
  );
}
