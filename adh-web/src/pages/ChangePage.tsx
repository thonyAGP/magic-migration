import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  ChangeOperationForm,
  ChangeOperationGrid,
  DeviseStockPanel,
  ChangeCancellationDialog,
} from '@/components/caisse/change';
import { useChangeStore } from '@/stores/changeStore';
import { useAuthStore } from '@/stores';
import { Button, PrinterChoiceDialog } from '@/components/ui';
import { ArrowLeft, Printer } from 'lucide-react';
import { executePrint, TicketType } from '@/services/printer';
import type { PrinterChoice } from '@/services/printer';
import type { ChangeFormData } from '@/components/caisse/change/types';

export function ChangePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';

  const {
    devises,
    stock,
    operations,
    summary,
    isLoadingDevises,
    isLoadingStock,
    isLoadingOperations,
    isSubmitting,
    isCancelling,
    error,
    loadDevises,
    loadStock,
    loadOperations,
    createOperation,
    cancelOperation,
    reset,
  } = useChangeStore();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  useEffect(() => {
    loadDevises(societe);
    loadStock(societe);
    loadOperations(societe);
    return () => reset();
  }, [loadDevises, loadStock, loadOperations, reset]);

  const handleSubmit = useCallback(
    async (data: ChangeFormData) => {
      await createOperation(
        societe,
        data.type,
        data.deviseCode,
        data.montant,
        data.taux,
        data.modePaiement,
        user?.login ?? 'caissier',
      );
    },
    [createOperation, user],
  );

  const handleCancelRequest = useCallback((operationId: number) => {
    setCancelTargetId(operationId);
    setCancelDialogOpen(true);
  }, []);

  const handleCancelConfirm = useCallback(
    async (motif: string) => {
      if (cancelTargetId === null) return;
      const result = await cancelOperation(cancelTargetId, motif);
      if (result.success) {
        setCancelDialogOpen(false);
        setCancelTargetId(null);
      }
    },
    [cancelTargetId, cancelOperation],
  );

  const handleCancelClose = useCallback(() => {
    setCancelDialogOpen(false);
    setCancelTargetId(null);
  }, []);

  const handlePrint = useCallback((choice: PrinterChoice) => {
    const lastOp = operations[0];
    executePrint(TicketType.CHANGE, {
      header: {
        societe: 'ADH',
        caisse: '',
        session: '',
        date: new Date().toLocaleDateString('fr-FR'),
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        operateur: user?.login ?? '',
      },
      lines: lastOp
        ? [{
            description: `Change ${lastOp.type} ${lastOp.deviseCode}`,
            montant: lastOp.montant,
            devise: lastOp.deviseCode,
          }]
        : [],
      footer: {
        total: lastOp?.montantConverti ?? 0,
        devise: 'EUR',
        moyenPaiement: lastOp?.modePaiement ?? '',
      },
    }, choice);
    setShowPrintDialog(false);
  }, [operations, user]);

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
          <h2 className="text-lg font-semibold">Change devises</h2>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={() => setShowPrintDialog(true)}>
              <Printer className="h-4 w-4 mr-1" /> Imprimer
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            {error}
          </div>
        )}

        {/* Main layout */}
        <div className="flex gap-4">
          {/* Left: Form + Grid (2/3) */}
          <div className="flex-[2] space-y-4 min-w-0">
            <ChangeOperationForm
              devises={devises}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              disabled={isLoadingDevises}
            />
            <ChangeOperationGrid
              operations={operations}
              summary={summary}
              onCancel={handleCancelRequest}
              isLoading={isLoadingOperations}
            />
          </div>

          {/* Right: Stock panel (1/3) */}
          <div className="flex-1 min-w-0">
            <DeviseStockPanel
              stock={stock}
              isLoading={isLoadingStock}
            />
          </div>
        </div>
      </div>

      <ChangeCancellationDialog
        open={cancelDialogOpen}
        operationId={cancelTargetId}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        isCancelling={isCancelling}
      />

      <PrinterChoiceDialog
        open={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onSelect={handlePrint}
      />
    </ScreenLayout>
  );
}
