import { cn } from "@/lib/utils";

interface HeaderSectionPanelProps {
  className?: string;
  operateurNom?: string;
  dateComptable?: string;
  sessionStatut?: string;
}

export const HeaderSectionPanel = ({
  className,
  operateurNom = "",
  dateComptable = "",
  sessionStatut = "Fermée",
}: HeaderSectionPanelProps) => {
  const getStatutColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "ouverte":
        return "text-green-600 bg-green-50";
      case "fermée":
        return "text-red-600 bg-red-50";
      case "suspendue":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className={cn("border border-gray-300 bg-gray-50 p-4", className)}>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-600 uppercase">
            Opérateur
          </span>
          <span className="mt-1 text-sm font-medium text-gray-900">
            {operateurNom || "—"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-600 uppercase">
            Date comptable
          </span>
          <span className="mt-1 text-sm font-medium text-gray-900">
            {dateComptable || "—"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-600 uppercase">
            Statut session
          </span>
          <span
            className={cn(
              "mt-1 inline-flex items-center self-start rounded-full px-2.5 py-0.5 text-xs font-semibold",
              getStatutColor(sessionStatut)
            )}
          >
            {sessionStatut}
          </span>
        </div>
      </div>
    </div>
  );
};