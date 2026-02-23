import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  ExtraitAccountSelector,
  ExtraitTransactionGrid,
  ExtraitFormatDialog,
} from '@/components/caisse/extrait';
import { EmailSendDialog } from '@/components/caisse/dialogs';
import { useExtraitStore } from '@/stores/extraitStore';
import { useAuthStore } from '@/stores';
import type { ExtraitAccountInfo, ExtraitPrintFormat } from '@/types/extrait';

type Phase = 'search' | 'extrait';

export function ExtraitPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';

  const selectedAccount = useExtraitStore((s) => s.selectedAccount);
  const transactions = useExtraitStore((s) => s.transactions);
  const summary = useExtraitStore((s) => s.summary);
  const searchResults = useExtraitStore((s) => s.searchResults);
  const isSearching = useExtraitStore((s) => s.isSearching);
  const isLoadingExtrait = useExtraitStore((s) => s.isLoadingExtrait);
  const isPrinting = useExtraitStore((s) => s.isPrinting);
  const error = useExtraitStore((s) => s.error);
  const searchAccount = useExtraitStore((s) => s.searchAccount);
  const selectAccount = useExtraitStore((s) => s.selectAccount);
  const loadExtrait = useExtraitStore((s) => s.loadExtrait);
  const printExtrait = useExtraitStore((s) => s.printExtrait);
  const reset = useExtraitStore((s) => s.reset);

  const [phase, setPhase] = useState<Phase>('search');
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleSelectAccount = useCallback(
    (account: ExtraitAccountInfo) => {
      selectAccount(account);
      loadExtrait(societe, account.codeAdherent, account.filiation);
      setPhase('extrait');
    },
    [selectAccount, loadExtrait, societe],
  );

  const handlePrintFormat = useCallback(
    async (format: ExtraitPrintFormat) => {
      if (!selectedAccount) return;
      await printExtrait(
        societe,
        selectedAccount.codeAdherent,
        selectedAccount.filiation,
        format,
      );
      setShowFormatDialog(false);
    },
    [selectedAccount, printExtrait, societe],
  );

  const handleBack = () => {
    if (phase === 'extrait') {
      reset();
      setPhase('search');
    } else {
      navigate('/caisse/menu');
    }
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Extrait de compte</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {phase === 'search'
                ? 'Rechercher un compte adherent'
                : `Compte: ${selectedAccount?.nom} ${selectedAccount?.prenom} #${selectedAccount?.codeAdherent}`}
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

        {phase === 'search' && (
          <>
            <ExtraitAccountSelector
              onSelect={handleSelectAccount}
              onSearch={(q) => searchAccount(societe, q)}
              searchResults={searchResults}
              isSearching={isSearching}
              isLoading={isLoadingExtrait}
            />
            <div className="flex justify-start">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Retour au menu
              </button>
            </div>
          </>
        )}

        {phase === 'extrait' && (
          <>
            <ExtraitTransactionGrid
              transactions={transactions}
              summary={summary}
              isLoading={isLoadingExtrait}
            />

            <div className="flex gap-3 justify-between">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Nouvelle recherche
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmailDialog(true)}
                  className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
                >
                  Envoyer par email
                </button>
                <button
                  onClick={() => setShowFormatDialog(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Imprimer
                </button>
              </div>
            </div>

            <ExtraitFormatDialog
              open={showFormatDialog}
              onClose={() => setShowFormatDialog(false)}
              onSelectFormat={handlePrintFormat}
              isPrinting={isPrinting}
            />

            <EmailSendDialog
              open={showEmailDialog}
              onClose={() => setShowEmailDialog(false)}
              documentType="extrait"
              documentId={selectedAccount ? String(selectedAccount.codeAdherent) : ''}
            />
          </>
        )}
      </div>
    </ScreenLayout>
  );
}
