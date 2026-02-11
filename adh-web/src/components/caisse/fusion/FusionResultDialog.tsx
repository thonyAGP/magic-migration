import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button, PrinterChoiceDialog } from '@/components/ui';
import { CheckCircle, XCircle, Printer } from 'lucide-react';
import { executePrint, TicketType } from '@/services/printer';
import type { PrinterChoice } from '@/services/printer';
import type { FusionResultDialogProps } from './types';

export function FusionResultDialog({ result, onRetry, onClose, className }: FusionResultDialogProps) {
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const handlePrint = (choice: PrinterChoice) => {
    if (!result.success || !result.compteFinal) return;
    executePrint(TicketType.RECAP, {
      header: {
        societe: 'ADH',
        caisse: '',
        session: '',
        date: result.dateExecution ?? new Date().toLocaleDateString('fr-FR'),
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        operateur: '',
      },
      lines: [
        {
          description: `Fusion → ${result.compteFinal.nom}`,
          montant: result.nbOperationsFusionnees ?? 0,
          devise: 'EUR',
        },
      ],
      footer: {
        total: result.nbOperationsFusionnees ?? 0,
        devise: 'EUR',
        moyenPaiement: `${result.nbGarantiesTransferees ?? 0} garanties transferees`,
      },
    }, choice);
    setShowPrintDialog(false);
  };

  return (
    <div className={cn('flex flex-col items-center space-y-6 py-8', className)}>
      {result.success ? (
        <CheckCircle className="h-16 w-16 text-green-500" />
      ) : (
        <XCircle className="h-16 w-16 text-destructive" />
      )}

      <div className="text-center space-y-2">
        <h3 className={cn('text-xl font-bold', result.success ? 'text-green-700' : 'text-destructive')}>
          {result.success ? 'Fusion reussie' : 'Echec de la fusion'}
        </h3>
        <p className="text-sm text-on-surface-muted">{result.message}</p>
      </div>

      {result.success && result.compteFinal && (
        <div className="w-full max-w-md rounded-lg border border-border bg-surface p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Compte final:</span>
            <span className="font-mono font-medium">
              {result.compteFinal.codeAdherent} - {result.compteFinal.nom}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Operations fusionnees:</span>
            <span className="font-medium">{result.nbOperationsFusionnees}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Garanties transferees:</span>
            <span className="font-medium">{result.nbGarantiesTransferees}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Date execution:</span>
            <span>{result.dateExecution}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!result.success && (
          <Button variant="outline" onClick={onRetry}>
            Reessayer
          </Button>
        )}
        {result.success && (
          <Button variant="outline" onClick={() => setShowPrintDialog(true)}>
            <Printer className="h-4 w-4 mr-2" /> Imprimer
          </Button>
        )}
        <Button onClick={onClose}>
          Retour au menu
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
