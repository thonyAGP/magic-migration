import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface FiltresPanelProps {
  numeroSession: string;
  dateComptable: string;
  isGenerating: boolean;
  onNumeroSessionChange: (value: string) => void;
  onDateComptableChange: (value: string) => void;
  onGenerate: () => void;
}

export const FiltresPanel = ({
  numeroSession,
  dateComptable,
  isGenerating,
  onNumeroSessionChange,
  onDateComptableChange,
  onGenerate,
}: FiltresPanelProps) => {
  const [localNumeroSession, setLocalNumeroSession] = useState(numeroSession);
  const [localDateComptable, setLocalDateComptable] = useState(dateComptable);

  const handleNumeroSessionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalNumeroSession(value);
      onNumeroSessionChange(value);
    },
    [onNumeroSessionChange]
  );

  const handleDateComptableChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalDateComptable(value);
      onDateComptableChange(value);
    },
    [onDateComptableChange]
  );

  const handleGenerate = useCallback(() => {
    const sessionNum = parseInt(localNumeroSession, 10);
    if (isNaN(sessionNum) || sessionNum <= 0) {
      return;
    }
    if (!localDateComptable) {
      return;
    }
    onGenerate();
  }, [localNumeroSession, localDateComptable, onGenerate]);

  const isValid =
    localNumeroSession.trim() !== '' &&
    !isNaN(parseInt(localNumeroSession, 10)) &&
    parseInt(localNumeroSession, 10) > 0 &&
    localDateComptable.trim() !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="numeroSession"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Numéro de session
          </label>
          <Input
            id="numeroSession"
            type="number"
            min="1"
            value={localNumeroSession}
            onChange={handleNumeroSessionChange}
            disabled={isGenerating}
            placeholder="Entrez le numéro de session"
            className="w-full"
          />
        </div>

        <div>
          <label
            htmlFor="dateComptable"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date comptable
          </label>
          <Input
            id="dateComptable"
            type="date"
            value={localDateComptable}
            onChange={handleDateComptableChange}
            disabled={isGenerating}
            className="w-full"
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={handleGenerate}
            disabled={!isValid || isGenerating}
            className={cn(
              'w-full bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isGenerating ? 'Génération en cours...' : 'Générer'}
          </Button>
        </div>
      </div>
    </div>
  );
};