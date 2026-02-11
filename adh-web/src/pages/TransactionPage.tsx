import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { TransactionForm } from '@/components/caisse/transaction';
import { PrinterChoiceDialog } from '@/components/ui';
import { useTransactionStore } from '@/stores';
import { executePrint, TicketType } from '@/services/printer';
import type { PrinterChoice } from '@/services/printer';
import type { TransactionMode } from '@/components/caisse/transaction/types';
import { Printer } from 'lucide-react';

function isValidMode(mode: string | undefined): mode is TransactionMode {
  return mode === 'GP' || mode === 'Boutique';
}

export function TransactionPage() {
  const { mode: rawMode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const mode = isValidMode(rawMode) ? rawMode : 'GP';

  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const {
    isLoadingCatalogs,
    preCheckResult,
    catalogErrors,
    loadCatalogs,
    resetTransaction,
  } = useTransactionStore();

  useEffect(() => {
    if (!isValidMode(rawMode)) {
      navigate('/caisse/vente/GP', { replace: true });
    }
  }, [rawMode, navigate]);

  useEffect(() => {
    loadCatalogs();
    return () => resetTransaction();
  }, [loadCatalogs, resetTransaction]);

  const handleSubmit = async () => {
    const { draft, selectedMOP, submitTransaction } = useTransactionStore.getState();
    if (!draft) return;
    const result = await submitTransaction(draft.compteId, {
      mop: selectedMOP,
      paymentSide: draft.paymentSide,
    });
    if (result.success) {
      setTransactionSuccess(true);
    }
  };

  const handlePrint = (choice: PrinterChoice) => {
    const { draft, selectedMOP } = useTransactionStore.getState();
    executePrint(TicketType.VENTE, {
      header: {
        societe: 'ADH',
        caisse: '',
        session: '',
        date: new Date().toLocaleDateString('fr-FR'),
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        operateur: '',
      },
      lines: draft?.lignes?.map((a) => ({
        description: a.description,
        quantite: a.quantite,
        montant: a.prixUnitaire * a.quantite,
        devise: 'EUR',
      })) ?? [],
      footer: {
        total: draft?.montantTotal ?? 0,
        devise: 'EUR',
        moyenPaiement: selectedMOP.map((m) => m.code).join(', '),
      },
    }, choice);
    setShowPrintDialog(false);
    navigate('/caisse/menu');
  };

  const handleCancel = () => {
    resetTransaction();
    navigate('/caisse/menu');
  };

  if (transactionSuccess) {
    return (
      <ScreenLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-green-600 text-lg font-semibold">Transaction enregistree</div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPrintDialog(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
            >
              <Printer className="h-4 w-4" /> Imprimer le ticket
            </button>
            <button
              onClick={() => navigate('/caisse/menu')}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Retour au menu
            </button>
          </div>
          <PrinterChoiceDialog
            open={showPrintDialog}
            onClose={() => setShowPrintDialog(false)}
            onSelect={handlePrint}
          />
        </div>
      </ScreenLayout>
    );
  }

  if (isLoadingCatalogs) {
    return (
      <ScreenLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-on-surface-muted">Chargement des catalogues...</div>
        </div>
      </ScreenLayout>
    );
  }

  if (preCheckResult && !preCheckResult.canSell) {
    return (
      <ScreenLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-danger font-medium">Vente impossible</div>
          <div className="text-sm text-on-surface-muted">
            {preCheckResult.reason ?? 'Le reseau est cloture ou une condition bloque la vente.'}
          </div>
          <button
            onClick={() => navigate('/caisse/menu')}
            className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark"
          >
            Retour au menu
          </button>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <div className="space-y-4">
        {catalogErrors.length > 0 && (
          <div className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
            Certains catalogues n'ont pas pu etre charges : {catalogErrors.join(', ')}
          </div>
        )}
        <TransactionForm
          mode={mode}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </ScreenLayout>
  );
}
