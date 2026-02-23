import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './Dialog';
import { Printer, Download, Receipt } from 'lucide-react';
import type { PrinterChoice } from '@/services/printer/types';

interface PrinterChoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (choice: PrinterChoice) => void;
  isEscPosAvailable?: boolean;
}

const CHOICES: {
  value: PrinterChoice;
  label: string;
  description: string;
  icon: typeof Printer;
}[] = [
  {
    value: 'pdf-browser',
    label: 'PDF Navigateur',
    description: 'Ouvre le ticket dans un nouvel onglet',
    icon: Printer,
  },
  {
    value: 'pdf-download',
    label: 'PDF Telechargement',
    description: 'Telecharge le ticket en PDF',
    icon: Download,
  },
  {
    value: 'escpos',
    label: 'Ticket thermique',
    description: 'Imprime sur imprimante thermique',
    icon: Receipt,
  },
];

export function PrinterChoiceDialog({
  open,
  onClose,
  onSelect,
  isEscPosAvailable = false,
}: PrinterChoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Imprimer le ticket</DialogTitle>
          <DialogDescription>Choisissez le mode d'impression</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {CHOICES.map((choice) => {
            const Icon = choice.icon;
            const disabled = choice.value === 'escpos' && !isEscPosAvailable;

            return (
              <button
                key={choice.value}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(choice.value)}
                className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-surface-dim disabled:cursor-not-allowed disabled:opacity-40"
                title={disabled ? 'Imprimante thermique non disponible' : undefined}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{choice.label}</p>
                  <p className="text-xs text-on-surface-muted">{choice.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { PrinterChoiceDialogProps };
