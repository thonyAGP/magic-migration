import { cn } from "@/lib/utils";

interface MontantsSectionPanelProps {
  className?: string;
  montantOuverture: number;
  montantActuel: number;
  montantFermeture: number;
  ecart: number;
}

export const MontantsSectionPanel = ({
  className,
  montantOuverture,
  montantActuel,
  montantFermeture,
  ecart,
}: MontantsSectionPanelProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const isEcartPositive = ecart >= 0;

  return (
    <div className={cn("space-y-4 rounded-lg border border-gray-200 bg-white p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900">Montants</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Montant Ouverture</label>
          <div className="text-xl font-semibold text-gray-900">
            {formatCurrency(montantOuverture)}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Montant Actuel</label>
          <div className="text-xl font-semibold text-blue-600">
            {formatCurrency(montantActuel)}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Montant Fermeture</label>
          <div className="text-xl font-semibold text-gray-900">
            {formatCurrency(montantFermeture)}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Écart</label>
          <div
            className={cn(
              "text-xl font-semibold",
              isEcartPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {isEcartPositive ? "+" : ""}{formatCurrency(ecart)}
          </div>
        </div>
      </div>
    </div>
  );
};