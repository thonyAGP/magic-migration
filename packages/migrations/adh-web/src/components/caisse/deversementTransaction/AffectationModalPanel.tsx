import { useState as _useState } from 'react';
import { Dialog, Button, Input } from '@/components/ui';
import { cn as _cn } from '@/lib/utils';

interface AffectationModalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  affectation: string;
  onAffectationChange: (value: string) => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const AffectationModalPanel = ({
  isOpen,
  onClose,
  affectation,
  onAffectationChange,
  onConfirm,
  isProcessing = false,
}: AffectationModalPanelProps) => {
  const [localAffectation, setLocalAffectation] = useState(affectation);

  const handleConfirm = () => {
    onAffectationChange(localAffectation);
    onConfirm();
  };

  const handleCancel = () => {
    setLocalAffectation(affectation);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>Affectation du transfert</Dialog.Title>
        </Dialog.Header>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="affectation-input" className="text-sm font-medium">
              Code d'affectation
            </label>
            <Input
              id="affectation-input"
              value={localAffectation}
              onChange={(e) => setLocalAffectation(e.target.value)}
              placeholder="Saisir le code d'affectation"
              disabled={isProcessing}
              className="w-full"
              autoFocus
            />
          </div>
        </div>

        <Dialog.Footer>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || !localAffectation.trim()}
          >
            {isProcessing ? 'Traitement...' : 'Confirmer'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};