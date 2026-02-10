import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  PassValidationForm,
  PassDetailCard,
  PassTransactionGrid,
  PassLimitDialog,
} from '@/components/caisse/clubmedpass';
import { useClubMedPassStore } from '@/stores/clubmedPassStore';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import type { PassValidationFormData } from '@/components/caisse/clubmedpass/types';

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
  const error = useClubMedPassStore((s) => s.error);
  const validatePass = useClubMedPassStore((s) => s.validatePass);
  const scanCard = useClubMedPassStore((s) => s.scanCard);
  const reset = useClubMedPassStore((s) => s.reset);

  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  useEffect(() => {
    return () => reset();
  }, [reset]);

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
        </div>

        {error && (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            {error}
          </div>
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
      </div>

      <PassLimitDialog
        open={limitDialogOpen}
        validationResult={validationResult}
        onClose={handleCloseLimitDialog}
      />
    </ScreenLayout>
  );
}
