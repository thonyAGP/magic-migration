import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ExtraitFormatDialogProps } from './types';
import type { ExtraitPrintFormat } from '@/types/extrait';

const FORMATS: { key: ExtraitPrintFormat; label: string }[] = [
  { key: 'cumule', label: 'Cumule' },
  { key: 'date', label: 'Par date' },
  { key: 'imputation', label: 'Par imputation' },
  { key: 'nom', label: 'Par nom' },
  { key: 'date_imp', label: 'Date + Imputation' },
  { key: 'service', label: 'Par service' },
];

export function ExtraitFormatDialog({
  open,
  onClose,
  onSelectFormat,
  isPrinting = false,
}: ExtraitFormatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Format d'impression</DialogTitle>
          <DialogDescription>
            Choisissez le format de l'extrait de compte
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4">
          {isPrinting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/80 rounded-md">
              <span className="text-sm text-on-surface-muted">Impression en cours...</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {FORMATS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                disabled={isPrinting}
                onClick={() => onSelectFormat(key)}
                className={cn(
                  'rounded-md border border-border px-4 py-3 text-sm font-medium',
                  'hover:bg-primary hover:text-white transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
