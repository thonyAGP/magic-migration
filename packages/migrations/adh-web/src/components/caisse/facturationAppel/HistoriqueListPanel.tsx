import type { HistoriqueAppel } from "@/types/facturationAppel";
import { cn } from "@/lib/utils";

export interface HistoriqueListPanelProps {
  historiqueAppels: HistoriqueAppel[];
  onSelectAppel: (appel: HistoriqueAppel) => void;
  selectedAppel?: HistoriqueAppel | null;
}

export const HistoriqueListPanel = ({
  historiqueAppels,
  onSelectAppel,
  selectedAppel,
}: HistoriqueListPanelProps) => {
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const formatDuree = (duree: string): string => {
    return duree;
  };

  const formatMontant = (montant: number): string => {
    return `${montant.toFixed(2)} €`;
  };

  const formatGratuit = (gratuit: boolean): string => {
    return gratuit ? "Oui" : "Non";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Heure
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Numéro
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                Durée
              </th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">
                Montant
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                Gratuit
              </th>
            </tr>
          </thead>
          <tbody>
            {historiqueAppels.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Aucun appel à afficher
                </td>
              </tr>
            ) : (
              historiqueAppels.map((appel, index) => (
                <tr
                  key={appel.id || index}
                  onClick={() => onSelectAppel(appel)}
                  className={cn(
                    "cursor-pointer border-b border-gray-200 transition-colors hover:bg-blue-50",
                    selectedAppel?.id === appel.id && "bg-blue-100"
                  )}
                >
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatDate(appel.dateAppel)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {appel.heureAppel}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {appel.numeroTel}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatDuree(appel.duree)}
                  </td>
                  <td className="px-4 py-2 text-right text-sm text-gray-900">
                    {formatMontant(appel.montant)}
                  </td>
                  <td className="px-4 py-2 text-center text-sm text-gray-900">
                    {formatGratuit(appel.gratuite)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};