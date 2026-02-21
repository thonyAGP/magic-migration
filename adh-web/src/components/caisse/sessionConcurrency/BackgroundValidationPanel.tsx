import { useEffect } from 'react';
import { Dialog, Button } from '@/components/ui';
import { useSessionConcurrencyStore } from '@/stores/sessionConcurrencyStore';
import type { SessionConcurrency } from '@/types/sessionConcurrency';

interface BackgroundValidationPanelProps {
  societe: string;
  compte: number;
  filiation: number;
  onValidationComplete?: (allowed: boolean) => void;
}

export const BackgroundValidationPanel = ({
  societe,
  compte,
  filiation,
  onValidationComplete,
}: BackgroundValidationPanelProps) => {
  const conflictDetected = useSessionConcurrencyStore((s) => s.conflictDetected);
  const conflictingSession = useSessionConcurrencyStore((s) => s.conflictingSession);
  const checkConcurrency = useSessionConcurrencyStore((s) => s.checkConcurrency);
  const clearConflict = useSessionConcurrencyStore((s) => s.clearConflict);
  const isLoading = useSessionConcurrencyStore((s) => s.isLoading);

  useEffect(() => {
    const validateSession = async () => {
      const result = await checkConcurrency(societe, compte, filiation);
      onValidationComplete?.(result.allowed);
    };

    validateSession();
  }, [societe, compte, filiation, checkConcurrency, onValidationComplete]);

  const handleClose = () => {
    clearConflict();
    onValidationComplete?.(false);
  };

  const formatSessionDetails = (session: SessionConcurrency) => {
    const timestamp = new Date(session.timestamp);
    const dateStr = timestamp.toLocaleDateString('fr-FR');
    const timeStr = timestamp.toLocaleTimeString('fr-FR');
    
    return {
      terminal: session.terminalId,
      date: dateStr,
      time: timeStr,
      calcul: session.codeCalcul === 'C' ? 'Caisse' : session.codeCalcul === 'D' ? 'Détail' : 'Non défini',
      comptage: session.coffreEnCoursComptage ? 'Oui' : 'Non',
    };
  };

  if (!conflictDetected || !conflictingSession) {
    return null;
  }

  const details = formatSessionDetails(conflictingSession);

  return (
    <Dialog
      isOpen={conflictDetected}
      onClose={handleClose}
      title="Session déjà ouverte"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-900 font-medium mb-2">
            Une session est déjà ouverte pour ce compte.
          </p>
          <p className="text-red-800 text-sm">
            Vous ne pouvez pas ouvrir une nouvelle session tant que la session existante n'est pas fermée.
          </p>
        </div>

        <div className="bg-gray-50 rounded p-4 space-y-2">
          <h3 className="font-medium text-gray-900 mb-3">Détails de la session active</h3>
          
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-600">Terminal :</div>
            <div className="font-medium text-gray-900">{details.terminal}</div>

            <div className="text-gray-600">Date :</div>
            <div className="font-medium text-gray-900">{details.date}</div>

            <div className="text-gray-600">Heure :</div>
            <div className="font-medium text-gray-900">{details.time}</div>

            <div className="text-gray-600">Type de calcul :</div>
            <div className="font-medium text-gray-900">{details.calcul}</div>

            <div className="text-gray-600">Coffre en cours :</div>
            <div className="font-medium text-gray-900">{details.comptage}</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-blue-900 text-sm">
            Veuillez fermer la session existante avant d'en ouvrir une nouvelle, ou contactez l'administrateur si nécessaire.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Fermer
          </Button>
        </div>
      </div>
    </Dialog>
  );
};