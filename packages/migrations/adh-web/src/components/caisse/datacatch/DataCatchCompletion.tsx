import { useState } from 'react';
import { Button, PrinterChoiceDialog } from '@/components/ui';
import { CheckCircle, XCircle, Printer } from 'lucide-react';
import { executePrint, TicketType } from '@/services/printer';
import type { PrinterChoice } from '@/services/printer';
import { t } from '@/i18n';
import type { DataCatchCompletionProps } from './types';

export function DataCatchCompletion({
  success,
  sessionId,
  onClose,
}: DataCatchCompletionProps) {
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const handlePrint = (choice: PrinterChoice) => {
    if (!success) return;
    executePrint(TicketType.RECAP, {
      header: {
        societe: 'ADH',
        caisse: '',
        session: sessionId ?? '',
        date: new Date().toLocaleDateString('fr-FR'),
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        operateur: '',
      },
      lines: [{
        description: 'Data Catching - Confirmation',
        montant: 0,
        devise: 'EUR',
      }],
      footer: {
        total: 0,
        devise: 'EUR',
        moyenPaiement: '-',
      },
    }, choice);
    setShowPrintDialog(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {success ? (
        <>
          <CheckCircle className="h-16 w-16 text-success" />
          <h3 className="mt-4 text-lg font-semibold">
            {t('datacatch.completion.titleSuccess')}
          </h3>
          {sessionId && (
            <p className="mt-2 text-sm text-on-surface-muted">
              {t('datacatch.completion.session')} : {sessionId}
            </p>
          )}
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-danger" />
          <h3 className="mt-4 text-lg font-semibold">
            {t('datacatch.completion.titleError')}
          </h3>
        </>
      )}
      <div className="mt-6 flex gap-3">
        {success && (
          <Button variant="outline" onClick={() => setShowPrintDialog(true)}>
            <Printer className="mr-2 h-4 w-4" />
            {t('datacatch.completion.print')}
          </Button>
        )}
        <Button onClick={onClose}>
          {t('datacatch.completion.finish')}
        </Button>
      </div>

      <PrinterChoiceDialog
        open={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onSelect={handlePrint}
      />
    </div>
  );
}
