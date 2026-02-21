import { Button } from '@/components/ui';
import type { SessionEcart } from '@/types/sessionEcart';

interface ActionsPanelProps {
  sessionId: number | null;
  deviseCode: string | null;
  caisseComptee: number;
  montantEcart: number;
  commentaire: string;
  commentaireDevise: string;
  isLoading: boolean;
  seuilAlerte: number;
  onSave: (ecart: SessionEcart) => Promise<void>;
  onCancel: () => void;
}

export const ActionsPanel = ({
  sessionId,
  deviseCode,
  caisseComptee,
  montantEcart,
  commentaire,
  commentaireDevise,
  isLoading,
  seuilAlerte,
  onSave,
  onCancel,
}: ActionsPanelProps) => {
  const handleValider = async () => {
    if (!sessionId || !deviseCode) {
      return;
    }

    const ecart: SessionEcart = {
      sessionId,
      deviseCode,
      quand: 'F',
      caisseComptee,
      montantEcart,
      commentaire: commentaire || null,
      commentaireDevise: commentaireDevise || null,
    };

    await onSave(ecart);
  };

  const isValid = sessionId !== null && deviseCode !== null;
  const hasExceededThreshold = Math.abs(montantEcart) > seuilAlerte;

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
      <Button
        variant="secondary"
        onClick={onCancel}
        disabled={isLoading}
      >
        Annuler
      </Button>
      <Button
        variant="primary"
        onClick={handleValider}
        disabled={!isValid || isLoading}
        className={hasExceededThreshold ? 'bg-red-600 hover:bg-red-700' : ''}
      >
        {isLoading ? 'Sauvegarde...' : 'Valider'}
      </Button>
    </div>
  );
};