import { useState } from "react";
import { Dialog } from "@/components/ui";
import { Printer, FileText, Download, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PrinterChoice } from "@/services/printer";

interface PrinterDialogPanelProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (choice: PrinterChoice) => void;
  title?: string;
  description?: string;
}

const PRINTER_OPTIONS = [
  {
    value: "pdf-browser",
    label: "PDF (Aperçu navigateur)",
    description: "Ouvrir le ticket dans un nouvel onglet",
    icon: FileText,
  },
  {
    value: "pdf-download",
    label: "PDF (Téléchargement)",
    description: "Télécharger le ticket au format PDF",
    icon: Download,
  },
  {
    value: "escpos",
    label: "Imprimante ESC/POS",
    description: "Imprimer directement sur l'imprimante thermique",
    icon: Wifi,
  },
] as const;

export const PrinterDialogPanel = ({
  open,
  onClose,
  onConfirm,
  title = "Choix de l'imprimante",
  description = "Sélectionnez le mode d'impression du ticket",
}: PrinterDialogPanelProps) => {
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterChoice>("pdf-browser");

  const handleConfirm = () => {
    onConfirm(selectedPrinter);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col gap-4">
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}

        <div className="flex flex-col gap-2">
          {PRINTER_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedPrinter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedPrinter(option.value)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border-2 transition-all",
                  "hover:border-blue-300 hover:bg-blue-50",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white"
                )}
              >
                <div className={cn(
                  "mt-0.5 flex-shrink-0",
                  isSelected ? "text-blue-600" : "text-slate-400"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className={cn(
                    "font-medium",
                    isSelected ? "text-blue-900" : "text-slate-900"
                  )}>
                    {option.label}
                  </div>
                  <div className="text-sm text-slate-600 mt-0.5">
                    {option.description}
                  </div>
                </div>
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5",
                  isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "border-slate-300 bg-white"
                )}>
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Confirmer
          </button>
        </div>
      </div>
    </Dialog>
  );
};