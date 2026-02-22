import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { RecapWorksheetSummary, RecapWorksheetExportFormat } from '@/types/recapWorksheet';

interface ExportPanelProps {
  summary: RecapWorksheetSummary | null;
  onExport: (format: RecapWorksheetExportFormat) => Promise<void>;
  className?: string;
}

const EXPORT_FORMATS = [
  { value: 'txt' as const, label: 'Texte (TXT)' },
  { value: 'csv' as const, label: 'CSV' },
  { value: 'json' as const, label: 'JSON' },
];

export const ExportPanel = ({ summary, onExport, className }: ExportPanelProps) => {
  const [selectedFormat, setSelectedFormat] = useState<RecapWorksheetExportFormat>('txt');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!summary) return;
    
    setIsExporting(true);
    try {
      await onExport(selectedFormat);
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = !summary || isExporting;

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">Export</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <div className="space-y-2">
            {EXPORT_FORMATS.map((format) => (
              <label
                key={format.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="export-format"
                  value={format.value}
                  checked={selectedFormat === format.value}
                  onChange={(e) => setSelectedFormat(e.target.value as RecapWorksheetExportFormat)}
                  disabled={isDisabled}
                  className="w-4 h-4"
                />
                <span className={isDisabled ? 'text-gray-400' : ''}>{format.label}</span>
              </label>
            ))}
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isDisabled}
          className="w-full"
        >
          {isExporting ? 'Export en cours...' : 'Exporter'}
        </Button>
      </div>
    </div>
  );
};