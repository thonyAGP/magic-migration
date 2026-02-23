import { useState, useCallback } from 'react';
import { Printer, Star } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useParametresStore } from '@/stores/parametresStore';
import type { PrinterSettingsProps } from './types';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'destructive'> = {
  online: 'success',
  offline: 'secondary',
  error: 'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  online: 'En ligne',
  offline: 'Hors ligne',
  error: 'Erreur',
};

const TYPE_LABEL: Record<string, string> = {
  pdf: 'PDF',
  escpos: 'ESC/POS',
  network: 'Reseau',
};

export function PrinterSettings({ className }: PrinterSettingsProps) {
  const { printers, testPrinter, isTestingPrinter } = useParametresStore();
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTestPrint = useCallback(
    async (printerId: string) => {
      setTestingId(printerId);
      await testPrinter(printerId);
      setTestingId(null);
    },
    [testPrinter],
  );

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-sm font-semibold">Imprimantes configurees</h3>

      {printers.length === 0 ? (
        <p className="text-sm text-on-surface-muted">Aucune imprimante configuree</p>
      ) : (
        <div className="space-y-3">
          {printers.map((printer) => {
            const isTesting = isTestingPrinter && testingId === printer.id;

            return (
              <div
                key={printer.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
                data-testid={`printer-${printer.id}`}
              >
                <div className="flex items-center gap-3">
                  <Printer className="h-5 w-5 text-on-surface-muted" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{printer.nom}</span>
                      {printer.estDefaut && (
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" data-testid="default-star" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-muted">
                      {TYPE_LABEL[printer.type] ?? printer.type} — {printer.adresse}
                      {printer.port > 0 ? `:${printer.port}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[printer.status]} data-testid={`status-${printer.id}`}>
                    {STATUS_LABEL[printer.status] ?? printer.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestPrint(printer.id)}
                    disabled={isTesting}
                    data-testid={`test-btn-${printer.id}`}
                  >
                    {isTesting ? 'Test...' : 'Tester'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
