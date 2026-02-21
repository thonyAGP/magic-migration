import type { OuvertureTicketData } from "@/types/sessionOuverture";
import { Button } from "@/components/ui";
import { Printer } from "lucide-react";

interface TicketPreviewPanelProps {
  data: OuvertureTicketData | null;
  onPrint: () => void;
  isPrinting?: boolean;
}

export const TicketPreviewPanel = ({ data, onPrint, isPrinting = false }: TicketPreviewPanelProps) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée à afficher
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const totalApportCoffre = data.soldeParMOP.produits + data.soldeParMOP.cartes;
  const caisseDepart = data.soldeParMOP.monnaie;
  const versement = data.soldeParMOP.total;
  const retrait = 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ticket d'ouverture</h3>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Société:</span>
                <span className="font-medium">{data.village}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Village:</span>
                <span className="font-medium">{data.village}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session N°:</span>
                <span className="font-medium">{data.chrono}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Dates</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date comptable:</span>
                <span className="font-medium">{formatDate(data.dateComptable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date début:</span>
                <span className="font-medium">{formatDate(new Date())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heure début:</span>
                <span className="font-medium">{formatTime(new Date())}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Montants</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Caisse départ:</span>
                <span className="font-medium">{formatCurrency(caisseDepart)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Apport coffre:</span>
                <span className="font-medium">{formatCurrency(totalApportCoffre)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Versement:</span>
                <span className="font-medium">{formatCurrency(versement)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Retrait:</span>
                <span className="font-medium">{formatCurrency(retrait)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(data.soldeParMOP.total)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Détail par moyen de paiement</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monnaie:</span>
                <span className="font-medium">{formatCurrency(data.soldeParMOP.monnaie)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Produits:</span>
                <span className="font-medium">{formatCurrency(data.soldeParMOP.produits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cartes:</span>
                <span className="font-medium">{formatCurrency(data.soldeParMOP.cartes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chèques:</span>
                <span className="font-medium">{formatCurrency(data.soldeParMOP.cheques)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Opérations diverses:</span>
                <span className="font-medium">{formatCurrency(data.soldeParMOP.od)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <Button
          onClick={onPrint}
          disabled={isPrinting}
          className="w-full"
        >
          <Printer className="w-4 h-4 mr-2" />
          {isPrinting ? "Impression..." : "Imprimer le ticket"}
        </Button>
      </div>
    </div>
  );
};