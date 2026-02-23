import { PRINTER_CONFIG } from '@/types/approTicket';
import { Button, Dialog } from '@/components/ui';
import { cn } from '@/lib/utils';

interface PrinterSelectionPanelProps {
  visible: boolean;
  selectedPrinterId: 1 | 9;
  onSelectPrinter: (printerId: 1 | 9) => void;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export const PrinterSelectionPanel = ({
  visible,
  selectedPrinterId,
  onSelectPrinter,
  onConfirm,
  onCancel,
  className,
}: PrinterSelectionPanelProps) => {
  const selectedConfig = PRINTER_CONFIG[selectedPrinterId];

  return (
    <Dialog
      open={visible}
      onClose={onCancel}
      title="Sélection de l'imprimante"
      className={cn('w-full max-w-md', className)}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Choisissez le format d'impression pour le ticket d'approvisionnement :
          </p>

          <div className="space-y-2">
            {(Object.entries(PRINTER_CONFIG) as [keyof typeof PRINTER_CONFIG, typeof PRINTER_CONFIG[1]][]).map(
              ([id, config]) => {
                const printerId = Number(id) as 1 | 9;
                const isSelected = printerId === selectedPrinterId;

                return (
                  <label
                    key={id}
                    className={cn(
                      'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <input
                      type="radio"
                      name="printer"
                      checked={isSelected}
                      onChange={() => onSelectPrinter(printerId)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{config.label}</div>
                      <div className="mt-1 text-sm text-gray-500">
                        Format : {config.format === 'a4' ? 'A4 (PDF)' : 'Thermique (ESC/POS)'}
                      </div>
                    </div>
                  </label>
                );
              }
            )}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Aperçu de la sélection</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Imprimante :</dt>
              <dd className="font-medium text-gray-900">{selectedConfig.label}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Type :</dt>
              <dd className="font-medium text-gray-900">
                {selectedConfig.type === 'pdf-browser'
                  ? 'PDF (Navigateur)'
                  : selectedConfig.type === 'pdf-download'
                    ? 'PDF (Téléchargement)'
                    : 'ESC/POS'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Format :</dt>
              <dd className="font-medium text-gray-900">
                {selectedConfig.format === 'a4' ? 'A4' : 'Thermique'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirmer et imprimer
          </Button>
        </div>
      </div>
    </Dialog>
  );
};