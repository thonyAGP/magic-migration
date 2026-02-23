import type { HistoriqueAppel } from "@/types/facturationAppel";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface ActionsPanelProps {
  selectedAppel: HistoriqueAppel | null;
  onFacturer: () => void;
  onMarquerGratuit: () => void;
  onAnnuler: () => void;
  isLoading: boolean;
  className?: string;
}

export const ActionsPanel = ({
  selectedAppel,
  onFacturer,
  onMarquerGratuit,
  onAnnuler,
  isLoading,
  className,
}: ActionsPanelProps) => {
  const canFacturer = selectedAppel && !selectedAppel.facture && !selectedAppel.gratuite;
  const canMarquerGratuit = selectedAppel && !selectedAppel.facture && !selectedAppel.gratuite;
  const canAnnuler = selectedAppel && selectedAppel.facture;

  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        onClick={onFacturer}
        disabled={!canFacturer || isLoading}
        variant="primary"
        className="min-w-[120px]"
      >
        Facturer
      </Button>
      <Button
        onClick={onMarquerGratuit}
        disabled={!canMarquerGratuit || isLoading}
        variant="secondary"
        className="min-w-[140px]"
      >
        Marquer Gratuit
      </Button>
      <Button
        onClick={onAnnuler}
        disabled={!canAnnuler || isLoading}
        variant="danger"
        className="min-w-[120px]"
      >
        Annuler
      </Button>
    </div>
  );
};