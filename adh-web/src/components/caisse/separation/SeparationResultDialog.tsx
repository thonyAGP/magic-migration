import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  Button,
  PrinterChoiceDialog,
} from '@/components/ui';
import { CheckCircle, XCircle, Printer } from 'lucide-react';
import { executePrint, TicketType } from '@/services/printer';
import type { PrinterChoice } from '@/services/printer';
import type { SeparationResultDialogProps } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function SeparationResultDialog({
  open,
  result,
  onClose,
}: SeparationResultDialogProps) {
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const handlePrint = (choice: PrinterChoice) => {
    if (!result?.success) return;
    executePrint(TicketType.RECAP, {
      header: {
        societe: 'ADH',
        caisse: '',
        session: '',
        date: result.dateExecution ?? new Date().toLocaleDateString('fr-FR'),
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        operateur: '',
      },
      lines: [{
        description: `Separation: ${result.compteSource.nom} → ${result.compteDestination.nom}`,
        montant: result.montantDeplace,
        devise: 'EUR',
      }],
      footer: {
        total: result.montantDeplace,
        devise: 'EUR',
        moyenPaiement: `${result.nbOperationsDeplacees} operations`,
      },
    }, choice);
    setShowPrintDialog(false);
  };

  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success ? (
              <>
                <CheckCircle className="h-5 w-5 text-success" />
                Separation terminee
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-danger" />
                Echec de la separation
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {result.success ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">De</span>
                <span className="font-medium">
                  {result.compteSource.nom} {result.compteSource.prenom}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">Vers</span>
                <span className="font-medium">
                  {result.compteDestination.nom} {result.compteDestination.prenom}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">Operations deplacees</span>
                <span className="font-semibold text-primary">
                  {result.nbOperationsDeplacees}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">Montant deplace</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(result.montantDeplace)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-muted">Date</span>
                <span className="text-on-surface">{result.dateExecution}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-danger">{result.message}</p>
          )}
        </div>

        <DialogFooter>
          {result.success && (
            <Button variant="outline" onClick={() => setShowPrintDialog(true)}>
              <Printer className="h-4 w-4 mr-2" /> Imprimer
            </Button>
          )}
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>

        <PrinterChoiceDialog
          open={showPrintDialog}
          onClose={() => setShowPrintDialog(false)}
          onSelect={handlePrint}
        />
      </DialogContent>
    </Dialog>
  );
}
