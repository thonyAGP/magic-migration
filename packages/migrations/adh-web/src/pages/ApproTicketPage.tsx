import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useApproTicketStore } from '@/stores/approTicketStore';
import { useAuthStore } from '@/stores';
import type { PrinterChoice, ApproTicketLine } from '@/types/approTicket';
import { APPRO_TICKET_OPERATION_LABELS, PRINTER_CONFIG } from '@/types/approTicket';
import { cn } from '@/lib/utils';

type Phase = 'generate' | 'preview';

export function ApproTicketPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const ticketData = useApproTicketStore((s) => s.ticketData);
  const isGenerating = useApproTicketStore((s) => s.isGenerating);
  const error = useApproTicketStore((s) => s.error);
  const _printerChoice = useApproTicketStore((s) => s.printerChoice);
  const showPrinterDialog = useApproTicketStore((s) => s.showPrinterDialog);
  const generateApproTicket = useApproTicketStore((s) => s.generateApproTicket);
  const selectPrinter = useApproTicketStore((s) => s.selectPrinter);
  const printTicket = useApproTicketStore((s) => s.printTicket);
  const clearError = useApproTicketStore((s) => s.clearError);
  const resetState = useApproTicketStore((s) => s.resetState);
  const setPrinterDialogVisible = useApproTicketStore((s) => s.setPrinterDialogVisible);

  const [phase, setPhase] = useState<Phase>('generate');
  const [village, setVillage] = useState('PHU');
  const [sessionId, setSessionId] = useState('1001');
  const [deviseLocale, setDeviseLocale] = useState('EUR');
  const [montantApproProduit, setMontantApproProduit] = useState('');
  const [selectedPrinterId, setSelectedPrinterId] = useState<1 | 9>(1);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  const handleGenerate = useCallback(async () => {
    clearError();
    await generateApproTicket({
      village,
      date: new Date(),
      sessionId: Number(sessionId),
      deviseLocale,
      montantApproProduit: montantApproProduit ? Number(montantApproProduit) : undefined,
    });
    setPhase('preview');
  }, [village, sessionId, deviseLocale, montantApproProduit, generateApproTicket, clearError]);

  const handlePrint = useCallback(() => {
    setPrinterDialogVisible(true);
  }, [setPrinterDialogVisible]);

  const handleSelectPrinter = useCallback(async () => {
    if (!ticketData) return;

    const config = PRINTER_CONFIG[selectedPrinterId];
    const choice: PrinterChoice = {
      type: config.type,
      format: config.format,
      printerId: selectedPrinterId,
    };

    selectPrinter(choice);
    await printTicket(ticketData, choice);
    setPrinterDialogVisible(false);
  }, [ticketData, selectedPrinterId, selectPrinter, printTicket, setPrinterDialogVisible]);

  const handleBack = useCallback(() => {
    if (phase === 'preview') {
      resetState();
      setPhase('generate');
    } else {
      navigate('/caisse/menu');
    }
  }, [phase, resetState, navigate]);

  const calculateTotal = useCallback((lines: ApproTicketLine[]) => {
    return lines.reduce((sum, line) => {
      if (line.operation === 'remise_coffre') {
        return sum - line.montant;
      }
      return sum + line.montant;
    }, 0);
  }, []);

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Ticket Appro Remise</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {phase === 'generate'
                ? 'Générer un ticket d\'approvisionnement'
                : `Ticket #${ticketData?.sessionId} - ${ticketData?.village}`}
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

        {phase === 'generate' && (
          <>
            <div className="space-y-4 bg-surface-card border border-border rounded-lg p-6">
              <div>
                <label htmlFor="village" className="block text-sm font-medium mb-2">Village</label>
                <Input
                  id="village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value.toUpperCase())}
                  placeholder="Code village (ex: PHU, OPI, DAH)"
                  maxLength={3}
                />
              </div>

              <div>
                <label htmlFor="session-id" className="block text-sm font-medium mb-2">Session ID</label>
                <Input
                  id="session-id"
                  type="number"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Numéro de session"
                />
              </div>

              <div>
                <label htmlFor="devise-locale" className="block text-sm font-medium mb-2">Devise locale</label>
                <Input
                  id="devise-locale"
                  value={deviseLocale}
                  onChange={(e) => setDeviseLocale(e.target.value.toUpperCase())}
                  placeholder="Code devise (ex: EUR, USD)"
                  maxLength={3}
                />
              </div>

              <div>
                <label htmlFor="montant-appro" className="block text-sm font-medium mb-2">
                  Montant appro produit (optionnel)
                </label>
                <Input
                  id="montant-appro"
                  type="number"
                  value={montantApproProduit}
                  onChange={(e) => setMontantApproProduit(e.target.value)}
                  placeholder="Montant en devise locale"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="secondary" onClick={handleBack}>
                Retour
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating || !village || !sessionId || !deviseLocale}>
                {isGenerating ? 'Génération...' : 'Générer le ticket'}
              </Button>
            </div>
          </>
        )}

        {phase === 'preview' && ticketData && (
          <>
            <div className="bg-surface-card border border-border rounded-lg p-6 space-y-4">
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-lg">{ticketData.village}</h3>
                <p className="text-sm text-on-surface-muted">
                  Date: {ticketData.date.toLocaleDateString('fr-FR')} | Session: #{ticketData.sessionId}
                </p>
              </div>

              {ticketData.lines.length === 0 ? (
                <div className="text-center text-on-surface-muted py-8">
                  Aucune opération enregistrée
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-sm font-medium">Opération</th>
                        <th className="text-left py-2 px-3 text-sm font-medium">Devise</th>
                        <th className="text-right py-2 px-3 text-sm font-medium">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketData.lines.map((line, idx) => (
                        <tr
                          key={idx}
                          className={cn(
                            'border-b border-border',
                            line.operation === 'remise_coffre' && 'bg-red-50',
                          )}
                        >
                          <td className="py-2 px-3 text-sm">
                            {APPRO_TICKET_OPERATION_LABELS[line.operation]}
                          </td>
                          <td className="py-2 px-3 text-sm">{line.devise}</td>
                          <td
                            className={cn(
                              'py-2 px-3 text-sm text-right font-mono',
                              line.operation === 'remise_coffre' ? 'text-red-600' : 'text-green-600',
                            )}
                          >
                            {line.operation === 'remise_coffre' ? '-' : '+'}
                            {line.montant.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border font-semibold">
                        <td colSpan={2} className="py-3 px-3 text-sm">
                          Total
                        </td>
                        <td className="py-3 px-3 text-sm text-right font-mono">
                          {calculateTotal(ticketData.lines).toFixed(2)} {ticketData.deviseLocale}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="secondary" onClick={handleBack}>
                Nouveau ticket
              </Button>
              <Button onClick={handlePrint} disabled={ticketData.lines.length === 0}>
                Imprimer
              </Button>
            </div>

            <Dialog open={showPrinterDialog} onClose={() => setPrinterDialogVisible(false)}>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sélection imprimante</h3>
                <div className="space-y-2">
                  {[1, 9].map((id) => {
                    const config = PRINTER_CONFIG[id as 1 | 9];
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-surface-hover"
                      >
                        <input
                          type="radio"
                          name="printer"
                          value={id}
                          checked={selectedPrinterId === id}
                          onChange={() => setSelectedPrinterId(id as 1 | 9)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{config.label}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="secondary" onClick={() => setPrinterDialogVisible(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSelectPrinter}>Imprimer</Button>
                </div>
              </div>
            </Dialog>
          </>
        )}
      </div>
    </ScreenLayout>
  );
}