import type { ApproTicketData, PrinterChoice } from "@/types/approTicket";
import { APPRO_TICKET_OPERATION_LABELS, PRINTER_CONFIG } from "@/types/approTicket";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface TicketPreviewPanelProps {
  ticketData: ApproTicketData;
  printerChoice: PrinterChoice | null;
  onPrint: () => void;
  onCancel: () => void;
  className?: string;
}

export const TicketPreviewPanel = ({
  ticketData,
  printerChoice,
  onPrint,
  onCancel,
  className,
}: TicketPreviewPanelProps) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatMontant = (montant: number, devise: string): string => {
    return `${montant.toFixed(2)} ${devise}`;
  };

  const printerLabel = printerChoice
    ? PRINTER_CONFIG[printerChoice.printerId as 1 | 9].label
    : "Aucune imprimante sélectionnée";

  return (
    <div className={cn("flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Aperçu Ticket d'Appro</h2>
        <div className="text-sm text-gray-600">{printerLabel}</div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-gray-700">Village:</span>
          <span className="text-lg font-semibold text-blue-600">{ticketData.village}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Date:</span>
            <span className="text-sm text-gray-900">{formatDate(ticketData.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Session:</span>
            <span className="text-sm text-gray-900">#{ticketData.sessionId}</span>
          </div>
        </div>

        {ticketData.montantApproProduit !== null && ticketData.montantApproProduit > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
            <span className="text-sm font-medium text-blue-700">Montant Appro Produit:</span>
            <span className="text-sm font-semibold text-blue-900">
              {formatMontant(ticketData.montantApproProduit, ticketData.deviseLocale)}
            </span>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Opération
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Devise
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Montant
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ticketData.lines.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">
                  Aucune opération
                </td>
              </tr>
            ) : (
              ticketData.lines.map((line, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {APPRO_TICKET_OPERATION_LABELS[line.operation]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{line.devise}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatMontant(line.montant, line.devise)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button variant="primary" onClick={onPrint} disabled={!printerChoice}>
          Imprimer
        </Button>
      </div>
    </div>
  );
};