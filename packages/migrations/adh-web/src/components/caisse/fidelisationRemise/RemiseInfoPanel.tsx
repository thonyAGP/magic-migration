import type { RemiseResult } from "@/types/fidelisationRemise";
import { cn } from "@/lib/utils";

interface RemiseInfoPanelProps {
  remiseResult: RemiseResult | null;
  className?: string;
}

export const RemiseInfoPanel = ({ remiseResult, className }: RemiseInfoPanelProps) => {
  if (!remiseResult) {
    return (
      <div className={cn("rounded-lg border border-outline bg-surface-container p-6", className)}>
        <p className="text-on-surface-muted text-center">Aucune information de remise disponible</p>
      </div>
    );
  }

  const statusColor = remiseResult.isValide
    ? "text-green-600 bg-green-50 border-green-200"
    : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className={cn("rounded-lg border border-outline bg-surface-container p-6 space-y-4", className)}>
      <h3 className="text-lg font-semibold text-on-surface mb-4">Informations de remise</h3>

      <div className="grid gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-on-surface-muted">ID Fidélisation</label>
          <div className="rounded-md border border-outline bg-surface-dim px-3 py-2 text-on-surface">
            {remiseResult.fidelisationId || "Aucun"}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-on-surface-muted">Montant remise</label>
          <div className="rounded-md border border-outline bg-surface-dim px-3 py-2 text-on-surface font-mono">
            {remiseResult.montantRemise.toFixed(2)} €
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-on-surface-muted">Statut</label>
          <div
            className={cn(
              "rounded-md border px-3 py-2 font-medium inline-flex items-center gap-2 w-fit",
              statusColor
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", remiseResult.isValide ? "bg-green-600" : "bg-red-600")} />
            {remiseResult.isValide ? "Valide" : "Non valide"}
          </div>
        </div>

        {remiseResult.message && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-on-surface-muted">Message</label>
            <div className="rounded-md border border-outline bg-surface-dim px-3 py-2 text-on-surface">
              {remiseResult.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};